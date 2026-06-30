#!/usr/bin/env node
/**
 * Build Darin skill payloads for all (or selected) AI harnesses.
 *
 * Usage:
 *   node scripts/build.mjs
 *   node scripts/build.mjs --providers=cursor,claude-code,codex
 *   node scripts/build.mjs --also-cursor   # optional: sync dist/cursor → local .cursor/skills/darin/ (gitignored)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllProviders, buildProviderSkill } from './lib/build-skill.mjs';
import { PROVIDERS, resolveProviderId } from './lib/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { providers: [], alsoCursor: false };
  for (const arg of argv) {
    if (arg === '--also-cursor') out.alsoCursor = true;
    else if (arg.startsWith('--providers=')) {
      out.providers = arg.slice('--providers='.length).split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const providerIds = args.providers
    .map(resolveProviderId)
    .filter(Boolean);

  if (args.providers.length && providerIds.length !== args.providers.length) {
    const bad = args.providers.filter(p => !resolveProviderId(p));
    console.error(`Unknown provider(s): ${bad.join(', ')}`);
    console.error(`Valid: ${Object.keys(PROVIDERS).join(', ')} (aliases: claude, codex, copilot, rovodev)`);
    process.exit(1);
  }

  const { built } = buildAllProviders({
    repoRoot: REPO_ROOT,
    providerIds: providerIds.length ? providerIds : undefined,
  });

  for (const { id, skillDir } of built) {
    console.log(`Built ${PROVIDERS[id].displayName} → ${skillDir}`);
  }

  if (args.alsoCursor) {
    const cursorDir = buildProviderSkill({
      repoRoot: REPO_ROOT,
      provider: PROVIDERS.cursor,
      destRoot: REPO_ROOT,
    });
    console.log(`Synced Cursor working copy → ${cursorDir}`);
  }
}

main();
