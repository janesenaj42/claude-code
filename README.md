# Project baseline

Conventions, checks and Claude Code setup for any project: TypeScript, Java (Gradle) or Python,
one stack or several, with lefthook or husky, on GitHub or GitLab, online or on-prem.

## Start

| Project | Do |
|---|---|
| New | GitHub: "Use this template" on this repo. GitLab: create the project from it as a group or instance project template, or import it. Then in Claude Code, in the new repo: `/adopt-baseline` |
| Existing | Install the skill once (below), then in the project: `/adopt-baseline` |

Install `/adopt-baseline` for every project on your machine, from whichever copy of this repo
you can reach (GitHub, GitLab, on-prem mirror):

```sh
git clone <clone URL of this repo> ~/.claude/baseline
mkdir -p ~/.claude/skills
ln -s ~/.claude/baseline/.claude/skills/adopt-baseline ~/.claude/skills/adopt-baseline
```

Where there's no clone, e.g. a cloud session, the skill clones from `$BASELINE_REPO` (a path or
clone URL) or asks for the URL. The skill surveys the project, proposes what to add or merge, waits for a yes, applies it and
runs every check. Run it again later to bring a project up to date with this repo. What it
copies, and how: [`.claude/skills/adopt-baseline/SKILL.md`](.claude/skills/adopt-baseline/SKILL.md).

## What's in it

| Practice | Files |
|---|---|
| Single source of truth; rules belong in CI; code review standards | [`CLAUDE.md`](CLAUDE.md) |
| Per-stack review rules, loaded only for matching files | [`.claude/rules/`](.claude/rules/) `typescript.md`, `java.md`, `python.md` |
| Writing rules for docs, comments, commits, PRs | [`.claude/rules/`](.claude/rules/) `docs.md`, `writing-style.md` |
| Claude formats and lints each file it edits; can't end a turn with failing types or tests | [`.claude/settings.json`](.claude/settings.json), [`.claude/hooks/`](.claude/hooks/) |
| Conventional Commits; PR title checked because PRs are squash-merged | [`commitlint.config.js`](commitlint.config.js), [`package.json`](package.json) (`npm run commit` for a guided prompt) |
| Branch names `<type>/<issue>/<slug>` | [`scripts/checks/branch-name.mjs`](scripts/checks/branch-name.mjs) |
| PR/MR template, checked in CI (the APIs, `gh` and `glab` skip it) | [`.github/pull_request_template.md`](.github/pull_request_template.md), [`scripts/checks/pr-description.mjs`](scripts/checks/pr-description.mjs) |
| Every check as a script any CI or hook runner calls | [`scripts/checks/`](scripts/checks/) |
| CI: same checks as the hooks, Markdown links, JSON, one build job per stack | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (GitHub), [`.gitlab-ci.yml`](.gitlab-ci.yml) (GitLab) |
| Per-stack hook commands, CI job and lint config for the review standards | [`presets/`](presets/) `ts`, `java-gradle`, `python`, `husky` |
| Glossary and decision records | [`CONTEXT.md`](CONTEXT.md), [`docs/adr/`](docs/adr/) |

## Checks

| Layer | Defined in | Runs | On failure | Bypass |
|---|---|---|---|---|
| Claude hooks | `.claude/settings.json`, `.claude/hooks/checks.json` | After each Claude edit; when Claude ends a turn | Error returned to Claude; the turn can't end until fixed | Edits made outside Claude Code |
| Git hooks | `lefthook.yml` or `.husky/` | `pre-commit`, `commit-msg`, `pre-push` | Commit or push rejected | `--no-verify` |
| CI | `.github/workflows/ci.yml`, `.gitlab-ci.yml` | Every PR/MR and push to `main` | Failing check on the PR/MR | None, once merging requires the checks (branch protection; GitLab "Pipelines must succeed") |

## Claude hooks: `checks.json`

The hook scripts are the same in every project; [`.claude/hooks/checks.json`](.claude/hooks/checks.json)
says what they run. One entry per Area (`CONTEXT.md`):

```json
{
  "areas": [
    {
      "name": "web",
      "root": "web",
      "onEdit": [{ "match": "\\.tsx?$", "run": ["npx", "--no", "--", "eslint", "{file}"] }],
      "onStop": [{ "run": ["npm", "test"], "okExitCodes": [0] }]
    }
  ]
}
```

| Key | Meaning |
|---|---|
| `root` | The Area's folder from the repo root; commands run there. A file belongs to the Area with the longest `root` containing it |
| `onEdit` | Run after Claude edits a file in the Area. `match`: a regex on `{file}`; without it, every file. `{file}`: path from `root`; `{absfile}`: absolute path |
| `onStop` | Run when Claude ends a turn and the Area has uncommitted non-Markdown changes |
| `okExitCodes` | Exit codes that count as passing; default `[0]` |

## GitHub, GitLab, on-prem

No file names a host. Runners, images and registries come from variables and tool
configuration; which ones, and what each platform can't do: [`docs/adr/0004-github-and-gitlab.md`](docs/adr/0004-github-and-gitlab.md).

## Recommended user-scope skills

Not copied into projects; install them in `~/.claude/skills/` from
[mattpocock/skills](https://github.com/mattpocock/skills): `grilling`, `grill-with-docs`,
`domain-modeling`. Commit a copy into a project only if its cloud sessions need it or it changes
the skill; keep the source commit and the MIT license file next to the copy.

## Not checked by anything

1. Review standards no linter can check (`CLAUDE.md`, `.claude/rules/`): for review.
2. Merging with red checks: requires branch protection (GitHub's free plan has none for private
   repositories) or GitLab's "Pipelines must succeed".
