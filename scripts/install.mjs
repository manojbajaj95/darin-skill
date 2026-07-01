#!/usr/bin/env node
/**
 * Install Darin into one or more AI harness folders.
 *
 * Usage:
 *   node scripts/install.mjs
 *   node scripts/install.mjs --providers=cursor,claude,codex,gemini -y
 *   node scripts/install.mjs --scope=global --providers=claude,codex
 *   node scripts/install.mjs --target=/path/to/project --providers=cursor
 *
 * Prefer: npx @getdarin/cli@latest install
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printPostInstall, runInstall } from './lib/install-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function usage() {
  console.log(`Darin installer — multi-harness skill deploy

Usage:
  node scripts/install.mjs [options]
  npx @getdarin/cli@latest install [options]

Options:
  --providers=LIST   Comma-separated harnesses (default: auto-detect or cursor,claude-code,codex)
  --scope=SCOPE      project (default) or global (user home skills dirs)
  --target=PATH      Install destination root (default: cwd)
  -y, --yes          Skip confirmation prompts
  --help             Show this help

Providers:
  cursor, claude-code (claude), codex (agents), gemini, github (copilot),
  opencode, pi, kiro, qoder, trae, trae-cn, rovo-dev (rovodev)

Examples:
  node scripts/install.mjs --providers=cursor,claude,codex -y
  npx @getdarin/cli@latest install -y
`);
}

function parseArgs(argv) {
  const out = {
    providers: [],
    scope: 'project',
    target: process.cwd(),
    yes: false,
    help: false,
  };
  for (const arg of argv) {
    if (arg === '-y' || arg === '--yes') out.yes = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg.startsWith('--providers=')) {
      out.providers = arg.slice('--providers='.length).split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg.startsWith('--scope=')) {
      out.scope = arg.slice('--scope='.length).trim();
    } else if (arg.startsWith('--target=')) {
      out.target = path.resolve(arg.slice('--target='.length).trim());
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = await runInstall({
    repoRoot: REPO_ROOT,
    providers: args.providers,
    scope: args.scope,
    target: args.target,
    yes: args.yes,
  });

  if (!result.aborted) {
    printPostInstall(result);
  }
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
