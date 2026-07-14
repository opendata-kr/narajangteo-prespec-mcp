import { describe, expect, it } from "vitest";
import { makeTestClient } from "../test-helpers.js";
import { runSearchByInstitution } from "./searchPrespecsByInstitution.js";

describe("runSearchByInstitution", () => {
  it("기관명과 일시를 파라미터로 매핑한다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchByInstitution(client, {
      kind: ["thng"],
      orderInstitution: "조달청",
      demandInstitution: "전라남도",
      startDate: "20250701",
      endDate: "20250705",
    });
    const seen = requests[0]!.params;
    expect(seen.get("orderInsttNm")).toBe("조달청");
    expect(seen.get("rlDminsttNm")).toBe("전라남도");
    expect(seen.get("inqryBgnDt")).toBe("202507010000");
    expect(seen.get("inqryEndDt")).toBe("202507052359");
  });

  it("byInstitution 오퍼레이션을 호출한다", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchByInstitution(client, { kind: ["thng"] });
    expect(requests[0]!.op).toBe("getInsttAcctoThngListInfoThng");
  });

  it("kind 미지정 시 4구분 fan-out", async () => {
    const { client, requests } = makeTestClient({});
    await runSearchByInstitution(client, {});
    expect(requests).toHaveLength(4);
  });
});
