---
name: adopt-baseline
description: Apply the project baseline (CLAUDE.md rules, Claude hooks, git hooks, Conventional Commits, branch names, lint config, ADR template, glossary) to a project, new or existing, TypeScript (React through init-react), Java (Gradle) or Python, with lefthook or husky. CI is not set up: the CI team owns pipelines. Also re-runs to bring a project up to date with the baseline. Use when the user wants to adopt, apply, install or update the baseline, or set up a repo's conventions or hooks from it.
---

# Adopt the baseline

This skill ships in the `baseline` plugin. The **baseline repo** (the files the steps below
copy, e.g. `presets/`), in this order:

1. `$BASELINE_REPO`, if set: a local checkout (to try changes before they are published), or a
   clone URL to clone into the scratchpad (a cloud session without the plugin).
2. The plugin's root: two levels up from this skill's folder (`skills/adopt-baseline/`).

The plugin is updated with `claude plugin marketplace update <marketplace>`; tell the user to
run it first if they want the latest. On a re-run, the plan in step 2 lists only what differs from the baseline.

The **target** is the repo the user names, or the current repo.

Never overwrite a target file without showing the diff and getting a yes. Merge; don't replace.

## 1. Survey the target

Report a table of what you find, with the file that told you:

| Question | Look at |
|---|---|
| Areas: folders with their own stack | `package.json` with `react` and `typescript` → `react` (init-react; not Next.js, which init-react refuses: use `ts`); with `typescript` only → `ts`; `build.gradle(.kts)` + `gradlew` → `java-gradle`; `pyproject.toml` → `python`. A single-project repo has one Area at `.` |
| Each Area's existing commands | `package.json` `scripts` (note names that differ from the presets', e.g. `eslint` for `lint`, `check-format` for `format:check`); Gradle plugins (spotless, checkstyle); `[tool.ruff]`, `[tool.mypy]`, `[tool.poe.tasks]` in `pyproject.toml` |
| Each Area's lint setup | ESLint version and config file (`.eslintrc*` is legacy: init-react keeps it and warns when its ESLint is older than the Standard's); whether the project's own `lint` script runs at all before any change |
| Hook runner | `.husky/` → husky; `lefthook.yml` → lefthook; `.pre-commit-config.yaml` → pre-commit; `git config core.hooksPath` set to another folder (e.g. `.githooks/`) → shell hooks; executable files in `.git/hooks/` other than `*.sample` → local hooks; none |
| Platform | `.github/` → GitHub; `.gitlab-ci.yml` or `.gitlab/` → GitLab; neither: ask. Never decide from the remote's host name: on-prem hosts have any name |
| Existing conventions | `CLAUDE.md`, `.claude/`, `commitlint.config.*`, `CONTEXT.md`, `docs/adr/`, `.gitattributes`, `CONTRIBUTING.md` (release and commit rules) |
| Claude hooks from an earlier baseline | `.claude/hooks/run.mjs`, `on-edit.mjs`, `on-stop.mjs`, and the `hooks` entries in `.claude/settings.json` that call them: the plugin replaces them |
| The plugin's marketplace | `claude plugin marketplace list`: the name of the marketplace the `baseline` plugin was installed from |
| Existing templates | Every file in `.github/pull_request_template*`, `.github/PULL_REQUEST_TEMPLATE/`, `.github/ISSUE_TEMPLATE/`, `.gitlab/merge_request_templates/`, `.gitlab/issue_templates/`, whatever its name |
| Package registry | `.npmrc`, `~/.npmrc`, lockfile `resolved` URLs, scripts that rewrite them, docs mentioning an air-gapped or on-prem network. If the target installs from a mirror (Nexus, Artifactory, GitLab), ask for its URL: init-react needs `--registry`, and `@janesenaj42/*` must be mirrored there first |
| Stack not covered | Maven, Gradle Groovy-only, pnpm/yarn, Poetry: say so, and adapt the preset's commands rather than skipping it |

A target with `.pre-commit-config.yaml`: ask whether to add the baseline's checks to it (as
`repo: local` hooks calling the same scripts) or replace it with lefthook. Never run two hook
runners (baseline `README.md`, "Any hook runner calls the same scripts").

A target with local hooks in `.git/hooks/`: they are on this machine only, not in the repo.
`lefthook install` renames each to `<hook>.old`, after which it no longer runs, with no
warning. Show the user each script and ask: move its commands into `lefthook.yml`, or drop
it. Install lefthook only after that.

## 2. Agree the plan

Show one table: each piece below, **add / merge / skip**, and why. Ask about anything that
conflicts, and wait for a yes:

1. An existing commit convention, or a PR/MR template with other sections.
2. Templates in the target (any PR/MR or issue template): they replace the org-wide ones
   for that repo (GitHub ignores the org's `ISSUE_TEMPLATE` folder entirely when a repo has its
   own). Keep them, or remove them to use the org's; ask.
3. Script names that differ from the presets' (e.g. `check-format`): init-react adds its own
   names beside them; say which pairs will exist and ask whether to remove the old ones.
4. The target's own lint or format check already failing before any change: list it; the
   baseline's git hooks will then block commits until it is fixed.
