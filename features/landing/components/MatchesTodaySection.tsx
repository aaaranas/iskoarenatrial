"use client";

// Matches Today section — auto-scroll ticker carousel of live + upcoming matches.
//
// FIX (Bug 4): Previously this section was hardwired to the LIVE_MATCHES static
// array from data.ts and showed the same mock matches every visit regardless of
// real data. Now it fetches from trpc.match.getAll filtered to today's matches
// and falls back to LIVE_MATCHES only if the DB is empty (so the landing page
// never shows a blank carousel during early setup).

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { formatMatchTime } from "@/lib/format-match-date";
import { pickSportPhoto } from "@/lib/sport-photos";
import {
  LIVE_MATCHES,
  COLLEGE_COLORS,
  COLLEGE_LOGOS,
  type LiveMatch,
  type CollegeCode,
} from "./data";

// ── Type adapter ──────────────────────────────────────────────────────────────
// Maps the shape returned by trpc.match.getAll to the LiveMatch shape the
// carousel cards expect. College codes are inferred from team name prefixes
// (e.g. "COS Scions" → "COS"). Falls back to "COS" if unrecognized so the
// card never crashes on an unknown team.
const COLLEGE_PREFIXES: Record<string, CollegeCode> = {
  COS:  "COS",
  CSS:  "CSS",
  CCAD: "CCAD",
  SOM:  "SOM",
};

function inferCollegeCode(teamName: string): CollegeCode {
  const prefix = teamName?.split(" ")[0]?.toUpperCase();
  return COLLEGE_PREFIXES[prefix] ?? "COS";
}

function toLiveMatch(m: {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  rawDate: string | null;
  venue: string;
}, index: number): LiveMatch {
  const statusLower = m.status?.toLowerCase() ?? "upcoming";
  const statusType =
    statusLower === "live"      ? "live"     :
    statusLower === "completed" ? "finished" : "upcoming";

  // Format wall-clock client-side (server no longer sends a pre-formatted string).
  const time = formatMatchTime(m.rawDate);

  const statusLabel =
    statusType === "live"     ? "LIVE"     :
    statusType === "finished" ? "FINISHED" : time;

  return {
    id:         index + 1,        // numeric id for React key
    sport:      m.league,
    home:       m.homeTeam,
    away:       m.awayTeam,
    homeScore:  statusType === "upcoming" ? null : (m.homeScore ?? null),
    awayScore:  statusType === "upcoming" ? null : (m.awayScore ?? null),
    status:     statusLabel,
    statusType,
    venue:      m.venue,
    time,
    cat:        "Traditional",    // category not exposed by the router; default ok
    homeCo:     inferCollegeCode(m.homeTeam),
    awayCo:     inferCollegeCode(m.awayTeam),
    // Deterministic sport photo — same match always shows the same image.
    img:        pickSportPhoto(m.league || "", m.id),
  };
}

// ── TeamRow (unchanged) ───────────────────────────────────────────────────────
function TeamRow({ code, name, score }: { code: CollegeCode; name: string; score: number | null }) {
  const teamColor = COLLEGE_COLORS[code] ?? "#f0f0f0";
  const logo = COLLEGE_LOGOS[code];
  const noScore = score == null;

  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Image src={logo} alt="" width={26} height={26} className="flex-shrink-0 rounded-md bg-white object-cover" />
        <span className="truncate font-bebas text-lg leading-none tracking-[1.2px]" style={{ color: teamColor }}>
          {name}
        </span>
      </div>
      <span className={`font-mono leading-none tabular-nums ${noScore ? "text-sm text-white/25" : "text-[22px] font-bold text-[#f0f0f0]"}`}>
        {noScore ? "–" : score}
      </span>
    </div>
  );
}

// ── MatchesTodayCard (unchanged) ──────────────────────────────────────────────
function MatchesTodayCard({ m }: { m: LiveMatch }) {
  const isLive     = m.statusType === "live";
  const isUpcoming = m.statusType === "upcoming";

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
      {/* Subtle sport photo background — 12% opacity so the card's dark surface
          stays dominant while giving each sport a distinct visual identity.
          The bottom-up gradient fades the photo into the card for legibility. */}
      {m.img && (
        <div className="pointer-events-none absolute inset-0">
          <img
            src={m.img}
            alt=""
            className="h-full w-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ia-card via-ia-card/70 to-transparent" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[2px] text-white/65">
          {m.sport}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[2px] ${statusClasses}`}>
          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-[pulseDot_1s_ease-in-out_infinite]" />}
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <TeamRow code={m.homeCo} name={m.home} score={m.homeScore} />
        <TeamRow code={m.awayCo} name={m.away} score={m.awayScore} />
      </div>
      <div className="mt-0.5 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className={`font-mono text-xs font-semibold ${isLive ? "text-ia-accent" : "text-[#f0f0f0]"}`}>
          {m.time}
        </span>
        <span className="text-[11px] tracking-[0.5px] text-white/40">📍 {m.venue}</span>
      </div>
    </div>
  );
}

// ── Carousel (unchanged except items source) ──────────────────────────────────
function MatchesTodayCarousel({ items }: { items: LiveMatch[] }) {
  const [paused, setPaused] = useState(false);
  const duration = Math.max(28, items.length * 6);
  const doubled  = [...items, ...items];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full overflow-hidden"
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
        maskImage:        "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
      }}
    >
      <div
        className="flex w-max gap-[18px] py-2 will-change-transform"
        style={{
          animation:           `matchesScroll ${duration}s linear infinite`,
          animationPlayState:  paused ? "paused" : "running",
        }}
      >
        {doubled.map((m, i) => <MatchesTodayCard key={`${m.id}-${i}`} m={m} />)}
      </div>
    </div>
  );
}

// ── Locale-safe isToday — mirrors the helper in dashboard/page.tsx ────────────
function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function MatchesTodaySection() {
  const { data: matchesData } = trpc.match.getAll.useQuery();

  const liveItems = useMemo<LiveMatch[]>(() => {
    if (!matchesData) return [];

    // Filter to today's non-completed matches using the raw ISO date string.
    // This is locale-independent — toLocaleDateString() comparison (the previous
    // approach) silently broke for users whose browser locale differed from the
    // server's locale, making the carousel always show zero real matches.
    const todayMatches = matchesData.filter(
      (m) => m.rawDate ? isToday(m.rawDate) && m.status !== "completed" : false
    );

    if (todayMatches.length > 0) {
      return todayMatches.map(toLiveMatch);
    }

    // Mock fallback: only in development so fabricated match data never reaches
    // production visitors on rest days or during off-season. In production an
    // empty carousel renders nothing — see the null return in the section below.
    if (process.env.NODE_ENV === "development") {
      return LIVE_MATCHES;
    }

    return [];
  }, [matchesData]);

  // In production with no real matches today, render nothing rather than fake data.
  if (liveItems.length === 0) return null;

  return (
    <section id="matches" className="py-28">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-6 pb-12">
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
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-ia-accent animate-[pulseDot_1s_ease-in-out_infinite]" />
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/70">
            LIVE FEED · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()} · {new Date().getFullYear()}
          </span>
        </div>
      </div>

      <MatchesTodayCarousel items={liveItems} />
    </section>
  );
}