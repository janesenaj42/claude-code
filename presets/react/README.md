# Preset: React (TypeScript), through init-react

[init-react](https://github.com/janesenaj42/init-react) sets up ESLint, Prettier, lint-staged,
`typecheck` and release scripts, with the review standards' lint rules in
`@janesenaj42/eslint-config`. The baseline keeps the commit convention, so init-react runs with
`--skip=commitlint`; it writes no CI.

In the Area's folder (the one with the React app's `package.json`):

| Target's hook runner | Command |
|---|---|
| lefthook or none | `npx @janesenaj42/init-react@^1 --skip=commitlint` |
| husky or a `core.hooksPath` folder | `npx @janesenaj42/init-react@^1 --skip=commitlint,lefthook`, then append `husky-pre-commit` to the hooks folder's `pre-commit`, with the folder after `cd` |

Run it with `--dry-run` first and show the output. Add `--registry=<url>` when the target installs
`@janesenaj42/*` from an on-prem mirror; installing needs a read token for the registry in the
developer's `~/.npmrc` (init-react's README, "Once per machine").

Then:

| File | Merges into | Replace |
|---|---|---|
| `checks.json` | `.claude/hooks/checks.json`, `areas` | `root` |

init-react writes its git hooks to `lefthook-init-react.yml` and adds an `extends:` entry to the
root `lefthook.yml`; keep that entry when merging the baseline's `lefthook.yml`.
