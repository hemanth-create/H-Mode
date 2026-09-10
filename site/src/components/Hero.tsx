"use client";

import { useState } from "react";
import { motion } from "motion/react";

// Every install path the project actually documents. Kept in sync with the
// README's Install section — if a command changes there, it changes here.
const INSTALLS = [
  { id: "npx", label: "npx", cmd: "npx github:hemanth-create/H-Mode", note: "auto-detects all 8 agents" },
  {
    id: "plugin",
    label: "Claude Code",
    cmd: "claude plugin marketplace add hemanth-create/H-Mode\nclaude plugin install h-mode@h-mode",
    note: "marketplace plugin",
  },
  {
    id: "curl",
    label: "curl",
    cmd: "curl -fsSL https://raw.githubusercontent.com/hemanth-create/H-Mode/main/install.sh | bash",
    note: "macOS · Linux",
  },
  {
    id: "powershell",
    label: "PowerShell",
    cmd: "irm https://raw.githubusercontent.com/hemanth-create/H-Mode/main/install.ps1 | iex",
    note: "Windows",
  },
  {
    id: "dry-run",
    label: "dry run",
    cmd: "npx github:hemanth-create/H-Mode --dry-run",
    note: "prints every file it would touch, changes nothing",
  },
];

function CopyCmd() {
  const [active, setActive] = useState(INSTALLS[0].id);
  const [copied, setCopied] = useState(false);
  const current = INSTALLS.find((i) => i.id === active)!;

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Installation method">
        {INSTALLS.map((i) => (
          <button
            key={i.id}
            role="tab"
            aria-selected={i.id === active}
            onClick={() => {
              setActive(i.id);
              setCopied(false);
            }}
            className={`rounded border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              i.id === active
                ? "border-amber bg-amber-soft text-amber"
                : "border-line text-dim hover:border-amber/50 hover:text-ink"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(current.cmd);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="group mt-2 flex w-full items-start gap-3 rounded-lg border border-line bg-panel px-5 py-3 text-left font-mono text-sm transition-colors hover:border-amber"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-label={`Copy ${current.label} install command`}
      >
        <span className="shrink-0 pt-px text-dim">$</span>
        <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">{current.cmd}</span>
        <span className="shrink-0 pt-px text-xs text-dim transition-colors group-hover:text-amber">
          {copied ? "copied" : "copy"}
        </span>
      </button>

      <p className="mt-1.5 font-mono text-[11px] text-dim">{current.note}</p>
    </div>
  );
}

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function Hero() {
  return (
    <header id="top" className="px-5 pt-36 pb-20 text-center">
      <motion.p
        custom={0}
        initial="hidden"
        animate="show"
        variants={rise}
        className="mx-auto mb-5 w-fit rounded-full border border-line bg-panel px-3 py-1 text-xs text-dim"
      >
        Four skills · full plugin integrations · upstream benchmark archive
      </motion.p>
      <motion.h1
        custom={1}
        initial="hidden"
        animate="show"
        variants={rise}
        className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Focus on <span className="text-amber">what matters.</span>{" "}
        <span className="text-dim">Build, audit, and review.</span>
      </motion.h1>
      <motion.p
        custom={2}
        initial="hidden"
        animate="show"
        variants={rise}
        className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-dim"
      >
        H-Mode brings concise coding, read-only audits and reviews, focused context,
        and Claude-specific hooks into one package. Historical comparisons below
        preserve the upstream results; they are not guarantees for H-Mode.
      </motion.p>
      <motion.div
        custom={3}
        initial="hidden"
        animate="show"
        variants={rise}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <CopyCmd />
        <a
          href="https://github.com/hemanth-create/H-Mode"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-5 py-3 text-sm text-dim transition-colors hover:text-ink"
        >
          GitHub →
        </a>
      </motion.div>
      <motion.p custom={4} initial="hidden" animate="show" variants={rise} className="mt-6 text-xs text-dim">
        Zero dependencies · zero network calls · zero LLM calls ·{" "}
        <code className="rounded bg-panel px-1.5 py-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          npx github:hemanth-create/H-Mode --uninstall
        </code>{" "}
        puts everything back
      </motion.p>
    </header>
  );
}
