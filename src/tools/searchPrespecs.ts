import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, type Kind, listOp } from "../api/endpoints.js";
import { formatPrespec } from "../format.js";
import type { Prespec } from "../api/types.js";
import { dateRangeParams, pagingParams, runList, type ListResult } from "./runList.js";

export const searchPrespecsInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe("업무구분 배열. 미지정 시 전 구분(공사/용역/물품/외자) 검색"),
  startDate: z.string().optional().describe("조회 시작일 YYYYMMDD"),
  endDate: z.string().optional().describe("조회 종료일 YYYYMMDD"),
  dateType: z
    .enum(["regist", "change"])
    .optional()
    .describe("기간 기준: regist=등록일시(기본), change=변경일시"),
  specRegistNo: z
    .string()
    .optional()
    .describe("사전규격등록번호로 단건 조회(지정 시 기간보다 우선)"),
  page: z.number().int().min(1).optional().describe("페이지 번호(기본 1)"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("페이지당 건수(기본 10)"),
};

export type SearchPrespecsArgs = {
  kind?: Kind[];
  startDate?: string;
  endDate?: string;
  dateType?: "regist" | "change";
  specRegistNo?: string;
  page?: number;
  pageSize?: number;
};

export function runSearchPrespecs(
  client: DataGoKrClient,
  args: SearchPrespecsArgs,
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

  return runList(client, listOp, params, kinds, args, formatPrespec);
}
