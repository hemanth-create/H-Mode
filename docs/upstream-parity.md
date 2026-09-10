# Full-suite parity

Source snapshot: `JayPokale/Chisle@80cd8e1fac7bf485e4411c2a3b645edfa17cebd5`.
This is a functional rebrand with integration corrections, not an exact byte copy.

## Restored components

All four upstream skills; Claude Code plugin and marketplace; Codex plugin;
Gemini extension and four commands; three lifecycle hooks; compressor, config,
mode tracker, and both statuslines; Node/Bash/PowerShell installers; settings
merge helper; five editor rule formats; AGENTS/GEMINI guidance; benchmark
runner, replay, aggregation, raw results, charts and samples; full original test
suite, CI/release workflows, contribution templates, and website source.

## Intentional differences

- Runtime name `h-mode`, display name H-Mode, environment prefix `H_MODE_`,
  repository `hemanth-create/H-Mode`; no upstream package/update endpoints.
- Version 2.0.0 belongs to H-Mode; source version history is kept separately.
- Codex manifest uses `skills: ./skills/` and valid UI metadata instead of the
  unsupported upstream `instructions` property. Claude hooks stay Claude-specific.
- The installer copies all four skills for Codex and standalone Claude, respects
  `CODEX_HOME`, offers explicit config-directory targeting, and never treats a
  failed plugin permission/setup step as permission to use a different install path.
- Gemini TOML commands now include `prompt` rather than only descriptive metadata.
  Format: [Google's custom command documentation](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands).
- Audit/review remain read-only; one-shot commands do not toggle persistent mode.
- Hook removal retains other commands that share the same matcher group.
  Validation also preserves opaque non-command hook types owned by the host.
- Update lookup checks H-Mode GitHub releases. Windows setup points at PowerShell.
- Audit/review findings must be justified by callers, contracts, and requirements.
- The optional 1.0 manual log helper remains separate from automatic hooks.
- npm publishing is disabled by `private: true` and an explicit workflow gate
  until the owner configures a package and publisher. No package/release was published.
- Historical raw benchmark data is unchanged. Charts/site label it as upstream.
  New live runs go to a separate directory and require paid-run opt-in.
- Original raster artwork is archived under docs/upstream-assets/; active branding
  uses H-Mode SVG and code-rendered icons rather than relabeling original images.
- Old marketing/history documents and the sponsorship template are archival;
  they are not active H-Mode marketing claims or fundraising configuration.

The complete source-to-destination inventory is `upstream-file-map.json`.
Availability of a manifest is not proof a given host version supports every
hook response shape. Verify the actual tool-output replacement in your host
before assuming input-token savings.
