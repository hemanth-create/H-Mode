# Security policy

## Reporting a vulnerability

Do not include secrets or exploitable details in a public issue. If GitHub's
private vulnerability reporting is enabled, use the repository's Security tab.
Otherwise, open a minimal issue requesting a private contact channel without
disclosing the vulnerability. No response-time SLA is promised.

Include the affected commit, file/function, reproduction steps, and impact in
the private report. H-Mode is distributed from this repository; an npm release
and a separately maintained security-release branch are not currently promised.

## Relevant boundaries

Preview the installer with `--dry-run`, review changes, and keep backups.
Hooks run with the agent user's permissions; compression is not a security
sandbox or a prompt-injection filter.

Output elision and duplicate suppression are lossy. Review the tool allowlist,
disable compression where exact output matters, and do not treat estimated
token savings as correctness evidence. Mode/statistics are local files, with
a shared mode flag for sessions using the same configuration directory.

The compressor makes no model or network calls. The session-start hook can
check this repository's GitHub releases; disable it with `H_MODE_UPDATE_CHECK=0`.
Live benchmarks use the caller's configured model account, incur cost, and
require `H_MODE_ALLOW_PAID_BENCHMARK=1`. Do not include sensitive prompts.
