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
      chgDt: "2025-01-07 11:00:00",
      opninRgstClseDt: "2025-01-10 18:00:00",
      rcptDt: "2025-01-11 09:00:00",
      refNo: "REF-2025-0001",
      bidNtceNoList: "20160510306,20160520154",
      bsnsDivNm: "정보통신",
      dlvrDaynum: "30",
      dlvrTmlmtDt: "2025-02-10",
      ofclNm: "김영희",
      ofclTelNo: "02-123-4567",
      swBizObjYn: "N",
    });
    expect(p.specRegistNo).toBe("356759");
    expect(p.productName).toBe("내화 재해위험지구 정비사업");
    expect(p.assignedBudget).toBe("180000000");
    expect(p.orderInstitution).toBe("조달청");
    expect(p.demandInstitution).toBe("전라남도");
    expect(p.registDt).toBe("2025-01-06 10:00:00");
    expect(p.changeDt).toBe("2025-01-07 11:00:00");
    expect(p.opinionCloseDt).toBe("2025-01-10 18:00:00");
    expect(p.receiptDt).toBe("2025-01-11 09:00:00");
    expect(p.refNo).toBe("REF-2025-0001");
    expect(p.bidNoticeList).toBe("20160510306,20160520154");
    expect(p.businessDivision).toBe("정보통신");
    expect(p.deliveryDays).toBe("30");
    expect(p.deliveryDeadline).toBe("2025-02-10");
    expect(p.officialName).toBe("김영희");
    expect(p.officialTel).toBe("02-123-4567");
    expect(p.swBusinessYn).toBe("N");
  });

  it("누락 필드는 빈 문자열로 채운다", () => {
    const p = formatPrespec({ bfSpecRgstNo: "X1" });
    expect(p.specRegistNo).toBe("X1");
    expect(p.productName).toBe("");
    expect(p.orderInstitution).toBe("");
  });

  it("prdctDtlList packed string을 productDetailList 배열로 파싱한다", () => {
    const p = formatPrespec({
      bfSpecRgstNo: "X",
      prdctDtlList: "[1^4323250501^교육용소프트웨어]",
    });
    expect(p.productDetailList).toEqual([
      { itemSeq: "1", detailProductNo: "4323250501", detailProductName: "교육용소프트웨어" },
    ]);
  });

  it("prdctDtlList 다건(],[ 구분)을 파싱한다", () => {
    const p = formatPrespec({
      bfSpecRgstNo: "X",
      prdctDtlList: "[1^111^가방],[2^222^의자]",
    });
    expect(p.productDetailList).toEqual([
      { itemSeq: "1", detailProductNo: "111", detailProductName: "가방" },
      { itemSeq: "2", detailProductNo: "222", detailProductName: "의자" },
    ]);
  });

  it("prdctDtlList 없거나 빈 값이면 빈 배열", () => {
    expect(formatPrespec({ bfSpecRgstNo: "X" }).productDetailList).toEqual([]);
    expect(formatPrespec({ bfSpecRgstNo: "X", prdctDtlList: "" }).productDetailList).toEqual([]);
  });
});

describe("formatPrespecOpinion", () => {
  it("의견 필드를 매핑하고 파일 URL을 배열로 접는다", () => {
    const o = formatPrespecOpinion({
      bfSpecRgstNo: "356782",
      refNo: "REF-2025-0002",
      opninNo: "1",
      rplyNo: "0",
      opninTitl: "의견등록합니다",
      opninCntnts: "규격 재검토 요청",
      mkngCorpNm: "디자인리제",
      mkrNm: "홍길동",
      inptDt: "2017-04-05 15:34:26",
      mkrTel: "010-1234-5678",
      mkrEmail: "hong@example.com",
      specDocOpninFileUrl1: "https://g2b.example/f1",
      specDocOpninFileUrl2: "https://g2b.example/f2",
      specDocOpninFileUrl3: "",
    });
    expect(o.specRegistNo).toBe("356782");
    expect(o.refNo).toBe("REF-2025-0002");
    expect(o.opinionNo).toBe("1");
    expect(o.replyNo).toBe("0");
    expect(o.opinionTitle).toBe("의견등록합니다");
    expect(o.opinionContent).toBe("규격 재검토 요청");
    expect(o.writerCorp).toBe("디자인리제");
    expect(o.writerName).toBe("홍길동");
    expect(o.inputDt).toBe("2017-04-05 15:34:26");
    expect(o.writerTel).toBe("010-1234-5678");
    expect(o.writerEmail).toBe("hong@example.com");
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
