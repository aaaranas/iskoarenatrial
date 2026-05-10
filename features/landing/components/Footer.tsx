"use client";

// Public landing's footer — replaces components/footer.tsx and absorbs the old
// components/call-to-action.tsx. Three-layer composition per the design spec:
//   1. Maroon CTA card with a dramatic curved bottom (login trigger lives here)
//   2. Dark footer card overlapping the CTA card by -32px (brand + link cols + socials)
//   3. Giant ISKOARENA watermark, clipped at the bottom edge of the page
// The asymmetric border-radius and watermark gradient text use inline styles —
// Tailwind doesn't have first-class utilities for either pattern.

import React from "react";
import Image from "next/image";

// Social link configuration — kept as a tuple of (kind, href) so the brand
// can swap in real URLs later without touching the markup.
const SOCIALS: { kind: "fb" | "ig" | "x" | "yt" | "tk"; label: string; href: string }[] = [
  { kind: "fb", label: "Facebook",  href: "#" },
  { kind: "ig", label: "Instagram", href: "#" },
  { kind: "x",  label: "X",         href: "#" },
  { kind: "yt", label: "YouTube",   href: "#" },
  { kind: "tk", label: "TikTok",    href: "#" },
];

// Footer link columns — the design groups them by user intent (Coverage / Community / IskoArena).
const LINK_COLS: { title: string; links: string[] }[] = [
  { title: "Coverage",  links: ["Schedules", "Standings", "Live Scores", "Sports"] },
  { title: "Community", links: ["News", "Spotlight", "Rivalry", "Highlights"] },
  { title: "IskoArena", links: ["About", "The Team", "Sponsors", "Contact"] },
];

// Inline social icon SVGs from the handoff bundle — kept as inline JSX so X and
// TikTok (which lucide-react doesn't ship) match the design exactly.
function SocialIconSvg({ kind }: { kind: typeof SOCIALS[number]["kind"] }) {
  switch (kind) {
    case "fb":
      return (
        <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h2v3h-2c-.5 0-1 .5-1 1v2h3l-.5 3H13v7A10 10 0 0 0 22 12Z" />
      );
    case "ig":
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </>
      );
    case "x":
      return (
        <path d="M18.244 2H21.5l-7.4 8.46L22.5 22h-6.66l-5.21-6.81L4.66 22H1.4l7.92-9.05L1.5 2h6.78l4.71 6.23L18.244 2Zm-1.17 18h1.84L7.02 4H5.06l12.014 16Z" />
      );
    case "yt":
      return (
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.76C18.2 5 12 5 12 5s-6.2 0-7.84.44A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.76C5.8 19 12 19 12 19s6.2 0 7.84-.44a2.5 2.5 0 0 0 1.76-1.76A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      );
    case "tk":
      return (
        <path d="M19.6 8.4a6.4 6.4 0 0 1-3.7-1.18v7.42a5.36 5.36 0 1 1-5.36-5.36c.18 0 .36.01.54.03v2.7a2.66 2.66 0 1 0 1.86 2.54V2h2.66a3.7 3.7 0 0 0 3.7 3.7H20l-.4 2.7Z" />
      );
  }
}

// Single social-icon button — hover tints to maroon to match the design.
function SocialIcon({ kind, label, href }: typeof SOCIALS[number]) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-white/55 transition-all hover:border-ia-maroon/60 hover:bg-ia-maroon/20 hover:text-[#f0f0f0]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <SocialIconSvg kind={kind} />
      </svg>
    </a>
  );
}

interface FooterProps {
  // Triggered by the white "Login to IskoArena" pill — LandingPage opens the modal.
  onLoginClick: () => void;
}

