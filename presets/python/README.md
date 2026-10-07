# Preset: Python (uv)

| File | Merges into | Replace |
|---|---|---|
| `checks.json` | `.claude/hooks/checks.json`, `areas` | `root` |
| `lefthook.yml` | `lefthook.yml`, `pre-commit.commands` | add `root: <folder>/` when the area isn't the repo root |
| `husky-pre-commit` | `.husky/pre-commit`, appended | the folder after `cd` |
| `ci-job.yml` | `.github/workflows/ci.yml`, `jobs` | `working-directory` |
| `pyproject.fragment.toml` | `pyproject.toml` | — |

The project needs `ruff`, `mypy` and `pytest` as dev dependencies (`uv add --dev ruff mypy pytest`)
and a committed `uv.lock`: CI runs `uv sync --locked`, which fails when the lockfile is missing
or stale.

pytest exits 5 when it collects no tests. The Stop hook accepts 5 (`okExitCodes`); CI does not,
so a project without tests fails CI rather than passing with nothing run.
