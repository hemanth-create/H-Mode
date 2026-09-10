# Optional log compaction

Use `scripts/compact-output.cjs` only for disposable plain-text logs whose original
content remains available. Node.js 18 or later is required for this helper; the
instruction-only skill has no runtime dependency.

From the repository root:

```sh
node skills/h-mode/scripts/compact-output.cjs /path/to/build.log
node skills/h-mode/scripts/compact-output.cjs --elide /path/to/build.log
```

Pass `-` in place of the path to read stdin. The helper writes only to stdout;
it never modifies a file, contacts a service, records history, or changes agent settings.
Do not redirect its output onto the input file. When piping a command's output,
capture the full log separately and preserve the original command's exit status.
The helper's successful exit does not mean the original build or test passed.

## Behavior

- Outputs of 1,024 characters or fewer pass through unchanged.
- The default removes ANSI control sequences and trailing spaces, reduces excess
  blank lines, and represents four or more identical consecutive lines with a count.
- `--elide` additionally permits discarding the middle when the cleaned output is
  over 8,000 characters. It prefers the first 60 and last 40 lines; very long or
  few-line outputs fall back to a character-based head/tail preview.
- Both preview paths attempt to retain up to 12 error-like lines from the omitted
  section. Salvaged lines longer than 300 characters are explicitly marked as truncated.
- A preview always labels omitted content. If a transformation would not reduce
  length, the input for that transformation is kept.

The 8,000-character value is an elision threshold, not a hard output limit.
Shortening is **not lossless**: even whitespace, formatting, and repeated lines can
matter. An error-keyword match is a heuristic, not proof that every important line
survived. Expand the original log before diagnosing an unexplained failure.

Never use this helper on source files, exact-match edits, patches, JSON, CSV, or
other structured evidence. It is not a Claude Code, Codex, or Kiro hook and does
not automatically reduce billed tokens. No duplicate-result suppression is included:
an earlier identical result may have been dropped from the agent's current context.
