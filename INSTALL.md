# Installation

Requires Node.js 18+ for the installer and hooks. The skill text has no runtime dependency.
The website has its own dependencies under site/; it is not installed by this tool.

## Preview and install

```sh
npx github:hemanth-create/H-Mode --dry-run
npx github:hemanth-create/H-Mode --only claude
npx github:hemanth-create/H-Mode --only codex
npx github:hemanth-create/H-Mode --only kiro
```

The default with no --only detects all supported agents. Claude and Codex installs
are user-wide; editor rules are written into the current project. Use --only to
avoid modifying agents you did not intend to configure. No registry package named
h-mode is assumed to exist.

From a local clone, use `node bin/install.js` with the same options. Shell and
PowerShell shims (`install.sh`, `install.ps1`) delegate to that installer.

| Target | Installation |
|---|---|
| Claude Code CLI | Marketplace plugin with all skills and lifecycle hooks |
| Claude without CLI / explicit config | Standalone hooks, statusline, and four skill folders |
| Codex | Four skill folders plus a fenced AGENTS.md block; honors CODEX_HOME |
| Gemini CLI | GitHub-hosted extension, context, and four commands |
| Cursor, Windsurf, Cline, Kiro, Copilot | Project-scoped generated instructions |

## Native Claude plugin

```sh
claude plugin marketplace add hemanth-create/H-Mode
claude plugin install h-mode@h-mode
```

Use the command picker; a plugin install may namespace skills as
`/h-mode:h-mode`, `/h-mode:h-mode-audit`, `/h-mode:h-mode-review`, and
`/h-mode:h-mode-help`. Standalone skill installs use unqualified skill names.
Do not also register the same hooks manually in settings.json.

## Native Codex plugin

The repository root is a plugin with `.codex-plugin/plugin.json`, exposing all
four folders under skills/. Import this repository using your Codex host's plugin
mechanism. The installer alternative above supplies standalone skills and the
always-on instruction block; these are distinct installation methods.

Claude-specific PostToolUse replacements and statuslines do not become Codex
features just because a Codex manifest is present. Select `$h-mode-help` for
available commands, `$h-mode-audit` for auditing, or `$h-mode-review` for review.

## Custom configuration directories

```sh
node bin/install.js --only claude --config-dir /path/to/claude-config --dry-run
node bin/install.js --only codex --config-dir /path/to/codex-config --dry-run
```

--config-dir requires exactly one of --only claude or --only codex. For Claude,
it deliberately selects local standalone installation without contacting a
marketplace. Existing skill folders are skipped unless --force is supplied.
Existing unrelated settings and instruction content are preserved. --force is
an explicit request to replace H-Mode's files; inspect the dry-run first.

## Statusline

Standalone Claude setup configures a statusline only if one is absent. For a
plugin install, add or integrate the appropriate command yourself:

- macOS/Linux: `bash "/absolute/path/to/H-Mode/hooks/h-mode-statusline.sh"`
- Windows: `powershell -NoProfile -File "C:\\path\\to\\H-Mode\\hooks\\h-mode-statusline.ps1"`

The Bash script renders usage/cost when supplied by Claude, plus approximate
compression savings. The PowerShell script renders the badge and approximate
savings; it does not implement the Bash rate-limit/cost display.

## Configuration and upgrades

Set H_MODE_DEFAULT_MODE=on or off. Per-user config.json contains
`{ "defaultMode": "on" }` under XDG_CONFIG_HOME/h-mode or ~/.config/h-mode;
Windows uses APPDATA/h-mode. CLAUDE_CONFIG_DIR selects the Claude state directory.

The default applies on a new startup. Explicit on/off commands override it for
the current session; resume, clear, and compaction preserve that choice. The
state file stores either on or off, and remains shared across sessions using
the same Claude config directory. Both statuslines suppress the badge when off.

Use H_MODE_UPDATE_CHECK=0 to disable the cached GitHub-release version check.
Use H_MODE_COMPRESS=0 to disable output rewriting, or H_MODE_COMPRESS_DEDUP=0
to disable duplicate suppression. Size and head/tail limits remain configurable
through H_MODE_COMPRESS_MAX_CHARS, H_MODE_COMPRESS_HEAD_LINES, and
H_MODE_COMPRESS_TAIL_LINES. H_MODE_COMPRESS_TOOLS supplies an exact allowlist.

For plugin updates, use `claude plugin update h-mode@h-mode`. For standalone
updates, rerun the installer with --force after reviewing the scope.

## Uninstall

```sh
node bin/install.js --uninstall --only claude
node bin/install.js --uninstall --only codex
```

The uninstaller removes H-Mode hook wiring/state and the Codex fenced rule block
for the selected targets. It retains copied skill folders and project rule files
to protect local edits; remove those H-Mode files manually when no longer needed.
For Gemini, use `gemini extensions uninstall h-mode`.

This repository migration does not install or uninstall anything in your agents.
