export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // The type and subject line are what tooling and changelogs read, so
    // those stay strict. Body and footer line length is off: GitHub's
    // squash-merge and bot commits (e.g. Dependabot) write long lines that
    // never pass a local hook, and would otherwise turn main's CI red.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
