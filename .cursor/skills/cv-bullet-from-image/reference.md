# CV Data Reference — my-cv repository

Canonical sources for the `cv-bullet-from-image` skill. Read only what you need per project.

## File map

```
public/
  cv_en.pdf, cv_pt.pdf          # Static CVs (manual; not generated from app data)
  locales/en/
    hero.json                   # Professional summary paragraphs
    categories.json             # Tech category labels (UI)
    projects/{id}.json          # Rich project copy (bullets, features, narrative)
    about.json                  # Legacy skills list (may be stale)
  readmes/{id}.md               # Expanded markdown (sparse — edgen-code.md exists)
  projects_images/{id}/         # Screenshots (*_L.png light, *_D.png dark)

app/components/
  projects/projects.data.ts     # Project registry: dates, org, tech, experience
  projects/projects.types.ts    # TypeScript contracts
  categories/category-cards.config.tsx  # Live tech stack on site

project-form-data/{id}.md       # Draft intake: Description, Achievements, Skills, Gallery
```

## Project registry fields (`projects.data.ts`)

| Field | CV use |
|-------|--------|
| `id` | Filename stem for locale JSON and form-data |
| `type` | `personal` / `professional` / `hybrid` |
| `company` | Employer or client name + logo |
| `experience.org` | Group bullets under EdgenAI, Freelance, Thesis Project |
| `experience.date` | Display date range on CV |
| `startDate` / `endDate` | ISO dates for ordering (YYYY-MM-DD) |
| `technologies[].name` | Skills to surface |
| `titleKey` / `descriptionKey` | Resolve via locale JSON |

## Locale JSON shape (`public/locales/en/projects/{id}.json`)

Primary text store for rendered site copy:

```json
{
  "title": "",
  "description": "",
  "overview": "",
  "coreConcept": {
    "summary": "",
    "bullets": ["short feature-oriented lines"]
  },
  "features": ["longer feature list"],
  "technical": {
    "frontendStack": [],
    "projectStructure": [],
    "deployment": []
  },
  "personalExperience": "First-person narrative paragraph(s)"
}
```

**CV bullet sources (priority):**

1. `project-form-data/{id}.md` → `## Achievements` — outcome-focused, best for CV
2. `coreConcept.bullets` — concise; good for CV after trimming
3. `features` — decompose into achievement bullets when Achievements are thin
4. `personalExperience` — source for summary paragraph, not raw bullets

## Form-data schema (`project-form-data/{id}.md`)

```markdown
# {Title} — Project Form Data
**Title:** …
**Headline:** …
**Release Date:** …
**Link:** …
## Description
## Achievements      ← primary CV bullet target when writing files
## Skills
## Gallery            ← /projects_images/{id}/ paths
```

## i18n rules

- Structure + keys in `projects.data.ts`; English strings in `public/locales/en/projects/{id}.json`
- New projects: add namespace to `PROJECT_I18N_NAMESPACES` in `app/i18n.ts`
- Use `*Key` fields in data file, not inline English in `projects.data.ts`

## Experience model limitation

There is **no** separate employment timeline type. Org/date context lives on each `Project`:

```ts
experience?: {
  name: string;   // initiative name
  org: string;    // EdgenAI | Freelance | Thesis Project
  date: string;   // e.g. '2024' or '2024-2025'
}
```

Group CV experience sections by `experience.org`, not by inventing job titles.

## Tech stack sources

| Source | Notes |
|--------|-------|
| `category-cards.config.tsx` | What the portfolio About section shows |
| `projects.data.ts` → `technologies` | Per-project stack |
| `project-form-data` → `## Skills` | Draft skill lists |
| `about.json` | Likely stale; prefer category cards |

## Screenshot naming

Gallery files under `public/projects_images/{id}/`:

- `{feature}_L.png` / `{feature}_D.png` — light/dark theme pairs
- Filename stem hints at UI area (e.g. `ai_chat`, `dashboard`, `job_applications`)

## What not to do

- Do not assume PDF content matches locale JSON — PDF is maintained separately
- Do not add `WorkExperience[]` without updating `projects.types.ts` and data model docs
- Do not copy `personalExperience` verbatim as bullets — distill into achievements
- Do not list skills from `about.json` without cross-checking live project data
