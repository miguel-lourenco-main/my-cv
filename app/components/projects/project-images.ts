export type ProjectScreenshotMode = "light" | "dark";

type ImageVariant = "light" | "dark" | "unknown";

function getVariant(src: string): ImageVariant {
  // Supports "..._D.png" / "..._L.png" (and other common extensions).
  // Keep it strict enough to avoid false positives on names containing "_D" etc.
  const m = src.match(/_([DL])\.(png|jpe?g|webp|gif|avif)$/i);
  if (!m) return "unknown";
  return m[1].toUpperCase() === "D" ? "dark" : "light";
}

function baseKey(src: string): string {
  // Remove the variant suffix (_D/_L) before the extension.
  return src.replace(/_([DL])\.(png|jpe?g|webp|gif|avif)$/i, ".$2");
}

export function filterProjectImagesByMode(
  images: string[],
  mode: ProjectScreenshotMode
): string[] {
  if (!images || images.length === 0) return [];

  // First pass: collect available variants per base key.
  const byBase = new Map<string, { light?: string; dark?: string }>();
  for (const src of images) {
    const variant = getVariant(src);
    if (variant === "unknown") continue;
    const key = baseKey(src);
    const prev = byBase.get(key) ?? {};
    if (variant === "light") prev.light = src;
    if (variant === "dark") prev.dark = src;
    byBase.set(key, prev);
  }

  // Second pass: preserve original order, but collapse L/D pairs into the chosen variant.
  const out: string[] = [];
  const seen = new Set<string>();

  for (const src of images) {
    const variant = getVariant(src);
    if (variant === "unknown") {
      out.push(src);
      continue;
    }

    const key = baseKey(src);
    if (seen.has(key)) continue;
    seen.add(key);

    const pair = byBase.get(key);
    const chosen =
      mode === "dark"
        ? pair?.dark ?? pair?.light
        : pair?.light ?? pair?.dark;

    out.push(chosen ?? src);
  }

  return out;
}

export function getProjectCoverImageByMode(
  images: string[],
  mode: ProjectScreenshotMode
): string | undefined {
  return filterProjectImagesByMode(images, mode)[0];
}


