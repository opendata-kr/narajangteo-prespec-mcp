import type { DataGoKrClient, Params, RawItem } from "@opendata-kr/core";
import type { Kind } from "../api/endpoints.js";

export type KindResult<T> =
  | { totalCount: number; items: T[] }
  | { error: string };

export interface ListResult<T> {
  query: unknown;
  results: Partial<Record<Kind, KindResult<T>>>;
}

// 업무구분별로 opFor(kind) 오퍼레이션을 병렬 호출하고 format으로 정제한다.
// 한 구분의 실패는 그 구분에만 error로 담고 나머지는 정상 반환한다.
export async function runList<T>(
  client: DataGoKrClient,
  opFor: (kind: Kind) => string,
  baseParams: Params,
  kinds: Kind[],
  query: unknown,
  format: (raw: RawItem) => T,
): Promise<ListResult<T>> {
  const settled = await Promise.allSettled(
    kinds.map((kind) => client.call(opFor(kind), { ...baseParams })),
  );

  const results: Partial<Record<Kind, KindResult<T>>> = {};
  kinds.forEach((kind, i) => {
    const s = settled[i]!;
    if (s.status === "fulfilled") {
      results[kind] = {
        totalCount: s.value.totalCount,
        items: s.value.items.map(format),
      };
    } else {
      const reason = s.reason;
      results[kind] = {
        error: reason instanceof Error ? reason.message : String(reason),
      };
    }
  });

  return { query, results };
}

// 페이징 공통 파라미터.
export function pagingParams(page?: number, pageSize?: number): Params {
  return { pageNo: page ?? 1, numOfRows: pageSize ?? 10 };
}

// YYYYMMDD → inqryBgnDt/inqryEndDt(YYYYMMDDHHMM). 시작 0000, 종료 2359.
export function dateRangeParams(startDate?: string, endDate?: string): Params {
  const p: Params = {};
  if (startDate) p.inqryBgnDt = `${startDate}0000`;
  if (endDate) p.inqryEndDt = `${endDate}2359`;
  return p;
}
