import { describe, expect, it } from "vitest";
import { makeTestClient } from "../test-helpers.js";
import { runSearchAdvanced } from "./searchPrespecsAdvanced.js";

describe("runSearchAdvanced", () => {
  it("복합 필터(기간+기관+품명)를 매핑하고 refNo 없으면 inqryDiv=1(접수일시)", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchAdvanced(client, {
      kind: ["thng"],
      noticeInstitution: "조달청",
      demandInstitution: "전라남도",
      productName: "복합공작기계",
      detailProductCode: "2523080201",
      swBusinessYn: "N",
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = requests[0]!.params;
    expect(seen.get("ntceInsttNm")).toBe("조달청");
    expect(seen.get("dminsttNm")).toBe("전라남도");
    expect(seen.get("prdctClsfcNoNm")).toBe("복합공작기계");
    expect(seen.get("dtilPrdctClsfcNo")).toBe("2523080201");
    expect(seen.get("swBizObjYn")).toBe("N");
    expect(seen.get("inqryDiv")).toBe("1");
    expect(seen.get("inqryBgnDt")).toBe("202507010000");
    expect(seen.get("inqryEndDt")).toBe("202507052359");
  });

  it("refNo 지정 시 inqryDiv=3(참조번호 조회) + refNo, 기간보다 우선", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchAdvanced(client, {
      kind: ["thng"],
      refNo: "제2026-공동-002호",
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = requests[0]!.params;
    expect(seen.get("inqryDiv")).toBe("3");
    expect(seen.get("refNo")).toBe("제2026-공동-002호");
    // refNo가 우선하므로 접수일시 기간은 보내지 않는다
    expect(seen.get("inqryBgnDt")).toBeNull();
  });

  it("specRegistNo가 refNo·기간보다 우선(inqryDiv=2), refNo는 보내지 않는다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchAdvanced(client, {
      kind: ["thng"],
      specRegistNo: "356759",
      refNo: "R1",
      startDate: "20250701",
    });
    const seen = requests[0]!.params;
    expect(seen.get("inqryDiv")).toBe("2");
    expect(seen.get("bfSpecRgstNo")).toBe("356759");
    expect(seen.get("refNo")).toBeNull();
    expect(seen.get("inqryBgnDt")).toBeNull();
  });

  it("advanced(PPSSrch) 오퍼레이션을 호출한다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchAdvanced(client, { kind: ["servc"] });
    expect(requests[0]!.op).toBe("getPublicPrcureThngInfoServcPPSSrch");
  });
});
