---
name: h-mode-audit
description: >
  Read-only efficiency audit of code and prose in a diff, file, or repository.
  Identify unnecessary complexity using callers, requirements, and contracts.
  Use for /h-mode-audit, "h-mode audit", "audit this for bloat", or
  "what can I cut".
---

# H-Mode Audit

Audit both code complexity and unnecessary prose. Remain read-only: do not edit,
write mode state, publish comments, or apply fixes.

## Scope

- No argument: inspect staged and unstaged changes. If empty, state that you are
  inspecting the latest commit; for a root commit, inspect its added files.
  If no commit exists, report that there is no diff to audit.
- A path: inspect that file or directory.
- An explicit whole-repository request: inspect the tree, excluding vendored,
  generated, dependency, build-output, and lock files unless relevant or requested.

State the inspected scope and material exclusions. Do not imply unread files
were reviewed.

## Evidence

For code, investigate duplicated capabilities, unused options, speculative
scaffolding, and unnecessary wrappers or dependencies. These are candidates,
not automatic findings. A single implementation may serve a public contract,
test seam, domain boundary, or platform requirement.

Check affected callers, tests, configuration, and requirements before proposing
removal. Establish what behavior the replacement preserves and what risk it
introduces. A built-in function or shorter implementation is suitable only if
its semantics match. For example, cache simplification must retain any required
expiry, invalidation, eviction, and concurrency behavior.

For prose, identify obsolete instructions, duplicated explanations, and comments
that restate the code. Preserve rationale, domain definitions, operational steps,
and uncertainty that helps the reader. Judge headings and tables by usefulness,
not by their token count alone.

Do not recommend removing security, accessibility, trust-boundary validation,
data-loss protections, public contracts, or explicit requirements. An annotated
shortcut is context to inspect, not a blanket exemption.

## Findings

Rank actionable findings by expected benefit and change risk. For each, give:

- Path and line, plus code or prose classification.
- Evidence: the relevant caller, contract, test, or duplicated passage.
- Suggested simplification, expected benefit, and behavior that must remain.
- Confidence and any specific unresolved assumption.

Keep findings concise; use more than one line when the rationale needs it.
Separate unverified candidates from confirmed findings and say what would
resolve the uncertainty. Do not count candidates as proven removable work.

For example: two CLI handlers build the same usage text with identical flags.
If both callers and help snapshots confirm equivalence, share that formatting
while preserving command-specific names and exit behavior.

End with the finding count, material review limits, and the most useful next
step if one is supported. Estimate line reductions only when grounded in the
proposed change; do not invent token savings. If nothing is supported, report
that no actionable findings were found in the inspected scope.
