#!/usr/bin/env node
/**
 * Pin/unpin Darin sub-command shortcuts across installed harness skill dirs.
 * Usage: node pin.mjs pin plan | unpin plan
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID = new Set([
  'init', 'ingest', 'discover', 'shape', 'plan', 'prioritize',
  'spec', 'prep', 'critique', 'review',
]);

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const META_PATH = path.join(SCRIPT_DIR, 'command-metadata.json');
const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

/** Harness folders that may contain Darin + pin targets */
const HARNESS_SKILL_DIRS = [
  '.cursor/skills',
  '.claude/skills',
  '.gemini/skills',
  '.agents/skills',
  '.github/skills',
  '.opencode/skills',
  '.pi/skills',
  '.kiro/skills',
  '.qoder/skills',
  '.trae/skills',
  '.trae-cn/skills',
  '.rovodev/skills',
];

function darinSkillRef(skillsDir) {
  const darinDir = path.join(skillsDir, 'darin');
  if (!fs.existsSync(path.join(darinDir, 'SKILL.md'))) return null;
  const rel = path.relative(path.dirname(skillsDir), darinDir).split(path.sep).join('/');
  return rel;
}

function skillRoots(cwd) {
  const home = os.homedir();
  const roots = new Set();
  for (const rel of HARNESS_SKILL_DIRS) {
    for (const base of [cwd, home]) {
      const dir = path.join(base, rel);
      if (fs.existsSync(dir)) roots.add(dir);
    }
  }
  return [...roots];
}

function writeShortcut(skillsDir, cmd, pin) {
  const darinRef = darinSkillRef(skillsDir);
  if (!darinRef) return false;

  const dir = path.join(skillsDir, cmd);
  fs.mkdirSync(dir, { recursive: true });
  const desc = meta[cmd]?.description || `Darin: ${cmd}`;
  const scriptsPath = `${darinRef}/scripts`;
  const body = pin
    ? `# /${cmd}\n\nShortcut for \`/darin ${cmd}\`.\n\nLoad \`${darinRef}/reference/${cmd}.md\` and follow it. Run \`node ${scriptsPath}/context.mjs\` first.\n`
    : '';
  const content = `---\nname: ${cmd}\ndescription: "${desc.replace(/"/g, '\\"')}"\nuser-invocable: true\n---\n\n${body}`;
  fs.writeFileSync(path.join(dir, 'SKILL.md'), content);
  return true;
}

const [action, cmd] = process.argv.slice(2);
if (!['pin', 'unpin'].includes(action) || !cmd || !VALID.has(cmd)) {
  console.error('Usage: node pin.mjs <pin|unpin> <command>');
  console.error(`Valid: ${[...VALID].join(', ')}`);
  process.exit(1);
}

let touched = 0;
for (const root of skillRoots(process.cwd())) {
  const target = path.join(root, cmd, 'SKILL.md');
  if (action === 'pin') {
    if (writeShortcut(root, cmd, true)) {
      console.log(`Pinned /${cmd} → /darin ${cmd} (${target})`);
      touched++;
    }
  } else if (fs.existsSync(target)) {
    fs.rmSync(path.join(root, cmd), { recursive: true, force: true });
    console.log(`Unpinned /${cmd} (${target})`);
    touched++;
  }
}

if (!touched) {
  console.error('No Darin skill installation found. Run node scripts/install.mjs first.');
  process.exit(1);
}
