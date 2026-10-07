// Fails if any file given as an argument isn't valid JSON. Kept in a file, not
// inline in a hook: on Windows, lefthook splits an inline `node -e "..."` script
// at its spaces. Run by the pre-commit hook on staged .json files.
import { readFileSync } from 'node:fs';

for (const file of process.argv.slice(2)) {
  JSON.parse(readFileSync(file, 'utf8'));
}
