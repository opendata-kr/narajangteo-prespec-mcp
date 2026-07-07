// 세부품목. raw prdctDtlList의 packed string `[순번^세부품명번호^세부품명]`을 파싱한 항목.
export interface ProductDetail {
  itemSeq: string;
  detailProductNo: string;
  detailProductName: string;
}

// ①②③④ 공통 응답. 물품·외자 응답의 세부품목 중첩(prdctDtlList, packed string)은
// productDetailList 배열로 파싱한다. 공사·용역 응답엔 없어 빈 배열이 된다.
export interface Prespec {
  specRegistNo: string;
  productName: string;
  assignedBudget: string;
  orderInstitution: string;
  demandInstitution: string;
  registDt: string;
  changeDt: string;
  opinionCloseDt: string;
  receiptDt: string;
  refNo: string;
  bidNoticeList: string;
  businessDivision: string;
  deliveryDays: string;
  deliveryDeadline: string;
  officialName: string;
  officialTel: string;
  swBusinessYn: string;
  productDetailList: ProductDetail[];
}

// ⑤ 규격서 의견/답변.
export interface PrespecOpinion {
  specRegistNo: string;
  refNo: string;
  opinionNo: string;
  replyNo: string;
  opinionTitle: string;
  opinionContent: string;
  writerCorp: string;
  writerName: string;
  inputDt: string;
  writerTel: string;
  writerEmail: string;
  opinionFileUrls: string[];
}
