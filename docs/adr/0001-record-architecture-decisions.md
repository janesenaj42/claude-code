---
status: accepted
---

# Record architecture decisions in `docs/adr/`

A decision gets a record here when all three hold:

1. **Hard to reverse:** changing course later has a meaningful cost.
2. **Surprising without context:** a future reader would ask "why was it done this way?"
3. **A real trade-off:** there were genuine alternatives and one was picked for stated reasons.

Each record is `docs/adr/NNNN-<kebab-slug>.md`, numbered one above the highest existing number,
with `status:` frontmatter (`proposed`, `accepted`, `superseded by NNNN`), a title naming the
decision, the decision itself, "Considered options" and "Consequences". A record is not edited
after it is accepted; a later record supersedes it.

## Considered options

- **Decisions in PR descriptions only.** Rejected: a PR is found by searching for it, and its
  reasoning is not next to the code it explains.
- **One `DECISIONS.md` file.** Rejected: entries can't be linked or superseded one at a time.

## Consequences

- `CLAUDE.md` names `docs/adr/` as the place for "why things are the way they are".
- The PR template's Definition of Done asks for an ADR for any hard-to-reverse decision.
