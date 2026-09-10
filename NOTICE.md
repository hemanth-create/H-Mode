# Attribution

H-Mode adapts the concise-output, reuse-first implementation, targeted-context,
and plain-text log-reduction ideas and portions of the MIT-licensed software from
[Chisle by Jay Pokale](https://github.com/JayPokale/Chisle), reviewed at commit
`80cd8e1fac7bf485e4411c2a3b645edfa17cebd5`.

The source skill was rewritten for H-Mode. The log helper adapts the source's
formatting cleanup, repeated-line reduction, and head/tail/error-sampling approach;
it is a standalone, explicit tool rather than a runtime hook.

Original copyright: Copyright (c) 2026 Jay Pokale.
H-Mode modifications: Copyright (c) 2026 Hemanth.

The full MIT terms are in `LICENSE` and also ship in `skills/h-mode/LICENSE` so
that installing the skill folder alone retains the required notices.
Upstream benchmark results are not H-Mode results and are not claimed here.
