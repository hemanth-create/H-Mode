# H-Mode changelog

## [Unreleased]

- Let explicit activation override an off default.
- Accept punctuation on off commands and polite/scoped natural mode requests,
  while preserving negation, explanation, and one-shot command guards.
- Preserve on/off choices across resume, clear, and compaction; new startup
  still uses the configured default. Hide both statusline badges while off.
- Refine all four skills to preserve scope, readability, contracts, and
  uncertainty; require evidence and impact for audit/review recommendations.
- Generate 13 instruction copies from the skills, including runtime reminders
  and complete Gemini command prompts; include runtime JSON in standalone installs.
- Add activation, statusline, installation, and instruction-propagation regressions.

## [2.0.0] — 2026-09-10

- Restore the full plugin suite from the documented upstream snapshot.
- Add audit, review, and help skills alongside the main H-Mode skill.
- Restore Claude hooks, compression, statuslines, all editor integrations,
  Gemini extension/commands, installer, benchmarks, CI, and website source.
- Expose all four skills through a valid Codex plugin manifest and installer.
- Correct Gemini commands to include executable prompts.
- Keep runtime/configuration names and install/update targets under H-Mode.
- Preserve attribution and historical benchmark evidence without claiming it
  as H-Mode measurements.
- Retain the optional manual log helper from 1.0.0.

## [1.0.0]

Initial reduced skill and manual log helper. Superseded by the complete suite.

Original project history is retained separately in `docs/upstream-changelog.md`.
