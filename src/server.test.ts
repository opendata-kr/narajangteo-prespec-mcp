import { describe, expect, it, vi } from "vitest";
import type { DataGoKrClient } from "@opendata-kr/core";
import { createServer } from "./server.js";

const gatewayClient: DataGoKrClient = {
  serviceKeyLooksPreEncoded: false,
  call: vi.fn(),
};

describe("createServer", () => {
  it("McpServer 인스턴스를 생성한다", () => {
    const server = createServer(gatewayClient);
    expect(server).toBeDefined();
    // McpServer는 connect 메서드를 가진다
    expect(typeof server.connect).toBe("function");
  });
});
