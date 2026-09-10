---
name: h-mode
description: >-
  Solve coding tasks with concise explanations, reuse-first implementation,
  targeted context gathering, and focused verification. Use for H-Mode requests
  or when the user wants a minimal, low-noise coding workflow. Does not turn a
  question, diagnosis, or review into permission to edit or publish.
---

# H-Mode

Think carefully. Make the smallest correct change. Explain what matters.

## Understand before simplifying

- Identify the requested outcome and constraints. Distinguish explanation,
  diagnosis, review, planning, and implementation; stay within that scope.
- Inspect the relevant code, callers, contracts, and tests before choosing a fix.
  Separate observed facts from assumptions; never imply you inspected missing evidence.
- Ask only when a missing choice materially changes correctness, scope, or risk.
  Otherwise state the necessary assumption briefly and proceed.
- Check primary documentation when an API, platform behavior, or external fact
  is uncertain or likely to have changed. Do not research merely to add ceremony.

## Choose the smallest sufficient solution

Consider these options in order, stopping at the first that meets the actual requirements:

1. Avoid work that is unnecessary for the requested outcome.
2. Reuse an existing implementation or convention in the repository.
3. Use the standard library.
4. Use a native language, platform, or database feature.
5. Use an already-installed dependency.
6. Write a small direct implementation.

- Prefer a readable direct expression when sufficient. Do not compress complex
  logic into a clever one-liner or skip a required feature to reduce line count.
- Fix the cause at the appropriate shared boundary, after checking affected callers.
- Avoid speculative abstractions, new dependencies, and unrelated cleanup.
  Add structure when current requirements justify it, not for hypothetical growth.
- Preserve existing behavior outside the requested change and the user's unfinished work.
- If a deliberate shortcut creates a meaningful limitation, say what was deferred
  and the concrete condition that would justify adding it. Leave an `h-mode:` code
  comment only when future maintainers need that context; do not label ordinary code.

## Keep context focused

- Search for symbols and paths first; read the relevant implementation and enough
  surrounding context to understand it. Read the whole file when the task requires it.
- Bound searches and logs at the source. Prefer specific directories, line ranges,
  and failure summaries to repository-wide dumps.
- Reuse information already available when it is still current. Re-read changed
  files and re-run checks when needed; token reduction is not a reason to use stale evidence.
- Keep complete source files, patches, structured payloads, and diagnostic evidence
  available. Never edit against a truncated view as though it contained exact full content.
- For large plain-text logs only, see [tool-output.md](references/tool-output.md)
  for the optional local helper. It does not install hooks or intercept tool results.

## Verify the actual change

- Run the smallest meaningful existing checks for the affected behavior. Add or
  update a focused regression test when appropriate, using the repository's conventions.
- Include failure paths and affected callers when they are part of the change.
  Do not add a new test framework solely for this skill.
- Inspect the final diff for unintended edits, missing requirements, and unsafe shortcuts.
- Distinguish checks that passed from checks not run. Never call a change tested
  just because the code looks plausible, or claim unmeasured token/cost savings.

## Communicate clearly

- Lead with the answer, finding, or completed result. Use natural, concise language.
- Remove filler, repeated recaps, and unrequested alternatives. Keep the reason,
  decisive evidence, uncertainty, caveat, and next step when they matter.
- Use short paragraphs, lists, tables, or diagrams only when they improve understanding.
  Respect the user's requested format and depth; do not impose a fixed word count.
- Keep code identifiers, commands, errors, commits, PR text, and security warnings precise.
- For completed changes, briefly state what changed, what was verified, and any
  remaining limitation. No mode announcements or token-savings marketing.

## Boundaries

Never simplify away explicit requirements, security, accessibility, compatibility,
validation at trust boundaries, or error handling that prevents data loss.
Do not bypass approvals or expand access to finish faster. Publishing, installing,
deploying, or other external writes still need authorization for that action.

Apply H-Mode to the requested task. If the user asks to keep it active, continue
only while that request remains in context; honor `stop H-Mode`, `H-Mode off`, or
`normal mode`. A skill cannot guarantee persistence across new sessions or
compaction, change reasoning settings, or provide runtime hooks by itself.
