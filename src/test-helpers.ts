import dataGoKr, { type DataGoKrClient } from "@opendata-kr/core";

// 오퍼레이션별 응답 스텁: 정상 items 또는 data.go.kr 오류 봉투.
export type OpStub =
  | { items: Record<string, unknown>[]; totalCount?: number }
  | { errorCode: string; errorMsg?: string };

export interface SeenRequest {
  op: string;
  params: URLSearchParams;
}

export interface TestClient {
  client: DataGoKrClient;
  requests: SeenRequest[];
}

// 가짜 클라이언트 객체 대신 실제 core 클라이언트에 fetch만 주입해, 봉투 정규화·스키마 검증·
// 기본 키 힌트 인터셉터까지 실 파이프라인을 테스트가 통과하게 한다.
// 스텁은 URL 마지막 경로 세그먼트(오퍼레이션명) 완전 일치로 고르고, 미등록 오퍼레이션은 빈 정상 응답이다.
export function makeTestClient(
  perOp: Record<string, OpStub>,
  opts: { serviceKey?: string } = {},
): TestClient {
  const requests: SeenRequest[] = [];
  const fetchFn: typeof fetch = async (input) => {
    const url = new URL(String(input));
    requests.push({ op: url.pathname.split("/").pop() ?? "", params: url.searchParams });
    const stub = perOp[url.pathname.split("/").pop() ?? ""];
    const envelope =
      stub && "errorCode" in stub
        ? {
            response: {
              header: { resultCode: stub.errorCode, resultMsg: stub.errorMsg ?? "오류" },
            },
          }
        : {
            response: {
              header: { resultCode: "00", resultMsg: "정상" },
              body: {
                items: stub?.items ?? [],
                totalCount: stub ? (stub.totalCount ?? stub.items.length) : 0,
                pageNo: 1,
              },
            },
          };
    return new Response(JSON.stringify(envelope));
  };
  return {
    client: dataGoKr.create({
      baseURL: "https://apis.example/1230000/ao/HrcspSsstndrdInfoService",
      serviceKey: opts.serviceKey ?? "test-key",
      params: { type: "json" },
      retry: { retries: 0 },
      fetch: fetchFn,
    }),
    requests,
  };
}
