// Fails unless each GitHub template and its GitLab copy have the same body, so the two
// platforms ask for the same things. GitHub's frontmatter (name, labels) and GitLab's quick
// actions (/label ...) differ by design and are ignored. A pair with one side missing (a
// project on one platform) is skipped.
//
// Usage: node scripts/checks/templates-match.mjs   Run by the pre-commit hook (lefthook.yml).
import { existsSync, readFileSync } from 'node:fs';

const PAIRS = [
  ['.github/pull_request_template.md', '.gitlab/merge_request_templates/Default.md'],
  ['.github/ISSUE_TEMPLATE/bug_report.md', '.gitlab/issue_templates/Bug.md'],
  ['.github/ISSUE_TEMPLATE/feature_request.md', '.gitlab/issue_templates/Feature.md'],
];

/** The template without frontmatter or quick-action lines. */
const body = (path) =>
  readFileSync(path, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^\/\w+.*$/gm, '')
    .trim();

const differ = PAIRS.filter(([github, gitlab]) => existsSync(github) && existsSync(gitlab)).filter(
  ([github, gitlab]) => body(github) !== body(gitlab),
);

if (differ.length) {
  console.error(`Templates whose GitHub and GitLab copies differ:
${differ.map(([github, gitlab]) => `  - ${github} / ${gitlab}`).join('\n')}

Make the same change in both.`);
  process.exit(1);
}
