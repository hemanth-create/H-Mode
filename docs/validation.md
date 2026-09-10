# Migration validation

## Activation and skill refinements

The follow-up change adds lifecycle, statusline, and instruction-propagation
regressions. Local Linux/Node 24 validation: 125 tests, 124 passed, 1 skipped
because PowerShell is unavailable. The PowerShell badge check runs when that
shell is available, including CI runners that provide it.

The activation regressions were run against the previous behavior and failed
before the fix. They cover explicit activation with an off default, both state
choices through resume/clear/compact, new-startup defaults, inactive compressor
output, one-shot commands, and statusline visibility. Standalone installation
also executes the installed tracker to verify its generated runtime dependency.

The off-command regressions failed on commit 0aa7663 before the final parsing
fix. They cover punctuation on qualified/unqualified slash commands, polite
and task-scoped natural selectors from both mode states, and preservation of
state for negations, explanations, and audit/review/help requests. Lifecycle
checks confirm the reported off requests stop reminders and compression and
remain off through compaction.

The generator check covers all 13 instruction copies. Its fixture test modifies
skill sources, confirms check mode detects drift without writing, regenerates,
and verifies propagation to the runtime text and four Gemini commands. LF/CRLF
source and checkout round trips produce the same instruction payloads, while
changes inside serialized JSON/TOML prompts still fail check mode.
Skill schemas, TOML parsing, syntax, and existing generated artifacts are checked
separately. These checks do not establish real-host integration or model quality.

A separate agent used the revised audit skill on a three-file profile-service
fixture with no expected findings supplied. It identified private forwarding
wrappers, preserved the documented cache expiry/invalidation/public boundary,
and reported its evidence and lack of tests. It made no edits. This is one
bounded behavioral check, not a broad model evaluation.

## Original migration checks

Validated locally on Linux with Node 24.19.0 and Python 3.12.14.
Source snapshot and all 197 source-file mappings are recorded in
[upstream-file-map.json](upstream-file-map.json).

## Passed

- 105 tests: original hook/compressor/tracker/installer/settings coverage,
  the retained manual helper tests, and full-suite integration regressions.
- Codex plugin schema validation and all four skill-package validations.
- Four Gemini TOML commands parsed with Python tomllib; each has a prompt.
- Syntax checks for 21 JavaScript/CommonJS/ESM files; 96 JSON files parsed.
- Rule, chart, and sample-data regeneration checks.
- Bash syntax checks for the installer, statusline, and live benchmark runner.
- Staged whitespace/error check with git diff --cached --check.

Installer tests use temporary configuration directories and a mocked Claude
CLI. They cover four-skill installation, idempotency, dry-run, preservation of
unrelated instruction content and command hooks, and scoped uninstall.
The live benchmark's default refusal was tested without paid model calls.

## Not exercised

- Real Claude/Codex/Gemini installations or end-to-end hook replacement.
- Windows PowerShell execution (PowerShell was unavailable).
- Website dependency installation, build, visual checks, or deployment.
- New live model benchmarks, actual token savings, or npm publication.
- Node 18/20/22 locally; CI is configured to run that matrix.

The native manifest and skill metadata follow the creator validators; they
do not imply every host version accepts every runtime feature.
