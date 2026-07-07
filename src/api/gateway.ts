import { createClient, type DataGoKrClient } from "@opendata-kr/core";

// 나라장터 사전규격정보서비스(HrcspSsstndrdInfoService).
// 입찰공고서비스(/1230000/ad/BidPublicInfoService)와 달리 경로 세그먼트가 ao다.
const SERVICE_PATH = "/1230000/ao/HrcspSsstndrdInfoService";

export function createGateway(): DataGoKrClient {
  return createClient({ path: SERVICE_PATH, params: { type: "json" } });
}