5. A legacy ESLint config: keep it (init-react warns about the version), or replace it with the
   Standard (`--force=eslint`, which drops the target's own rules).
6. Claude hook scripts from an earlier baseline: removed, since the plugin runs the same hooks
   (running both would run every check twice).
Never add or change CI files (`.github/workflows/`, `.gitlab-ci.yml`): the CI team owns them.

## 3. Apply

Paths are from the baseline repo root. "Merge" means keep everything the target has, add what's
missing, and ask where they disagree.

| Piece | Baseline files | How |
|---|---|---|
| Instructions | `CLAUDE.md` | Merge sections into the target's `CLAUDE.md`. Fill the "Single source of truth" table with the target's real files; delete rows that don't apply; no `<...>` left |
| Stack rules | `.claude/rules/{typescript,java,python}.md` | Copy the ones for the target's stacks |
| Writing rules | `.claude/rules/{docs,writing-style}.md` | Copy |
| Claude hooks | None: the `baseline` plugin runs them; each Area's commands go in `.claude/hooks/checks.json` (stack row) | Run `claude plugin install baseline@<marketplace> --scope project` in the target: it adds `"enabledPlugins": {"baseline@<marketplace>": true}` to the target's `.claude/settings.json`, so the plugin runs in this repo only. Never add `extraKnownMarketplaces`: it names a host, and each machine adds the marketplace from the host it can reach. Remove an earlier baseline's `.claude/hooks/*.mjs` and the `hooks` entries calling them |
| Commits | `commitlint.config.mjs`, root `package.json` | Copy the config; merge the devDependencies, `scripts.commit`, `config.commitizen`, `engines` into the root `package.json` (create one for Java/Python targets, `"private": true`) |
| Each Area's stack | `presets/<stack>/` | Every file, as `presets/<stack>/README.md` says: Claude hook commands, git hook commands (lefthook, or the husky/shell-hook lines with `presets/husky/README.md`), lint config. Skip what the target already runs and say which. If the target already breaks the new lint rules, show the count and ask: fix now, or open an issue to fix them first |
| React Areas | `presets/react/` | As `presets/react/README.md` says: run init-react (`--skip=commitlint`; also `lefthook` when the target keeps husky or its own hooks; `--registry=<mirror>` when it installs from one), dry run first and show every `!` line, then merge its `checks.json`. Not `presets/ts` |
| Shared git hooks | `lefthook.yml`, or `presets/husky/` | lefthook or none: merge `lefthook.yml`. husky or shell hooks (`core.hooksPath`): append as `presets/husky/README.md` says, keeping every `\|\| exit 1`; a new hook file gets `#!/bin/sh` and the executable bit |
| Branch names | `scripts/checks/branch-name.mjs` | Copy |
| JSON check | `scripts/checks/json-valid.mjs` | Copy |
| PR/MR and issue templates | None: they are published once per org/group (`README.md`, "Templates, once per org and group") | Copy nothing. Check the target's org or group has **both** kinds, and report each one missing. GitHub: a **public** `.github` repo in the org with `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/` (`bug_report.yml`, `feature_request.yml`, `config.yml`). GitLab: Group → Settings → General → Templates set to a project with `.gitlab/merge_request_templates/Default.md` and `.gitlab/issue_templates/` (`Bug.md`, `Feature.md`) |
| Check layers table | `README.md` "Checks run in two layers" | Add the table to the target's `README.md` (the target's `CLAUDE.md` points to it), with its real files |
| Line endings | `.gitattributes`, `presets/java-gradle/README.md` | Merge |
| Glossary | `CONTEXT.md` | Only if the target has none; fill the project name and description from its README |
| Decision records | `docs/adr/template.md` | Copy if the target has no ADR format of its own. Copy no records: a project's records are its own decisions |

## 4. Verify

Run each and report pass or fail with the output; fix what fails before reporting done:

1. `npm install` at the root (installs the hooks via `prepare`, unless husky).
   `claude plugin list` in the target shows `baseline@<marketplace>` enabled.
2. `node scripts/checks/branch-name.mjs <a valid name>` and an invalid one: passes, then fails.
3. `printf 'feat: x\n' | npx commitlint` passes; `printf 'bad\n' | npx commitlint` fails.
4. Every `onEdit` and `onStop` command in `checks.json`, run by hand in its Area.
5. The hooks fire: stage a file with invalid JSON and run `git commit -m 'bad'`; it must be
   rejected. A passing `lefthook run` is not enough: `lefthook install` exits 0 without
   installing when `core.hooksPath` points elsewhere, and `prepare` hides its errors
   (`|| true`). Check `git config core.hooksPath` is empty (lefthook) or the hooks folder.
6. The hooks let good work through: commit one unchanged-but-touched source file from each Area
   (e.g. add a blank line and remove it with the formatter) with a valid message on a valid
   branch, and a change to `tsconfig.json`; each must succeed. A hook that blocks every commit
   (a broken lint config, an ESLint version the config can't load) fails here, not in a week.

## 5. Report

A table: piece, what changed (file), verified how. Then a list of what's left for the user:

1. For the CI team: the commands their pipeline should run per Area (each preset's `README.md`
   lists them; React Areas: `lint`, `format:check`, `typecheck`), plus commitlint on the PR/MR
   title and `node scripts/checks/branch-name.mjs` on the branch, since git hooks can be skipped.
2. Squash merging with the title as the commit: the default on GitHub; on GitLab, set "Squash
   commits when merging" to required and the squash commit template to `%{title}`.
3. On-prem: package registries in npm, Gradle and uv configuration (never committed).
4. Node for Java and Python developers (baseline `README.md`, "Node runs the shared checks").
5. Each developer, once per machine, so Claude's hooks run for them: add the marketplace from a
   host they reach (`claude plugin marketplace add <source>`), then, in this repo,
   `claude plugin install baseline@<marketplace> --scope project`. Without it, no Claude hook
   runs for them; the git hooks still do.
