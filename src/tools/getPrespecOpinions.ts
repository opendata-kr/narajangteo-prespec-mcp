import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, opinionOp } from "../api/endpoints.js";
import { formatPrespecOpinion } from "../format.js";
import { RawPrespecOpinionSchema } from "../api/schema.js";
import type { PrespecOpinion } from "../api/types.js";
import { dateRangeParams, pagingParams } from "@opendata-kr/core";
import { runList, type ListResult } from "./runList.js";

export const getOpinionsInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe(
      "업무구분: cnstwk=공사, servc=용역, thng=물품, frgcpt=외자. 미지정 시 전 구분 병렬 조회로 API 요청 4건을 소모한다. 업무구분을 알면 지정해 인증키 일일 트래픽을 아낀다",
    ),
  specRegistNo: z
    .string()
    .optional()
    .describe("사전규격등록번호(지정 시 inqryDiv=2, 기간보다 우선)"),
  startDate: z.string().optional().describe("조회 시작일 YYYYMMDD"),
  endDate: z.string().optional().describe("조회 종료일 YYYYMMDD"),
  page: z.number().int().min(1).optional().describe("페이지 번호(기본 1)"),
  pageSize: z.number().int().min(1).max(100).optional().describe("페이지당 건수(기본 10)"),
};

// inputSchema에서 파생해 shape와 타입의 원천을 하나로 유지한다.
export type GetOpinionsArgs = z.infer<z.ZodObject<typeof getOpinionsInputShape>>;

// ⑤ 의견의 inqryDiv는 1(등록일시)/2(사전규격등록번호)만 있다.
export function runGetOpinions(
  client: DataGoKrClient,
  args: GetOpinionsArgs,
): Promise<ListResult<PrespecOpinion>> {
  const kinds = args.kind ?? [...ALL_KINDS];
  const params: Params = pagingParams(args.page, args.pageSize);

  if (args.specRegistNo) {
    params.inqryDiv = "2";
    params.bfSpecRgstNo = args.specRegistNo;
  } else if (args.startDate || args.endDate) {
    params.inqryDiv = "1";
    Object.assign(params, dateRangeParams(args.startDate, args.endDate));
  }

  return runList(
    client,
    opinionOp,
    params,
    kinds,
    args,
    RawPrespecOpinionSchema,
    formatPrespecOpinion,
  );
}
