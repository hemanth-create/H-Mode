# Migration validation

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
