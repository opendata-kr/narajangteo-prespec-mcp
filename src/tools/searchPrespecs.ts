import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, listOp } from "../api/endpoints.js";
import { formatPrespec } from "../format.js";
import { RawPrespecSchema } from "../api/schema.js";
import type { Prespec } from "../api/types.js";
import { dateRangeParams, pagingParams } from "@opendata-kr/core";
import { runList, type ListResult } from "./runList.js";

export const searchPrespecsInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe(
      "업무구분: cnstwk=공사, servc=용역, thng=물품, frgcpt=외자. 미지정 시 전 구분 병렬 조회",
    ),
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

// inputSchema에서 파생해 shape와 타입의 원천을 하나로 유지한다(수동 중복·드리프트 방지).
export type SearchPrespecsArgs = z.infer<z.ZodObject<typeof searchPrespecsInputShape>>;

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

  return runList(client, listOp, params, kinds, args, RawPrespecSchema, formatPrespec);
}
