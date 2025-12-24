# EdgenCode (VS Code Extension)

EdgenCode is a **Visual Studio Code extension** that brings an **AI chat assistant** into your IDE — similar in spirit to [Continue.dev](https://continue.dev/) — with a focus on **developer workflow**, **code-aware conversations**, and **tight VS Code integration**.

> This README is written for the extension project itself (architecture + setup + development workflow).

---

## What it does

- **Chat inside VS Code**: a dedicated side panel for asking questions and iterating quickly.
- **Code-aware assistance**: include selected text / file context to ground answers.
- **IDE-native UX**: commands, quick actions, and a responsive webview UI.
- **Local/remote LLM support**: connects to an LLM inference service via HTTP (self-hosted or internal).

---

## Key features

- **Chat panel (Webview)** with streaming responses
- **Context injection**
  - current file
  - selection / highlighted code
  - (optional) workspace-level context via an indexer
- **Prompt presets** (e.g., “Explain”, “Refactor”, “Write tests”, “Fix bug”)
- **Commands** exposed via Command Palette
- **Configurable provider + model settings** through VS Code settings

---

## How it works (high-level architecture)

EdgenCode is split into two main pieces:

- **Extension Host (Node/TypeScript)**
  - registers commands
  - reads editor state (active file, selections)
  - handles auth / settings
  - calls the LLM backend
  - communicates with the UI via `postMessage`

- **Webview UI (React/TypeScript)**
  - chat UI rendering (messages, composer, history)
  - sends user messages and UI events to the extension host
  - receives streaming tokens / updates from the extension host

Message passing is done using VS Code’s Webview messaging bridge:

```ts
// webview -> extension
vscode.postMessage({ type: "chat:send", payload: { text, context } });

// extension -> webview
panel.webview.postMessage({ type: "chat:delta", payload: { token } });
```

---

## Requirements

- Visual Studio Code (recent stable)
- Node.js (LTS recommended)
- Package manager: `pnpm` or `npm`
- An LLM backend endpoint (local or remote)

---

## Configuration (VS Code Settings)

EdgenCode reads its configuration from VS Code settings (`settings.json`).

Example:

```json
{
  "edgencode.provider": "openai-compatible",
  "edgencode.baseUrl": "http://localhost:11434",
  "edgencode.model": "llama3.1",
  "edgencode.requestTimeoutMs": 60000,
  "edgencode.stream": true
}
```

Suggested settings (typical):

- `edgencode.provider`: provider type (e.g. `openai-compatible`, `internal`, `ollama-like`)
- `edgencode.baseUrl`: inference API base URL
- `edgencode.model`: model name
- `edgencode.apiKey`: optional auth token (if required)
- `edgencode.stream`: enable streaming responses
- `edgencode.requestTimeoutMs`: request timeout

---

## Commands (Command Palette)

These commands are typically registered:

- **EdgenCode: Open Chat**
- **EdgenCode: Ask About Selection**
- **EdgenCode: Explain File**
- **EdgenCode: Generate Tests**
- **EdgenCode: Reset Conversation**

If you implement command IDs, keep them stable and namespaced:

```json
{
  "contributes": {
    "commands": [
      { "command": "edgencode.openChat", "title": "EdgenCode: Open Chat" }
    ]
  }
}
```

---

## Development

### Install dependencies

```bash
pnpm install
```

### Run / debug the extension

1. Open the project in VS Code
2. Go to **Run and Debug**
3. Start the **Extension** launch config (or press **F5**)
4. A new **Extension Development Host** window opens with EdgenCode loaded

### Debugging tips

- **Extension logs**: `View → Output → (select “EdgenCode”)`
- **Webview logs**: `Developer: Toggle Developer Tools` in the Extension Development Host window
- Prefer structured logging on the extension side:

```ts
outputChannel.appendLine(`[chat] sending request model=${model}`);
```

---

## Packaging & distribution

EdgenCode can be packaged as a `.vsix` and distributed via:

- Visual Studio Marketplace
- Private marketplace
- Internal artifact repository

Common tooling:

```bash
pnpm add -D @vscode/vsce
pnpm vsce package
```

---

## Security & privacy notes

- Treat **workspace code** as sensitive input.
- Make context sharing explicit (selection/file/workspace indexing should be opt-in).
- If an API key is required, store it via **VS Code SecretStorage** (not plaintext settings).

---

## Troubleshooting

- **Chat opens but no responses**
  - verify `edgencode.baseUrl` is reachable
  - check Output panel logs
  - confirm model name is correct

- **Webview is blank**
  - check DevTools console for CSP or bundle errors
  - verify webview build output is included in the extension package

- **Streaming feels laggy**
  - ensure the backend streams tokens
  - throttle UI rendering (batch tokens per animation frame)

---

## Project summary (portfolio context)

EdgenCode was built as a Continue.dev-style IDE assistant: **TypeScript + VS Code Extension APIs + React Webview**, integrating with a local inference system to provide **chat and code help directly in the editor**.


