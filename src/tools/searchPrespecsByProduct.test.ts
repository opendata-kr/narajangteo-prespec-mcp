import { describe, expect, it } from "vitest";
import { makeTestClient } from "../test-helpers.js";
import { runSearchByProduct } from "./searchPrespecsByProduct.js";

describe("runSearchByProduct", () => {
  it("품명·세부품명을 파라미터로 매핑한다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchByProduct(client, {
      kind: ["thng"],
      productName: "하이콤 거더",
      detailProductCode: "2523080201",
      detailProductName: "철도용오링",
    });
    const seen = requests[0]!.params;
    expect(seen.get("prdctClsfcNoNm")).toBe("하이콤 거더");
    expect(seen.get("dtilPrdctClsfcNo")).toBe("2523080201");
    expect(seen.get("dtilPrdctClsfcNoNm")).toBe("철도용오링");
  });

  it("byProduct 오퍼레이션을 호출한다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchByProduct(client, { kind: ["cnstwk"] });
    expect(requests[0]!.op).toBe("getThngDetailMetaInfoCnstwk");
  });
});
