import { describe, expect, it } from "vitest";
import { formatPrespec, formatPrespecOpinion } from "./format.js";

describe("formatPrespec", () => {
  it("raw 필드를 의미형으로 매핑한다", () => {
    const p = formatPrespec({
      bfSpecRgstNo: "356759",
      prdctClsfcNoNm: "내화 재해위험지구 정비사업",
      asignBdgtAmt: "180000000",
      orderInsttNm: "조달청",
      rlDminsttNm: "전라남도",
      rgstDt: "2025-01-06 10:00:00",
      opninRgstClseDt: "2025-01-10 18:00:00",
      bidNtceNoList: "20160510306,20160520154",
      swBizObjYn: "N",
    });
    expect(p.specRegistNo).toBe("356759");
    expect(p.productName).toBe("내화 재해위험지구 정비사업");
    expect(p.assignedBudget).toBe("180000000");
    expect(p.orderInstitution).toBe("조달청");
    expect(p.demandInstitution).toBe("전라남도");
    expect(p.bidNoticeList).toBe("20160510306,20160520154");
  });

  it("누락 필드는 빈 문자열로 채운다", () => {
    const p = formatPrespec({ bfSpecRgstNo: "X1" });
    expect(p.specRegistNo).toBe("X1");
    expect(p.productName).toBe("");
    expect(p.orderInstitution).toBe("");
  });
});

describe("formatPrespecOpinion", () => {
  it("의견 필드를 매핑하고 파일 URL을 배열로 접는다", () => {
    const o = formatPrespecOpinion({
      bfSpecRgstNo: "356782",
      opninNo: "1",
      rplyNo: "0",
      opninTitl: "의견등록합니다",
      opninCntnts: "규격 재검토 요청",
      mkngCorpNm: "디자인리제",
      mkrNm: "홍길동",
      inptDt: "2017-04-05 15:34:26",
      specDocOpninFileUrl1: "https://g2b.example/f1",
      specDocOpninFileUrl2: "https://g2b.example/f2",
      specDocOpninFileUrl3: "",
    });
    expect(o.specRegistNo).toBe("356782");
    expect(o.opinionNo).toBe("1");
    expect(o.opinionTitle).toBe("의견등록합니다");
    expect(o.writerCorp).toBe("디자인리제");
    expect(o.opinionFileUrls).toEqual([
      "https://g2b.example/f1",
      "https://g2b.example/f2",
    ]);
  });

  it("파일 URL이 모두 비면 빈 배열", () => {
    const o = formatPrespecOpinion({ bfSpecRgstNo: "X" });
    expect(o.opinionFileUrls).toEqual([]);
  });
});
