/**
 * Command metadata — single source for SKILL command table, pin, and hints.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function metadataPath(repoRoot) {
  return path.join(repoRoot, 'skill', 'scripts', 'command-metadata.json');
}

/**
 * Locate repoRoot by walking up from this file looking for skill/scripts/command-metadata.json.
 * This file is vendored at different depths depending on context
 * (monorepo: scripts/lib/commands.mjs, npm package: vendor/lib/commands.mjs), so a
 * hardcoded "../.." guess breaks in one of them. Search instead of assuming depth.
 */
function findDefaultRepoRoot() {
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'skill', 'scripts', 'command-metadata.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Could not locate skill/scripts/command-metadata.json above ${__dirname}`);
}

export function loadCommandMetadata(repoRoot = findDefaultRepoRoot()) {
  return JSON.parse(fs.readFileSync(metadataPath(repoRoot), 'utf8'));
}

export function commandIds(meta) {
  if (meta.order?.length) return meta.order;
  return Object.keys(meta).filter(k => k !== 'order');
}

export function commandHint(meta) {
  return commandIds(meta).join(' · ');
}

export function renderCommandsTable(meta) {
  const lines = [
    '| Command | Category | Description | Argument | Reference |',
    '|---------|----------|-------------|----------|-----------|',
  ];
  for (const id of commandIds(meta)) {
    const cmd = meta[id];
    if (!cmd) continue;
    const arg = cmd.argumentHint ? `\`${cmd.argumentHint}\`` : '—';
    lines.push(
      `| \`${id}\` | ${cmd.category} | ${cmd.description} | ${arg} | [reference/${id}.md](reference/${id}.md) |`,
    );
  }
  return lines.join('\n');
}
