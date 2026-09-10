# Contributing

Small focused PRs beat big rewrites. H-Mode is a small package — keep it that way.

## What lives where

| File | Purpose |
|------|---------|
| `skills/h-mode/SKILL.md` | **Behaviour source.** All rules and examples. The activate hook reads it at runtime. |
| `scripts/build-rules.js` | Generates editor rules, AGENTS/GEMINI context, activation rules, runtime instruction JSON, and all four Gemini commands from the skills. |
| `hooks/h-mode-activate.js` | SessionStart: reads SKILL.md, writes flag, emits rules |
| `hooks/h-mode-mode-tracker.js` | UserPromptSubmit: `/h-mode` commands, NL detection, per-turn reinforcement |
| `hooks/h-mode-compress-output.js` | PostToolUse: input-side compression (scrub / elide / dedup tiers, savings ledger) |
| `hooks/h-mode-config.js` | Shared flag read/write, mode resolution. Security-sensitive — test changes carefully. |
| `hooks/h-mode-statusline.sh` / `.ps1` | Statusline badge: mode + measured input-side savings |
| `bin/install.js` + `bin/lib/settings.js` | Multi-agent installer, JSONC-safe settings merge |

## What to edit

**Changing behaviour** → edit the relevant `skills/*/SKILL.md`, then run
`npm run build:rules`. The marked core/reminder sections in the main skill feed
shared rules and runtime text. Each Gemini command embeds its corresponding
skill body. CI checks all 13 generated files against those sources; do not edit
generated copies directly. Keep the section markers intact.

**Input-side compression** → `hooks/h-mode-compress-output.js`. Correctness invariants that must survive any change: allowlist only (never `Read`/`Edit`), error-line salvage on any elision, dedup only within one session, every tier kill-switchable, hook never throws.

**Natural language triggers** → regex patterns in `hooks/h-mode-mode-tracker.js`.

**Security-sensitive paths** → `hooks/h-mode-config.js` (`safeWriteFlag`, `readFlag`). Symlink-safe, `O_NOFOLLOW`, size-capped. Don't simplify them.

## Tests

```bash
npm test        # node --test tests/*.js tests/*.test.cjs
```

Add focused tests for changed behavior. Activation lifecycle regressions belong
in `tests/test_activation_lifecycle.js`; command parsing is in
`tests/test_tracker.js`. Generator tests verify edits propagate without
enforcing a particular writing style. Compressor tests remain in
`tests/test_compress.js`.

## Benchmarks

Numbers in README/docs come from committed raw data — nothing lands without receipts:

```bash
bash benchmarks/run-live.sh [model] [fresh-raw-dir]   # live 4-arm run
RAW_DIR=<dir> node benchmarks/aggregate.js            # tables
node benchmarks/replay-compress.js [mode]             # input-axis replay
```

## PR checklist

- [ ] Relevant SKILL.md updated and `npm run build:rules` run
- [ ] Hook changes don't break the flag-file security model or the compressor invariants
- [ ] New measurable behavior gets a benchmark task or replay receipt
- [ ] `npm test` passes; `npm run check:rules` and `npm run check:chart` clean

## Reporting bugs

Open an issue. Include: what you typed, what h-mode did, what you expected.
