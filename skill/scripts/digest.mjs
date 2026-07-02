#!/usr/bin/env node
/**
 * Memory-only context for a digest: PRODUCT.md, STRATEGY.md, hypotheses
 * (with status), and ingestion notes — optionally filtered to a topic.
 *
 * Never reads the codebase — that's insights-route.mjs's job.
 *
 *   node digest.mjs --json [--target "invite friction"]
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  darinHome,
  parsePathArgs,
  resolveSlug,
  workspaceRoot,
} from './lib/paths.mjs';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function mtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function firstExisting(dir, names) {
  for (const name of names) {
    const p = path.join(dir, name);
    if (exists(p)) return p;
  }
  return null;
}

function matchesKeyword(filename, content, keyword) {
  const needle = keyword.toLowerCase();
  return filename.toLowerCase().includes(needle) || content.toLowerCase().includes(needle);
}

function hypothesisStatus(content) {
  const match = content.match(/^Status:\s*(.+)$/mi);
  return match ? match[1].trim() : 'unknown';
}

function listHypotheses(root, keyword) {
  const dir = path.join(root, 'hypotheses');
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const p = path.join(dir, f);
      const content = safeRead(p);
      return { file: f, path: p, status: hypothesisStatus(content), mtime: mtime(p), content };
    })
    .filter(h => !keyword || matchesKeyword(h.file, h.content, keyword))
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ content, ...rest }) => rest);
}

function walkIngestion(root, keyword) {
  const base = path.join(root, 'ingestion');
  const out = [];
  if (!exists(base)) return out;
  for (const shape of fs.readdirSync(base)) {
    const d = path.join(base, shape);
    if (!exists(d) || !fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).filter(name => name.endsWith('.md') && !name.startsWith('_'))) {
      const p = path.join(d, f);
      const content = safeRead(p);
      if (keyword && !matchesKeyword(f, content, keyword)) continue;
      out.push({ shape, file: f, path: p, mtime: mtime(p) });
    }
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function parseDigestArgs(argv) {
  const base = parsePathArgs(argv);
  const out = { ...base, target: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target' && argv[i + 1]) out.target = argv[++i];
    else if (!a.startsWith('--')) out.target += `${out.target ? ' ' : ''}${a}`;
  }
  return out;
}

const args = parseDigestArgs(process.argv);
const slug = resolveSlug(args);
const root = workspaceRoot(args);

if (!root) {
  const err = {
    error: 'NO_ACTIVE_WORKSPACE',
    message: 'Run `/darin init` or set active_workspace in ~/.darin/config.json',
  };
  if (args.json) console.log(JSON.stringify(err, null, 2));
  else console.error(err.message);
  process.exit(1);
}

const productPath = firstExisting(root, ['PRODUCT.md', 'Product.md']);

if (!productPath) {
  const err = {
    error: 'NO_PRODUCT_MD',
    message: 'Run `/darin init` to write PRODUCT.md for this workspace.',
    workspace_root: root,
  };
  if (args.json) console.log(JSON.stringify(err, null, 2));
  else console.error(err.message);
  process.exit(1);
}

const strategyPath = firstExisting(root, ['STRATEGY.md', 'Strategy.md']);
const target = args.target.trim();

const hypotheses = listHypotheses(root, target);
const ingestion = walkIngestion(root, target);

// Backfill digests/ for workspaces scaffolded before this command existed.
fs.mkdirSync(path.join(root, 'digests'), { recursive: true });
const reportSlug = target ? `-${slugify(target)}` : '';
const report_path = `digests/${today()}${reportSlug}.md`;

const result = {
  darin_home: darinHome(),
  slug,
  workspace_root: root,
  target: target || null,
  product_path: productPath,
  strategy_path: strategyPath,
  hypotheses,
  ingestion,
  thin: hypotheses.length === 0 && ingestion.length === 0,
  report_path,
};

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Workspace: ${root}`);
  console.log(`Target: ${target || '(everything)'}`);
  console.log(`Hypotheses: ${hypotheses.length}`);
  console.log(`Ingestion notes: ${ingestion.length}`);
  if (result.thin) console.log('Memory is thin for this scope.');
  console.log(`Report: ${path.join(root, report_path)}`);
}
