---
status: accepted
---

# Checks are scripts any hook runner can call; lefthook is the default

Each git-hook check is a script in `scripts/checks/` (or a commitlint call) that lefthook,
husky or CI runs the same way. A project without hooks gets lefthook (`lefthook.yml`). A project
already on husky keeps husky and gets lines appended to `.husky/` (`presets/husky/`).

## Considered options

- **Move every project to lefthook.** Rejected: it rewrites working hooks in projects that
  already use husky, for no gain in what is checked.
- **Keep the checks in `.lefthook/`.** Rejected: the folder name ties the scripts to one runner.

## Consequences

- A repo must not run husky and lefthook together: husky sets `core.hooksPath=.husky`, and
  `lefthook install` writes its own hooks, so the last one installed disables the other.
- CI calls the same scripts, so every project is enforced the same way whichever runner it uses.
