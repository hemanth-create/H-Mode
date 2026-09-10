# Contributing

Small focused PRs beat big rewrites. H-Mode is a small package — keep it that way.

## What lives where

| File | Purpose |
|------|---------|
| `skills/h-mode/SKILL.md` | **Behaviour source.** All rules and examples. The activate hook reads it at runtime. |
| `scripts/build-rules.js` | Condensed mirror of the skill for the 7 non-Claude agents. **Editing SKILL.md alone does not propagate here** — update the `BODY` too, then regenerate. |
| `hooks/h-mode-activate.js` | SessionStart: reads SKILL.md, writes flag, emits rules |
| `hooks/h-mode-mode-tracker.js` | UserPromptSubmit: `/h-mode` commands, NL detection, per-turn reinforcement |
| `hooks/h-mode-compress-output.js` | PostToolUse: input-side compression (scrub / elide / dedup tiers, savings ledger) |
| `hooks/h-mode-config.js` | Shared flag read/write, mode resolution. Security-sensitive — test changes carefully. |
| `hooks/h-mode-statusline.sh` / `.ps1` | Statusline badge: mode + measured input-side savings |
| `bin/install.js` + `bin/lib/settings.js` | Multi-agent installer, JSONC-safe settings merge |

## What to edit

**Changing behaviour** → `skills/h-mode/SKILL.md`, **and** the condensed `BODY` in `scripts/build-rules.js`, then `npm run build:rules`. CI checks the copies are in sync with the generator (not with SKILL.md — the mirror is manual, by design).

**Input-side compression** → `hooks/h-mode-compress-output.js`. Correctness invariants that must survive any change: allowlist only (never `Read`/`Edit`), error-line salvage on any elision, dedup only within one session, every tier kill-switchable, hook never throws.

**Natural language triggers** → regex patterns in `hooks/h-mode-mode-tracker.js`.

**Security-sensitive paths** → `hooks/h-mode-config.js` (`safeWriteFlag`, `readFlag`). Symlink-safe, `O_NOFOLLOW`, size-capped. Don't simplify them.

## Tests

```bash
npm test        # node --test tests/*.js
```

Add a test for any hook logic change. Compressor changes go in `tests/test_compress.js`.

## Benchmarks

Numbers in README/docs come from committed raw data — nothing lands without receipts:

```bash
bash benchmarks/run-live.sh [model] [fresh-raw-dir]   # live 4-arm run
RAW_DIR=<dir> node benchmarks/aggregate.js            # tables
node benchmarks/replay-compress.js [mode]             # input-axis replay
```

## PR checklist

- [ ] SKILL.md and the `build-rules.js` BODY both updated (if behavior changed) + `npm run build:rules`
- [ ] Hook changes don't break the flag-file security model or the compressor invariants
- [ ] New measurable behavior gets a benchmark task or replay receipt
- [ ] `npm test` passes; `npm run check:rules` and `npm run check:chart` clean

## Reporting bugs

Open an issue. Include: what you typed, what h-mode did, what you expected.
