import type { DataGoKrClient, Params, RawItem } from "@opendata-kr/core";
import { fanOut, withKeyHint, errMessage } from "@opendata-kr/core";
import type { Kind } from "../api/endpoints.js";

export type KindResult<T> =
  | { totalCount: number; items: T[] }
  | { error: string };

export interface ListResult<T> {
  query: unknown;
  results: Partial<Record<Kind, KindResult<T>>>;
}

// 업무구분별로 opFor(kind) 오퍼레이션을 core fanOut으로 병렬 호출하고 kind 결과맵으로 부분실패를 격리한다.
// 반환 shape(KindResult·query 래퍼)는 발행된 도구 출력계약이라 유지한다.
export async function runList<T>(
  client: DataGoKrClient,
  opFor: (kind: Kind) => string,
  baseParams: Params,
  kinds: Kind[],
  query: unknown,
  format: (raw: RawItem) => T,
): Promise<ListResult<T>> {
  const { results: outcomes } = await fanOut(
    kinds,
    async (kind) => {
      const op = await client.call(opFor(kind), { ...baseParams });
      return { totalCount: op.totalCount, items: op.items.map(format) };
    },
    {
      label: (kind) => kind,
      concurrency: kinds.length,
      mapError: (reason) => withKeyHint(client, errMessage(reason)),
    },
  );

  const results: Partial<Record<Kind, KindResult<T>>> = {};
  for (const kind of kinds) {
    const o = outcomes[kind]!;
    results[kind] = o.ok ? o.value : { error: o.error };
  }
  return { query, results };
}
