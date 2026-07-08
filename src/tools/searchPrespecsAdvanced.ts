import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, type Kind, advancedOp } from "../api/endpoints.js";
import { formatPrespec } from "../format.js";
import type { Prespec } from "../api/types.js";
import { dateRangeParams, pagingParams } from "@opendata-kr/core";
import { runList, type ListResult } from "./runList.js";

// 참고: ④ PPSSrch의 inqryDiv 의미는 ①과 다르다.
// ④ = 1.접수일시 / 2.사전규격등록번호 / 3.참조번호 (①의 3은 변경일시라 혼동 주의).
// 세부품명 name(dtilPrdctClsfcNoNm)은 ④가 받지 않는다(라이브 확인). 그건 search_prespecs_by_product 전용.
export const searchAdvancedInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe(
      "업무구분: cnstwk=공사, servc=용역, thng=물품, frgcpt=외자. 미지정 시 전 구분 병렬 조회",
    ),
  startDate: z.string().optional().describe("접수 시작일 YYYYMMDD"),
  endDate: z.string().optional().describe("접수 종료일 YYYYMMDD"),
  specRegistNo: z
    .string()
    .optional()
    .describe("사전규격등록번호로 조회(지정 시 최우선, inqryDiv=2)"),
  refNo: z
    .string()
    .optional()
    .describe("참조번호로 조회(지정 시 inqryDiv=3, 기간보다 우선)"),
  noticeInstitution: z.string().optional().describe("발주기관명"),
  demandInstitution: z.string().optional().describe("수요기관명"),
  productName: z.string().optional().describe("품명(사업명)/물품분류명"),
  detailProductCode: z.string().optional().describe("세부품명번호"),
  swBusinessYn: z
    .enum(["Y", "N"])
    .optional()
    .describe("SW사업 대상 여부: Y=대상, N=비대상"),
  page: z.number().int().min(1).optional().describe("페이지 번호(기본 1)"),
  pageSize: z.number().int().min(1).max(100).optional().describe("페이지당 건수(기본 10)"),
};

// inputSchema에서 파생해 shape와 타입의 원천을 하나로 유지한다.
export type SearchAdvancedArgs = z.infer<z.ZodObject<typeof searchAdvancedInputShape>>;

export function runSearchAdvanced(
  client: DataGoKrClient,
  args: SearchAdvancedArgs,
): Promise<ListResult<Prespec>> {
  const kinds = args.kind ?? [...ALL_KINDS];
  const params: Params = pagingParams(args.page, args.pageSize);

  // inqryDiv는 하나만 지정된다. 우선순위: 등록번호(2) > 참조번호(3) > 접수일시(1).
  if (args.specRegistNo) {
    params.inqryDiv = "2";
    params.bfSpecRgstNo = args.specRegistNo;
  } else if (args.refNo) {
    params.inqryDiv = "3";
    params.refNo = args.refNo;
  } else if (args.startDate || args.endDate) {
    params.inqryDiv = "1";
    Object.assign(params, dateRangeParams(args.startDate, args.endDate));
  }

  // 부가 필터는 inqryDiv와 무관하게 함께 전송한다.
  if (args.noticeInstitution) params.ntceInsttNm = args.noticeInstitution;
  if (args.demandInstitution) params.dminsttNm = args.demandInstitution;
  if (args.productName) params.prdctClsfcNoNm = args.productName;
  if (args.detailProductCode) params.dtilPrdctClsfcNo = args.detailProductCode;
  if (args.swBusinessYn) params.swBizObjYn = args.swBusinessYn;

  return runList(client, advancedOp, params, kinds, args, formatPrespec);
}
