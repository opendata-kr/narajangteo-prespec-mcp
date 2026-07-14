import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { makeTestClient } from "./test-helpers.js";
import { createServer } from "./server.js";

const gatewayClient = makeTestClient({}).client;

describe("createServer", () => {
  it("McpServer 인스턴스를 생성한다", () => {
    const server = createServer(gatewayClient);
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("사전규격 5툴을 등록한다", async () => {
    const server = createServer(gatewayClient);
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "search_prespecs",
        "search_prespecs_by_institution",
        "search_prespecs_by_product",
        "search_prespecs_advanced",
        "get_prespec_opinions",
      ].sort(),
    );

    await client.close();
    await server.close();
  });

  it("모든 도구가 조회 전용 애노테이션(readOnlyHint·openWorldHint)과 title을 노출한다", async () => {
    const server = createServer(gatewayClient);
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const { tools } = await client.listTools();
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint, `${t.name} readOnlyHint`).toBe(true);
      expect(t.annotations?.openWorldHint, `${t.name} openWorldHint`).toBe(true);
      expect(t.title, `${t.name} title`).toBeTruthy();
    }

    await client.close();
    await server.close();
  });
});
