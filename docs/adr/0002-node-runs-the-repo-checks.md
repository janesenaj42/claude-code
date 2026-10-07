---
status: accepted
---

# Node runs the repo's own checks, whatever the project's stack

The checks every project shares (commit message, branch name, PR description, Markdown links,
JSON validity) and Claude's hooks are Node scripts, with commitlint for commit messages. A
Java or Python project gets a small root `package.json` for this tooling only. Each stack's own
build, lint and test commands stay in its own toolchain (`presets/`).

## Considered options

- **The same checks rewritten per stack** (Python for Python projects, a Gradle task for Java).
  Rejected: three copies of every check, which drift apart.
- **`pre-commit` (the Python framework) as the hook runner.** Rejected: it brings a Python
  dependency to TypeScript and Java projects instead of a Node one to Python projects, and the
  checks would still need writing in one language.

## Consequences

- Developers on every project need Node (`package.json` `engines`) to run the git hooks.
- CI's shared jobs need `setup-node` regardless of the project's language.
