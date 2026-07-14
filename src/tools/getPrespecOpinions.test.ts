import { describe, expect, it } from "vitest";
import { opinionOp } from "../api/endpoints.js";
import { makeTestClient } from "../test-helpers.js";
import { runGetOpinions } from "./getPrespecOpinions.js";

function makeClient(item?: Record<string, unknown>) {
  return makeTestClient(
    item ? { [opinionOp("thng")]: { items: [item], totalCount: 1 } } : {},
  );
}

describe("runGetOpinions", () => {
  it("specRegistNo 지정 시 inqryDiv=2 + bfSpecRgstNo", async () => {
    const { client, requests } = makeClient();
    await runGetOpinions(client, { kind: ["thng"], specRegistNo: "356782" });
    const seen = requests[0]!.params;
    expect(seen.get("inqryDiv")).toBe("2");
    expect(seen.get("bfSpecRgstNo")).toBe("356782");
  });

  it("opinion 오퍼레이션을 호출하고 PrespecOpinion으로 정제한다", async () => {
    const { client, requests } = makeClient({
      bfSpecRgstNo: "356782",
      opninNo: "1",
      opninTitl: "의견",
      specDocOpninFileUrl1: "https://g2b.example/f1",
    });
    const r = await runGetOpinions(client, { kind: ["thng"], specRegistNo: "356782" });
    expect(requests[0]!.op).toBe("getPublicPrcureThngOpinionInfoThng");
    const thng = r.results.thng!;
    expect("items" in thng && thng.items[0]!.opinionNo).toBe("1");
    expect("items" in thng && thng.items[0]!.opinionFileUrls).toEqual([
      "https://g2b.example/f1",
    ]);
  });

  it("의견번호가 숫자로 와도 문자열로 수렴한다", async () => {
    const { client } = makeClient({ bfSpecRgstNo: "356782", opninNo: 3 });
    const r = await runGetOpinions(client, { kind: ["thng"], specRegistNo: "356782" });
    const thng = r.results.thng!;
    expect("items" in thng && thng.items[0]!.opinionNo).toBe("3");
    expect("items" in thng && thng.invalidCount).toBe(0);
  });

  it("kind 미지정 시 4구분 fan-out", async () => {
    const { client, requests } = makeClient();
    await runGetOpinions(client, { specRegistNo: "356782" });
    expect(requests).toHaveLength(4);
  });
});
