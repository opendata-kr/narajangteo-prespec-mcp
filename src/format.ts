import type { RawPrespec, RawPrespecOpinion } from "./api/schema.js";
import type { Prespec, PrespecOpinion, ProductDetail } from "./api/types.js";

// prdctDtlList packed string `[순번^세부품명번호^세부품명],[...]`을 배열로 파싱한다.
function parseProductDetails(raw: string): ProductDetail[] {
  const blocks = raw.match(/\[([^\]]*)\]/g);
  if (!blocks) return [];
  return blocks.map((b) => {
    const [itemSeq = "", detailProductNo = "", detailProductName = ""] = b
      .slice(1, -1)
      .split("^");
    return { itemSeq, detailProductNo, detailProductName };
  });
}

export function formatPrespec(raw: RawPrespec): Prespec {
  return {
    specRegistNo: raw.bfSpecRgstNo,
    productName: raw.prdctClsfcNoNm ?? "",
    assignedBudget: raw.asignBdgtAmt ?? "",
    orderInstitution: raw.orderInsttNm ?? "",
    demandInstitution: raw.rlDminsttNm ?? "",
    registDt: raw.rgstDt ?? "",
    changeDt: raw.chgDt ?? "",
    opinionCloseDt: raw.opninRgstClseDt ?? "",
    receiptDt: raw.rcptDt ?? "",
    refNo: raw.refNo ?? "",
    bidNoticeList: raw.bidNtceNoList ?? "",
    businessDivision: raw.bsnsDivNm ?? "",
    deliveryDays: raw.dlvrDaynum ?? "",
    deliveryDeadline: raw.dlvrTmlmtDt ?? "",
    officialName: raw.ofclNm ?? "",
    officialTel: raw.ofclTelNo ?? "",
    swBusinessYn: raw.swBizObjYn ?? "",
    productDetailList: parseProductDetails(raw.prdctDtlList ?? ""),
  };
}

export function formatPrespecOpinion(raw: RawPrespecOpinion): PrespecOpinion {
  const fileUrls = [
    raw.specDocOpninFileUrl1,
    raw.specDocOpninFileUrl2,
    raw.specDocOpninFileUrl3,
    raw.specDocOpninFileUrl4,
    raw.specDocOpninFileUrl5,
  ].filter((u): u is string => u !== undefined && u !== "");
  return {
    specRegistNo: raw.bfSpecRgstNo,
    refNo: raw.refNo ?? "",
    opinionNo: raw.opninNo ?? "",
    replyNo: raw.rplyNo ?? "",
    opinionTitle: raw.opninTitl ?? "",
    opinionContent: raw.opninCntnts ?? "",
    writerCorp: raw.mkngCorpNm ?? "",
    writerName: raw.mkrNm ?? "",
    inputDt: raw.inptDt ?? "",
    writerTel: raw.mkrTel ?? "",
    writerEmail: raw.mkrEmail ?? "",
    opinionFileUrls: fileUrls,
  };
}
