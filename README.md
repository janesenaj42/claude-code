# Project baseline

Conventions, checks and Claude Code setup for any project: TypeScript, Java (Gradle) or Python,
one stack or several, with lefthook or husky, on GitHub or GitLab, online or on-prem.

## Start

Projects don't clone or copy this repo. A project, new or existing, runs `/adopt-baseline`, which
copies only what its stacks and platform need. Start a new project with its stack's own tool
(`npm create vite`, Spring Initializr, `uv init`), commit it, then follow the steps below.

`<baseline URL>` below is the clone URL of whichever copy of this repo you can reach: GitHub,
GitLab, or an on-prem mirror.

### On your machine

1. Once per machine, install the skill for every project:

   ```sh
   git clone <baseline URL> ~/.claude/baseline
   mkdir -p ~/.claude/skills
   ln -s ~/.claude/baseline/.claude/skills/adopt-baseline ~/.claude/skills/adopt-baseline
   ```

2. In the project, on a new branch: run `claude`, then `/adopt-baseline`.
3. Review the plan (each piece marked add, merge or skip) and approve it. The skill applies it
   and runs every check.
4. Commit and open a PR/MR.

### In a Claude Code cloud session

`~/.claude/` doesn't exist in a cloud session, so the skill comes from the baseline repo itself.

1. Start the session on the project's repo.
2. If the baseline is on GitHub: add it to the session by prompting "add the repo
   `<owner>/<name>`". Its skills load, including `/adopt-baseline`. Run `/adopt-baseline` and
   name the project as the target.

Cloud sessions add GitHub repos only. For a baseline on GitLab or on-prem:

1. In the cloud environment's settings (environment menu in the session's title bar > Edit), add
   the environment variable `BASELINE_REPO=<baseline URL>`. The container's network must reach
   that host, and a private repo needs credentials the container can use. Start a new session:
   variables apply to new sessions only.
2. In the session, prompt: "Clone `$BASELINE_REPO` and follow its
   `.claude/skills/adopt-baseline/SKILL.md` for this repo."

### Bring a project up to date

Run `/adopt-baseline` again in the project, the same way as above. It pulls the latest baseline
first (`git -C ~/.claude/baseline pull --ff-only` on your machine), compares, and proposes only
what differs.

## What a project gets

### Claude works to the project's rules

| Rule | File |
|---|---|
| Every fact in one file, docs link to it; a rule people must remember belongs in a check | [`CLAUDE.md`](CLAUDE.md) |
| Code review standards, for every stack | [`CLAUDE.md`](CLAUDE.md) |
| Stack review standards, loaded only when Claude reads that stack's files | [`.claude/rules/`](.claude/rules/) `typescript.md`, `java.md`, `python.md` |
| How to write docs, comments, commit messages and PR descriptions | [`.claude/rules/`](.claude/rules/) `docs.md`, `writing-style.md` |

### Checks run in two layers

CI is not part of the baseline: the CI team owns pipelines. Git hooks can be skipped, so the CI
team runs the same checks; `/adopt-baseline` reports which.

| Layer | Defined in | Runs | On failure | Bypass |
|---|---|---|---|---|
| Claude hooks | `.claude/settings.json`, `.claude/hooks/checks.json` | After each Claude edit; when Claude ends a turn | Error returned to Claude; the turn can't end until fixed | Edits made outside Claude Code |
| Git hooks | `lefthook.yml` or `.husky/` | `pre-commit`, `commit-msg`, `pre-push` | Commit or push rejected | `--no-verify` |

The checks themselves are scripts in [`scripts/checks/`](scripts/checks/), so any hook runner,
and any pipeline, runs the same code. [`.claude/hooks/checks.json`](.claude/hooks/checks.json) sets
the commands Claude's hooks run per Area (`CONTEXT.md`); its format is in the header of
[`.claude/hooks/run.mjs`](.claude/hooks/run.mjs).

### Commits, branches and PR/MR descriptions follow one convention

| Convention | Why | Checked by |
|---|---|---|
| Conventional Commits | Changelogs and release tools read the type | [`commitlint.config.js`](commitlint.config.js); `npm run commit` for a guided prompt |
| PR/MR title is a Conventional Commit | Squash merging makes the title the commit on `main` | The CI team's pipeline |
| Branch `<type>/<issue>/<slug>` | The branch, title and commit agree, and name the issue | [`scripts/checks/branch-name.mjs`](scripts/checks/branch-name.mjs) |
| PR/MR template | Every description says what changed, how it was tested, and what was assumed | Review |

### Each stack is linted for the review standards

[`presets/`](presets/) has, per stack (`ts`, `java-gradle`, `python`): the Claude and git hook
commands and lint config that enforces the standards marked *(lint)* in `CLAUDE.md`. React projects
get theirs from [init-react](https://github.com/janesenaj42/init-react) instead of `presets/ts`. `presets/husky/` is for projects that keep husky or their own hooks.

### Terms and decisions are written down

[`CONTEXT.md`](CONTEXT.md) defines the project's terms. [`docs/adr/`](docs/adr/) holds a
project's decision records; the baseline ships only their format,
[`docs/adr/template.md`](docs/adr/template.md).

## How the baseline is built

### Node runs the shared checks, whatever the project's stack

The checks every project shares and Claude's hooks are Node scripts, with commitlint for commit
messages. Rewriting them per stack would mean three copies that drift apart. A Java or Python
project gets a small root `package.json` for this tooling only, so its developers need Node to
run the git hooks. Each stack's build, lint and test commands stay in its own toolchain.

### Any hook runner calls the same scripts

lefthook, husky, a `core.hooksPath` folder and a pipeline all call the scripts in `scripts/checks/`. A
project without hooks gets lefthook; one with husky or its own hooks keeps them
([`presets/husky/`](presets/husky/)). Never two runners in one repo: husky sets
`core.hooksPath`, and `lefthook install` then installs nothing (exit 0); `lefthook install` also
renames hooks in `.git/hooks/` to `<hook>.old`, which then don't run.

### No host in any file

Where the baseline is cloned from is set when you clone it (`BASELINE_REPO` for
`/adopt-baseline`). npm, Gradle and PyPI registries come from each tool's configuration on the
machine, never from a committed file.

## Recommended user-scope skills

Not copied into projects; install them in `~/.claude/skills/` from
[mattpocock/skills](https://github.com/mattpocock/skills): `grilling`, `grill-with-docs`,
`domain-modeling`. Commit a copy into a project only if its cloud sessions need it or it changes
the skill; keep the source commit and the MIT license file next to the copy.
