import dataGoKr, { type DataGoKrClient } from "@opendata-kr/core";

// 나라장터 사전규격정보서비스(HrcspSsstndrdInfoService).
// 입찰공고서비스(/1230000/ad/BidPublicInfoService)와 달리 경로 세그먼트가 ao다.
const BASE_URL = "https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService";

export function createGateway(): DataGoKrClient {
  // 오버라이드(DATA_GO_KR_BASE_URL)는 서비스 경로를 포함한 전체 URL이어야 한다 (core 0.4.0 규약).
  return dataGoKr.create({
    baseURL: process.env.DATA_GO_KR_BASE_URL ?? BASE_URL,
    params: { type: "json" },
  });
}
