# Preset: Java (Gradle)

| File | Merges into | Replace |
|---|---|---|
| `checks.json` | `.claude/hooks/checks.json`, `areas` | `root` |
| `lefthook.yml` | `lefthook.yml`, `pre-commit.commands` | add `root: <folder>/` when the area isn't the repo root |
| `husky-pre-commit` | `.husky/pre-commit`, appended | the folder after `cd` |
| `ci-job.yml` | `.github/workflows/ci.yml`, `jobs` | `working-directory`, `java-version` |
| `build.gradle.fragment.kts` | `build.gradle.kts` | — |
| `config/checkstyle/checkstyle.xml` | same path in the project | — |
| `.gitattributes` lines below | `.gitattributes` | — |

```gitattributes
# Spotless's google-java-format writes LF; on a CRLF checkout (core.autocrlf on Windows) every
# Java file fails spotlessCheck on line endings alone.
*.java text eol=lf
```

`./gradlew` starts a Gradle daemon, which is slow the first time. The pre-commit hook runs only
`spotlessCheck`; tests run in the Claude Stop hook and in CI (`check`), not on every commit.
After an edit, Claude's hook formats only the edited file (`-PspotlessIdeHook`).
