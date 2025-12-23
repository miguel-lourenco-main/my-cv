import { projectsImagesManifest } from './projects-images-manifest';

/**
 * Gets project images from the manifest (synchronous, for use in data files).
 * The manifest is generated at build time and contains all project images.
 * 
 * @param projectId - The project identifier
 * @param imagesDir - Optional custom directory (relative to /public). If it points inside 'projects_images/',
 * it will be resolved to that folder name and used as the manifest key.
 * @returns Array of image paths
 * 
 * @example
 * ```ts
 * const images = getProjectImages('edgen-translate');
 * ```
 */
export function getProjectImages(projectId: string, imagesDir?: string): string[] {
  const key = imagesDir ? normalizeImagesDirToManifestKey(imagesDir) : projectId;
  return projectsImagesManifest[key] || [];
}

function normalizeImagesDirToManifestKey(imagesDir: string): string {
  // Accept '/projects_images/foo', 'projects_images/foo', 'foo', or nested paths.
  const clean = imagesDir.replace(/^\/+/, '').replace(/\/+$/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return imagesDir;

  // If 'projects_images/<folder>' use that folder as the manifest key.
  const piIndex = parts.indexOf('projects_images');
  if (piIndex >= 0 && parts[piIndex + 1]) return parts[piIndex + 1];

  // Otherwise, fall back to the last path segment.
  return parts[parts.length - 1];
}

