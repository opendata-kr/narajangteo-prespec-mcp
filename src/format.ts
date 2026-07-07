import type { RawItem } from "@opendata-kr/core";
import type { Prespec, PrespecOpinion } from "./api/types.js";

export function formatPrespec(raw: RawItem): Prespec {
  const pick = (k: string): string => raw[k] ?? "";
  return {
    specRegistNo: pick("bfSpecRgstNo"),
    productName: pick("prdctClsfcNoNm"),
    assignedBudget: pick("asignBdgtAmt"),
    orderInstitution: pick("orderInsttNm"),
    demandInstitution: pick("rlDminsttNm"),
    registDt: pick("rgstDt"),
    changeDt: pick("chgDt"),
    opinionCloseDt: pick("opninRgstClseDt"),
    receiptDt: pick("rcptDt"),
    refNo: pick("refNo"),
    bidNoticeList: pick("bidNtceNoList"),
    businessDivision: pick("bsnsDivNm"),
    deliveryDays: pick("dlvrDaynum"),
    deliveryDeadline: pick("dlvrTmlmtDt"),
    officialName: pick("ofclNm"),
    officialTel: pick("ofclTelNo"),
    swBusinessYn: pick("swBizObjYn"),
  };
}

export function formatPrespecOpinion(raw: RawItem): PrespecOpinion {
  const pick = (k: string): string => raw[k] ?? "";
  const fileUrls = [1, 2, 3, 4, 5]
    .map((n) => pick(`specDocOpninFileUrl${n}`))
    .filter((u) => u !== "");
  return {
    specRegistNo: pick("bfSpecRgstNo"),
    refNo: pick("refNo"),
    opinionNo: pick("opninNo"),
    replyNo: pick("rplyNo"),
    opinionTitle: pick("opninTitl"),
    opinionContent: pick("opninCntnts"),
    writerCorp: pick("mkngCorpNm"),
    writerName: pick("mkrNm"),
    inputDt: pick("inptDt"),
    writerTel: pick("mkrTel"),
    writerEmail: pick("mkrEmail"),
    opinionFileUrls: fileUrls,
  };
}
