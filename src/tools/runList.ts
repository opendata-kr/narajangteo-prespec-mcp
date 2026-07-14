import type { DataGoKrClient, Params, StandardSchemaV1 } from "@opendata-kr/core";
import { fanOut } from "@opendata-kr/core";
import type { Kind } from "../api/endpoints.js";

export type KindResult<T> =
  | { totalCount: number; invalidCount: number; items: T[] }
  | { error: string };

export interface ListResult<T> {
  query: unknown;
  results: Partial<Record<Kind, KindResult<T>>>;
}

// 업무구분별로 opFor(kind) 오퍼레이션을 core fanOut으로 병렬 호출하고 kind 결과맵으로 부분실패를 격리한다.
// item은 schema로 검증해 통과분만 format하고, 탈락 건수는 invalidCount로 노출한다
// (0이 아니면 API 응답이 스키마와 어긋난 것). 에러 문자열화·키 힌트는 core(fanOut 기본
// errMessage·클라이언트 기본 인터셉터)가 처리한다. 반환 shape(KindResult·query 래퍼)는
// 발행된 도구 출력계약이라 유지한다.
export async function runList<Raw, T>(
  client: DataGoKrClient,
  opFor: (kind: Kind) => string,
  baseParams: Params,
  kinds: Kind[],
  query: unknown,
  schema: StandardSchemaV1<unknown, Raw>,
  format: (raw: Raw) => T,
): Promise<ListResult<T>> {
  const { results: outcomes } = await fanOut(
    kinds,
    async (kind) => {
      const r = await client.get(opFor(kind), { params: { ...baseParams }, schema });
      return {
        totalCount: r.totalCount,
        invalidCount: r.invalid.length,
        items: r.data.map(format),
      };
    },
    { label: (kind) => kind, concurrency: kinds.length },
  );

  const results: Partial<Record<Kind, KindResult<T>>> = {};
  for (const kind of kinds) {
    const o = outcomes[kind]!;
    results[kind] = o.ok ? o.value : { error: o.error };
  }
  return { query, results };
}
