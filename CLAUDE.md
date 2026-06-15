# Code Review Standards (Universal)

After completing any implementation, review for the following.
Fix violations proactively — don't wait to be asked.

## Complexity & Size
- Functions longer than 30 lines are likely doing too much — split by responsibility
- One function, one concern; if you need "and" to describe it, split it

## Duplication
- Logic duplicated more than twice must be extracted to a utility or helper
- Shared logic belongs in a dedicated module, not copy-pasted across files

## Types
- No `any` / `Any` anywhere — use real types or generics
- If a type feels hard to express, that's a signal the data shape needs rethinking

## Error Handling
- All async operations must have error handling — no fire-and-forget
- Prefer `.catch().finally()` chains over `await` unless nesting exceeds 2 levels
- Never swallow errors silently; log or propagate with context

## Constants
- No magic numbers or magic strings — extract to named constants
- Timeouts, retry counts, limits, port numbers, and status codes must all be named
- Group related constants together (e.g. `DEFAULT_RETRY_COUNT`, `DEFAULT_RETRY_DELAY_MS`)
