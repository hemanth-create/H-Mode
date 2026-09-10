# Agent portability

H-Mode is primarily a Claude Code plugin, but the same instruction set ships
to every agent that supports a rules/context file. One source, many targets.

## Source of truth

`skills/h-mode/SKILL.md` defines shared behavior in its marked core/reminder
sections. `scripts/build-rules.js` generates editor rules, AGENTS/GEMINI context,
`rules/h-mode-activate.md`, and runtime instruction JSON from those sections.
Each Gemini command embeds the body of its matching skill. Do not hand-edit
the 13 generated files.

## Distribution map

| Agent | File | Format |
|-------|------|--------|
| Claude Code | `.claude-plugin/plugin.json` + `skills/` + `hooks/` | plugin |
| Codex | `.codex-plugin/plugin.json` → four `skills/` folders; installer also adds `AGENTS.md` | plugin or standalone skills |
| Gemini | `gemini-extension.json` → `GEMINI.md` + `commands/*.toml` | extension with four prompt commands |
| Cursor | `.cursor/rules/h-mode.mdc` | MDC, `alwaysApply: true` |
| Windsurf | `.windsurf/rules/h-mode.md` | `trigger: always_on` |
| Cline | `.clinerules/h-mode.md` | plain markdown |
| Kiro | `.kiro/steering/h-mode.md` | `inclusion: always` |
| GitHub Copilot | `.github/copilot-instructions.md` | plain markdown |

## Keeping copies in sync

```bash
node scripts/build-rules.js          # regenerate all copies
node scripts/build-rules.js --check  # CI gate — fails if any drifted
```

CI runs `--check` on every push and PR. Edit the relevant SKILL.md, regenerate,
and commit. The generated files are committed (not built on install) so marketplace
and `git clone` installs work without a build step.

## What does NOT port

The statusline badge, token-savings counter, and lifecycle hooks are
Claude-Code-specific. Codex and Gemini can select the four skills/commands,
but they do not receive Claude runtime behavior just by loading those instructions.
Claude plugin installs may use namespaced slash names; use the host command picker.

Claude stores explicit on/off state. Resume, clear, and compaction preserve it;
new startup uses the configured default. The state directory remains shared
across concurrent sessions, so this is not per-session isolation.
