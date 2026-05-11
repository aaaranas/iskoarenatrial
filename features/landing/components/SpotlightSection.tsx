"use client";

// Spotlight — Isko of the Week. Two-column section: rich player card on the
// left (photo + jersey number + name + tags + stat pills), narrative + quote +
// awards on the right.
//
// V1 STATUS: PLAYER data is fully mock in components/landing/_data.ts.
// Photo uses a dev-team headshot as placeholder until real player photography
// arrives. TODO: needs a featured_players or weekly_spotlight Supabase table.

import React from "react";
import Image from "next/image";
import { PLAYER, COLLEGE_COLORS } from "./data";
import SectionLabel from "./SectionLabel";

// Small stat block used in the player card footer (e.g. PPG / RPG / APG / STL).
function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[84px] rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-center">
      <div className="font-mono text-2xl font-bold leading-none tabular-nums text-[#f0f0f0]">
        {value}
      </div>
      <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[2px] text-white/35">
        {label}
      </div>
    </div>
  );
}

export default function SpotlightSection() {
  const p = PLAYER;
  const collegeColor = COLLEGE_COLORS[p.college];

  return (
    <section id="spotlight" className="mx-auto max-w-[1280px] px-6 py-28">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        {/* LEFT — player card with photo header + stats footer */}
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-[20px] border bg-ia-card"
            style={{ borderColor: `${collegeColor}33` }}
          >
            {/* Photo block (4:5 aspect). Multiple absolute overlays for badges + name. */}
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={p.photo}
                alt={p.name}
                fill
                // Player card occupies the left col of a 1fr/1.1fr grid (max-w 1280) —
                // ~half viewport on desktop, full width on mobile.
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover [filter:grayscale(0.2)_contrast(1.05)]"
              />
              {/* Vertical fade to card black + a college-tinted diagonal wash */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 95%),
                               linear-gradient(135deg, ${collegeColor}22 0%, transparent 50%)`,
                }}
              />

              {/* Top-left "Isko of the Week" badge — maroon pill with gold border */}
              <div
                className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 backdrop-blur-md"
                style={{
                  background: "rgba(128,0,0,0.8)",
                  borderColor: "rgba(212,175,55,0.4)",
                }}
              >
                <span className="text-[13px] text-ia-gold">★</span>
                <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-ia-gold">
                  ISKO OF THE WEEK
                </span>
              </div>

              {/* Top-right giant jersey number — Bebas, soft glow shadow */}
              <div
                className="absolute right-6 top-5 font-bebas text-[88px] leading-[0.85] tracking-[1px] text-white opacity-90"
                style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}
              >
                #{p.number}
              </div>

              {/* Bottom name overlay — nickname (mono colored), full name (Bebas), then 3 tag pills */}
              <div className="absolute bottom-6 left-6 right-6">
                <div
                  className="mb-1.5 font-mono text-[11px] tracking-[1.5px]"
                  style={{ color: collegeColor }}
                >
                  &quot;{p.nickname}&quot;
                </div>
                <div className="font-bebas text-[clamp(36px,4.5vw,52px)] leading-[0.95] tracking-[2px] text-white">
                  {p.name}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {[p.college, p.sport, p.year].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats footer — flex-wrap row of StatPill blocks */}
            <div
              className="flex flex-wrap gap-2 border-t bg-[#070707] px-6 py-5"
              style={{ borderTopColor: `${collegeColor}22` }}
            >
              {Object.entries(p.stats).map(([k, v]) => (
                <StatPill key={k} label={k} value={v} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — narrative + quote + awards list */}
        <div>
          <SectionLabel>Player Spotlight</SectionLabel>
          <h2 className="mb-6 font-bebas text-[clamp(44px,5.5vw,80px)] leading-[0.95] tracking-[1px] text-[#f0f0f0]">
            The Isko of
            <br />
            <span style={{ color: collegeColor }}>the Week</span>
          </h2>

          <p className="mb-6 max-w-[440px] text-[15px] leading-[1.8] text-white/55">
            Every week, IskoArena spotlights the student-athlete who went above and beyond — on the court, on the board, or in the arena. This week, it&apos;s{" "}
            <strong className="text-[#f0f0f0]">{p.name}</strong> from {p.collegeFull}.
          </p>

          {/* Pull quote — left maroon stripe, italic body, attribution */}
          <blockquote className="mb-8 max-w-[480px] border-l-[3px] border-ia-maroon pl-5 text-base italic leading-[1.7] text-white/70">
            &ldquo;{p.quote}&rdquo;
            <footer className="mt-2.5 text-[11px] not-italic tracking-[1.5px] text-white/40">
              — {p.name.toUpperCase()}, {p.college}
            </footer>
          </blockquote>

          {/* Recent awards list */}
          <div className="mb-3.5 text-[11px] font-bold tracking-[2px] text-white/40">
            RECENT ACCOLADES
          </div>
          <div className="flex flex-col gap-2">
            {p.awards.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3.5 rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm text-ia-gold">★</span>
                <span className="text-[13px] text-white/70">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
