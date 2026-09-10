import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "H-Mode — cut Claude Code's token bill on three axes",
    template: "%s · H-Mode",
  },
  description:
    "H-Mode is a Claude Code plugin that cuts token usage three ways: a terse dev persona, a tool-output compression hook, and context-diet rules. Bundled benchmarks are historical upstream evidence, not H-Mode measurements.",
  keywords: [
    "claude code plugin",
    "token optimization",
    "save tokens claude",
    "claude code token usage",
    "context compression",
    "tool output compression",
    "YAGNI",
    "h-mode",
    "caveman claude",
    "ponytail claude",
  ],
  authors: [{ name: "Hemanth", url: "https://github.com/hemanth-create" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "H-Mode",
    title: "H-Mode — write less. ship less. mean more.",
    description:
      "H-Mode includes four skills and Claude-specific runtime hooks. Terse persona + tool-output compressor + context diet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "H-Mode — cut Claude Code's token bill on three axes",
    description:
      "Terse persona + tool-output compressor + context diet. Historical benchmarks are attributed to the upstream project.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "H-Mode",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  description:
    "Claude Code plugin that cuts token usage on three axes: terse dev persona, tool-output compression hook, and context-diet rules.",
  url: SITE_URL,
  downloadUrl: "https://github.com/hemanth-create/H-Mode",
  softwareVersion: "2.0.0",
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Person", name: "Hemanth", url: "https://github.com/hemanth-create" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {/* set theme before paint — no flash; default light, honors saved choice or OS dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("h-mode-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
