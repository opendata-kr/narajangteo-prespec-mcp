import { z } from "zod";
import type { DataGoKrClient, Params } from "@opendata-kr/core";
import { ALL_KINDS, type Kind, byInstitutionOp } from "../api/endpoints.js";
import { formatPrespec } from "../format.js";
import type { Prespec } from "../api/types.js";
import { dateRangeParams, pagingParams } from "@opendata-kr/core";
import { runList, type ListResult } from "./runList.js";

export const searchByInstitutionInputShape = {
  kind: z
    .array(z.enum(["cnstwk", "servc", "thng", "frgcpt"]))
    .optional()
    .describe(
      "업무구분: cnstwk=공사, servc=용역, thng=물품, frgcpt=외자. 미지정 시 전 구분 병렬 조회",
    ),
  orderInstitution: z.string().optional().describe("발주기관명"),
  demandInstitution: z.string().optional().describe("실수요기관명"),
  startDate: z.string().optional().describe("조회 시작일 YYYYMMDD"),
  endDate: z.string().optional().describe("조회 종료일 YYYYMMDD"),
  page: z.number().int().min(1).optional().describe("페이지 번호(기본 1)"),
  pageSize: z.number().int().min(1).max(100).optional().describe("페이지당 건수(기본 10)"),
};

// inputSchema에서 파생해 shape와 타입의 원천을 하나로 유지한다.
export type SearchByInstitutionArgs = z.infer<z.ZodObject<typeof searchByInstitutionInputShape>>;

export function runSearchByInstitution(
  client: DataGoKrClient,
  args: SearchByInstitutionArgs,
): Promise<ListResult<Prespec>> {
  const kinds = args.kind ?? [...ALL_KINDS];
  const params: Params = {
    ...pagingParams(args.page, args.pageSize),
    ...dateRangeParams(args.startDate, args.endDate),
  };
  if (args.orderInstitution) params.orderInsttNm = args.orderInstitution;
  if (args.demandInstitution) params.rlDminsttNm = args.demandInstitution;

  return runList(client, byInstitutionOp, params, kinds, args, formatPrespec);
}
