// Shared by the Claude hooks in this folder (wired in .claude/settings.json). The commands come
// from checks.json; its format is in the baseline README, "Claude hooks".
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { posix, resolve, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** The JSON Claude Code sends on stdin. */
export function payload() {
  return JSON.parse(readFileSync(0, 'utf8') || '{}');
}

/** The areas in checks.json, each with its root as a path from the repo root ("" for the root). */
export function areas() {
  const config = JSON.parse(readFileSync(new URL('./checks.json', import.meta.url), 'utf8'));
  return (config.areas ?? []).map((area) => ({ ...area, root: normalize(area.root ?? '.') }));
}

/** The area owning a path from the repo root: the one with the longest root containing it. */
export function owner(list, path) {
  return list
    .filter((area) => area.root === '' || path === area.root || path.startsWith(`${area.root}/`))
    .sort((a, b) => b.root.length - a.root.length)[0];
}

/**
 * A path from the payload, as this process sees it. Claude Code sends paths in its own form
 * (D:\... on Windows); resolving them against the payload's cwd, then against this process's
 * cwd, also works when Node runs elsewhere (e.g. in a container with the repo mounted).
 */
export function localPath(path, cwd) {
  const style = /^[A-Za-z]:[\\/]/.test(path) || /^[A-Za-z]:[\\/]/.test(cwd ?? '') ? win32 : posix;
  return resolve(process.cwd(), style.relative(cwd ?? process.cwd(), path).replaceAll('\\', '/'));
}

/**
 * Runs one checks.json command ({ run: [tool, ...args], okExitCodes? }) in `cwd`, with
 * placeholders in its arguments replaced. Returns whether it passed, and its output.
 */
export function check(command, cwd, placeholders = {}) {
  const [tool, ...args] = command.run.map((arg) =>
    arg.replace(/\{(\w+)\}/g, (match, name) => placeholders[name] ?? match),
  );
  const result = spawnSync(tool, args, {
    cwd,
    encoding: 'utf8',
    // npm, npx and uv shims are .cmd files on Windows, which only a shell can start.
    shell: process.platform === 'win32',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  const ok = (command.okExitCodes ?? [0]).includes(result.status);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.message ?? ''}`.trim();
  return { ok, label: [tool, ...args].join(' '), output };
}

/** Runs git in the repo root; returns stdout. */
export function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' }).stdout ?? '';
}

function normalize(path) {
  return posix.normalize(path.replaceAll('\\', '/')).replace(/^\.\/?$|\/$/g, '');
}
