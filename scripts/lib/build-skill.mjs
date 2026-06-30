import fs from 'node:fs';
import path from 'node:path';
import { COMMAND_HINT, PROVIDERS, SKILL_NAME, scriptsRelPath } from './providers.mjs';

const OPTIONAL_FIELDS = new Set([
  'user-invocable',
  'argument-hint',
  'license',
  'allowed-tools',
]);

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('SKILL.src.md missing YAML frontmatter');
  const body = match[2];
  const fields = {};
  let currentKey = null;
  let listItems = null;

  for (const line of match[1].split('\n')) {
    if (listItems !== null) {
      const item = line.match(/^\s+-\s+(.+)$/);
      if (item) {
        listItems.push(item[1]);
        continue;
      }
      fields[currentKey] = listItems;
      listItems = null;
      currentKey = null;
    }

    const kv = line.match(/^([a-z-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    if (value === '') {
      currentKey = key;
      listItems = [];
      continue;
    }
    fields[key] = value.replace(/^["']|["']$/g, '');
  }

  if (listItems !== null && currentKey) {
    fields[currentKey] = listItems;
  }

  return { fields, body };
}

function yamlQuote(value) {
  const s = String(value);
  if (/[:#\[\]{}&*!|>'"%@`]/.test(s) || s.includes('\n')) {
    return JSON.stringify(s);
  }
  return s;
}

function emitFrontmatter(fields, allowedFields, provider) {
  const lines = ['---'];
  lines.push(`name: ${fields.name}`);
  lines.push(`description: ${yamlQuote(fields.description)}`);

  for (const key of allowedFields) {
    if (!OPTIONAL_FIELDS.has(key) || !(key in fields)) continue;
    let value = fields[key];
    if (key === 'user-invocable') {
      lines.push('user-invocable: true');
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${replacePlaceholders(item, provider)}`);
      }
      continue;
    }
    if (typeof value === 'string') value = replacePlaceholders(value, provider);
    lines.push(`${key}: ${yamlQuote(value)}`);
  }

  lines.push('---');
  return `${lines.join('\n')}\n`;
}

function replacePlaceholders(text, provider) {
  const scriptsPath = scriptsRelPath(provider);
  return text
    .replaceAll('{{scripts_path}}', scriptsPath)
    .replaceAll('{{command_prefix}}', provider.commandPrefix)
    .replaceAll('[{{command_hint}}]', `[${COMMAND_HINT}]`);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function transformMarkdownFile(filePath, provider) {
  const raw = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, replacePlaceholders(raw, provider));
}

/**
 * Build Darin skill for one provider into destRoot/{configDir}/skills/darin/
 * @param {{ repoRoot: string, provider: import('./providers.mjs').Provider, destRoot: string }} opts
 */
export function buildProviderSkill({ repoRoot, provider, destRoot }) {
  const skillSrc = path.join(repoRoot, 'skill', 'SKILL.src.md');
  const { fields, body } = parseFrontmatter(fs.readFileSync(skillSrc, 'utf8'));

  const allowed = ['name', 'description', ...provider.frontmatterFields];
  const frontmatter = emitFrontmatter(fields, allowed, provider);
  const skillBody = replacePlaceholders(body, provider);

  const skillDir = path.join(destRoot, provider.configDir, 'skills', SKILL_NAME);
  fs.rmSync(skillDir, { recursive: true, force: true });
  fs.mkdirSync(skillDir, { recursive: true });

  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `${frontmatter}${skillBody}`);

  for (const sub of ['reference', 'scripts', 'templates']) {
    const src = path.join(repoRoot, 'skill', sub);
    if (!fs.existsSync(src)) continue;
    copyDir(src, path.join(skillDir, sub));
  }

  const refDir = path.join(skillDir, 'reference');
  if (fs.existsSync(refDir)) {
    for (const file of fs.readdirSync(refDir).filter(f => f.endsWith('.md'))) {
      transformMarkdownFile(path.join(refDir, file), provider);
    }
  }

  return skillDir;
}

/**
 * @param {{ repoRoot: string, providerIds?: string[], destRoot?: string }} opts
 */
export function buildAllProviders({ repoRoot, providerIds, destRoot }) {
  const ids = providerIds?.length ? providerIds : Object.keys(PROVIDERS);
  const outRoot = destRoot || path.join(repoRoot, 'dist');
  const built = [];

  for (const id of ids) {
    const provider = PROVIDERS[id];
    if (!provider) throw new Error(`Unknown provider: ${id}`);
    const skillDir = buildProviderSkill({ repoRoot, provider, destRoot: path.join(outRoot, id) });
    built.push({ id, skillDir });
  }

  return { outRoot, built };
}

export { replacePlaceholders, scriptsRelPath, parseFrontmatter };
