import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataGoKrClient } from "@opendata-kr/core";
import { VERSION } from "./version.js";

// 사전규격 검색/조회 툴은 API 스펙 통합 단계에서 등록한다.
// HrcspSsstndrdInfoService 오퍼레이션(getPublicPrcureThngInfo{Kind},
// {Kind}PPSSrch, getInsttAcctoThngListInfo{Kind}, getThngDetailMetaInfo{Kind} 등)을
// client로 호출하는 툴이 여기 추가된다.
export function createServer(_client: DataGoKrClient): McpServer {
  return new McpServer({
    name: "narajangteo-prespec-mcp",
    version: VERSION,
  });
}
