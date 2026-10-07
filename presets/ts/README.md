# Preset: TypeScript (npm)

| File | Merges into | Replace |
|---|---|---|
| `checks.json` | `.claude/hooks/checks.json`, `areas` | `root` |
| `lefthook.yml` | `lefthook.yml`, `pre-commit.commands` | add `root: <folder>/` when the area isn't the repo root |
| `husky-pre-commit` | `.husky/pre-commit`, appended | the folder after `cd` |
| `ci-job.yml` | `.github/workflows/ci.yml`, `jobs` | `working-directory`, `cache-dependency-path` |
| `eslint.config.fragment.js` | `eslint.config.js`: spread into the exported array | — |

The project's `package.json` must define the scripts these files call: `format:check`
(`prettier --check .`), `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test`, `build`. CI
runs them without `--if-present`, so a missing script fails instead of passing with nothing run.

`eslint.config.fragment.js` needs `typescript-eslint` in the project's ESLint config.
