/**
 * AI harness targets for Darin skill installs.
 * Paths follow the Agent Skills spec and Impeccable's harness layout.
 */
import { commandHint, loadCommandMetadata } from './commands.mjs';

export const SKILL_NAME = 'darin';

export const COMMAND_HINT = commandHint(loadCommandMetadata());

/** @typedef {{ id: string, configDir: string, displayName: string, commandPrefix: string, frontmatterFields: string[], globalSkillsDir?: string }} Provider */

/** @type {Record<string, Provider>} */
export const PROVIDERS = {
  cursor: {
    id: 'cursor',
    configDir: '.cursor',
    displayName: 'Cursor',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.cursor/skills',
  },
  'claude-code': {
    id: 'claude-code',
    configDir: '.claude',
    displayName: 'Claude Code',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.claude/skills',
  },
  gemini: {
    id: 'gemini',
    configDir: '.gemini',
    displayName: 'Gemini CLI',
    commandPrefix: '/',
    frontmatterFields: [],
    globalSkillsDir: '.gemini/skills',
  },
  codex: {
    id: 'codex',
    configDir: '.agents',
    displayName: 'Codex CLI',
    commandPrefix: '$',
    frontmatterFields: [],
    globalSkillsDir: '.agents/skills',
  },
  github: {
    id: 'github',
    configDir: '.github',
    displayName: 'GitHub Copilot',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license'],
    globalSkillsDir: '.github/skills',
  },
  opencode: {
    id: 'opencode',
    configDir: '.opencode',
    displayName: 'OpenCode',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.opencode/skills',
  },
  pi: {
    id: 'pi',
    configDir: '.pi',
    displayName: 'Pi',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.pi/skills',
  },
  kiro: {
    id: 'kiro',
    configDir: '.kiro',
    displayName: 'Kiro',
    commandPrefix: '/',
    frontmatterFields: ['license'],
    globalSkillsDir: '.kiro/skills',
  },
  qoder: {
    id: 'qoder',
    configDir: '.qoder',
    displayName: 'Qoder',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.qoder/skills',
  },
  trae: {
    id: 'trae',
    configDir: '.trae',
    displayName: 'Trae',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license'],
    globalSkillsDir: '.trae/skills',
  },
  'trae-cn': {
    id: 'trae-cn',
    configDir: '.trae-cn',
    displayName: 'Trae China',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license'],
    globalSkillsDir: '.trae-cn/skills',
  },
  'rovo-dev': {
    id: 'rovo-dev',
    configDir: '.rovodev',
    displayName: 'Rovo Dev',
    commandPrefix: '/',
    frontmatterFields: ['user-invocable', 'argument-hint', 'license', 'allowed-tools'],
    globalSkillsDir: '.rovodev/skills',
  },
};

/** CLI aliases → provider id */
export const PROVIDER_ALIASES = {
  agents: 'codex',
  claude: 'claude-code',
  copilot: 'github',
  rovodev: 'rovo-dev',
};

export const DEFAULT_PROVIDER_IDS = ['cursor', 'claude-code', 'codex'];

export function resolveProviderId(input) {
  const key = String(input || '').trim().toLowerCase();
  if (PROVIDERS[key]) return key;
  if (PROVIDER_ALIASES[key]) return PROVIDER_ALIASES[key];
  return null;
}

export function scriptsRelPath(provider) {
  return `${provider.configDir}/skills/${SKILL_NAME}/scripts`;
}

export function skillRelPath(provider) {
  return `${provider.configDir}/skills/${SKILL_NAME}`;
}

import fs from 'node:fs';

export function detectInstalledProviders(cwd, homeDir) {
  const found = new Set();
  for (const provider of Object.values(PROVIDERS)) {
    const projectDir = `${cwd}/${provider.configDir}`;
    const globalDir = provider.globalSkillsDir
      ? `${homeDir}/${provider.globalSkillsDir}`
      : null;
    if (
      fs.existsSync(projectDir) ||
      (globalDir && fs.existsSync(globalDir)) ||
      (provider.id === 'codex' && fs.existsSync(`${homeDir}/.codex`))
    ) {
      found.add(provider.id);
    }
  }
  return [...found];
}
