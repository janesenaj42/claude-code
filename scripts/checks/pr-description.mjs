// Fails unless a pull or merge request description follows the repo's template:
// it starts by naming the issue it closes ("Closes #12") or why there is none
// ("No issue: hotfix"), and has every "## " section of the template, each with
// something in it ("None" is fine). A template heading ending in "(optional)"
// may be left out. The sections are read from the template, so changing the
// template changes the check.
//
// GitHub fills the template in only when a PR is opened in the web UI; `gh pr
// create --body`, the API and tools that use them skip it without a word. GitLab
// is the same for `glab mr create` and its API.
//
// Usage: PR_BODY=... [BRANCH=...] [PR_BODY_TRUNCATED=true] [PR_TEMPLATE=path] \
//          node scripts/checks/pr-description.mjs
// Run by CI on every pull or merge request (.github/workflows/ci.yml, .gitlab-ci.yml).
// PR_TEMPLATE defaults to whichever platform's template the repo has.
// PR_BODY_TRUNCATED: GitLab cuts CI_MERGE_REQUEST_DESCRIPTION at 2700 characters; when it
// did, sections after the cut can't be checked, so a missing one isn't reported.
import { existsSync, readFileSync } from 'node:fs';

// Opened by tools, not people. Unlike branch-name.mjs, claude/ branches are not
// exempt: a request Claude opens follows the template like any other.
const EXEMPT = [/^release-please--/, /^dependabot\//, /^renovate\//];

const TEMPLATES = ['.github/pull_request_template.md', '.gitlab/merge_request_templates/Default.md'];

const branch = process.env.BRANCH ?? '';
if (EXEMPT.some((pattern) => pattern.test(branch))) process.exit(0);

const template = process.env.PR_TEMPLATE || TEMPLATES.find((path) => existsSync(path));
if (!template) {
  console.error(`No template found (${TEMPLATES.join(', ')}); set PR_TEMPLATE.`);
  process.exit(1);
}

/** Text without HTML comments (the template's instructions). */
const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '');

/** The "## " sections of a Markdown text, in order, with what each holds. */
function sections(text) {
  const parts = stripComments(text).replace(/\r\n/g, '\n').split(/^## +(.+?)\s*$/m);
  const found = [];
  for (let i = 1; i < parts.length; i += 2) found.push({ heading: parts[i], body: parts[i + 1].trim() });
  return { intro: parts[0].trim(), found };
}

const required = sections(readFileSync(template, 'utf8'))
  .found.map((s) => s.heading)
  .filter((heading) => !/\(optional\)$/i.test(heading));
const truncated = process.env.PR_BODY_TRUNCATED === 'true';
const { intro, found } = sections(process.env.PR_BODY ?? '');
// The last section of a cut description may be cut short, so it isn't checked either.
const checkable = truncated ? found.slice(0, -1) : found;

const problems = [];
// GitLab references can name nested groups: group/subgroup/project#12.
if (!/^(?:(?:Closes|Fixes|Resolves) +(?:[\w.-]+(?:\/[\w.-]+)+)?#\d+|No issue: *\S)/im.test(intro)) {
  problems.push('Start with "Closes #<issue>", or "No issue: <why>".');
}
for (const heading of required) {
  const section = found.find((s) => s.heading.toLowerCase() === heading.toLowerCase());
  if (!section) {
    if (!truncated) problems.push(`Missing "## ${heading}".`);
  } else if (checkable.includes(section) && !section.body) {
    problems.push(`"## ${heading}" is empty (write "None" if there's nothing to say).`);
  }
}

if (problems.length) {
  console.error(`The description doesn't follow ${template}:\n${problems.map((p) => `  - ${p}`).join('\n')}

Edit the description, then re-run this check.`);
  process.exit(1);
}
