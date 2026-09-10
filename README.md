# H-Mode

Hemanth's full coding-efficiency plugin and skill suite: concise output,
reuse-first code, focused context, plus read-only audit and review workflows.

## Included

| Component | Location |
|---|---|
| Main coding mode | `skills/h-mode/` |
| Code + prose efficiency audit | `skills/h-mode-audit/` |
| Over-engineering review | `skills/h-mode-review/` |
| Command and setup help | `skills/h-mode-help/` |
| Claude Code plugin + marketplace | `.claude-plugin/` |
| Codex plugin exposing all four skills | `.codex-plugin/plugin.json` |
| Gemini extension + executable commands | `gemini-extension.json`, `commands/` |
| Session activation, prompt tracking, output compression | `hooks/` |
| Bash and PowerShell statuslines | `hooks/h-mode-statusline.sh`, `.ps1` |
| Cross-platform installer and settings merge | `bin/`, `install.sh`, `install.ps1` |
| Cursor, Windsurf, Cline, Kiro, Copilot rules | Per-agent directories |
| Benchmarks, replay, charts, sample builders | `benchmarks/`, `scripts/` |
| Tests, CI, release tooling, website source | `tests/`, `.github/workflows/`, `site/` |

This replaces the earlier reduced H-Mode adaptation with the full upstream
feature set, rebranded and with documented integration fixes. It is not a
byte-for-byte copy. See [the parity notes](docs/upstream-parity.md).

## Install

Preview the installer before allowing it to modify agent configuration:

```sh
npx github:hemanth-create/H-Mode --dry-run
npx github:hemanth-create/H-Mode --only claude
```

Or use Claude Code's marketplace:

```sh
claude plugin marketplace add hemanth-create/H-Mode
claude plugin install h-mode@h-mode
```

For Codex's portable skill installation:

```sh
npx github:hemanth-create/H-Mode --only codex
```

This installs all four skill folders and the always-on rules, respecting
`CODEX_HOME` when set. The repository also supplies the native Codex plugin
manifest for hosts that import plugin repositories. No Claude hooks are
advertised as Codex runtime hooks.

The npm name `h-mode` is **not** claimed as published. The commands above install
from this GitHub repository. See [INSTALL.md](INSTALL.md) for local-clone setup,
Windows statuslines, editor integrations, configuration, and uninstall behavior.

## Commands

| Skill | Purpose |
|---|---|
| `h-mode` | Concise coding and reuse-first implementation |
| `h-mode-audit [path]` | Read-only audit of code and prose for avoidable complexity |
| `h-mode-review [path]` | Read-only review of a diff or file for over-engineering |
| `h-mode-help` | Usage and platform differences |

Use `$h-mode-audit` / `$h-mode-review` in Codex. Claude Code may show
plugin-qualified slash names such as `/h-mode:h-mode-audit`; standalone skill
installs and Gemini use names such as `/h-mode-audit`. Use the host's command
picker for the exact displayed name. Audit and review do not apply fixes or
publish comments. `stop h-mode`, `/h-mode off`, or `normal mode` turns the main
mode off in Claude Code; plugin-qualified `/h-mode:h-mode off` is also recognized.

## Hooks and limits

Claude Code integration includes `SessionStart`, `UserPromptSubmit`, and
`PostToolUse` hooks. It retains the upstream formatting cleanup, head/tail
elision, bounded error sampling, and same-session duplicate detection.

The compressor does not edit source files. Its elision is lossy and can remove
useful diagnostic details. Exact `Read` / `Edit` / `Write` tools are excluded by
default. MCP tool names alone do not imply read-only behavior; narrow the
allowlist for your own environment. Replacement support depends on the host and
tool-output schema: unit tests are not proof of end-to-end token reduction.

Mode and statistics use files inside the Claude config directory. The mode flag
is shared by sessions using that directory. The inherited dedup logic assumes
earlier output is still available; disable it after compaction when that is not
true. Statistics are character counts, with tokens estimated as characters / 4.

```sh
# Set these through your shell or environment settings as appropriate.
H_MODE_DEFAULT_MODE=off
H_MODE_COMPRESS=0
H_MODE_COMPRESS_SCRUB=0
H_MODE_COMPRESS_DEDUP=0
H_MODE_UPDATE_CHECK=0
```

All original compression tuning options remain under the `H_MODE_` prefix.
The session-start update notice checks this repository's GitHub releases, cached
for three days; it sends no prompts or source code. The compressor itself makes
no network or model calls. [Security and limitations](SECURITY.md).

## Verification and benchmarks

```sh
npm test
node scripts/build-rules.js --check
node scripts/build-chart.js --check
node scripts/build-samples.js --check
```

Historical raw results are retained unchanged under `benchmarks/results/` and
identified as **upstream results, not H-Mode measurements**. The historical
`rdxmin` data key is retained for reproducibility. The website's benchmark
components and generated charts use upstream labels. Do not interpret these as
fresh H-Mode quality or cost guarantees.

The replay utility reads local transcripts without model calls. Live benchmarks
are separate, paid operations that require explicit opt-in; they were not run
as part of the repository migration. Website source is included, not deployed.

## License

MIT. Runtime names, commands, configuration, and install links use H-Mode.
Required attribution and unchanged historical evidence retain their provenance
in [NOTICE.md](NOTICE.md), [LICENSE](LICENSE), and the historical documents.
