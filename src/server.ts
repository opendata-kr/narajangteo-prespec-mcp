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

// 조회 전용 도구 공통 애노테이션: 환경을 바꾸지 않고(readOnlyHint), 외부 API를 호출한다(openWorldHint).
const READONLY = { readOnlyHint: true, openWorldHint: true } as const;

export function createServer(client: DataGoKrClient): McpServer {
  const server = new McpServer({
    name: "narajangteo-prespec-mcp",
    version: VERSION,
  });

  server.registerTool(
    "search_prespecs",
    {
      title: "사전규격 조회",
      description:
        "사전규격을 기간(등록/변경일시) 또는 사전규격등록번호로 조회한다. 단순 기간·번호 조회에 쓴다. 기관 기준은 search_prespecs_by_institution, 품명 기준은 search_prespecs_by_product, 복합 조건은 search_prespecs_advanced를 쓴다. 업무구분 미지정 시 공사/용역/물품/외자를 병렬 조회한다. 데이터는 2025년 1월 이후 등록분이다.",
      inputSchema: searchPrespecsInputShape,
      annotations: READONLY,
    },
    (args) => guard(() => runSearchPrespecs(client, args as SearchPrespecsArgs)),
  );

  server.registerTool(
    "search_prespecs_by_institution",
    {
      title: "기관별 사전규격 조회",
      description:
        "발주기관명·실수요기관명으로 사전규격을 조회한다. 특정 기관의 발주 예정 물량을 볼 때 쓴다. 품명 기준은 search_prespecs_by_product, 여러 조건을 동시에 걸려면 search_prespecs_advanced를 쓴다. 업무구분 미지정 시 전 구분 병렬 조회. 데이터는 2025년 1월 이후 등록분이다.",
      inputSchema: searchByInstitutionInputShape,
      annotations: READONLY,
    },
    (args) =>
      guard(() => runSearchByInstitution(client, args as SearchByInstitutionArgs)),
  );

  server.registerTool(
    "search_prespecs_by_product",
    {
      title: "품목별 사전규격 조회",
      description:
        "품명·세부품명(번호·이름)으로 사전규격을 조회한다. 관심 품목의 사전규격을 찾을 때 쓴다. 기관 기준은 search_prespecs_by_institution, 여러 조건을 동시에 걸려면 search_prespecs_advanced를 쓴다(단 세부품명 이름 검색은 이 도구에만 있다). 업무구분 미지정 시 전 구분 병렬 조회. 데이터는 2025년 1월 이후 등록분이다.",
      inputSchema: searchByProductInputShape,
      annotations: READONLY,
    },
    (args) => guard(() => runSearchByProduct(client, args as SearchByProductArgs)),
  );

  server.registerTool(
    "search_prespecs_advanced",
    {
      title: "사전규격 복합 검색",
      description:
        "발주기관·수요기관·품명·참조번호·SW사업여부 등 복합 조건으로 사전규격을 조회한다. 여러 필터를 동시에 걸 때 쓴다(기관·품명 필터를 포괄). 조회 우선순위는 사전규격등록번호 > 참조번호 > 접수일시다. 세부품명 이름(name) 검색은 이 API가 지원하지 않으므로 그 경우 search_prespecs_by_product를 쓴다. 업무구분 미지정 시 전 구분 병렬 조회. 데이터는 2025년 1월 이후 등록분이다.",
      inputSchema: searchAdvancedInputShape,
      annotations: READONLY,
    },
    (args) => guard(() => runSearchAdvanced(client, args as SearchAdvancedArgs)),
  );

  server.registerTool(
    "get_prespec_opinions",
    {
      title: "규격서 의견 조회",
      description:
        "특정 사전규격(사전규격등록번호)에 달린 규격서 의견·답변 목록을 조회한다. 사전규격 자체 목록이 필요하면 search_prespecs 계열 도구를 먼저 써서 등록번호를 얻는다. 업무구분 미지정 시 전 구분 병렬 조회. 데이터는 2025년 1월 이후 등록분이다.",
      inputSchema: getOpinionsInputShape,
      annotations: READONLY,
    },
    (args) => guard(() => runGetOpinions(client, args as GetOpinionsArgs)),
  );

  return server;
}
