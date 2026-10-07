---
status: accepted
---

# Checks are scripts any hook runner can call; lefthook is the default

Each git-hook check is a script in `scripts/checks/` (or a commitlint call) that lefthook,
husky or CI runs the same way. A project without hooks gets lefthook (`lefthook.yml`). A project
already on husky, or on a versioned shell-hook folder (`core.hooksPath`), keeps it and gets
lines appended there (`presets/husky/`).

## Considered options

- **Move every project to lefthook.** Rejected: it rewrites working hooks in projects that
  already use husky, for no gain in what is checked.
- **Keep the checks in `.lefthook/`.** Rejected: the folder name ties the scripts to one runner.

## Consequences

- A repo must not run husky and lefthook together: husky sets `core.hooksPath=.husky`, and
  `lefthook install` writes its own hooks, so the last one installed disables the other.
- `lefthook install` renames hooks it finds in `.git/hooks/` to `<hook>.old`, which then no
  longer run, and installs nothing when `core.hooksPath` points elsewhere. `/adopt-baseline`
  checks for both before installing.
- CI calls the same scripts, so every project is enforced the same way whichever runner it uses.
