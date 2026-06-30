/**
 * JSON signals — reads ~/.darin/workspaces/<slug>/
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  activeWorkspaceFromConfig,
  darinHome,
  listWorkspaces,
  parsePathArgs,
  resolveSlug,
  workspaceRoot,
} from './lib/paths.mjs';

const STALE_DAYS = 30;
const MS_DAY = 86400000;

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function mtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function listMd(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
}

function walkIngestion(root) {
  const base = path.join(root, 'ingestion');
  const out = [];
  if (!exists(base)) return out;
  for (const shape of fs.readdirSync(base)) {
    const d = path.join(base, shape);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of listMd(d)) {
      out.push({
        shape,
        file: f,
        path: path.join(root, 'ingestion', shape, f),
        mtime: mtime(path.join(d, f)),
      });
    }
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

function staleHypotheses(root, now) {
  const dir = path.join(root, 'hypotheses');
  const stale = [];
  for (const f of listMd(dir)) {
    const p = path.join(dir, f);
    const age = (now - mtime(p)) / MS_DAY;
    if (age >= STALE_DAYS) stale.push({ file: f, daysSinceUpdate: Math.floor(age) });
  }
  return stale;
}

function adhocBacklog(root) {
  const d = path.join(root, 'ingestion', 'adhoc');
  return listMd(d).map(f => path.join(root, 'ingestion', 'adhoc', f));
}

const opts = parsePathArgs(process.argv);
const slug = resolveSlug(opts);
const root = workspaceRoot(opts);
const now = Date.now();

const signals = {
  darin_home: darinHome(),
  active_workspace: activeWorkspaceFromConfig(),
  slug,
  workspace_root: root,
  workspaces: listWorkspaces(),
  setup: {
    hasActiveWorkspace: !!slug,
    hasProduct: root ? exists(path.join(root, 'PRODUCT.md')) : false,
    hasStrategy: root ? exists(path.join(root, 'STRATEGY.md')) : false,
    hasHypotheses: root ? listMd(path.join(root, 'hypotheses')).length > 0 : false,
  },
  ingestion: root
    ? { recent: walkIngestion(root).slice(0, 5), adhocBacklog: adhocBacklog(root) }
    : { recent: [], adhocBacklog: [] },
  hypotheses: root
    ? { stale: staleHypotheses(root, now), count: listMd(path.join(root, 'hypotheses')).length }
    : { stale: [], count: 0 },
  critique: {
    latest: root
      ? (() => {
          const dir = path.join(root, 'critique');
          const files = listMd(dir).sort().reverse();
          return files[0] ? path.join(root, 'critique', files[0]) : null;
        })()
      : null,
  },
};

if (!slug) signals.error = 'NO_ACTIVE_WORKSPACE';

console.log(JSON.stringify(signals, null, 2));
