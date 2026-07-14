import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { Kind } from "../api/endpoints.js";
import { makeTestClient } from "../test-helpers.js";
import { runList } from "./runList.js";

// op == kind 문자열이라 스텁을 kind로 직접 매칭한다.
const opFor = (k: Kind): string => k;
const AnySchema = z.looseObject({});
type AnyRaw = z.infer<typeof AnySchema>;
const identity = (raw: AnyRaw): AnyRaw => raw;
const QUERY = { q: 1 };

// 사전 인코딩된 키로 보이는 값 (%2F 포함). 기본 키 힌트 인터셉터를 발화시킨다.
const PRE_ENCODED_KEY = "abc%2Fdef";

describe("runList", () => {
  it("사전 인코딩 키 + 인증류 에러(코드 30)에 Decoding 키 안내가 붙는다", async () => {
    const { client } = makeTestClient(
      { thng: { errorCode: "30", errorMsg: "등록되지 않은 서비스키" } },
      { serviceKey: PRE_ENCODED_KEY },
    );
    const r = await runList(client, opFor, {}, ["thng"], QUERY, AnySchema, identity);
    const thng = r.results.thng!;
    expect("error" in thng).toBe(true);
    if ("error" in thng) {
      expect(thng.error.startsWith("[30]")).toBe(true);
      expect(thng.error).toContain("Decoding 인증키");
    }
  });

  it("정상 키면 인증류 에러에 힌트를 안 붙인다", async () => {
    const { client } = makeTestClient({
      thng: { errorCode: "30", errorMsg: "등록되지 않은 서비스키" },
    });
    const r = await runList(client, opFor, {}, ["thng"], QUERY, AnySchema, identity);
    const thng = r.results.thng!;
    expect("error" in thng && thng.error).toBe("[30] 등록되지 않은 서비스키");
  });

  it("비인증 에러엔 사전 인코딩 키여도 힌트를 안 붙인다", async () => {
    const { client } = makeTestClient(
      { thng: { errorCode: "99", errorMsg: "boom" } },
      { serviceKey: PRE_ENCODED_KEY },
    );
    const r = await runList(client, opFor, {}, ["thng"], QUERY, AnySchema, identity);
    const thng = r.results.thng!;
    expect("error" in thng && thng.error).toBe("[99] boom");
  });

  it("한 kind 실패가 다른 kind를 막지 않는다", async () => {
    const { client } = makeTestClient({
      thng: { errorCode: "99", errorMsg: "boom" },
      servc: { items: [{ a: "1" }], totalCount: 1 },
    });
    const r = await runList(client, opFor, {}, ["thng", "servc"], QUERY, AnySchema, identity);
    expect("error" in r.results.thng!).toBe(true);
    const servc = r.results.servc!;
    expect("items" in servc && servc.totalCount).toBe(1);
    expect("items" in servc && servc.items).toEqual([{ a: "1" }]);
  });

  it("스키마 탈락 item은 items에서 빠지고 invalidCount로 집계된다", async () => {
    const StrictSchema = z.looseObject({ id: z.string() });
    const { client } = makeTestClient({
      thng: { items: [{ id: "ok" }, { id: 123 }], totalCount: 2 },
    });
    const r = await runList(
      client,
      opFor,
      {},
      ["thng"],
      QUERY,
      StrictSchema,
      (raw: z.infer<typeof StrictSchema>) => raw.id,
    );
    const thng = r.results.thng!;
    expect("items" in thng && thng.items).toEqual(["ok"]);
    expect("items" in thng && thng.invalidCount).toBe(1);
    expect("items" in thng && thng.totalCount).toBe(2);
  });

  it("query를 그대로 echo한다", async () => {
    const { client } = makeTestClient({});
    const r = await runList(client, opFor, {}, ["thng"], QUERY, AnySchema, identity);
    expect(r.query).toBe(QUERY);
  });

  it("결과 key 순서가 입력 kinds 순서와 같다", async () => {
    const { client } = makeTestClient({});
    const r = await runList(
      client,
      opFor,
      {},
      ["servc", "thng", "cnstwk"],
      QUERY,
      AnySchema,
      identity,
    );
    expect(Object.keys(r.results)).toEqual(["servc", "thng", "cnstwk"]);
  });
});
