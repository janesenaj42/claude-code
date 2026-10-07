// Stop hook: before Claude ends a turn, run the onStop commands (e.g. typecheck and test) of
// every area with uncommitted changes (checks.json), and keep Claude working if one fails.
// Markdown changes are ignored: they can't affect a typecheck or a test.
//
// If Claude is already continuing because of this hook (stop_hook_active), it may stop: a
// failure it can't fix must reach the user, not loop. CI still blocks the merge.
import { join } from 'node:path';

import { ROOT, areas, check, git, owner, payload } from './run.mjs';

if (payload().stop_hook_active) process.exit(0);

const changed = git(['status', '--porcelain', '--untracked-files=all'])
  .split('\n')
  .filter(Boolean)
  .map((line) => line.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, ''))
  .filter((file) => !file.endsWith('.md'));
if (changed.length === 0) process.exit(0);

const list = areas();
const touched = [...new Set(changed.map((file) => owner(list, file)).filter(Boolean))];

const failures = touched.flatMap((area) =>
  (area.onStop ?? [])
    .map((command) => check(command, join(ROOT, area.root)))
    .filter((result) => !result.ok)
    .map((result) => `${result.label} (in ${area.root || '.'}/):\n${result.output.slice(-4000)}`),
);

if (failures.length) {
  console.log(
    JSON.stringify({
      decision: 'block',
      reason: `Checks failed for what you changed; fix them, or tell the user why you can't.\n\n${failures.join('\n\n')}`,
    }),
  );
}
