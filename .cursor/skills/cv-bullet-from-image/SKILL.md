---
name: cv-bullet-from-image
description: >-
  Analyzes a shared CV comparison image (current CV plus has/missing checklist)
  and drafts bullet points for a new CV version grounded in this repository's
  projects, experience, and skills. Use when the user shares a CV screenshot,
  comparison image, or checklist of what their CV mentions or lacks, and wants
  new CV bullets, gap analysis, or updated Achievements content.
---

# CV Bullet Generator from Image Comparison

Analyze the user's shared image, compare it against canonical data in this repo, and produce actionable CV bullet points for a new version.

## Expected image input

The user typically shares one image containing:

1. **Current CV** — rendered PDF or screenshot of the existing résumé
2. **Comparison checklist** — items the CV already mentions vs items it lacks

If only one part is visible, ask what is missing or infer gaps from the image and repo data.

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read and extract the image
- [ ] Step 2: Load canonical repo data
- [ ] Step 3: Build gap analysis (has vs missing)
- [ ] Step 4: Draft CV bullets grouped by role/org
- [ ] Step 5: Present output and optional file updates
```

### Step 1: Read and extract the image

Read the attached image with the Read tool. Extract:

- **Current CV content**: job titles, companies, dates, existing bullets, skills, projects named
- **Checklist annotations**: each item marked as present, missing, partial, or "needs rewrite"
- **Target role or audience** if noted on the image (e.g. frontend, full-stack, AI engineer)

Do not invent experience not supported by repo data.

### Step 2: Load canonical repo data

Read these sources in parallel before drafting bullets:

| Priority | Path | What to extract |
|----------|------|-----------------|
| 1 | `app/components/projects/projects.data.ts` | `id`, `type`, `company`, `experience`, `technologies`, `startDate`/`endDate` |
| 2 | `project-form-data/{id}.md` | `## Description`, `## Achievements`, `## Skills` |
| 3 | `public/locales/en/projects/{id}.json` | `coreConcept.bullets`, `features`, `personalExperience`, `technical` |
| 4 | `public/readmes/{id}.md` | Long-form narrative if it exists |
| 5 | `public/locales/en/hero.json` | Professional summary (`intro1`, `intro2`) |
| 6 | `app/components/categories/category-cards.config.tsx` | Tech stack categories shown on the site |
| 7 | `public/cv_en.pdf` | Current downloadable CV (reference only; not auto-generated) |

**Project IDs** (match filenames): `oflat`, `edgen-chat`, `edgen-code`, `edgen-translate`, `sonora`, `agentic-hub`, `o-guardanapo`, `ui-components`, `cash-register`, `job-ai-hub`.

**Experience grouping** (from `experience.org` + dates):

| Org | Projects | Approx. period |
|-----|----------|----------------|
| EdgenAI | edgen-chat, edgen-code, edgen-translate, sonora, agentic-hub | 2024–2025 |
| Freelance | o-guardanapo, ui-components, cash-register, job-ai-hub | 2025–2026 |
| Thesis Project | oflat | 2023 |

For field contracts and i18n rules, see [reference.md](reference.md).

### Step 3: Build gap analysis

Produce a table mapping checklist items to repo evidence:

| Checklist item | Status on current CV | Repo source | Action |
|----------------|------------------------|-------------|--------|
| e.g. "AI tooling" | Missing | job-ai-hub, edgen-chat | Add bullets |
| e.g. "EdgenCode" | Partial | edgen-code.md | Strengthen |

Status values: **Present**, **Missing**, **Partial**, **Outdated**, **Needs rewrite**.

Flag bullets that appear on the CV but are **not** supported by repo data — suggest removal or verification.

### Step 4: Draft CV bullets

#### Bullet style rules

Follow existing repo tone (see [examples.md](examples.md)):

- Start with a strong past-tense verb: Built, Shipped, Designed, Implemented, Created, Led
- One outcome per bullet; 1–2 lines max
- Include concrete tech, scale, or scope when repo data supports it
- Prefer impact over feature lists
- Do not duplicate bullets across roles unless the work genuinely spans both
- No first-person pronouns in bullets (summary paragraph may use "I")

#### Output structure

Deliver in this order:

```markdown
# CV Gap Analysis — [date or target role]

## Image summary
[What the image shows: current CV sections + checklist highlights]

## Gap analysis
| Item | CV status | Repo evidence | Recommendation |
...

## Professional summary (optional rewrite)
[2–3 sentences if checklist flags summary gaps; source hero.json + cross-project themes]

## Experience bullets

### [Org / Role] — [date range]
**Context:** [1 line from experience.name + company]

- [bullet]
- [bullet]

### [Next org / role]
...

## Skills to add or surface
[Grouped: Languages, Frontend, Backend, DevOps, AI/ML, Testing — only skills with repo evidence]

## Projects worth naming on CV
[Project title + 1-line why, mapped to checklist gaps]

## Suggested removals or trims
[CV content not backed by repo or redundant]

## Next steps
- [ ] Review bullets for target job/audience
- [ ] Paste into `public/cv_en.pdf` / `cv_pt.pdf` (manual today)
- [ ] Optionally update `project-form-data/{id}.md` → `## Achievements`
- [ ] Optionally sync `public/locales/en/projects/{id}.json` → `coreConcept.bullets`
```

#### Prioritization when space is limited

1. Checklist items marked **Missing** or **Needs rewrite**
2. Highest-impact achievements (quantified, full-stack, AI, shipped products)
3. Skills that match the target role on the image
4. Recent work (Freelance 2025–2026, then EdgenAI 2024–2025)

### Step 5: Apply updates (only when asked)

Default: **draft only** — present bullets for human review.

When the user asks to **write** or **update** repo files:

1. Update `project-form-data/{id}.md` → `## Achievements` first (canonical draft format)
2. Mirror concise versions into `public/locales/en/projects/{id}.json` → `coreConcept.bullets`
3. Do not edit PDFs directly
4. Do not invent a `WorkExperience` type — org context stays on `Project.experience`
5. Register new project namespaces in `app/i18n.ts` only if adding a new project

## Image-only projects

If the checklist references work visible in screenshots but thin in repo text:

1. Read `project-form-data/{id}.md` gallery paths and `public/projects_images/{id}/`
2. Use screenshot filenames as feature hints (`ai_chat`, `dashboard`, `job_applications`, etc.)
3. Cross-check `public/locales/en/projects/{id}.json` `features` array
4. Mark inferred bullets as `[inferred from screenshots — verify]` until confirmed

## Quality checks before delivering

- [ ] Every new bullet traces to `project-form-data`, locale JSON, or `projects.data.ts`
- [ ] No duplicate bullets across sections
- [ ] Dates align with `startDate`/`endDate` and `experience.date`
- [ ] Technologies mentioned exist in `technologies[]` or `## Skills`
- [ ] Gap table covers every checklist item visible in the image
- [ ] Tone matches existing `## Achievements` examples

## Additional resources

- Data contracts and file map: [reference.md](reference.md)
- Example gap analysis and bullet output: [examples.md](examples.md)
