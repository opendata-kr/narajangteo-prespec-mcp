import type { RawItem } from "@opendata-kr/core";
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
    productDetailList: parseProductDetails(pick("prdctDtlList")),
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
