<!-- mcp-name: io.github.opendata-kr/narajangteo-prespec-mcp -->

# 나라장터 사전규격 MCP

나라장터 사전규격정보서비스(HrcspSsstndrdInfoService) Open API를 위한 로컬 MCP 서버.

> **스캐폴딩 단계.** 리포 인프라(빌드·CI·릴리스 파이프라인)만 구성돼 있습니다.
> 사전규격 검색/조회 툴, 클라이언트별 설정, 인증키 발급 그림 가이드(`docs/service-key-guide.md`)는
> API 스펙 통합 단계에서 채웁니다. 아래 설치·사용법은 그때 확정됩니다.

## 설치

```jsonc
{
  "mcpServers": {
    "narajangteo-prespec": {
      "command": "npx",
      "args": ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"],
      "env": {
        "DATA_GO_KR_SERVICE_KEY": "<data.go.kr Decoding 인증키>"
      }
    }
  }
}
```

> 클라이언트별 설정 블록과 원클릭 설치 버튼은 스펙 통합 시 추가됩니다.

## 사용법

사전규격 검색/조회 툴은 스펙 통합 후 문서화됩니다.

## 개발

```sh
nvm use
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT
