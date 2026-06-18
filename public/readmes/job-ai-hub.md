# 💼 Job Hunting Platform

> **Real-world Personal Productivity Application** | AI-augmented workspace to manage applications, resumes, interviews, and cover letters in a single workflow

## 🔗 **Live Demo**

Coming soon

[![Next.js](https://img.shields.io/badge/Next.js-Framework-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-Library-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Testing-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)

---

## 🚀 Project Overview

Job Hunting Platform is an end-to-end job search management application that combines structured tracking with AI-assisted workflows. It is designed to reduce tool-switching during the job hunt and provide one system of record for applications, company context, resumes, interview practice, and notes.

### Key Achievements

- 🤖 **AI-augmented workflows**: Resume analysis, cover letter generation, and interview feedback
- 📋 **End-to-end pipeline management**: Application tracking with detail-rich context views
- 🧱 **Typed and contract-driven architecture**: Explicit schemas and documented data model
- ✅ **Comprehensive testing setup**: Unit, integration, component, E2E, and optional stress testing

---

## 📱 Application Features

### Application Management

- **Pipeline Tracking**: Kanban-style stages and status management
- **Application Details**: Tabs for overview, notes, submissions, interviews, and cover letters
- **Job Post Enrichment**: Scrape and structure job description context
- **Context Linking**: Connect notes, cover letters, and interview data to target entities

### Resume and Cover Letter

- **Resume Analyzer**: Upload, parse, and score resumes with AI-assisted feedback
- **Resume History**: Keep analysis runs and compare progression over time
- **Cover Letter Builder**: Create manually, from templates, or with AI generation
- **Template Reuse**: Reusable cover letter templates with configurable variables

### Interview Preparation

- **Question Bank**: Create and organize interview questions by category and type
- **Interview Templates**: Build repeatable interview practice setups
- **AI-assisted Creation**: Generate interview content from job/application context
- **Interview Feedback**: Evaluate answers with structured scoring and improvement guidance

### Profile and Notes

- **Profile Management**: Centralize role preferences, skills, projects, and goals
- **Project Context**: Keep portfolio/project references connected to job targets
- **Notes Workspace**: Manage technical, behavioral, and company-specific notes
- **Link Anywhere**: Attach notes to job applications and job profiles for quick retrieval

---

## 🧩 Architecture Highlights

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI Layer**: Tailwind CSS + Radix/shadcn patterns
- **Data Layer**: Supabase (PostgreSQL + Storage), local-first workflow
- **AI Integration**: Vercel AI SDK (OpenAI, Anthropic, Google)
- **Contracts and Safety**: Structured output validation and partial/fallback handling
- **Quality Pipeline**: ESLint, TypeScript checks, Vitest, Playwright, k6

---

## 🛠️ Getting Started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

```bash
cp .env.example .env.local
```

Fill in required values in `.env.local` (at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 3) Start local Supabase (recommended)

```bash
pnpm supabase:start
```

### 4) Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Useful Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm supabase:start
pnpm supabase:stop
```

---

## 📚 Documentation

- Data model and entity contracts: `docs/DATA_MODEL.md`
- E2E guides and selectors: `docs/E2E_SELECTORS.md`, `e2e/README.md`
- Incident and recovery references: `docs/INCIDENT_RESPONSE.md`, `docs/BACKUP_RECOVERY.md`
- CI/CD and infrastructure references: `infra/ci/README.md`

---

## 📄 License

Private project - All rights reserved
