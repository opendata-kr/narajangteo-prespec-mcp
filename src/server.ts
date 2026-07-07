import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataGoKrClient } from "@opendata-kr/core";
import { VERSION } from "./version.js";
import {
  runSearchPrespecs,
  searchPrespecsInputShape,
  type SearchPrespecsArgs,
} from "./tools/searchPrespecs.js";
import {
  runSearchByInstitution,
  searchByInstitutionInputShape,
  type SearchByInstitutionArgs,
} from "./tools/searchPrespecsByInstitution.js";
import {
  runSearchByProduct,
  searchByProductInputShape,
  type SearchByProductArgs,
} from "./tools/searchPrespecsByProduct.js";
import {
  runSearchAdvanced,
  searchAdvancedInputShape,
  type SearchAdvancedArgs,
} from "./tools/searchPrespecsAdvanced.js";
import {
  runGetOpinions,
  getOpinionsInputShape,
  type GetOpinionsArgs,
} from "./tools/getPrespecOpinions.js";

function textResult(payload: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

async function guard<T>(run: () => Promise<T>) {
  try {
    return textResult(await run());
  } catch (err) {
    return textResult(
      { error: err instanceof Error ? err.message : String(err) },
      true,
    );
  }
}

export function createServer(client: DataGoKrClient): McpServer {
  const server = new McpServer({
    name: "narajangteo-prespec-mcp",
    version: VERSION,
  });

  server.registerTool(
    "search_prespecs",
    {
      description:
        "사전규격을 기간(등록/변경일시) 또는 사전규격등록번호로 조회한다. 단순 기간·번호 조회에 쓴다. 기관 기준은 search_prespecs_by_institution, 품명 기준은 search_prespecs_by_product, 복합 조건은 search_prespecs_advanced를 쓴다. 업무구분 미지정 시 공사/용역/물품/외자를 병렬 조회한다.",
      inputSchema: searchPrespecsInputShape,
    },
    (args) => guard(() => runSearchPrespecs(client, args as SearchPrespecsArgs)),
  );

  server.registerTool(
    "search_prespecs_by_institution",
    {
      description:
        "발주기관명·실수요기관명으로 사전규격을 조회한다. 특정 기관의 발주 예정 물량을 볼 때 쓴다. 업무구분 미지정 시 전 구분 병렬 조회.",
      inputSchema: searchByInstitutionInputShape,
    },
    (args) =>
      guard(() => runSearchByInstitution(client, args as SearchByInstitutionArgs)),
  );

  server.registerTool(
    "search_prespecs_by_product",
    {
      description:
        "품명·세부품명(번호)으로 사전규격을 조회한다. 관심 품목의 사전규격을 찾을 때 쓴다. 업무구분 미지정 시 전 구분 병렬 조회.",
      inputSchema: searchByProductInputShape,
    },
    (args) => guard(() => runSearchByProduct(client, args as SearchByProductArgs)),
  );

  server.registerTool(
    "search_prespecs_advanced",
    {
      description:
        "발주기관·수요기관·품명·참조번호·SW사업여부 등 복합 조건으로 사전규격을 조회한다. 여러 필터를 동시에 걸 때 쓴다(기관·품명 필터를 포괄). 업무구분 미지정 시 전 구분 병렬 조회.",
      inputSchema: searchAdvancedInputShape,
    },
    (args) => guard(() => runSearchAdvanced(client, args as SearchAdvancedArgs)),
  );

  server.registerTool(
    "get_prespec_opinions",
    {
      description:
        "특정 사전규격(사전규격등록번호)에 달린 규격서 의견·답변 목록을 조회한다. 업무구분 미지정 시 전 구분 병렬 조회.",
      inputSchema: getOpinionsInputShape,
    },
    (args) => guard(() => runGetOpinions(client, args as GetOpinionsArgs)),
  );

  return server;
}
