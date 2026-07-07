import { describe, expect, it } from "vitest";
import {
  ALL_KINDS,
  KIND_LABEL,
  listOp,
  byInstitutionOp,
  byProductOp,
  advancedOp,
  opinionOp,
} from "./endpoints.js";

describe("endpoints", () => {
  it("업무구분 4종을 노출한다", () => {
    expect([...ALL_KINDS].sort()).toEqual(
      ["cnstwk", "frgcpt", "servc", "thng"].sort(),
    );
  });

  it("한국어 라벨을 제공한다", () => {
    expect(KIND_LABEL.thng).toBe("물품");
    expect(KIND_LABEL.frgcpt).toBe("외자");
    expect(KIND_LABEL.servc).toBe("용역");
    expect(KIND_LABEL.cnstwk).toBe("공사");
  });

  it("5유형 오퍼레이션명을 매핑한다 (물품)", () => {
    expect(listOp("thng")).toBe("getPublicPrcureThngInfoThng");
    expect(byInstitutionOp("thng")).toBe("getInsttAcctoThngListInfoThng");
    expect(byProductOp("thng")).toBe("getThngDetailMetaInfoThng");
    expect(advancedOp("thng")).toBe("getPublicPrcureThngInfoThngPPSSrch");
    expect(opinionOp("thng")).toBe("getPublicPrcureThngOpinionInfoThng");
  });

  it("접미가 업무구분 뒤에 붙는다 (외자·공사)", () => {
    expect(listOp("frgcpt")).toBe("getPublicPrcureThngInfoFrgcpt");
    expect(advancedOp("cnstwk")).toBe("getPublicPrcureThngInfoCnstwkPPSSrch");
    expect(opinionOp("servc")).toBe("getPublicPrcureThngOpinionInfoServc");
  });
});
