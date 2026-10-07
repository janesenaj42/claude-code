# Preset: TypeScript (npm), not React

React projects use `presets/react/` instead.

| File | Merges into | Replace |
|---|---|---|
| `checks.json` | `.claude/hooks/checks.json`, `areas` | `root` |
| `lefthook.yml` | `lefthook.yml`, `pre-commit.commands` | add `root: <folder>/` when the area isn't the repo root |
| `husky-pre-commit` | `.husky/pre-commit`, appended | the folder after `cd` |
| `eslint.config.fragment.js` | `eslint.config.js`: spread into the exported array | — |

The project's `package.json` must define the scripts these files call: `format:check`
(`prettier --check .`), `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test`. Remove a
`checks.json` command whose script the project doesn't have (e.g. `test` in a new Vite app).

`eslint.config.fragment.js` needs `typescript-eslint` in the project's ESLint config.
