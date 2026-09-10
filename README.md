# H-Mode

Hemanth's coding skill for clear answers, small correct changes, and focused verification.

## What it does

- Cuts filler without hiding reasoning, uncertainty, or important caveats.
- Prefers existing code, standard libraries, native features, and installed dependencies.
- Avoids speculative abstractions and unrelated changes.
- Gathers targeted context instead of loading every file and log.
- Verifies behavior with meaningful checks and reports what actually ran.
- Includes an optional, local-only plain-text log preview helper.

The skill is [skills/h-mode/SKILL.md](skills/h-mode/SKILL.md). Its instructions are
the source of truth; helper details are loaded only when needed.

## Use it

Install or import the **entire `skills/h-mode` folder** using your agent's skill
installation mechanism. Keep its `LICENSE`, `agents`, `references`, and `scripts`
with it. Then select H-Mode or ask:

> Use H-Mode for this task. Find the cause, make the smallest correct change,
> and verify the affected behavior. Keep the explanation concise.

Hosts that support dollar-style skill invocation can use `$h-mode`.
For an agent that only accepts project instructions or steering, use the body of
`SKILL.md` as project guidance; adjust its relative helper link to the installed
location, or omit that optional helper paragraph. Keep the license alongside it.

H-Mode is task-scoped by default. Ask to keep it active if wanted, or say
`H-Mode off` / `normal mode`. Actual availability and persistence depend on the
host agent; these files do not change model settings or enforce a runtime mode.

This repository does **not** install anything into your computer or ChatGPT
account just because it exists on GitHub. No global agent files are overwritten.

## Optional log previews

With Node.js 18+ installed, run from the repository root:

```sh
node skills/h-mode/scripts/compact-output.cjs /path/to/build.log
node skills/h-mode/scripts/compact-output.cjs --elide /path/to/build.log
```

The default cleans formatting and repeated lines. `--elide` explicitly allows
dropping the middle of large logs while attempting to keep error-like lines.
The original file is unchanged. Read the [limitations and safety guidance](skills/h-mode/references/tool-output.md)
before using it for diagnosis. Formatting cleanup is not byte-for-byte lossless.

## Intentionally not included

No original-product branding in the skill or helper, marketing, benchmark claims,
background update checks, telemetry, global mode flags, statusline badges,
cross-session deduplication, or automatic multi-agent installer.

The instruction-only skill works independently of the helper. No automatic
tool-output interception or Claude Code hooks are registered. No claimed
percentage reduction in billed tokens: savings and quality depend on real tasks
and the host's billing and context behavior.

## Development

No npm dependencies or installation step are needed:

```sh
npm test
```

Tests exercise the log helper and the skill package's local links and metadata.
They do not establish model quality or validate behavior inside every agent host.

## License

MIT. Required upstream attribution is retained in [NOTICE.md](NOTICE.md) and
[LICENSE](LICENSE); operational names and instructions use H-Mode.
