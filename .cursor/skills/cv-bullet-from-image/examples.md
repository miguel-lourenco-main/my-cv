# CV Bullet Generator — Examples

## Example trigger

User shares an image showing:
- Left: current CV PDF with EdgenAI role (3 bullets) and Freelance (1 bullet)
- Right: checklist — ✅ React/Next.js, ✅ EdgenAI, ❌ AI agent tooling, ❌ Job AI Hub, ❌ testing/CI, ⚠️ VS Code extension (vague)

## Example gap analysis (excerpt)

| Checklist item | CV status | Repo evidence | Recommendation |
|----------------|-----------|---------------|----------------|
| AI agent tooling | Missing | job-ai-hub (40+ tools), agentic-hub, edgen-chat | Add 2 bullets under Freelance + 1 under EdgenAI |
| Job AI Hub | Missing | project-form-data/job-ai-hub.md | Add project name + Kanban/AI bullet |
| Testing / CI | Missing | job-ai-hub.json technical.projectStructure | Add Vitest/Playwright/k6 bullet |
| VS Code extension | Partial | edgen-code.md Achievements | Replace vague line with Webview + local LLM bullet |

## Example bullets (repo-grounded)

### EdgenAI — 2024–2025

**Context:** AI product engineering across chat, code, translation, and agent platforms.

- Built EdgenCode, a VS Code extension delivering AI chat and code assistance via Webview API and local model inference.
- Shipped EdgenChat with conversational AI integrated into the product workflow.
- Developed Sonora and Agentic Hub initiatives connecting LLM tooling to internal product surfaces.
- Delivered EdgenTranslate for AI-assisted translation within the EdgenAI product suite.

### Freelance — 2025–2026

**Context:** End-to-end web products from UX through deployment.

- Built Job AI Hub, an application-centric Kanban pipeline linking cover letters, interviews, Q&A, resumes, and notes per role.
- Created an action-taking AI chat assistant with 40+ tools to create and update records across the app.
- Shipped resume analysis, AI cover-letter generation with version history, and an interview engine with code execution.
- Implemented BYOK (OpenAI, Anthropic, Google) with full JSON export/import for data portability.

## Achievements → coreConcept.bullets mapping

When syncing files, compress Achievements for locale JSON:

**Form-data (`project-form-data/job-ai-hub.md`):**
```markdown
- Built an application-centric Kanban pipeline linking cover letters, interviews, Q&A, resumes, and notes per role.
```

**Locale JSON (`coreConcept.bullets` entry):**
```json
"Application-centric workspace — each role gets cover letters, interviews, Q&A, resumes, and notes"
```

Rule: Achievements use past-tense verbs and outcomes; `coreConcept.bullets` use present-tense feature phrasing. Keep both in sync semantically, not verbatim.

## Skills block example

```
Languages: TypeScript, JavaScript
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, Supabase (Postgres, Auth, Storage)
AI/ML: OpenAI, Anthropic, Google AI, Vercel AI SDK, tool-calling agents
Testing: Vitest, Playwright, k6
DevOps: Vercel, GitLab CI, Sentry
```

Only include skills appearing in `technologies[]`, `## Skills`, or `technical.frontendStack` / `projectStructure`.

## Inferred bullet (screenshot-only evidence)

When gallery exists but Achievements are thin:

```markdown
- [inferred from screenshots — verify] Shipped dashboard with pipeline stats, recent applications, and resume health overview (job-ai-hub/dashboard_L.png).
```

Ask the user to confirm before adding to form-data or CV PDF.
