import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient, OperationResult, Params } from "@opendata-kr/core";
import { runSearchByInstitution } from "./searchPrespecsByInstitution.js";

function stubClient(): DataGoKrClient {
  return {
    serviceKeyLooksPreEncoded: false,
    call: vi.fn(
      async (_op: string, _params?: Params): Promise<OperationResult> => ({
        totalCount: 0,
        pageNo: 1,
        items: [],
      }),
    ),
  };
}

describe("runSearchByInstitution", () => {
  it("기관명과 일시를 파라미터로 매핑한다", async () => {
    const client = stubClient();
    await runSearchByInstitution(client, {
      kind: ["thng"],
      orderInstitution: "조달청",
      demandInstitution: "전라남도",
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![1] as Params;
    expect(seen.orderInsttNm).toBe("조달청");
    expect(seen.rlDminsttNm).toBe("전라남도");
    expect(seen.inqryBgnDt).toBe("202507010000");
    expect(seen.inqryEndDt).toBe("202507052359");
  });

  it("byInstitution 오퍼레이션을 호출한다", async () => {
    const client = stubClient();
    await runSearchByInstitution(client, { kind: ["thng"] });
    const op = (client.call as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(op).toBe("getInsttAcctoThngListInfoThng");
  });

  it("kind 미지정 시 4구분 fan-out", async () => {
    const client = stubClient();
    await runSearchByInstitution(client, {});
    expect(client.call).toHaveBeenCalledTimes(4);
  });
});
