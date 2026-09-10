---
name: h-mode-review
description: >
  Read-only review of a diff or file for avoidable code complexity. Recommend
  behavior-preserving simplifications with evidence and uncertainty.
  Use for /h-mode-review, "h-mode review", or "review this for bloat".
---

# H-Mode Review

Review the target for unnecessary complexity while preserving its intended
behavior. Do not edit files, change mode state, post comments, or apply fixes.

## Scope and evidence

With no target, inspect staged and unstaged changes. If neither exists, report
that there is no current diff. Do not silently widen to the latest commit or
the whole repository. Read affected callers, tests, and requirements, and state
material gaps in what you could inspect.

Investigate duplicated logic, unused options, speculative scaffolding, and
wrappers or dependencies without a current purpose. Do not treat one call site,
one implementation, or a shorter alternative as proof of over-engineering.
Interfaces can enforce required boundaries; helpers can encode important
lifetime, error, or platform behavior.

Before proposing a replacement, identify the behavior it preserves and the
evidence supporting equivalence. Do not replace a cache with a Map without
checking expiry, invalidation, eviction, and concurrency. Do not inline debounce
logic without checking cancellation, cleanup, and leading/trailing behavior.

Preserve public contracts, required tests, domain rationale, security,
accessibility, trust-boundary validation, data-loss handling, and everything
explicitly requested. Style preferences alone are not findings.

## Output

For each actionable finding, provide the path and line, evidence of unnecessary
complexity, a concrete simplification, and its expected impact. Include confidence
and the behavior or assumptions that still need checking. Keep it concise
without squeezing away the justification.

Example: a private helper forwards arguments unchanged to an existing utility.
After checking all callers and confirming it adds no instrumentation or public
API boundary, suggest calling the utility directly and retaining caller tests.

Separate unverified candidates from confirmed findings. If a claim depends on
unread code or an unknown contract, explain that limitation instead of asserting
the code can be removed. Finish with the count and review limits; estimate line
reductions only when supported. An empty report should say no actionable
findings were found in the inspected scope.

This is a complexity review; it does not establish general correctness,
security, or production readiness.
