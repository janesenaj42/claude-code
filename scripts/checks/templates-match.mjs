// Fails unless each GitHub template and its GitLab counterpart ask for the same things. A pair
// with one side missing (a project on one platform) is skipped.
//
// - Markdown and Markdown (PR/MR): the bodies must be the same. GitHub's frontmatter (name,
//   labels) and GitLab's quick actions (/label ...) differ by design and are ignored.
// - GitHub issue form (YAML) and GitLab Markdown: GitLab has no forms, so the form's field labels
//   must equal the Markdown's `## ` headings, in order. "(optional)" in a heading is ignored: the
//   form says it with `required`.
//
// Usage: node scripts/checks/templates-match.mjs   Run by the pre-commit hook (lefthook.yml).
// Needs only Node: the form is read line by line, not with a YAML parser.
import { existsSync, readFileSync } from 'node:fs';

const PAIRS = [
  ['.github/pull_request_template.md', '.gitlab/merge_request_templates/Default.md'],
  ['.github/ISSUE_TEMPLATE/bug_report.yml', '.gitlab/issue_templates/Bug.md'],
  ['.github/ISSUE_TEMPLATE/feature_request.yml', '.gitlab/issue_templates/Feature.md'],
];

const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** A Markdown template without frontmatter or quick-action lines. */
const body = (path) =>
  read(path)
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^\/\w+.*$/gm, '')
    .trim();

const unquote = (text) => text.trim().replace(/^(["'])(.*)\1$/, '$2');

/** An issue form's field labels: each `label:` under `attributes:` in `body:`. */
const formSections = (path) => [...read(path).matchAll(/^\s+label:(.*)$/gm)].map((match) => unquote(match[1]));

const headings = (path) =>
  [...body(path).matchAll(/^## (.+)$/gm)].map((match) => match[1].replace(/\s*\(optional\)$/, '').trim());

/** What a template asks for, in a form both platforms' templates can be compared in. */
const asks = (path, other) => {
  if (path.endsWith('.yml')) return formSections(path).join('\n');
  return other.endsWith('.yml') ? headings(path).join('\n') : body(path);
};

const differ = PAIRS.filter(([github, gitlab]) => existsSync(github) && existsSync(gitlab)).filter(
  ([github, gitlab]) => asks(github, gitlab) !== asks(gitlab, github),
);

if (differ.length) {
  console.error(`Templates whose GitHub and GitLab versions ask for different things:
${differ.map(([github, gitlab]) => `  - ${github} / ${gitlab}`).join('\n')}

Make the same change in both.`);
  process.exit(1);
}
