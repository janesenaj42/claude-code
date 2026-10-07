---
status: accepted
---

# One set of check scripts for GitHub and GitLab, with no host in any file

Projects using the baseline are hosted on GitHub and on GitLab, online and on-prem, at
different URLs. Every check is a script in `scripts/checks/` that takes its input from
arguments or environment variables (`PR_BODY`, `BRANCH`, ...). Each platform has a thin CI file
that only passes its own values in: `.github/workflows/ci.yml` and `.gitlab-ci.yml`. Each preset
has a job for each (`presets/<stack>/github-job.yml`, `gitlab-job.yml`).

No file names a host a project must use. What differs between installations comes from the
platform's or the tool's own configuration:

| Varies | Set by |
|---|---|
| Where the baseline is cloned from | The user (`README.md`), `$BASELINE_REPO` for `/adopt-baseline` |
| GitHub runner | `CI_RUNS_ON` repository or organization variable |
| GitLab images | `NODE_IMAGE`, `JAVA_IMAGE`, `UV_IMAGE` CI/CD variables, overriding the defaults in the YAML |
| Package registries | npm, Gradle and uv configuration on the machine or runner, never in the repo |

## Considered options

- **A separate baseline per platform.** Rejected: every check written twice, which drift apart.
- **Logic in the CI files** (inline shell, as the first GitHub-only version had for JSON).
  Rejected: each platform's copy would need fixing separately, and it can't run locally.

## Consequences

- GitHub Actions `uses:` can't come from a variable. On GitHub Enterprise Server, the pinned
  actions must be reachable: GitHub Connect, or synced with `actions-sync`.
- GitLab doesn't start a pipeline when only a merge request's description changes; the
  description check re-runs with the next push, or by re-running the job.
- GitLab cuts `CI_MERGE_REQUEST_DESCRIPTION` at 2700 characters; `pr-description.mjs` then
  doesn't report sections it can't see.
- The baseline repo keeps one request template, `.github/pull_request_template.md`;
  `/adopt-baseline` copies it to `.gitlab/merge_request_templates/Default.md` for GitLab projects.
