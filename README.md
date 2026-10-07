# Project baseline

Conventions, checks and Claude Code setup for any project: TypeScript, Java (Gradle) or Python,
one stack or several, with lefthook or husky, on GitHub or GitLab, online or on-prem.

## Start

Projects don't clone or copy this repo. It is a Claude Code plugin, `baseline`, published to the
`gc3-webplatform` marketplace ([Publish the plugin](#publish-the-plugin)). A project turns it on in
its committed `.claude/settings.json`, so it runs in that project only, and `/baseline:adopt-baseline`
copies what the project's stacks and platform need. Start a new project with its stack's own tool
(`npm create vite`, Spring Initializr, `uv init`), commit it, then follow the steps below.

### Once per machine

Add the marketplace from wherever you can reach it: `gc3-webplatform/General-Docs` on GitHub, the
git URL of its on-prem mirror, or a local folder with a copy. This turns no plugin on.

```sh
claude plugin marketplace add <source>
```

### Adopt the baseline in a project

1. In the project, on a new branch, turn the plugin on for this repo (adds `enabledPlugins` to
   `.claude/settings.json`):

   ```sh
   claude plugin install baseline@gc3-webplatform --scope project
   ```

2. Run `claude`, then `/baseline:adopt-baseline`.
3. Review the plan (each piece marked add, merge or skip) and approve it. The skill applies it
   and runs every check.
4. Commit and open a PR/MR.

A teammate runs step 1's command once per machine, in any repo that has the plugin on. Until
then, Claude's hooks don't run for them; the git hooks do.

### In a Claude Code cloud session

`~/.claude/` starts empty in a cloud session, so the skill comes from the marketplace repo itself.

1. Start the session on the project's repo.
2. Add the marketplace repo by prompting "add the repo `gc3-webplatform/General-Docs`", then
   prompt: "Follow `plugins/baseline/skills/adopt-baseline/SKILL.md` in that clone for this repo."

Cloud sessions add GitHub repos only. For a copy on GitLab or on-prem, add the environment
variable `BASELINE_REPO=<clone URL>` in the cloud environment's settings (environment menu in the
session's title bar > Edit; new sessions only; the container's network must reach that host),
then prompt: "Clone `$BASELINE_REPO` and follow its `skills/adopt-baseline/SKILL.md` for this repo."

### Bring a project up to date

```sh
claude plugin marketplace update gc3-webplatform
```

Then run `/baseline:adopt-baseline` in the project: it compares and proposes only what differs.

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
team runs the same checks; `/baseline:adopt-baseline` reports which.

| Layer | Defined in | Runs | On failure | Bypass |
|---|---|---|---|---|
| Claude hooks | The `baseline` plugin ([`hooks/`](hooks/)), on in `.claude/settings.json`; commands in `.claude/hooks/checks.json` | After each Claude edit; when Claude ends a turn | Error returned to Claude; the turn can't end until fixed | Edits made outside Claude Code; a machine without the plugin installed |
| Git hooks | `lefthook.yml` or `.husky/` | `pre-commit`, `commit-msg`, `pre-push` | Commit or push rejected | `--no-verify` |

The checks themselves are scripts in [`scripts/checks/`](scripts/checks/), so any hook runner,
and any pipeline, runs the same code. A project's `.claude/hooks/checks.json` sets the commands
Claude's hooks run per Area (`CONTEXT.md`); its format is in the header of
[`hooks/run.mjs`](hooks/run.mjs).

### Commits, branches and PR/MR descriptions follow one convention

| Convention | Why | Checked by |
|---|---|---|
| Conventional Commits | Changelogs and release tools read the type | [`commitlint.config.mjs`](commitlint.config.mjs); `npm run commit` for a guided prompt |
| PR/MR title is a Conventional Commit | Squash merging makes the title the commit on `main` | The CI team's pipeline |
| Branch `<type>/<issue>/<slug>` | The branch, title and commit agree, and name the issue | [`scripts/checks/branch-name.mjs`](scripts/checks/branch-name.mjs) |
| PR/MR and issue templates | Every PR/MR says what changed, how it was tested and what was assumed; every issue says what's wrong or what's needed | Review; published once per org and group (below) |

### Each stack is linted for the review standards

[`presets/`](presets/) has, per stack (`react`, `ts`, `java-gradle`, `python`): the Claude and git hook
commands and lint config that enforces the standards marked *(lint)* in `CLAUDE.md`. `react` runs
[init-react](https://github.com/janesenaj42/init-react), which ships its lint rules as a versioned
package. `presets/husky/` is for projects that keep husky or their own hooks.

### Terms and decisions are written down

[`CONTEXT.md`](CONTEXT.md) defines the project's terms. [`docs/adr/`](docs/adr/) holds a
project's decision records; the baseline ships only their format,
[`docs/adr/template.md`](docs/adr/template.md).

## Templates, once per org and group

The PR/MR and issue templates in `.github/` and `.gitlab/` here are the source. Projects don't
copy them: each platform serves them to every repo from one place. Publish them once, and again
after changing them here. GitHub's issue templates are issue forms (YAML, with required fields);
GitLab has no forms, so its issue templates are Markdown with the same sections
(`scripts/checks/templates-match.mjs` checks the two platforms ask for the same things).

| Platform | Steps | Applies to |
|---|---|---|
| GitHub | 1. In the org, create a repository named `.github`, or use the existing one. It must be **public**: GitHub ignores default templates in a private one. 2. Copy `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/` from this repo to the same paths there. 3. Make sure the `bug` and `enhancement` labels exist in the repos (GitHub creates both by default) | Every repo in the org without its own templates; a repo's own `.github/ISSUE_TEMPLATE/` replaces the org's whole folder |
| GitLab (Premium) | 1. Create one project in the group, e.g. `templates`. 2. Copy `.gitlab/merge_request_templates/` and `.gitlab/issue_templates/` from this repo into it. 3. Group → Settings → General → Templates: select that project | Every project in the group and its subgroups: the templates appear in the template list of new issues and MRs |

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

Each machine adds the plugin's marketplace from the host it reaches; a project commits only the
plugin's name (`enabledPlugins`), never `extraKnownMarketplaces`, which names a host. npm, Gradle
and PyPI registries come from each tool's configuration on the machine, never from a committed
file.

## Publish the plugin

This repo is the source; teammates install from `gc3-webplatform/General-Docs`, which they can
read.

1. Raise `version` in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json): Claude Code
   fetches a plugin again only when its version changes.
2. Merge to `main`. From a checkout of `main`:

   ```sh
   node scripts/publish-plugin.mjs <General-Docs checkout>
   ```

3. In `General-Docs`, on a branch, commit `plugins/baseline/` and
   `.claude-plugin/marketplace.json`, and open a PR.
4. On-prem: update the mirror of `General-Docs`.

To try a change before publishing it, set `BASELINE_REPO` to your checkout before running
`claude`: `/baseline:adopt-baseline` then copies files from there. The hooks still come from the
installed plugin.

## Recommended user-scope skills

Not copied into projects; install them in `~/.claude/skills/` from
[mattpocock/skills](https://github.com/mattpocock/skills): `grilling`, `grill-with-docs`,
`domain-modeling`. Commit a copy into a project only if its cloud sessions need it or it changes
the skill; keep the source commit and the MIT license file next to the copy.
