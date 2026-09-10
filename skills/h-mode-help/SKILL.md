---
name: h-mode-help
description: >
  Quick-reference card for H-Mode commands. One-shot
  display, not a persistent mode. Use when the user says "h-mode help", "how do I
  use h-mode", "what h-mode commands", or invokes /h-mode-help.
---

# H-Mode — quick reference

**What it is:** maximum-efficiency dev mode. Zero-fluff prose + YAGNI-first code, always on together.

## Commands

| Command | Effect |
|---------|--------|
| `/h-mode` | Activate |
| `/h-mode-audit [path]` | Audit a diff/file/repo for both code bloat AND prose verbosity |
| `/h-mode-review` | Review the current diff for over-engineering |
| `/h-mode-help` | Show this reference |
| `stop h-mode` / `normal mode` | Deactivate |

Natural language works: "activate h-mode", "h-mode mode", "h-modify this".

## The code ladder

YAGNI → reuse → stdlib → native → installed dep → one line → minimum code.

## Statusline

`[H-MODE]` — shown while active. Configure via
`hooks/h-mode-statusline.sh` (or `.ps1` on Windows).

## Never minimal about

Input validation, error handling that prevents data loss, security,
accessibility, anything you explicitly asked for.

## Platform differences

Claude plugin commands may appear as `/h-mode:h-mode`, `/h-mode:h-mode-audit`,
`/h-mode:h-mode-review`, and `/h-mode:h-mode-help`; standalone skills can use
unqualified names. Codex selects `$h-mode`, `$h-mode-audit`, `$h-mode-review`,
or `$h-mode-help`. Gemini ships four prompt-based slash commands.

Runtime activation, compression hooks, and statuslines are Claude-specific.
Audit and review are read-only and must not activate the persistent mode.
The Bash statusline includes host-provided usage/cost; PowerShell includes the
badge and approximate savings only. Character-based savings are not billing proof.
