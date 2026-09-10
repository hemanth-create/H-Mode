# Benchmarks

## 1. Live 4-arm head-to-head

`run-live.sh` drives the authenticated `claude` CLI across four arms — vanilla
(no tool), caveman, ponytail, rdxmin — over 6 tasks (3 coding, 3 non-coding).
Each arm appends a different system prompt. The runner uses the caller's normally
configured authentication and does not copy credentials or change HOME/config.
Run it in an appropriately isolated benchmark environment: existing plugins,
hooks, and personal configuration can confound comparisons. Competitor prompts
resolve from a local clone or installed plugin cache. New runs default to
`results/h-mode-live/`; historical upstream outputs remain in `results/raw*/`.
Live runs incur model-account charges and require explicit opt-in.

```bash
H_MODE_ALLOW_PAID_BENCHMARK=1 bash benchmarks/run-live.sh [model] [raw-dir]
node benchmarks/aggregate.js                       # comparison tables (RAW_DIR= for a fresh dir)
node scripts/build-chart.js                        # regenerate assets/benchmark.svg from all raw dirs
```

Committed suites: `results/raw/` (June, Haiku), `results/raw-sonnet/` (June,
Sonnet), `results/raw-verify/` (July re-verification). Combined ledger, per-task
detail, and the correctness grading live in
[`results/2026-07-07-verify-rerun.md`](./results/2026-07-07-verify-rerun.md);
June writeups: [`2026-06-29-live-4arm.md`](./results/2026-06-29-live-4arm.md),
[`2026-06-29-reliability.md`](./results/2026-06-29-reliability.md).

The committed results measure the upstream snapshot, not this H-Mode adaptation.
The historical `rdxmin` arm key remains for reproducibility. No new live runs
were performed during this migration; do not relabel historical data as new results.

## 2. Input-axis replay (deterministic, free)

`replay-compress.js` feeds every tool_result in your local Claude Code
transcripts through the exact code the shipped compression hook runs and
reports what it would have saved. Zero LLM calls.

```bash
node benchmarks/replay-compress.js [lite|full|ultra]
```

Historical receipts from the upstream maintainer's corpus:
[`results/2026-07-07-input-axis.md`](./results/2026-07-07-input-axis.md).

## What we measure

| Metric | Layer | Why |
|--------|-------|-----|
| Billed output tokens | live | The headline cost number (includes model reasoning) |
| Visible answer size / lines | deterministic | What the user reads; YAGNI proxy |
| Correctness | graded | A short answer that's wrong is not a win |
| Input chars elided | deterministic | The compressor's measured, baselined savings |

The correctness gate matters: compression is only a benefit if the answer still
solves the task. An arm that's 90% shorter but fails the task scores zero.
