#!/usr/bin/env node
/**
 * List, resolve, scaffold, or activate Darin workspaces.
 *
 *   node workspace.mjs --list [--json]
 *   node workspace.mjs --json
 *   node workspace.mjs --scaffold --slug acme
 *   node workspace.mjs --use acme
 */
import fs from 'node:fs';
import {
  activeWorkspaceFromConfig,
  darinHome,
  ensureWorkspaceScaffold,
  globalConfigPath,
  listWorkspaces,
  parsePathArgs,
  resolveSlug,
  setActiveWorkspace,
  slugify,
  workspaceRoot,
} from './lib/paths.mjs';

const opts = parsePathArgs(process.argv);
const useIdx = process.argv.indexOf('--use');
const useSlug = useIdx >= 0 ? process.argv[useIdx + 1] : null;
const scaffold = process.argv.includes('--scaffold');
const nameIdx = process.argv.indexOf('--name');
const scaffoldName = nameIdx >= 0 ? process.argv[nameIdx + 1] : null;

if (opts.list) {
  const payload = {
    darin_home: darinHome(),
    active_workspace: activeWorkspaceFromConfig(),
    workspaces: listWorkspaces(),
  };
  if (opts.json) console.log(JSON.stringify(payload, null, 2));
  else if (payload.workspaces.length === 0) {
    console.log('No workspaces yet. Run `/darin init --slug my-product`.');
  } else {
    console.log(`Darin home: ${darinHome()}`);
    console.log(`Active: ${payload.active_workspace || '(none)'}\n`);
    for (const w of payload.workspaces) {
      const mark = w.active ? ' *' : '';
      const status = w.has_product ? '' : ' (no PRODUCT.md yet)';
      console.log(`  ${w.slug}${mark} — ${w.name}${status}`);
    }
  }
  process.exit(0);
}

if (useSlug) {
  const s = setActiveWorkspace(useSlug);
  const root = workspaceRoot({ slug: s });
  if (opts.json) {
    console.log(JSON.stringify({ active_workspace: s, workspace_root: root, exists: fs.existsSync(root) }, null, 2));
  } else {
    console.log(`Active workspace: ${s}`);
    console.log(`Path: ${root}`);
  }
  process.exit(0);
}

let slug = null;
try {
  slug = opts.slug ? slugify(opts.slug) : resolveSlug(opts);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

if (scaffold) {
  if (!opts.slug) {
    console.error('Usage: node workspace.mjs --scaffold --slug <readable-slug>');
    process.exit(1);
  }
  const root = ensureWorkspaceScaffold(opts.slug, { name: scaffoldName || opts.slug });
  slug = slugify(opts.slug);
  if (opts.json) {
    console.log(JSON.stringify({ slug, workspace_root: root, scaffolded: true }, null, 2));
  } else {
    console.log(`Scaffolded workspace: ${slug}`);
    console.log(`Path: ${root}`);
  }
  process.exit(0);
}

const root = slug ? workspaceRoot({ slug }) : null;
const info = {
  darin_home: darinHome(),
  config: globalConfigPath(),
  active_workspace: activeWorkspaceFromConfig(),
  slug,
  workspace_root: root,
  exists: root ? fs.existsSync(root) : false,
  workspaces: listWorkspaces(),
};

if (!slug) {
  info.error = 'NO_ACTIVE_WORKSPACE';
  info.hint = 'Run workspace.mjs --list, then --use <slug> or /darin init --slug <name>';
}

if (opts.json) console.log(JSON.stringify(info, null, 2));
else if (!slug) {
  console.log('No active workspace.');
  console.log('\nAvailable:');
  if (info.workspaces.length === 0) console.log('  (none)');
  else for (const w of info.workspaces) console.log(`  - ${w.slug}`);
  console.log('\nSet one: node workspace.mjs --use <slug>');
  console.log('Or create: node workspace.mjs --scaffold --slug <name>');
} else {
  console.log(`Darin home:       ${info.darin_home}`);
  console.log(`Active workspace: ${info.slug}${info.slug === info.active_workspace ? '' : ' (not saved as active — run --use)'}`);
  console.log(`Workspace root:   ${info.workspace_root}`);
}
