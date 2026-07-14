import { z } from "zod";

// data.go.kr 응답 item 검증 스키마. core README 규약대로 관용적으로 짠다.
// looseObject로 미선언 필드를 통과시키고, 필수는 조인 키(사전규격등록번호)만 둔다.
// 숫자·문자열이 섞여 올 수 있는 필드(금액·일수·번호)는 coerce.string으로 수렴시킨다.

// ①②③④ 공통 사전규격 item.
export const RawPrespecSchema = z.looseObject({
  bfSpecRgstNo: z.string(),
  prdctClsfcNoNm: z.string().optional(),
  asignBdgtAmt: z.coerce.string().optional(),
  orderInsttNm: z.string().optional(),
  rlDminsttNm: z.string().optional(),
  rgstDt: z.string().optional(),
  chgDt: z.string().optional(),
  opninRgstClseDt: z.string().optional(),
  rcptDt: z.string().optional(),
  refNo: z.string().optional(),
  bidNtceNoList: z.string().optional(),
  bsnsDivNm: z.string().optional(),
  dlvrDaynum: z.coerce.string().optional(),
  dlvrTmlmtDt: z.string().optional(),
  ofclNm: z.string().optional(),
  ofclTelNo: z.string().optional(),
  swBizObjYn: z.string().optional(),
  prdctDtlList: z.string().optional(),
});

export type RawPrespec = z.infer<typeof RawPrespecSchema>;

// ⑤ 규격서 의견 item.
export const RawPrespecOpinionSchema = z.looseObject({
  bfSpecRgstNo: z.string(),
  refNo: z.string().optional(),
  opninNo: z.coerce.string().optional(),
  rplyNo: z.coerce.string().optional(),
  opninTitl: z.string().optional(),
  opninCntnts: z.string().optional(),
  mkngCorpNm: z.string().optional(),
  mkrNm: z.string().optional(),
  inptDt: z.string().optional(),
  mkrTel: z.string().optional(),
  mkrEmail: z.string().optional(),
  specDocOpninFileUrl1: z.string().optional(),
  specDocOpninFileUrl2: z.string().optional(),
  specDocOpninFileUrl3: z.string().optional(),
  specDocOpninFileUrl4: z.string().optional(),
  specDocOpninFileUrl5: z.string().optional(),
});

export type RawPrespecOpinion = z.infer<typeof RawPrespecOpinionSchema>;
