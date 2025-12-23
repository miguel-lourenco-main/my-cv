const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
const PROJECTS_IMAGES_DIR = path.join(process.cwd(), 'public', 'projects_images');

/**
 * Generates a manifest file mapping project IDs to their image paths.
 * This manifest is used at runtime to auto-detect images.
 */
function generateImagesManifest() {
  const manifest = {};

  if (!fs.existsSync(PROJECTS_IMAGES_DIR)) {
    console.warn('[generateImagesManifest] projects_images directory not found');
    return;
  }

  const projectDirs = fs.readdirSync(PROJECTS_IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const projectId of projectDirs) {
    const projectDir = path.join(PROJECTS_IMAGES_DIR, projectId);
    const files = fs.readdirSync(projectDir);

    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext);
      })
      .map((file) => `/projects_images/${projectId}/${file}`)
      .sort();

    if (images.length > 0) {
      manifest[projectId] = images;
      console.log(`[generateImagesManifest] Found ${images.length} images for ${projectId}`);
    }
  }

  // Write JSON version for runtime fetch
  const jsonManifestPath = path.join(process.cwd(), 'public', 'projects-images-manifest.json');
  fs.writeFileSync(jsonManifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[generateImagesManifest] JSON manifest written to ${jsonManifestPath}`);

  // Write TypeScript version for synchronous import
  const tsManifestPath = path.join(process.cwd(), 'app', 'lib', 'projects-images-manifest.ts');
  const tsContent = `/**
 * Auto-generated manifest of project images.
 * Generated at build time by scripts/generate-images-manifest.js
 * DO NOT EDIT MANUALLY
 */

export const projectsImagesManifest: Record<string, string[]> = ${JSON.stringify(manifest, null, 2)};
`;
  fs.writeFileSync(tsManifestPath, tsContent);
  console.log(`[generateImagesManifest] TypeScript manifest written to ${tsManifestPath}`);
}

generateImagesManifest();

