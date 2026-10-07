# CLAUDE.md

<!-- Baseline: copied into each project by /adopt-baseline. Replace every <...> placeholder. -->

## Single source of truth

Every fact lives in exactly one place. Docs **point** to that place; they never copy it. When
you add or change something, edit its source and link to it; when you find a copy, replace it
with a link.

| Fact | Lives in |
|---|---|
| Git hooks and the commands they run | `lefthook.yml` (or `.husky/`) |
| Commands Claude's hooks run after an edit and before a turn ends | `.claude/hooks/checks.json` |
| CI checks | `scripts/checks/`; run by `.github/workflows/ci.yml` (GitHub) or `.gitlab-ci.yml` (GitLab) |
| Commit types | `commitlint.config.js` |
| Tool versions | `package.json`, <build file: `build.gradle.kts`, `pyproject.toml`> |
| <fact> | <file> |
| Vocabulary | `CONTEXT.md` |
| Why things are the way they are | `docs/adr/` |

A README earns a line only for what these files cannot say: how to get started, what a
convention is for, the gotcha no config confesses.

A rule people must remember to follow belongs in CI, not in a doc. Check layers: `README.md`,
"Checks".

## Language

Use the terms in `CONTEXT.md`. A new term gets defined there first.

## Commits and branches

Conventional Commits, checked by commitlint (git hook, CI). Branches are
`<type>/<issue number>/<short-description>` (`scripts/checks/branch-name.mjs`). PRs are
squash-merged, so the PR (GitHub) or MR (GitLab) title is the commit on `main`.

## Code review standards

After completing any implementation, review for the following. Fix violations proactively;
don't wait to be asked. Run /simplify before presenting code to the user.

Rules marked *(lint)* are also enforced by the stack's linter (`presets/` in the baseline repo);
the rest are for review. Stack rules: `.claude/rules/<stack>.md`, loaded for matching files.

### Complexity and size
- Functions longer than 30 lines are likely doing too much: split by responsibility *(lint)*
- One function, one concern; if you need "and" to describe it, split it

### Duplication
- Logic duplicated more than twice must be extracted to a utility or helper
- Shared logic belongs in a dedicated module, not copy-pasted across files

### Types
- No `any` / `Any` anywhere: use real types or generics *(lint)*
- If a type feels hard to express, that's a signal the data shape needs rethinking

### Error handling
- All async operations must have error handling: no fire-and-forget
- Prefer `.catch().finally()` chains over `await` unless nesting exceeds 2 levels
- Never swallow errors silently; log or propagate with context

### Constants
- No magic numbers or magic strings: extract to named constants *(lint, numbers only)*
- Timeouts, retry counts, limits, port numbers, and status codes must all be named
- Group related constants together (e.g. `DEFAULT_RETRY_COUNT`, `DEFAULT_RETRY_DELAY_MS`)
