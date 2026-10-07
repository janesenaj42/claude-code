// Fails unless a PR description follows .github/pull_request_template.md:
// it starts by naming the issue it closes ("Closes #12") or why there is none
// ("No issue: hotfix"), and has every "## " section of the template, each with
// something in it ("None" is fine). A template heading ending in "(optional)"
// may be left out. The sections are read from the template, so changing the
// template changes the check.
//
// GitHub fills the template in only when a PR is opened in the web UI; `gh pr
// create --body`, the API and tools that use them skip it without a word.
//
// Usage: PR_BODY=... [BRANCH=...] node .github/scripts/pr-description.mjs
// Run by CI on every PR, and again when its description is edited
// (.github/workflows/ci.yml).
import { readFileSync } from 'node:fs';

// Opened by tools, not people. Unlike scripts/checks/branch-name.mjs, claude/ branches are
// not exempt: a PR Claude opens follows the template like any other.
const EXEMPT = [/^release-please--/, /^dependabot\//, /^renovate\//];

const TEMPLATE = '.github/pull_request_template.md';

const branch = process.env.BRANCH ?? '';
if (EXEMPT.some((pattern) => pattern.test(branch))) process.exit(0);

/** Text without HTML comments (the template's instructions). */
const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '');

/** The "## " sections of a Markdown text, in order, with what each holds. */
function sections(text) {
  const parts = stripComments(text).replace(/\r\n/g, '\n').split(/^## +(.+?)\s*$/m);
  const found = [];
  for (let i = 1; i < parts.length; i += 2) found.push({ heading: parts[i], body: parts[i + 1].trim() });
  return { intro: parts[0].trim(), found };
}

const required = sections(readFileSync(TEMPLATE, 'utf8'))
  .found.map((s) => s.heading)
  .filter((heading) => !/\(optional\)$/i.test(heading));
const body = process.env.PR_BODY ?? '';
const { intro, found } = sections(body);

const problems = [];
if (!/^(?:(?:Closes|Fixes|Resolves) +(?:[\w.-]+\/[\w.-]+)?#\d+|No issue: *\S)/im.test(intro)) {
  problems.push('Start with "Closes #<issue>", or "No issue: <why>".');
}
for (const heading of required) {
  const section = found.find((s) => s.heading.toLowerCase() === heading.toLowerCase());
  if (!section) problems.push(`Missing "## ${heading}".`);
  else if (!section.body) problems.push(`"## ${heading}" is empty (write "None" if there's nothing to say).`);
}

if (problems.length) {
  console.error(`The PR description doesn't follow ${TEMPLATE}:\n${problems.map((p) => `  - ${p}`).join('\n')}

Edit the description; this check runs again on its own.`);
  process.exit(1);
}
