// Fails if a JSON file doesn't parse: the files given as arguments, or every tracked .json
// file when there are none. Kept in a file, not inline in a hook: on Windows, lefthook splits an
// inline `node -e "..."` script at its spaces. Run by the pre-commit hook on staged .json files,
// and by CI on all of them; needs only Node and git (no jq on self-hosted runners).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = process.argv.length > 2
  ? process.argv.slice(2)
  : execFileSync('git', ['ls-files', '*.json'], { encoding: 'utf8' }).split('\n').filter(Boolean);

const broken = [];
for (const file of files) {
  try {
    JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    broken.push(`${file}: ${error.message}`);
  }
}

if (broken.length) {
  console.error(`JSON that doesn't parse:\n${broken.map((b) => `  - ${b}`).join('\n')}`);
  process.exit(1);
}
