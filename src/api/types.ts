// ①②③④ 공통 응답. 물품·외자에만 있는 세부품목 중첩은 실호출 검증(설계 §9-3) 후
// 구조화하며, 초기에는 원시 값을 그대로 보존한다.
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
