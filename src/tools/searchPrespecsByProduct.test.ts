import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient, OperationResult, Params } from "@opendata-kr/core";
import { runSearchByProduct } from "./searchPrespecsByProduct.js";

function stubClient(): DataGoKrClient {
  return {
    serviceKeyLooksPreEncoded: false,
    call: vi.fn(
      async (_op: string, _params?: Params): Promise<OperationResult> => ({
        totalCount: 0,
        pageNo: 1,
        items: [],
      }),
    ),
  };
}

describe("runSearchByProduct", () => {
  it("품명·세부품명을 파라미터로 매핑한다", async () => {
    const client = stubClient();
    await runSearchByProduct(client, {
      kind: ["thng"],
      productName: "하이콤 거더",
      detailProductCode: "2523080201",
      detailProductName: "철도용오링",
    });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.prdctClsfcNoNm).toBe("하이콤 거더");
    expect(seen.dtilPrdctClsfcNo).toBe("2523080201");
    expect(seen.dtilPrdctClsfcNoNm).toBe("철도용오링");
  });

  it("byProduct 오퍼레이션을 호출한다", async () => {
    const client = stubClient();
    await runSearchByProduct(client, { kind: ["cnstwk"] });
    const op = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(op).toBe("getThngDetailMetaInfoCnstwk");
  });
});
