import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Resolve skill source root (skill/SKILL.src.md parent).
 * Published package: packages/cli/vendor/
 * Monorepo dev: ai-pm-skill repo root
 */
export function getSkillRepoRoot() {
  const vendorRoot = path.join(PKG_ROOT, 'vendor');
  if (fs.existsSync(path.join(vendorRoot, 'skill', 'SKILL.src.md'))) {
    return vendorRoot;
  }

  const monorepoRoot = path.resolve(PKG_ROOT, '../..');
  if (fs.existsSync(path.join(monorepoRoot, 'skill', 'SKILL.src.md'))) {
    return monorepoRoot;
  }

  throw new Error(
    'Darin skill source not found. Try reinstalling: npx @getdarin/cli@latest install',
  );
}

export function getPackageRoot() {
  return PKG_ROOT;
}

export function readPackageVersion() {
  const pkgPath = path.join(PKG_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}
