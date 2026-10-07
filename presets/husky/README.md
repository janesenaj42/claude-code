# Preset: husky and shell hooks

For a project that already runs its git hooks with husky (`.husky/`), or from a versioned folder
of shell scripts set with `git config core.hooksPath` (e.g. `.githooks/`). The files here are
plain `sh`, so they work in both. Append each to the hook of the same name in that folder, after
its existing lines; create the hook if it doesn't exist (shell hooks: `#!/bin/sh` first line,
executable). Don't add `lefthook.yml` or `lefthook install`: husky sets `core.hooksPath=.husky`, and
`lefthook install` writes its own hooks, so whichever runs last disables the other.

The root `package.json` keeps its `husky` dependency and `prepare` script and drops `lefthook`.
Each stack's pre-commit lines are in `presets/<stack>/husky-pre-commit`.
