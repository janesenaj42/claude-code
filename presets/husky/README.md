# Preset: husky

For a project that already runs its git hooks with husky (`.husky/`). Append each file here to
the hook of the same name in `.husky/`, after its existing lines; create the hook if it doesn't
exist. Don't add `lefthook.yml` or `lefthook install`: husky sets `core.hooksPath=.husky`, and
`lefthook install` writes its own hooks, so whichever runs last disables the other.

The root `package.json` keeps its `husky` dependency and `prepare` script and drops `lefthook`.
Each stack's pre-commit lines are in `presets/<stack>/husky-pre-commit`.
