// Fails unless every relative link in every tracked Markdown file points to a file or folder
// that exists, so moving or deleting a file can't silently leave docs pointing at nothing.
//
// Checks `[text](path)` and reference definitions `[ref]: path`. Skips external URLs
// (`https:`, `mailto:`, ...), same-page anchors (`#section`) and fenced code blocks. For
// `file.md#section` only the file is checked.
//
// Usage: node scripts/checks/markdown-links.mjs   Run by CI (.github/workflows/ci.yml, .gitlab-ci.yml).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const files = execFileSync('git', ['ls-files', '*.md'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

const INLINE = /\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const REFERENCE = /^ {0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/gm;

const broken = [];
for (const file of files) {
  const text = readFileSync(join(ROOT, file), 'utf8').replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  for (const [, target] of [...text.matchAll(INLINE), ...text.matchAll(REFERENCE)]) {
    if (/^([a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
    const path = decodeURI(target.split('#')[0]);
    if (path && !existsSync(join(ROOT, dirname(file), path))) broken.push(`${file}: ${target}`);
  }
}

if (broken.length) {
  console.error(`Links to files that don't exist:\n${broken.map((b) => `  - ${b}`).join('\n')}
\nPoint each at the file's new place, or remove the link.`);
  process.exit(1);
}
console.log(`${files.length} Markdown files: every relative link resolves.`);
