/**
 * Company/client logo resolver.
 *
 * Goal: standardize which icon file we use for a given entity name, so we don't
 * get inconsistent/incorrect icons across the app.
 *
 * Note: we intentionally only map to files that exist in `public/logos/`.
 */
export type CompanyClientKind = "company" | "client";

// Add to this registry whenever you add a new logo file under `public/logos/`.
const LOGO_REGISTRY: Record<string, string> = {
  edgen: "/logos/edgen-logo.svg",
  sibs: "/logos/sibs-logo.svg",
};

export function normalizeCompanyClientKey(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      // strip accents/diacritics
      .normalize("NFD")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0300-\u036f]/g, "")
      // keep alphanumerics, convert others to dashes
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function resolveCompanyClientLogo(name: string): string | null {
  const key = normalizeCompanyClientKey(name);
  return LOGO_REGISTRY[key] ?? null;
}

export function getInitials(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return "?";
  const parts = cleaned.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : (parts[0]?.[1] ?? "");
  return (first + second).toUpperCase();
}


