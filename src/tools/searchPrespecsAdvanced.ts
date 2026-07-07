import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, type Kind, advancedOp } from "../api/endpoints.js";
import { formatPrespec } from "../format.js";
import type { Prespec } from "../api/types.js";
import { dateRangeParams, pagingParams, runList, type ListResult } from "./runList.js";

export const searchAdvancedInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe("업무구분 배열. 미지정 시 전 구분 검색"),
  startDate: z.string().optional().describe("조회 시작일 YYYYMMDD"),
  endDate: z.string().optional().describe("조회 종료일 YYYYMMDD"),
  dateType: z
    .enum(["regist", "change"])
    .optional()
    .describe("기간 기준: regist=등록일시(기본), change=변경일시"),
  specRegistNo: z.string().optional().describe("사전규격등록번호(지정 시 기간보다 우선)"),
  noticeInstitution: z.string().optional().describe("발주기관명"),
  demandInstitution: z.string().optional().describe("수요기관명"),
  productName: z.string().optional().describe("품명(사업명)/물품분류명"),
  detailProductCode: z.string().optional().describe("세부품명번호"),
  refNo: z.string().optional().describe("참조번호"),
  swBusinessYn: z.string().optional().describe("SW사업 여부(Y/N)"),
  page: z.number().int().min(1).optional().describe("페이지 번호(기본 1)"),
  pageSize: z.number().int().min(1).max(100).optional().describe("페이지당 건수(기본 10)"),
};

export type SearchAdvancedArgs = {
  kind?: Kind[];
  startDate?: string;
  endDate?: string;
  dateType?: "regist" | "change";
  specRegistNo?: string;
  noticeInstitution?: string;
  demandInstitution?: string;
  productName?: string;
  detailProductCode?: string;
  refNo?: string;
  swBusinessYn?: string;
  page?: number;
  pageSize?: number;
};

export function runSearchAdvanced(
  client: DataGoKrClient,
  args: SearchAdvancedArgs,
): Promise<ListResult<Prespec>> {
  const kinds = args.kind ?? [...ALL_KINDS];
  const params: Params = pagingParams(args.page, args.pageSize);

  if (args.specRegistNo) {
    params.inqryDiv = "2";
    params.bfSpecRgstNo = args.specRegistNo;
  } else if (args.startDate || args.endDate) {
    params.inqryDiv = args.dateType === "change" ? "3" : "1";
    Object.assign(params, dateRangeParams(args.startDate, args.endDate));
  }

  if (args.noticeInstitution) params.ntceInsttNm = args.noticeInstitution;
  if (args.demandInstitution) params.dminsttNm = args.demandInstitution;
  if (args.productName) params.prdctClsfcNoNm = args.productName;
  if (args.detailProductCode) params.dtilPrdctClsfcNo = args.detailProductCode;
  if (args.refNo) params.refNo = args.refNo;
  if (args.swBusinessYn) params.swBizObjYn = args.swBusinessYn;

  return runList(client, advancedOp, params, kinds, args, formatPrespec);
}
