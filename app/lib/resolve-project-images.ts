import type { ProjectImagesManifest } from "./project-images-context";

export function getProjectImagesFromManifest(
  manifest: ProjectImagesManifest,
  projectId: string,
  imagesDir?: string
): string[] {
  const key = imagesDir ? normalizeImagesDirToManifestKey(imagesDir) : projectId;
  return manifest[key] ?? [];
}

function normalizeImagesDirToManifestKey(imagesDir: string): string {
  const clean = imagesDir.replace(/^\/+/, "").replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return imagesDir;

  const projectsImagesIndex = parts.indexOf("projects_images");
  if (projectsImagesIndex >= 0 && parts[projectsImagesIndex + 1]) {
    return parts[projectsImagesIndex + 1];
  }

  return parts[parts.length - 1];
}
