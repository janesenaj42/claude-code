---
name: adopt-baseline
description: Apply the project baseline (CLAUDE.md rules, Claude hooks, git hooks, Conventional Commits, branch names, PR template, CI checks, ADRs, glossary) to a project, new or existing, TypeScript, Java (Gradle) or Python, with lefthook or husky. Also re-runs to bring a project up to date with the baseline. Use when the user wants to adopt, apply, install or update the baseline, or set up a repo's conventions, hooks or CI from it.
---

# Adopt the baseline

The **baseline repo**, in this order:

1. The repo holding this skill: resolve this skill's folder with `realpath` (it may be a symlink
   in `~/.claude/skills/`) and go up three levels, if that is a git checkout.
2. `$BASELINE_REPO`: a local path, or a clone URL to clone into the scratchpad.
3. Otherwise ask the user for the clone URL. Never assume a host: the baseline is served from
   more than one (on-prem and online).

Run `git -C <baseline> pull --ff-only` first, unless the target *is* a fresh copy of the
template. On a re-run, the plan in step 2 lists only what differs from the baseline.

The **target** is the repo the user names, or the current repo.

Never overwrite a target file without showing the diff and getting a yes. Merge; don't replace.

## 1. Survey the target

Report a table of what you find, with the file that told you:

| Question | Look at |
|---|---|
| Areas: folders with their own stack | `package.json` with `typescript` → `ts`; `build.gradle(.kts)` + `gradlew` → `java-gradle`; `pyproject.toml` → `python`. A single-project repo has one Area at `.` |
| Each Area's existing commands | `package.json` `scripts`; Gradle plugins (spotless, checkstyle); `[tool.ruff]`, `[tool.mypy]`, `[tool.poe.tasks]` in `pyproject.toml` |
| Hook runner | `.husky/` → husky; `lefthook.yml` → lefthook; `.pre-commit-config.yaml` → pre-commit; `git config core.hooksPath` set to another folder (e.g. `.githooks/`) → shell hooks; executable files in `.git/hooks/` other than `*.sample` → local hooks; none |
| Platform | `.github/` → GitHub; `.gitlab-ci.yml` or `.gitlab/` → GitLab; neither: ask. Never decide from the remote's host name: on-prem hosts have any name |
| Existing CI | `.github/workflows/*.yml`, `.gitlab-ci.yml` |
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
conflicts (an existing commit convention, a PR template with other sections, CI that already
runs the same tool). Wait for a yes.

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
| Each Area's stack | `presets/<stack>/` | Every file, as `presets/<stack>/README.md` says: Claude hook commands, git hook commands (lefthook, or the husky/shell-hook lines with `presets/husky/README.md`), the CI job for the target's platform only, lint config. Skip what the target already runs and say which. If the target already breaks the new lint rules, show the count and ask: fix now, or add them as warnings and open an issue. Write no host into any file: runners and images come from the variables named in the CI files' header comments |
| Shared CI jobs | `.github/workflows/ci.yml` (GitHub) or `.gitlab-ci.yml` (GitLab), `scripts/checks/markdown-links.mjs` | Merge into the target's CI file for its platform |
| Shared git hooks | `lefthook.yml`, or `presets/husky/` | lefthook or none: merge `lefthook.yml`. husky or shell hooks: append as `presets/husky/README.md` says |
| Branch names | `scripts/checks/branch-name.mjs` | Copy |
| JSON check | `scripts/checks/json-valid.mjs` | Copy |
| PR/MR template | `.github/pull_request_template.md`, `scripts/checks/pr-description.mjs` | Merge into `.github/pull_request_template.md` (GitHub) or `.gitlab/merge_request_templates/Default.md` (GitLab); replace the `<kind of change>` Definition of Done line with the target's own checks. The script reads the template's `##` headings, so it follows whatever the template becomes |
| Check layers table | `README.md` "Checks run in three layers" | Add the table to the target's `README.md` (the target's `CLAUDE.md` points to it), with its real files |
| Line endings | `.gitattributes`, `presets/java-gradle/README.md` | Merge |
| Glossary | `CONTEXT.md` | Only if the target has none; fill the project name and description from its README |
| Decision records | `docs/adr/template.md` | Copy if the target has no ADR format of its own. Copy no records: a project's records are its own decisions |

If the target is a fresh copy of the template, also delete the baseline-only files once the
Areas are set up: `presets/`, `.claude/skills/adopt-baseline/`, the other platform's CI file
and template. Replace `README.md` with the project's own.

## 4. Verify

Run each and report pass or fail with the output; fix what fails before reporting done:

1. `npm install` at the root (installs the hooks via `prepare`, unless husky).
2. `node scripts/checks/branch-name.mjs <a valid name>` and an invalid one: passes, then fails.
3. `printf 'feat: x\n' | npx commitlint` passes; `printf 'bad\n' | npx commitlint` fails.
4. `node scripts/checks/markdown-links.mjs`, and `node scripts/checks/pr-description.mjs` with
   `PR_BODY` set to a filled-in template (passes) and to an empty string (fails).
5. Every `onEdit` and `onStop` command in `checks.json`, run by hand in its Area.
6. The hooks fire: stage a file with invalid JSON and run `git commit -m 'bad'`; it must be
   rejected. A passing `lefthook run` is not enough: `lefthook install` exits 0 without
   installing when `core.hooksPath` points elsewhere, and `prepare` hides its errors
   (`|| true`). Check `git config core.hooksPath` is empty (lefthook) or the hooks folder.
7. Each CI build job's commands, run locally in its Area.

## 5. Report

A table: piece, what changed (file), verified how. Then a list of what's left for the user:

1. Requiring the CI checks before merge: branch protection (GitHub), "Pipelines must succeed"
   (GitLab).
2. Squash merging with the title as the commit: the default on GitHub; on GitLab, set "Squash
   commits when merging" to required and the squash commit template to `%{title}`.
3. On-prem: the variables the CI file's header names (`CI_RUNS_ON`, `NODE_IMAGE`, ...), and
   package registries in npm, Gradle and uv configuration (never committed).
4. Node for Java and Python developers (baseline `README.md`, "Node runs the shared checks").
