/**
 * Shared lookup table for technology official URLs.
 * This keeps `projects.data.ts` simple while still enabling clickable tech circles.
 */

function normalizeTechName(rawName: string): string {
  // Remove trailing version numbers like "Next.js 15.0.5" or "TypeScript 5.7.2"
  const withoutVersion = rawName.replace(/\s+\d+(\.\d+){0,4}.*$/g, "");
  // Remove parenthetical suffixes, trim, and lowercase.
  return withoutVersion.replace(/\s*\(.*\)\s*/g, "").trim().toLowerCase();
}

const TECH_URLS: Record<string, string> = {
  react: "https://react.dev",
  "next.js": "https://nextjs.org",
  nextjs: "https://nextjs.org",
  typescript: "https://www.typescriptlang.org",
  "tailwind css": "https://tailwindcss.com",
  supabase: "https://supabase.com",
  playwright: "https://playwright.dev",
  n8n: "https://n8n.io",
  turbo: "https://turbo.build",
  ocaml: "https://ocaml.org",
  javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "c#": "https://learn.microsoft.com/en-us/dotnet/csharp/",
  openai: "https://openai.com",
  elevenlabs: "https://elevenlabs.io",
};

export function getOfficialTechUrl(techName: string): string | undefined {
  const normalized = normalizeTechName(techName);
  return TECH_URLS[normalized];
}

