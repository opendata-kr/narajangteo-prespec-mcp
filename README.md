<!-- mcp-name: io.github.opendata-kr/narajangteo-prespec-mcp -->

# @opendata-kr/narajangteo-prespec-mcp

나라장터 사전규격정보서비스(공공데이터포털 data.go.kr) Open API를 감싼 로컬 MCP 서버.

[![npm version](https://img.shields.io/npm/v/@opendata-kr/narajangteo-prespec-mcp)](https://www.npmjs.com/package/@opendata-kr/narajangteo-prespec-mcp)
[![CI](https://img.shields.io/github/actions/workflow/status/opendata-kr/narajangteo-prespec-mcp/ci.yml?branch=main&label=CI)](https://github.com/opendata-kr/narajangteo-prespec-mcp/actions/workflows/ci.yml)
[![node](https://img.shields.io/node/v/@opendata-kr/narajangteo-prespec-mcp)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@opendata-kr/narajangteo-prespec-mcp)](./LICENSE)

MCP 클라이언트에서 나라장터 사전규격(발주기관이 입찰공고 전에 규격서를 사전공개하고 의견을 받는 단계)을 자연어로 검색하고 조회한다. 예를 들어 이렇게 물어볼 수 있다.

- "이번 달 올라온 물품 사전규격을 찾아줘"
- "해군군수사령부가 발주한 사전규격을 검색해줘"
- "사전규격등록번호 R26BD00234692의 규격서 의견을 보여줘"

## 특징

- **20개 오퍼레이션을 5개 도구로 노출**: 전체 조회/기관별/품목별/복합검색/규격서의견 유형별로 묶어 사용성을 단순화했다.
- **4개 업무구분 병렬 검색**: 공사/용역/물품/외자를 한 번에 조회한다. 업무구분 미지정 시 전 구분을 동시 검색한다.
- **부분 실패 표면화**: 일부 구분 조회가 실패해도 나머지 결과를 반환하고, 실패한 구분은 오류 메시지로 드러낸다(조용한 누락 없음).
- **data.go.kr 에러코드 한국어화**: 인증키 만료, 트래픽 초과 등 결과코드를 조치 가능한 한국어 메시지로 정규화한다.
- **이중 인코딩 방어**: Encoding 키를 잘못 넣으면 경고하고, 요청은 한 번만 인코딩한다.
- **타임아웃**: API 호출에 타임아웃을 둔다.

## 준비물

- **Node.js 24** 이상 (`.nvmrc` = `lts/krypton`).
- **data.go.kr 인증키**:
  1. [공공데이터포털](https://www.data.go.kr)에서 **나라장터 사전규격정보서비스**를 활용신청해 `[승인]`을 받는다. 인증키는 계정당 하나지만, 각 API는 저마다 활용신청 승인이 있어야 그 API에서 인증된다. 서비스키가 있어도 이 API를 활용신청하지 않으면 인증 오류(코드 30)가 난다.
  2. 마이페이지 → 활용신청 현황 → 개발계정 상세에서 **Decoding 서비스키**를 복사한다.
  3. 같은 `DATA_GO_KR_SERVICE_KEY`는 같은 계정으로 활용신청한 다른 data.go.kr API에도 재사용된다.

> [!TIP]
> 공공데이터포털이 처음이라면 활용신청부터 인증키 복사까지 그림으로 따라 하는 [**data.go.kr 인증키 발급 가이드**](docs/service-key-guide.md)를 참고한다.

> 서비스키는 반드시 **Decoding(원본)** 키를 넣는다. Encoding(`%2B` 등 포함) 키를 넣으면 이중 인코딩으로 인증 오류(코드 30)가 난다.

## MCP 클라이언트 설정

MCP 클라이언트에 아래 config를 추가한다:

```json
{
  "mcpServers": {
    "narajangteo-prespec": {
      "command": "npx",
      "args": ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"],
      "env": { "DATA_GO_KR_SERVICE_KEY": "발급받은_Decoding_키" }
    }
  }
}
```

> [!NOTE]
> `@opendata-kr/narajangteo-prespec-mcp@latest`를 쓰면 클라이언트가 항상 최신 버전을 받는다.

> [!IMPORTANT]
> `DATA_GO_KR_SERVICE_KEY`(필수, **Decoding 원본** 키)가 없으면 첫 호출이 인증 오류(코드 30)로 실패한다. 위 config의 `env`에 키를 넣는다. 원클릭 버튼이나 env를 config에 담지 못하는 클라이언트는 설치 후 셸 환경변수로 `DATA_GO_KR_SERVICE_KEY`를 설정한다.

### 클라이언트별 설정

<details>
  <summary>Amp</summary>
  https://ampcode.com/manual#mcp 의 안내를 따르고 위 config를 사용한다. CLI로도 추가할 수 있다:

```bash
amp mcp add narajangteo-prespec -- npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

이후 생성된 설정의 `env`(또는 셸 환경변수)에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Antigravity</summary>

<a href="https://antigravity.google/docs/mcp">Antigravity 문서</a>의 커스텀 MCP 서버 추가 방법을 따라 아래 config를 MCP servers 설정에 넣는다:

```json
{
  "mcpServers": {
    "narajangteo-prespec": {
      "command": "npx",
      "args": ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"],
      "env": { "DATA_GO_KR_SERVICE_KEY": "발급받은_Decoding_키" }
    }
  }
}
```

</details>

<details>
  <summary>Claude Code</summary>

Claude Code CLI로 서버를 추가한다 (<a href="https://code.claude.com/docs/en/mcp">가이드</a>):

```bash
claude mcp add narajangteo-prespec --scope user --env DATA_GO_KR_SERVICE_KEY=발급받은_Decoding_키 -- npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

</details>

<details>
  <summary>Cline</summary>
  https://docs.cline.bot/mcp/configuring-mcp-servers 의 안내를 따르고 위 config를 사용한다.
</details>

<details>
  <summary>Codex</summary>
  <a href="https://developers.openai.com/codex/mcp/#configure-with-the-cli">MCP 설정 가이드</a>를 따르고 위 config를 사용한다. Codex CLI로도 추가할 수 있다:

```bash
codex mcp add narajangteo-prespec --env DATA_GO_KR_SERVICE_KEY=발급받은_Decoding_키 -- npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

**Windows**

`~/.codex/config.toml`에 `cmd /c` 래핑으로 추가한다:

```toml
[mcp_servers.narajangteo-prespec]
command = "cmd"
args = ["/c", "npx", "-y", "@opendata-kr/narajangteo-prespec-mcp@latest"]
env = { DATA_GO_KR_SERVICE_KEY = "발급받은_Decoding_키" }
```

</details>

<details>
  <summary>Command Code</summary>

Command Code CLI로 서버를 추가한다 (<a href="https://commandcode.ai/docs/mcp">MCP 가이드</a>):

```bash
cmd mcp add narajangteo-prespec --scope user npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

이후 생성된 설정의 `env`(또는 셸 환경변수)에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Continue</summary>

Continue의 <a href="https://docs.continue.dev/customize/deep-dives/mcp">MCP 가이드</a>를 따른다. Continue는 `mcpServers`를 배열로 쓴다:

```json
{
  "mcpServers": [
    {
      "name": "narajangteo-prespec",
      "command": "npx",
      "args": ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"],
      "env": { "DATA_GO_KR_SERVICE_KEY": "발급받은_Decoding_키" }
    }
  ]
}
```

</details>

<details>
  <summary>Copilot CLI</summary>

Copilot CLI를 시작한다:

```
copilot
```

MCP 서버 추가 대화를 연다:

```
/mcp add
```

다음 필드를 입력하고 `CTRL+S`로 저장한다:

- **Server name:** `narajangteo-prespec`
- **Server Type:** `[1] Local`
- **Command:** `npx -y @opendata-kr/narajangteo-prespec-mcp@latest`
- **Environment variables:** `DATA_GO_KR_SERVICE_KEY=발급받은_Decoding_키`

</details>

<details>
  <summary>Copilot / VS Code</summary>

**버튼으로 설치:**

[<img src="https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white" alt="Install in VS Code">](https://vscode.dev/redirect/mcp/install?name=io.github.opendata-kr%2Fnarajangteo-prespec-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40opendata-kr%2Fnarajangteo-prespec-mcp%22%5D%2C%22env%22%3A%7B%7D%7D)

[<img src="https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white" alt="Install in VS Code Insiders">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522io.github.opendata-kr%252Fnarajangteo-prespec-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522%2540opendata-kr%252Fnarajangteo-prespec-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

> 버튼은 키를 담지 못한다. 설치 후 `.vscode/mcp.json`(또는 사용자 설정)의 `env`에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

**직접 추가:**

VS Code [MCP 설정 가이드](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server)를 따르거나 CLI를 쓴다.

macOS·Linux:

```bash
code --add-mcp '{"name":"narajangteo-prespec","command":"npx","args":["-y","@opendata-kr/narajangteo-prespec-mcp@latest"],"env":{"DATA_GO_KR_SERVICE_KEY":"발급받은_Decoding_키"}}'
```

Windows(PowerShell):

```powershell
code --add-mcp '{"""name""":"""narajangteo-prespec""","""command""":"""npx""","""args""":["""-y""","""@opendata-kr/narajangteo-prespec-mcp@latest"""],"""env""":{"""DATA_GO_KR_SERVICE_KEY""":"""발급받은_Decoding_키"""}}'
```

</details>

<details>
  <summary>Cursor</summary>

**버튼으로 설치:**

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Add narajangteo-prespec MCP server to Cursor">](https://cursor.com/en/install-mcp?name=narajangteo-prespec&config=eyJjb21tYW5kIjoibnB4IC15IEBvcGVuZGF0YS1rci9uYXJhamFuZ3Rlby1wcmVzcGVjLW1jcEBsYXRlc3QifQ==)

> 버튼은 키를 담지 못한다. 설치 후 Cursor의 MCP 설정에서 `env`에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

**직접 추가:**

`Cursor Settings` → `MCP` → `New MCP Server`에서 위 config를 사용한다.

</details>

<details>
  <summary>Factory CLI</summary>

Factory CLI로 서버를 추가한다 (<a href="https://docs.factory.ai/cli/configuration/mcp">가이드</a>):

```bash
droid mcp add narajangteo-prespec "npx -y @opendata-kr/narajangteo-prespec-mcp@latest"
```

이후 생성된 설정의 `env`(또는 셸 환경변수)에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Gemini CLI</summary>

Gemini CLI로 서버를 추가한다.

**프로젝트 범위:**

```bash
gemini mcp add narajangteo-prespec npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

**전역:**

```bash
gemini mcp add -s user narajangteo-prespec npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

또는 <a href="https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP 가이드</a>를 따르고 위 config를 쓴다. `~/.gemini/settings.json`의 서버 정의 `env`에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Gemini Code Assist</summary>
  <a href="https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer#configure-mcp-servers">MCP 설정 가이드</a>를 따르고 위 config를 사용한다.
</details>

<details>
  <summary>Grok Build CLI</summary>

```bash
grok mcp add narajangteo-prespec npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

이후 생성된 설정의 `env`(또는 셸 환경변수)에 `DATA_GO_KR_SERVICE_KEY`를 추가한다. 더 많은 옵션은 <a href="https://docs.x.ai/build/features/skills-plugins-marketplaces">문서</a> 참고.

</details>

<details>
  <summary>JetBrains AI Assistant & Junie</summary>

`Settings | Tools | AI Assistant | Model Context Protocol (MCP)` → `Add`에서 위 config를 사용한다.
Junie도 같은 방식으로 `Settings | Tools | Junie | MCP Settings` → `Add`에서 위 config를 사용한다.

</details>

<details>
  <summary>Katalon Studio</summary>

Katalon StudioAssist는 MCP 프록시를 통해 stdio 서버를 연결한다.

**1단계:** <a href="https://docs.katalon.com/katalon-studio/studioassist/mcp-servers/setting-up-mcp-proxy-for-stdio-mcp-servers">MCP 프록시 설정 가이드</a>로 프록시를 설치한다.

**2단계:** 프록시로 서버를 띄운다(같은 셸에 `DATA_GO_KR_SERVICE_KEY`를 export 한 상태):

```bash
DATA_GO_KR_SERVICE_KEY=발급받은_Decoding_키 mcp-proxy --transport streamablehttp --port 8080 -- npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

**3단계:** StudioAssist에 다음 설정으로 서버를 추가한다:

- **Connection URL:** `http://127.0.0.1:8080/mcp`
- **Transport type:** `HTTP`

</details>

<details>
  <summary>Kiro</summary>

**Kiro Settings**에서 `Configure MCP` → `Open Workspace or User MCP Config` → 위 config를 사용한다.

또는 **Activity Bar** → `Kiro` → `MCP Servers` → `Open MCP Config`에서 위 config를 사용한다.

</details>

<details>
  <summary>Mistral Vibe</summary>

`~/.vibe/config.toml`에 추가한다:

```toml
[[mcp_servers]]
name = "narajangteo-prespec"
transport = "stdio"
command = "npx"
args = ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"]
env = { DATA_GO_KR_SERVICE_KEY = "발급받은_Decoding_키" }
```

</details>

<details>
  <summary>OpenCode</summary>

`opencode.json`에 추가한다. 없으면 `~/.config/opencode/opencode.json`에 만든다 (<a href="https://opencode.ai/docs/mcp-servers">가이드</a>):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "narajangteo-prespec": {
      "type": "local",
      "command": ["npx", "-y", "@opendata-kr/narajangteo-prespec-mcp@latest"],
      "environment": { "DATA_GO_KR_SERVICE_KEY": "발급받은_Decoding_키" }
    }
  }
}
```

</details>

<details>
  <summary>Qoder</summary>

**Qoder Settings**에서 `MCP Server` → `+ Add` → 위 config를 사용한다.

또는 <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">MCP 가이드</a>를 따르고 위 config를 쓴다.

</details>

<details>
  <summary>Qoder CLI</summary>

Qoder CLI로 서버를 추가한다 (<a href="https://docs.qoder.com/cli/using-cli#mcp-servers">가이드</a>):

**프로젝트 범위:**

```bash
qodercli mcp add narajangteo-prespec -- npx @opendata-kr/narajangteo-prespec-mcp@latest
```

**전역:**

```bash
qodercli mcp add -s user narajangteo-prespec -- npx @opendata-kr/narajangteo-prespec-mcp@latest
```

이후 생성된 설정의 `env`(또는 셸 환경변수)에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Visual Studio</summary>

**버튼으로 설치:**

[<img src="https://img.shields.io/badge/Visual_Studio-Install-C16FDE?logo=visualstudio&logoColor=white" alt="Install in Visual Studio">](https://vs-open.link/mcp-install?%7B%22name%22%3A%22narajangteo-prespec%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40opendata-kr%2Fnarajangteo-prespec-mcp%40latest%22%5D%7D)

> 버튼은 키를 담지 못한다. 설치 후 서버 설정의 `env`에 `DATA_GO_KR_SERVICE_KEY`를 추가한다.

</details>

<details>
  <summary>Warp</summary>

`Settings | AI | Manage MCP Servers` → `+ Add`에서 [MCP 서버를 추가](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server)하고 위 config를 사용한다.

</details>

<details>
  <summary>Windsurf</summary>
  <a href="https://docs.windsurf.com/windsurf/cascade/mcp#mcp-config-json">MCP 설정 가이드</a>를 따르고 위 config를 사용한다. Windsurf는 `mcpServers` 키를 쓴다(`~/.codeium/windsurf/mcp_config.json`).
</details>

<details>
  <summary>Zed</summary>

`~/.config/zed/settings.json`에 추가한다(스키마는 Zed 버전에 따라 다를 수 있으니 <a href="https://zed.dev/docs/ai/mcp">Zed 공식 문서</a>를 확인):

```json
{
  "context_servers": {
    "narajangteo-prespec": {
      "command": { "path": "npx", "args": ["-y", "@opendata-kr/narajangteo-prespec-mcp@latest"] },
      "env": { "DATA_GO_KR_SERVICE_KEY": "발급받은_Decoding_키" }
    }
  }
}
```

</details>

<details>
  <summary>ChatGPT · 원격 전용 클라이언트</summary>

ChatGPT Developer Mode처럼 **원격(HTTPS) MCP만 지원하는 클라이언트**는 로컬 stdio 서버를 직접 붙일 수 없다. stdio→HTTP 브리지(`mcp-proxy`)로 이 서버를 HTTP로 띄우고 공개 HTTPS 엔드포인트(리버스 프록시·터널·호스팅)로 노출한 뒤, 그 URL을 커넥터로 등록한다.

```bash
DATA_GO_KR_SERVICE_KEY=발급받은_Decoding_키 mcp-proxy --transport streamablehttp --port 8080 -- npx -y @opendata-kr/narajangteo-prespec-mcp@latest
```

`http://127.0.0.1:8080/mcp`를 공개 HTTPS로 노출하는 것은 사용자 몫이다. (`mcp-remote`는 반대로 stdio 클라이언트를 원격 서버에 붙일 때 쓰는 도구라 여기엔 맞지 않는다.)

</details>

### 발견성

이 서버는 MCP 레지스트리에 `io.github.opendata-kr/narajangteo-prespec-mcp`로 기술된다. [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)를 지원하는 클라이언트에서 검색·설치할 수 있다.

## 환경변수

| 환경변수 | 필수 | 비밀 | 기본값 | 설명 |
|---|---|---|---|---|
| `DATA_GO_KR_SERVICE_KEY` | 예 | 예 | (없음) | 공공데이터포털 **Decoding(원본)** 인증키 |
| `DATA_GO_KR_BASE_URL` | 아니오 | 아니오 | `https://apis.data.go.kr` | 게이트웨이 base 오버라이드 |

## 도구

5개 도구 모두 읽기 전용 조회다. 20개 오퍼레이션을 조회 방식에 따라 묶었다. 아래 파라미터는 모든 도구에 공통이다.

- `kind`: `string[]`. 업무구분 배열: `cnstwk`(공사) `servc`(용역) `thng`(물품) `frgcpt`(외자). 미지정 시 전 구분 병렬 조회
- `page`: `number`. 페이지 번호(기본 1)
- `pageSize`: `number`. 페이지당 건수(기본 10, 최대 100)

### `search_prespecs`

사전규격을 기간(등록/변경일시) 또는 사전규격등록번호로 조회한다. 단순 기간·번호 조회에 쓴다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `startDate` | `string` | 조회 시작일 `YYYYMMDD` |
| `endDate` | `string` | 조회 종료일 `YYYYMMDD` |
| `dateType` | `string` | 기간 기준: `regist`(등록일시, 기본) `change`(변경일시) |
| `specRegistNo` | `string` | 사전규격등록번호로 단건 조회(지정 시 기간보다 우선) |

### `search_prespecs_by_institution`

발주기관명·실수요기관명으로 사전규격을 조회한다. 특정 기관의 발주 예정 물량을 볼 때 쓴다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `orderInstitution` | `string` | 발주기관명 |
| `demandInstitution` | `string` | 실수요기관명 |
| `startDate` | `string` | 조회 시작일 `YYYYMMDD` |
| `endDate` | `string` | 조회 종료일 `YYYYMMDD` |

### `search_prespecs_by_product`

품명·세부품명(번호)으로 사전규격을 조회한다. 관심 품목의 사전규격을 찾을 때 쓴다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `productName` | `string` | 품명(사업명) |
| `detailProductCode` | `string` | 세부품명번호 |
| `detailProductName` | `string` | 세부품명 |
| `startDate` | `string` | 조회 시작일 `YYYYMMDD` |
| `endDate` | `string` | 조회 종료일 `YYYYMMDD` |

### `search_prespecs_advanced`

발주기관·수요기관·품명·참조번호·SW사업여부 등 복합 조건으로 사전규격을 조회한다. 여러 필터를 동시에 걸 때 쓴다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `startDate` | `string` | 접수 시작일 `YYYYMMDD` |
| `endDate` | `string` | 접수 종료일 `YYYYMMDD` |
| `specRegistNo` | `string` | 사전규격등록번호로 조회(지정 시 최우선) |
| `refNo` | `string` | 참조번호로 조회(지정 시 기간보다 우선) |
| `noticeInstitution` | `string` | 발주기관명 |
| `demandInstitution` | `string` | 수요기관명 |
| `productName` | `string` | 품명(사업명) |
| `detailProductCode` | `string` | 세부품명번호 |
| `swBusinessYn` | `string` | SW사업 여부(`Y`/`N`) |

> 조회 우선순위는 사전규격등록번호 > 참조번호 > 접수일시 순이다. 세부품명(`detailProductName`) 검색은 이 API가 지원하지 않는다. 세부품명으로 찾으려면 `search_prespecs_by_product`를 쓴다.

### `get_prespec_opinions`

특정 사전규격(사전규격등록번호)에 달린 규격서 의견·답변 목록을 조회한다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `specRegistNo` | `string` | 사전규격등록번호 |
| `startDate` | `string` | 조회 시작일 `YYYYMMDD` |
| `endDate` | `string` | 조회 종료일 `YYYYMMDD` |

모든 도구의 반환은 `{ query, results }`다. `results`는 업무구분별로 `{ totalCount, items }`를, 실패 시 해당 구분에 `{ error }`를 담는다.

## 응답 필드

### `Prespec` (①②③④ 공통)

`specRegistNo`(사전규격등록번호), `productName`(품명/사업명), `assignedBudget`(배정예산액), `orderInstitution`(발주기관), `demandInstitution`(실수요기관), `registDt`(등록일시), `changeDt`(변경일시), `opinionCloseDt`(의견등록마감), `receiptDt`(접수일시), `refNo`(참조번호), `bidNoticeList`(관련 입찰공고번호 목록), `businessDivision`(업무구분), `deliveryDays`(납품기한일수), `deliveryDeadline`(납품기한), `officialName`(담당자), `officialTel`(담당자 전화), `swBusinessYn`(SW사업 여부), `productDetailList`(세부품목 배열: `itemSeq`·`detailProductNo`·`detailProductName`. 공사·용역은 빈 배열).

### `PrespecOpinion` (⑤)

`specRegistNo`, `refNo`, `opinionNo`(의견번호), `replyNo`(답변번호), `opinionTitle`(제목), `opinionContent`(내용), `writerCorp`(작성업체), `writerName`(작성자), `inputDt`(등록일시), `writerTel`, `writerEmail`, `opinionFileUrls`(첨부파일 URL 배열).

## 개발

```bash
nvm use            # Node 24
pnpm install
pnpm test          # vitest
pnpm typecheck     # tsc --noEmit
pnpm build         # tsup, dist/ 생성
```

## 문제 해결

- **인증 오류(코드 30)**: Encoding 키를 넣으면 이중 인코딩으로 실패한다. **Decoding(원본)** 키를 쓴다. 서버가 시작 시 Encoding 키로 보이면 경고 로그를 남긴다.
- **결과코드 메시지**: 트래픽 초과, 인증키 만료 등 data.go.kr 결과코드는 한국어 메시지로 정규화되어 반환된다.
- **도구 동작 점검**: MCP inspector로 직접 호출해 볼 수 있다.

  ```bash
  npx @modelcontextprotocol/inspector npx -y @opendata-kr/narajangteo-prespec-mcp
  ```

## 라이선스

[MIT](./LICENSE)
