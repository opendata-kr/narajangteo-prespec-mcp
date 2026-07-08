import { describe, expect, it, vi } from "vitest";
import type {
  DataGoKrClient,
  OperationResult,
  Params,
  RawItem,
} from "@opendata-kr/core";
import type { Kind } from "../api/endpoints.js";
import { runList } from "./runList.js";

// op == kind 문자열이라 perKind를 op로 직접 매칭한다.
function fakeClient(
  perKind: Record<string, OperationResult | Error>,
  preEncoded = false,
): DataGoKrClient {
  return {
    serviceKeyLooksPreEncoded: preEncoded,
    call: vi.fn(async (op: string, _params?: Params): Promise<OperationResult> => {
      const v = perKind[op];
      if (v instanceof Error) throw v;
      return v ?? { totalCount: 0, pageNo: 1, items: [] };
    }),
  };
}

const opFor = (k: Kind): string => k;
const identity = (raw: RawItem): RawItem => raw;
const QUERY = { q: 1 };

describe("runList", () => {
  it("serviceKeyLooksPreEncoded일 때 인증류 에러에 Decoding 키 안내를 붙인다", async () => {
    const client = fakeClient({ thng: new Error("HTTP 401") }, true);
    const r = await runList(client, opFor, {}, ["thng"], QUERY, identity);
    const thng = r.results.thng!;
    expect("error" in thng).toBe(true);
    if ("error" in thng) {
      expect(thng.error.startsWith("HTTP 401")).toBe(true);
      expect(thng.error).toContain("Decoding 인증키");
    }
  });

  it("serviceKeyLooksPreEncoded가 아니면 힌트를 안 붙인다", async () => {
    const client = fakeClient({ thng: new Error("HTTP 401") }, false);
    const r = await runList(client, opFor, {}, ["thng"], QUERY, identity);
    const thng = r.results.thng!;
    expect("error" in thng && thng.error).toBe("HTTP 401");
  });

  it("비인증 에러엔 힌트를 안 붙인다", async () => {
    const client = fakeClient({ thng: new Error("boom") }, true);
    const r = await runList(client, opFor, {}, ["thng"], QUERY, identity);
    const thng = r.results.thng!;
    expect("error" in thng && thng.error).toBe("boom");
  });

  it("한 kind 실패가 다른 kind를 막지 않는다", async () => {
    const client = fakeClient({
      thng: new Error("boom"),
      servc: { totalCount: 1, pageNo: 1, items: [{ a: "1" }] },
    });
    const r = await runList(client, opFor, {}, ["thng", "servc"], QUERY, identity);
    expect("error" in r.results.thng!).toBe(true);
    const servc = r.results.servc!;
    expect("items" in servc && servc.totalCount).toBe(1);
    expect("items" in servc && servc.items).toEqual([{ a: "1" }]);
  });

  it("query를 그대로 echo한다", async () => {
    const client = fakeClient({ thng: { totalCount: 0, pageNo: 1, items: [] } });
    const r = await runList(client, opFor, {}, ["thng"], QUERY, identity);
    expect(r.query).toBe(QUERY);
  });

  it("결과 key 순서가 입력 kinds 순서와 같다", async () => {
    const client = fakeClient({
      servc: { totalCount: 0, pageNo: 1, items: [] },
      thng: { totalCount: 0, pageNo: 1, items: [] },
      cnstwk: { totalCount: 0, pageNo: 1, items: [] },
    });
    const r = await runList(
      client,
      opFor,
      {},
      ["servc", "thng", "cnstwk"],
      QUERY,
      identity,
    );
    expect(Object.keys(r.results)).toEqual(["servc", "thng", "cnstwk"]);
  });
});
