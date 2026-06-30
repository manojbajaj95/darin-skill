#!/usr/bin/env node
/**
 * Bundle skill + install libs into packages/cli/vendor for npm publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const VENDOR = path.join(PKG_ROOT, 'vendor');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function main() {
  fs.rmSync(VENDOR, { recursive: true, force: true });
  fs.mkdirSync(path.join(VENDOR, 'lib'), { recursive: true });

  copyDir(path.join(REPO_ROOT, 'skill'), path.join(VENDOR, 'skill'));

  for (const file of ['build-skill.mjs', 'providers.mjs', 'install-core.mjs']) {
    fs.copyFileSync(
      path.join(REPO_ROOT, 'scripts', 'lib', file),
      path.join(VENDOR, 'lib', file),
    );
  }

  console.log(`Prepack: vendor bundle → ${VENDOR}`);
}

main();
