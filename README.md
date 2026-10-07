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

Run it again later to bring a project up to date with this repo. Where there's no clone (a
cloud session), set `BASELINE_REPO` to a path or clone URL. What it does:
[`.claude/skills/adopt-baseline/SKILL.md`](.claude/skills/adopt-baseline/SKILL.md).

## What a project gets

### Claude works to the project's rules

| Rule | File |
|---|---|
| Every fact in one file, docs link to it; a rule people must remember belongs in CI | [`CLAUDE.md`](CLAUDE.md) |
| Code review standards, for every stack | [`CLAUDE.md`](CLAUDE.md) |
| Stack review standards, loaded only when Claude reads that stack's files | [`.claude/rules/`](.claude/rules/) `typescript.md`, `java.md`, `python.md` |
| How to write docs, comments, commit messages and PR descriptions | [`.claude/rules/`](.claude/rules/) `docs.md`, `writing-style.md` |

### Checks run in three layers

CI runs every check the git hooks run, so skipping a hook (`--no-verify`) or Claude (editing by
hand) doesn't get past review.

| Layer | Defined in | Runs | On failure | Bypass |
|---|---|---|---|---|
| Claude hooks | `.claude/settings.json`, `.claude/hooks/checks.json` | After each Claude edit; when Claude ends a turn | Error returned to Claude; the turn can't end until fixed | Edits made outside Claude Code |
| Git hooks | `lefthook.yml` or `.husky/` | `pre-commit`, `commit-msg`, `pre-push` | Commit or push rejected | `--no-verify` |
| CI | `.github/workflows/ci.yml`, `.gitlab-ci.yml` | Every PR/MR and push to `main` | Failing check on the PR/MR | None, once merging requires the checks (branch protection; GitLab "Pipelines must succeed") |

The checks themselves are scripts in [`scripts/checks/`](scripts/checks/), so every layer and
both platforms run the same code. [`.claude/hooks/checks.json`](.claude/hooks/checks.json) sets
the commands Claude's hooks run per Area (`CONTEXT.md`); its format is in the header of
[`.claude/hooks/run.mjs`](.claude/hooks/run.mjs).

### Commits, branches and PR/MR descriptions follow one convention

| Convention | Why | Checked by |
|---|---|---|
| Conventional Commits | Changelogs and release tools read the type | [`commitlint.config.js`](commitlint.config.js); `npm run commit` for a guided prompt |
| PR/MR title is a Conventional Commit | Squash merging makes the title the commit on `main` | CI |
| Branch `<type>/<issue>/<slug>` | The branch, title and commit agree, and name the issue | [`scripts/checks/branch-name.mjs`](scripts/checks/branch-name.mjs) |
| Description follows the template | `gh`, `glab` and the APIs skip the template | [`scripts/checks/pr-description.mjs`](scripts/checks/pr-description.mjs) |

### Each stack is linted for the review standards

[`presets/`](presets/) has, per stack (`ts`, `java-gradle`, `python`): the Claude and git hook
commands, a CI job for GitHub and for GitLab, and lint config that enforces the standards marked
*(lint)* in `CLAUDE.md`. `presets/husky/` is for projects that keep husky or their own hooks.

### Terms and decisions are written down

[`CONTEXT.md`](CONTEXT.md) defines the project's terms; [`docs/adr/`](docs/adr/) records
hard-to-reverse decisions and why.

## GitHub, GitLab, on-prem

No file names a host. Runners, images and registries come from variables and tool
configuration; which ones, and what each platform can't do: [`docs/adr/0004-github-and-gitlab.md`](docs/adr/0004-github-and-gitlab.md).

## Recommended user-scope skills

Not copied into projects; install them in `~/.claude/skills/` from
[mattpocock/skills](https://github.com/mattpocock/skills): `grilling`, `grill-with-docs`,
`domain-modeling`. Commit a copy into a project only if its cloud sessions need it or it changes
the skill; keep the source commit and the MIT license file next to the copy.
