import { describe, expect, it } from "vitest";
import { ALL_KINDS, type Kind, listOp } from "../api/endpoints.js";
import { makeTestClient, type OpStub } from "../test-helpers.js";
import { runSearchPrespecs } from "./searchPrespecs.js";

// kind 키 스텁을 list 오퍼레이션명 키로 펼친다.
function makeClient(perKind: Partial<Record<Kind, OpStub>>) {
  const perOp: Record<string, OpStub> = {};
  for (const [kind, stub] of Object.entries(perKind)) {
    perOp[listOp(kind as Kind)] = stub;
  }
  return makeTestClient(perOp);
}

describe("runSearchPrespecs", () => {
  it("kind 미지정 시 4개 업무구분에 fan-out한다", async () => {
    const { client, requests } = makeClient({
      thng: { items: [{ bfSpecRgstNo: "T1" }], totalCount: 1 },
    });
    const r = await runSearchPrespecs(client, {});
    expect(requests).toHaveLength(4);
    expect(requests.map((q) => q.op).sort()).toEqual([...ALL_KINDS].map(listOp).sort());
    const thng = r.results.thng!;
    expect("items" in thng && thng.items[0]!.specRegistNo).toBe("T1");
  });

  it("kind 지정 시 해당 구분만 호출한다", async () => {
    const { client, requests } = makeClient({
      servc: { items: [{ bfSpecRgstNo: "S1" }], totalCount: 2 },
    });
    const r = await runSearchPrespecs(client, { kind: ["servc"] });
    expect(requests).toHaveLength(1);
    expect(Object.keys(r.results)).toEqual(["servc"]);
  });

  it("startDate/endDate를 inqryDiv=1 + 일시로 변환한다", async () => {
    const { client, requests } = makeClient({});
    await runSearchPrespecs(client, {
      kind: ["thng"],
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = requests[0]!.params;
    expect(seen.get("inqryDiv")).toBe("1");
    expect(seen.get("inqryBgnDt")).toBe("202507010000");
    expect(seen.get("inqryEndDt")).toBe("202507052359");
  });

  it("dateType=change 시 inqryDiv=3", async () => {
    const { client, requests } = makeClient({});
    await runSearchPrespecs(client, {
      kind: ["thng"],
      startDate: "20250701",
      dateType: "change",
    });
    expect(requests[0]!.params.get("inqryDiv")).toBe("3");
  });

  it("specRegistNo 지정 시 inqryDiv=2 + bfSpecRgstNo", async () => {
    const { client, requests } = makeClient({});
    await runSearchPrespecs(client, { kind: ["thng"], specRegistNo: "356759" });
    const seen = requests[0]!.params;
    expect(seen.get("inqryDiv")).toBe("2");
    expect(seen.get("bfSpecRgstNo")).toBe("356759");
  });

  it("한 업무구분 실패 시 나머지는 정상 반환한다", async () => {
    const { client } = makeClient({
      thng: { errorCode: "99", errorMsg: "boom" },
      servc: { items: [{ bfSpecRgstNo: "S1" }], totalCount: 1 },
      cnstwk: { items: [] },
      frgcpt: { items: [] },
    });
    const r = await runSearchPrespecs(client, {});
    expect("error" in r.results.thng!).toBe(true);
    expect("items" in r.results.servc!).toBe(true);
  });
});
