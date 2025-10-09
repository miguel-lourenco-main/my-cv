const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listJsonFilesRecursive(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsonFilesRecursive(abs, baseDir));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(path.relative(baseDir, abs));
    }
  }
  return files.sort();
}

function flattenJson(obj, prefix = '') {
  const flat = {};
  if (obj === null || obj === undefined) return flat;
  const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (isObject(value)) {
      Object.assign(flat, flattenJson(value, nextKey));
    } else {
      flat[nextKey] = value;
    }
  }
  return flat;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const localesRoot = path.join(repoRoot, 'public', 'locales');
  const sourceLocale = 'en';
  const sourceDir = path.join(localesRoot, sourceLocale);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Missing source locale directory: ${sourceDir}`);
    process.exit(0);
  }

  const enFiles = listJsonFilesRecursive(sourceDir, sourceDir);
  const result = {};

  const localeDirs = fs.readdirSync(localesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== sourceLocale);

  for (const locale of localeDirs) {
    const localeDir = path.join(localesRoot, locale);
    const perFile = {};

    for (const relFile of enFiles) {
      const enPath = path.join(sourceDir, relFile);
      const targetPath = path.join(localeDir, relFile);

      const enJson = readJsonSafe(enPath);
      if (!enJson) continue;
      const enFlat = flattenJson(enJson);

      let missingKeys = [];
      if (!fs.existsSync(targetPath)) {
        missingKeys = Object.keys(enFlat);
      } else {
        const targetJson = readJsonSafe(targetPath) || {};
        const targetFlat = flattenJson(targetJson);
        missingKeys = Object.keys(enFlat).filter((k) => !(k in targetFlat));
      }

      if (missingKeys.length > 0) {
        perFile[relFile] = missingKeys.sort();
      }
    }

    if (Object.keys(perFile).length > 0) {
      result[locale] = perFile;
    }
  }

  const outPath = path.join(repoRoot, 'i18n-missing.json');
  if (Object.keys(result).length === 0) {
    // Clean up any previous report
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    console.log('No missing translation keys detected.');
    return;
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`Missing translations written to ${path.relative(repoRoot, outPath)}`);
}

main();


