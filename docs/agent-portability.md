# Agent portability

H-Mode is primarily a Claude Code plugin, but the same instruction set ships
to every agent that supports a rules/context file. One source, many targets.

## Source of truth

`skills/h-mode/SKILL.md` defines behavior. The short always-on rule lives in
`rules/h-mode-activate.md`. Per-agent copies are **generated** from a shared body in
`scripts/build-rules.js` — never hand-edit the generated files.

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

CI runs `--check` on every push. Edit the body in `build-rules.js`, regenerate,
commit. The generated files are committed (not built on install) so marketplace
and `git clone` installs work without a build step.

## What does NOT port

The statusline badge, token-savings counter, and lifecycle hooks are
Claude-Code-specific. Codex and Gemini can select the four skills/commands,
but they do not receive Claude runtime behavior just by loading those instructions.
Claude plugin installs may use namespaced slash names; use the host command picker.