export default function Footer({ onLoginClick }: FooterProps) {
  return (
    <footer className="relative overflow-hidden bg-ia-card px-4 pt-10">
      {/* CTA CARD — maroon radial gradient, dramatic curved bottom.
          Asymmetric border-radius can't be expressed in pure Tailwind, so it lives
          in an inline style. Format: <horizontal-radii> / <vertical-radii>. */}
      <div
        className="relative mx-auto max-w-[1240px] border border-b-0 border-white/[0.06] px-6 pb-[120px] pt-[88px] text-center"
        style={{
          borderRadius: "28px 28px 96px 96px / 28px 28px 240px 240px",
          background: "radial-gradient(ellipse 60% 80% at 50% 0%, #800000 0%, #2A0407 60%, #0a0a0a 100%)",
        }}
      >
        {/* Subtle accent glow over the maroon — adds the "stage lighting" feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            borderRadius: "inherit",
            background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(169,29,58,0.2) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-[1]">
          <h2 className="mb-4 font-bebas text-[clamp(42px,5.5vw,72px)] leading-[0.95] tracking-[2px] text-white">
            Ready for game day?
          </h2>
          <p className="mx-auto mb-8 max-w-[480px] text-[15px] leading-relaxed text-white/65">
            Join the Iskolaro community — every match, every score, every Isko story in one place.
          </p>

          {/* White pill — the only auth surface in the footer; opens the LoginModal */}
          <button
            type="button"
            onClick={onLoginClick}
            className="rounded-full bg-white px-9 py-3.5 text-sm font-bold tracking-[0.4px] text-ia-maroon transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
          >
            Login to IskoArena
          </button>
        </div>
      </div>

      {/* FOOTER CARD — overlaps the CTA card by -32px so the curve "tucks under" it */}
      <div className="relative z-[2] mx-auto -mt-8 max-w-[1240px] rounded-3xl border border-white/[0.06] bg-ia-card-elev px-11 pb-8 pt-12">
        <div className="mb-9 grid grid-cols-1 gap-9 sm:grid-cols-2 md:grid-cols-[minmax(260px,1.2fr)_repeat(3,minmax(120px,1fr))]">
          {/* Left col — brand: logo + tagline + social row */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={34}
                height={34}
                // Silences Next's width/height-modified warning (see Hero for details)
                style={{ width: "auto", height: "auto" }}
                className="object-contain"
              />
              <span className="font-bebas text-[22px] tracking-[2.5px] text-[#f0f0f0]">
                IskoArena
              </span>
            </div>
            <p className="mb-6 max-w-[340px] text-[13px] leading-[1.7] text-white/50">
              The official home of UP Cebu Intramurals — built by Iskos, for Iskos. Live scores, full coverage, every sport.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <SocialIcon key={s.kind} {...s} />
              ))}
            </div>
          </div>

          {/* 3 link columns — gold uppercase header + muted link list */}
          {LINK_COLS.map((col) => (
            <div key={col.title}>
              <div className="mb-[18px] text-[11px] font-bold uppercase tracking-[2.5px] text-ia-gold">
                {col.title}
              </div>
              <ul className="m-0 list-none p-0">
                {col.links.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="block py-1 text-[13px] tracking-[0.2px] text-white/45 transition-colors hover:text-[#f0f0f0]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Hairline divider before the legal row */}
        <div className="mb-6 h-px w-full bg-white/[0.06]" />

        {/* Bottom row — copyright on the left, legal links on the right */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-xs text-white/40">
            © 2026 IskoArena · UP Cebu Intramurals. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6">
            {["Privacy Policy", "Terms of Service", "Code of Conduct"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs text-white/45 underline decoration-white/15 underline-offset-[3px] transition-colors hover:text-ia-gold hover:decoration-ia-gold/55"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* GIANT WATERMARK — clipped at the page bottom, transparent fill with maroon stroke + gradient.
          Tailwind has no utility for -webkit-text-stroke or gradient text, so this stays inline. */}
      <div
        aria-hidden="true"
        className="relative mx-auto mt-10 max-w-[1240px] overflow-hidden text-center"
        style={{ height: "clamp(80px, 14vw, 180px)", pointerEvents: "none" }}
      >
        <div
          style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
            fontSize: "clamp(120px, 22vw, 320px)",
            letterSpacing: 8,
            lineHeight: 0.85,
            color: "transparent",
            WebkitTextStroke: "1px rgba(128,0,0,0.18)",
            background: "linear-gradient(180deg, rgba(128,0,0,0.10) 0%, transparent 80%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            whiteSpace: "nowrap",
            transform: "translateY(-10%)",
          }}
        >
          ISKOARENA
        </div>
      </div>
    </footer>
  );
}
