"use client";

// Matches Today section — auto-scroll only ticker carousel of live + upcoming
// matches. Replaces components/landing/PublicSchedules.tsx (the previous
// embedded schedules grid).
//
// Implementation notes (ported from ia-carousels.jsx → TypeScript):
//   • CSS keyframe `matchesScroll` (defined in app/globals.css) drives the
//     duplicated track. Pause on hover via `animation-play-state: paused`.
//   • Duration scales with item count: max(28, items.length * 6) seconds —
//     keeps per-card dwell time roughly constant regardless of feed size.
//   • LIVE pill pulses (pulseDot keyframe) and glows in ia-accent. UPCOMING
//     uses a gold outline; FINAL uses a muted outline.

import React, { useState } from "react";
import Image from "next/image";
import { LIVE_MATCHES, COLLEGE_COLORS, COLLEGE_LOGOS, type LiveMatch, type CollegeCode } from "./_data";

// Inline row for a single team in a match card: logo + Bebas team name + mono score.
// Score renders an em-dash if null (upcoming match — no score yet).
function TeamRow({
  code,
  name,
  score,
}: {
  code: CollegeCode;
  name: string;
  score: number | null;
}) {
  const teamColor = COLLEGE_COLORS[code] ?? "#f0f0f0";
  const logo = COLLEGE_LOGOS[code];
  const noScore = score == null;

  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Team crest — small white square so the colored logo pops on the dark card */}
        <Image
          src={logo}
          alt=""
          width={26}
          height={26}
          className="flex-shrink-0 rounded-md bg-white object-cover"
        />
        {/* Team name — Bebas Neue in the team's brand color, truncates if long */}
        <span
          className="truncate font-bebas text-lg leading-none tracking-[1.2px]"
          style={{ color: teamColor }}
        >
          {name}
        </span>
      </div>
      {/* Score — JetBrains Mono, tabular-nums so digits align across rows */}
      <span
        className={`font-mono leading-none tabular-nums ${
          noScore ? "text-sm text-white/25" : "text-[22px] font-bold text-[#f0f0f0]"
        }`}
      >
        {noScore ? "–" : score}
      </span>
    </div>
  );
}

// Single match card — sport tag + status pill + 2 team rows + time/venue footer.
function MatchesTodayCard({ m }: { m: LiveMatch }) {
  const isLive = m.statusType === "live";
  const isUpcoming = m.statusType === "upcoming";

  // Status pill style is conditional on the match state.
  const statusClasses = isLive
    ? "bg-ia-accent text-white shadow-[0_0_14px_rgba(169,29,58,0.55)]"
    : isUpcoming
    ? "border border-ia-gold/20 text-ia-gold"
    : "border border-white/10 text-white/40";

  const statusLabel = isLive ? "LIVE" : isUpcoming ? "UPCOMING" : "FINAL";

  return (
    <div
      className="relative flex flex-shrink-0 flex-col gap-3.5 overflow-hidden rounded-[18px] border border-white/[0.06] bg-ia-card px-5 py-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
      style={{ width: "clamp(280px, 28vw, 340px)" }}
    >
      {/* Top row: sport tag pill + status pill */}
      <div className="flex items-center justify-between">
        {/* Sport tag — small caps muted pill */}
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[2px] text-white/65">
          {m.sport}
        </span>

        {/* Status pill — LIVE has a pulsing white dot + accent glow */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[2px] ${statusClasses}`}
        >
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-[pulseDot_1s_ease-in-out_infinite]" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Two team rows */}
      <div className="flex flex-col gap-2.5">
        <TeamRow code={m.homeCo} name={m.home} score={m.homeScore} />
        <TeamRow code={m.awayCo} name={m.away} score={m.awayScore} />
      </div>

      {/* Footer: time on the left (accent if live), venue on the right */}
      <div className="mt-0.5 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span
          className={`font-mono text-xs font-semibold ${
            isLive ? "text-ia-accent" : "text-[#f0f0f0]"
          }`}
        >
          {m.time}
        </span>
        <span className="text-[11px] tracking-[0.5px] text-white/40">📍 {m.venue}</span>
      </div>
    </div>
  );
}

interface MatchesTodayCarouselProps {
  items?: LiveMatch[];
}

function MatchesTodayCarousel({ items = LIVE_MATCHES }: MatchesTodayCarouselProps) {
  const [paused, setPaused] = useState(false);
  // Duration scales by item count so the per-card pace feels constant.
  const duration = Math.max(28, items.length * 6);
  const doubled = [...items, ...items];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full overflow-hidden"
      style={{
        // Soft-fade edges hide the loop seam.
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
      }}
    >
      <div
        className="flex w-max gap-[18px] py-2 will-change-transform"
        style={{
          animation: `matchesScroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((m, i) => (
          <MatchesTodayCard key={`${m.id}-${i}`} m={m} />
        ))}
      </div>
    </div>
  );
}

export default function MatchesTodaySection() {
  return (
    // id="matches" — Nav "Schedules" link points here per the design.
    <section id="matches" className="py-28">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-6 pb-12">
        {/* Left: eyebrow + headline + subcopy */}
        <div>
          <div className="mb-3.5 inline-flex items-center gap-2.5">
            <span className="inline-block h-0.5 w-7 rounded bg-ia-accent" />
            <span className="text-[11px] font-bold uppercase tracking-[3px] text-ia-accent">
              Matches Today
            </span>
          </div>
          <h2 className="mb-2 font-bebas text-[clamp(40px,6vw,76px)] leading-none tracking-[1px] text-[#f0f0f0]">
            Live &amp; Upcoming
          </h2>
          <p className="mt-2 max-w-[480px] text-sm text-white/45">
            Auto-updating feed of every game on the court, board, or arena today.
          </p>
        </div>

        {/* Right: live-feed pill with date */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-ia-accent animate-[pulseDot_1s_ease-in-out_infinite]" />
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/70">
            LIVE FEED · APR 26 · 2026
          </span>
        </div>
      </div>

      <MatchesTodayCarousel items={LIVE_MATCHES} />
    </section>
  );
}
