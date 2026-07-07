import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient, OperationResult, Params } from "@opendata-kr/core";
import { runGetOpinions } from "./getPrespecOpinions.js";

function makeClient(item?: Record<string, string>): DataGoKrClient {
  return {
    serviceKeyLooksPreEncoded: false,
    call: vi.fn(
      async (_op: string, _params?: Params): Promise<OperationResult> => ({
        totalCount: item ? 1 : 0,
        pageNo: 1,
        items: item ? [item] : [],
      }),
    ),
  };
}

describe("runGetOpinions", () => {
  it("specRegistNo 지정 시 inqryDiv=2 + bfSpecRgstNo", async () => {
    const client = makeClient();
    await runGetOpinions(client, { kind: ["thng"], specRegistNo: "356782" });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.inqryDiv).toBe("2");
    expect(seen.bfSpecRgstNo).toBe("356782");
  });

  it("opinion 오퍼레이션을 호출하고 PrespecOpinion으로 정제한다", async () => {
    const client = makeClient({
      bfSpecRgstNo: "356782",
      opninNo: "1",
      opninTitl: "의견",
      specDocOpninFileUrl1: "https://g2b.example/f1",
    });
    const r = await runGetOpinions(client, { kind: ["thng"], specRegistNo: "356782" });
    const op = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(op).toBe("getPublicPrcureThngOpinionInfoThng");
    const thng = r.results.thng!;
    expect("items" in thng && thng.items[0]!.opinionNo).toBe("1");
    expect("items" in thng && thng.items[0]!.opinionFileUrls).toEqual([
      "https://g2b.example/f1",
    ]);
  });

  it("kind 미지정 시 4구분 fan-out", async () => {
    const client = makeClient();
    await runGetOpinions(client, { specRegistNo: "356782" });
    expect(client.call).toHaveBeenCalledTimes(4);
  });
});
