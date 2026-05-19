// Dashboard V2 — Cinematic featured-match hero.
// 420px tall section: full-bleed sport photo + dual gradient overlays +
// scorebug (3-column: home / status / away).
// Empty state when no match is available.
"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { Eyebrow, StatusPill, CollegeBadge } from "./DashboardPrimitives";
import type { V2Match } from "./dashboard-data";

// ── TeamSide — one side of the scorebug (home or away) ──────────────────────
function TeamSide({
  code,
  name,
  full,
  score,
  winning = false,
}: {
  code: V2Match["homeCo"];
  name: string;
  full: string;
  score: number | null;
  winning?: boolean;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 flex-1 min-w-0">
      <CollegeBadge code={code} size={42} />
      <div className="flex-1 min-w-0">
        <div className="font-bebas text-base tracking-[0.08em] leading-none text-white truncate">
          {name}
        </div>
        <div className="text-[11px] text-white/50 mt-0.5 truncate">{full}</div>
      </div>
      <div
        className={`font-bebas italic text-[42px] leading-none tabular-nums shrink-0 ${
          winning ? "text-ia-accent" : "text-white"
        }`}
        style={{
          textShadow: winning ? "0 0 16px rgba(169,29,58,0.6)" : "none",
        }}
      >
        {score ?? "—"}
      </div>
    </div>
  );
}

// ── HeroFeaturedMatch ────────────────────────────────────────────────────────
export function HeroFeaturedMatch({ match }: { match: V2Match | null }) {
  // Empty state — no live or upcoming match to feature.
  if (!match) {
    return (
      <section className="relative h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden bg-black border-b border-white/5 flex items-center justify-center">
        {/* Accent stripe on the left edge — matches the live hero treatment */}
        <div
          className="absolute top-0 left-0 w-1.5 h-full"
          style={{ background: "linear-gradient(180deg, #A91D3A, transparent)" }}
        />
        <div className="text-center px-6">
          <Trophy className="size-10 text-ia-gold/50 mx-auto mb-3" />
          <Eyebrow color="gold" mono>NO MATCHES TODAY</Eyebrow>
          <p className="font-bebas italic text-4xl sm:text-5xl text-white/80 tracking-tight mt-2">
            CHECK BACK SOON
          </p>
          <p className="text-sm text-white/40 mt-2">The next live match will appear here.</p>
        </div>
      </section>
    );
  }

  const isLive = match.statusType === "live";
  const homeWinning =
    match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore;
  const awayWinning =
    match.homeScore != null && match.awayScore != null && match.awayScore > match.homeScore;

  return (
    <section className="relative h-[420px] sm:h-[460px] overflow-hidden bg-black border-b border-white/5">
      {/* Background photo — covers entire hero, with a slight de-saturation + contrast bump
          per the broadcast-cinematic look. Uses next/image for srcset + lazy fallback. */}
      {match.img && (
        <Image
          src={match.img}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "saturate(0.85) contrast(1.1)" }}
        />
      )}

      {/* Horizontal gradient: opaque sides → faded middle, frames the headline. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />
      {/* Vertical gradient: top barely tinted, bottom strongly tinted to anchor the scorebug. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Left-edge accent stripe (6px maroon fade-down) — signature broadcast detail. */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full pointer-events-none"
        style={{ background: "linear-gradient(180deg, #A91D3A, transparent)" }}
      />
      {/* Content layer */}
      <div className="absolute inset-0 px-6 sm:px-10 py-9 flex flex-col">
        {/* Featured match headline + scorebug */}
        <div className="flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
              <StatusPill type={isLive ? "live" : "upcoming"}>
                {isLive ? `LIVE · ${match.time}` : match.status}
              </StatusPill>
              <span className="font-bebas text-[13px] tracking-[0.18em] text-ia-gold">
                FEATURED · {match.sport.toUpperCase()}
              </span>
            </div>
            {/* The cinematic matchup headline. Scales down on small viewports. */}
            <h1
              className="font-bebas italic text-[56px] sm:text-[72px] lg:text-[88px] leading-[0.9] tracking-[0.01em] m-0 text-white"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}
            >
              {(match.homeCo ?? match.home).toUpperCase()}
              <br />
              <span className="text-ia-accent">VS</span> {(match.awayCo ?? match.away).toUpperCase()}
            </h1>
            <div className="mt-2.5 text-[13px] text-white/70 tracking-[0.04em]">
              {match.venue} · IskoArena · {match.time}
            </div>
          </div>

          {/* Scorebug — 3-column home / status / away. Wraps on small screens. */}
          <div
            className="flex flex-col sm:flex-row items-stretch gap-0 backdrop-blur-[8px] border border-white/10 border-l-[4px] border-l-ia-accent max-w-2xl bg-black/65"
          >
            <TeamSide
              code={match.homeCo}
              name={match.homeCo ?? "HOME"}
              full={match.home}
              score={match.homeScore}
              winning={homeWinning}
            />

            {/* Center status column */}
            <div
              className="px-4 py-3.5 text-center bg-black/50 border-y sm:border-y-0 sm:border-x border-white/10 sm:min-w-[90px] shrink-0"
            >
              <div className="font-bebas text-[11px] tracking-[0.2em] text-ia-accent">
                {isLive ? "● LIVE" : "VS"}
              </div>
              <div className="font-mono font-bold text-sm mt-0.5 text-white">
                {isLive ? match.time : match.time || "TBD"}
              </div>
              <div className="font-mono text-[9px] text-white/35 mt-0.5 tracking-[0.05em]">
                {match.sport.toUpperCase()}
              </div>
            </div>

            <TeamSide
              code={match.awayCo}
              name={match.awayCo ?? "AWAY"}
              full={match.away}
              score={match.awayScore}
              winning={awayWinning}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
