---
name: adopt-baseline
description: Apply the project baseline (CLAUDE.md rules, Claude hooks, git hooks, Conventional Commits, branch names, PR/MR and issue templates, lint config, ADR template, glossary) to a project, new or existing, TypeScript (React through init-react), Java (Gradle) or Python, with lefthook or husky. CI is not set up: the CI team owns pipelines. Also re-runs to bring a project up to date with the baseline. Use when the user wants to adopt, apply, install or update the baseline, or set up a repo's conventions or hooks from it.
---

# Adopt the baseline

The **baseline repo**, in this order:

1. The repo holding this skill: resolve this skill's folder with `realpath` (it may be a symlink
   in `~/.claude/skills/`) and go up three levels, if that is a git checkout.
2. `$BASELINE_REPO`: a local path, or a clone URL to clone into the scratchpad.
3. Otherwise ask the user for the clone URL. Never assume a host: the baseline is served from
   more than one (on-prem and online).

Run `git -C <baseline> pull --ff-only` first. On a re-run, the plan in step 2 lists only what differs from the baseline.

The **target** is the repo the user names, or the current repo.

Never overwrite a target file without showing the diff and getting a yes. Merge; don't replace.

## 1. Survey the target

Report a table of what you find, with the file that told you:

| Question | Look at |
|---|---|
| Areas: folders with their own stack | `package.json` with `react` and `typescript` → `react` (init-react; not Next.js, which init-react refuses: use `ts`); with `typescript` only → `ts`; `build.gradle(.kts)` + `gradlew` → `java-gradle`; `pyproject.toml` → `python`. A single-project repo has one Area at `.` |
| Each Area's existing commands | `package.json` `scripts`; Gradle plugins (spotless, checkstyle); `[tool.ruff]`, `[tool.mypy]`, `[tool.poe.tasks]` in `pyproject.toml` |
| Hook runner | `.husky/` → husky; `lefthook.yml` → lefthook; `.pre-commit-config.yaml` → pre-commit; `git config core.hooksPath` set to another folder (e.g. `.githooks/`) → shell hooks; executable files in `.git/hooks/` other than `*.sample` → local hooks; none |
| Platform, for the templates' paths | `.github/` → GitHub; `.gitlab-ci.yml` or `.gitlab/` → GitLab; neither: ask. Never decide from the remote's host name: on-prem hosts have any name |
| Existing conventions | `CLAUDE.md`, `.claude/`, `commitlint.config.*`, `.github/pull_request_template.md`, `CONTEXT.md`, `docs/adr/`, `.gitattributes` |
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
conflicts (an existing commit convention, a PR template with other sections). Wait for a yes.
Never add or change CI files (`.github/workflows/`, `.gitlab-ci.yml`): the CI team owns them.

## 3. Apply

Paths are from the baseline repo root. "Merge" means keep everything the target has, add what's
missing, and ask where they disagree.

| Piece | Baseline files | How |
|---|---|---|
| Instructions | `CLAUDE.md` | Merge sections into the target's `CLAUDE.md`. Fill the "Single source of truth" table with the target's real files; delete rows that don't apply; no `<...>` left |
| Stack rules | `.claude/rules/{typescript,java,python}.md` | Copy the ones for the target's stacks |
| Writing rules | `.claude/rules/{docs,writing-style}.md` | Copy |
| Claude hooks | `.claude/settings.json`, `.claude/hooks/*.mjs` | Merge `hooks` into the target's `.claude/settings.json`; copy the scripts |
| Commits | `commitlint.config.js`, root `package.json` | Copy the config; merge the devDependencies, `scripts.commit`, `config.commitizen`, `engines` into the root `package.json` (create one for Java/Python targets, `"private": true`) |
| Each Area's stack | `presets/<stack>/` | Every file, as `presets/<stack>/README.md` says: Claude hook commands, git hook commands (lefthook, or the husky/shell-hook lines with `presets/husky/README.md`), lint config. Skip what the target already runs and say which. If the target already breaks the new lint rules, show the count and ask: fix now, or open an issue to fix them first |
| React Areas | `presets/react/` | As `presets/react/README.md` says: run init-react (`--skip=commitlint`; also `lefthook` when the target keeps husky or its own hooks), dry run first, then merge its `checks.json`. Not `presets/ts` |
| Shared git hooks | `lefthook.yml`, or `presets/husky/` | lefthook or none: merge `lefthook.yml`. husky or shell hooks: append as `presets/husky/README.md` says |
| Branch names | `scripts/checks/branch-name.mjs` | Copy |
| JSON check | `scripts/checks/json-valid.mjs` | Copy |
| PR/MR and issue templates | GitHub: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/`. GitLab: `.gitlab/merge_request_templates/Default.md`, `.gitlab/issue_templates/` | The target's platform only (both if it is mirrored to both, then also `scripts/checks/templates-match.mjs` and its `lefthook.yml` entry). Merge with templates the target has; replace the `<kind of change>` Definition of Done line with the target's own checks |
| Check layers table | `README.md` "Checks run in two layers" | Add the table to the target's `README.md` (the target's `CLAUDE.md` points to it), with its real files |
| Line endings | `.gitattributes`, `presets/java-gradle/README.md` | Merge |
| Glossary | `CONTEXT.md` | Only if the target has none; fill the project name and description from its README |
| Decision records | `docs/adr/template.md` | Copy if the target has no ADR format of its own. Copy no records: a project's records are its own decisions |

## 4. Verify

Run each and report pass or fail with the output; fix what fails before reporting done:

1. `npm install` at the root (installs the hooks via `prepare`, unless husky).
2. `node scripts/checks/branch-name.mjs <a valid name>` and an invalid one: passes, then fails.
3. `printf 'feat: x\n' | npx commitlint` passes; `printf 'bad\n' | npx commitlint` fails.
4. Every `onEdit` and `onStop` command in `checks.json`, run by hand in its Area.
5. The hooks fire: stage a file with invalid JSON and run `git commit -m 'bad'`; it must be
   rejected. A passing `lefthook run` is not enough: `lefthook install` exits 0 without
   installing when `core.hooksPath` points elsewhere, and `prepare` hides its errors
   (`|| true`). Check `git config core.hooksPath` is empty (lefthook) or the hooks folder.

## 5. Report

A table: piece, what changed (file), verified how. Then a list of what's left for the user:

1. For the CI team: the commands their pipeline should run per Area (each preset's `README.md`
   lists them; React Areas: `lint`, `format:check`, `typecheck`), plus commitlint on the PR/MR
   title and `node scripts/checks/branch-name.mjs` on the branch, since git hooks can be skipped.
2. Squash merging with the title as the commit: the default on GitHub; on GitLab, set "Squash
   commits when merging" to required and the squash commit template to `%{title}`.
3. On-prem: package registries in npm, Gradle and uv configuration (never committed).
4. Node for Java and Python developers (baseline `README.md`, "Node runs the shared checks").
