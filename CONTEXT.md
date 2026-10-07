# <Project name>

<One or two sentences: what the system is and who uses it.>

## Language

<!-- One entry per term. Define it here before using it in code, docs or ADRs.

**<Term>**:
<What it is, in one or two sentences.>
_Avoid_: "<synonym people use that means something else here>"
-->

**Area**:
A folder of the repo with its own stack and checks, listed in `.claude/hooks/checks.json`. A
single-project repo has one Area: the repo root.
_Avoid_: "module", "package" (both mean something specific in most stacks)
