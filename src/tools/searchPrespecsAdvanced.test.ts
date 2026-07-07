import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient, OperationResult, Params } from "@opendata-kr/core";
import { runSearchAdvanced } from "./searchPrespecsAdvanced.js";

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

describe("runSearchAdvanced", () => {
  it("복합 필터를 파라미터로 매핑한다", async () => {
    const client = stubClient();
    await runSearchAdvanced(client, {
      kind: ["thng"],
      noticeInstitution: "조달청",
      demandInstitution: "전라남도",
      productName: "복합공작기계",
      detailProductCode: "2523080201",
      refNo: "001730093800001",
      swBusinessYn: "N",
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.ntceInsttNm).toBe("조달청");
    expect(seen.dminsttNm).toBe("전라남도");
    expect(seen.prdctClsfcNoNm).toBe("복합공작기계");
    expect(seen.dtilPrdctClsfcNo).toBe("2523080201");
    expect(seen.refNo).toBe("001730093800001");
    expect(seen.swBizObjYn).toBe("N");
    expect(seen.inqryDiv).toBe("1");
    expect(seen.inqryBgnDt).toBe("202507010000");
  });

  it("specRegistNo 지정 시 inqryDiv=2", async () => {
    const client = stubClient();
    await runSearchAdvanced(client, { kind: ["thng"], specRegistNo: "356759" });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.inqryDiv).toBe("2");
    expect(seen.bfSpecRgstNo).toBe("356759");
  });

  it("advanced(PPSSrch) 오퍼레이션을 호출한다", async () => {
    const client = stubClient();
    await runSearchAdvanced(client, { kind: ["servc"] });
    const op = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(op).toBe("getPublicPrcureThngInfoServcPPSSrch");
  });
});
