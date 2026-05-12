import type { Project, ProjectCompany } from "./projects.types";

/** Single-select browse filter: all projects, personal-only, or one employer company name */
export const AFFILIATION_ALL = "all" as const;
/** Reserved id — not used as a company name */
export const AFFILIATION_PERSONAL = "__personal__" as const;

export type AffiliationFilterValue =
  | typeof AFFILIATION_ALL
  | typeof AFFILIATION_PERSONAL
  | string;

export type ProjectSortMode = "recent" | "start_asc";

/**
 * Resolves display name and optional logo path from {@link ProjectCompany}.
 */
export function resolveCompanyFields(
  company?: ProjectCompany,
): { name: string; icon?: string } | null {
  if (!company) return null;
  if (typeof company === "string") {
    const name = company.trim();
    return name.length > 0 ? { name } : null;
  }
  const name = company.name.trim();
  if (!name) return null;
  const icon = company.icon?.trim();
  return { name, icon: icon || undefined };
}

export type CompanyFilterOption = {
  id: string;
  name: string;
  icon: string;
};

/**
 * Distinct companies that appear on projects and have at least one logo path in data.
 */
export function deriveCompanyFilterOptions(projects: Project[]): CompanyFilterOption[] {
  const iconByName = new Map<string, string>();

  for (let i = 0; i < projects.length; i++) {
    const resolved = resolveCompanyFields(projects[i].company);
    if (!resolved?.icon) continue;
    if (!iconByName.has(resolved.name)) {
      iconByName.set(resolved.name, resolved.icon);
    }
  }

  const options: CompanyFilterOption[] = [];
  iconByName.forEach((icon, name) => {
    options.push({ id: name, name, icon });
  });

  return options.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterProjectsByAffiliation(
  projects: Project[],
  selection: AffiliationFilterValue,
): Project[] {
  if (selection === AFFILIATION_ALL) return projects;
  if (selection === AFFILIATION_PERSONAL) {
    return projects.filter((p) => p.type !== "professional");
  }
  return projects.filter((p) => resolveCompanyFields(p.company)?.name === selection);
}

function parseIsoDay(iso: string): number {
  const ms = Date.parse(`${iso}T12:00:00`);
  return Number.isNaN(ms) ? 0 : ms;
}

function endSortKey(p: Project): number {
  return p.endDate ? parseIsoDay(p.endDate) : Number.MAX_SAFE_INTEGER;
}

function startSortKey(p: Project): number {
  return parseIsoDay(p.startDate);
}

/**
 * Sort projects for browse UI.
 * - `recent`: newest end date first (ongoing / missing `endDate` last); tie-break by start date descending.
 * - `start_asc`: earliest start first; tie-break by end ascending (ongoing last among same start).
 */
export function compareProjectsForSort(a: Project, b: Project, mode: ProjectSortMode): number {
  if (mode === "recent") {
    const de = endSortKey(b) - endSortKey(a);
    if (de !== 0) return de;
    return startSortKey(b) - startSortKey(a);
  }
  const ds = startSortKey(a) - startSortKey(b);
  if (ds !== 0) return ds;
  return endSortKey(a) - endSortKey(b);
}

export function sortProjects(projects: Project[], mode: ProjectSortMode): Project[] {
  return [...projects].sort((a, b) => compareProjectsForSort(a, b, mode));
}
