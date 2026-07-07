import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient, OperationResult, Params } from "@opendata-kr/core";
import { runSearchPrespecs } from "./searchPrespecs.js";

function makeClient(
  perKind: Record<string, OperationResult | Error>,
): DataGoKrClient {
  return {
    serviceKeyLooksPreEncoded: false,
    call: vi.fn(
      async (op: string, _params?: Params): Promise<OperationResult> => {
        const kind = Object.keys(perKind).find((k) => {
          const suffix = k.charAt(0).toUpperCase() + k.slice(1);
          return op.endsWith(suffix);
        });
        const v = kind ? perKind[kind] : undefined;
        if (v instanceof Error) throw v;
        if (!v) return { totalCount: 0, pageNo: 1, items: [] };
        return v;
      },
    ),
  };
}

describe("runSearchPrespecs", () => {
  it("kind 미지정 시 4개 업무구분에 fan-out한다", async () => {
    const client = makeClient({
      thng: { totalCount: 1, pageNo: 1, items: [{ bfSpecRgstNo: "T1" }] },
    });
    const r = await runSearchPrespecs(client, {});
    expect(client.call).toHaveBeenCalledTimes(4);
    const thng = r.results.thng!;
    expect("items" in thng && thng.items[0]!.specRegistNo).toBe("T1");
  });

  it("kind 지정 시 해당 구분만 호출한다", async () => {
    const client = makeClient({
      servc: { totalCount: 2, pageNo: 1, items: [{ bfSpecRgstNo: "S1" }] },
    });
    const r = await runSearchPrespecs(client, { kind: ["servc"] });
    expect(client.call).toHaveBeenCalledTimes(1);
    expect(Object.keys(r.results)).toEqual(["servc"]);
  });

  it("startDate/endDate를 inqryDiv=1 + 일시로 변환한다", async () => {
    const client = makeClient({ thng: { totalCount: 0, pageNo: 1, items: [] } });
    await runSearchPrespecs(client, {
      kind: ["thng"],
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.inqryDiv).toBe("1");
    expect(seen.inqryBgnDt).toBe("202507010000");
    expect(seen.inqryEndDt).toBe("202507052359");
  });

  it("dateType=change 시 inqryDiv=3", async () => {
    const client = makeClient({ thng: { totalCount: 0, pageNo: 1, items: [] } });
    await runSearchPrespecs(client, {
      kind: ["thng"],
      startDate: "20250701",
      dateType: "change",
    });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.inqryDiv).toBe("3");
  });

  it("specRegistNo 지정 시 inqryDiv=2 + bfSpecRgstNo", async () => {
    const client = makeClient({ thng: { totalCount: 0, pageNo: 1, items: [] } });
    await runSearchPrespecs(client, { kind: ["thng"], specRegistNo: "356759" });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.inqryDiv).toBe("2");
    expect(seen.bfSpecRgstNo).toBe("356759");
  });

  it("한 업무구분 실패 시 나머지는 정상 반환한다", async () => {
    const client = makeClient({
      thng: new Error("boom"),
      servc: { totalCount: 1, pageNo: 1, items: [{ bfSpecRgstNo: "S1" }] },
      cnstwk: { totalCount: 0, pageNo: 1, items: [] },
      frgcpt: { totalCount: 0, pageNo: 1, items: [] },
    });
    const r = await runSearchPrespecs(client, {});
    expect("error" in r.results.thng!).toBe(true);
    expect("items" in r.results.servc!).toBe(true);
  });
});
