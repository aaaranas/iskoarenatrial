// Dashboard V2 — Scoreboard row. One match line in the "SCOREBOARD · TODAY" list.
// Renders 5 columns at lg+: [sport+status | home | score | away | venue+CTA].
// Collapses to a 2-row stack on mobile so nothing overflows the viewport.
"use client";

import Link from "next/link";
import { CollegeBadge, MonoLabel, StatusPill } from "./DashboardPrimitives";
import type { V2Match } from "./dashboard-data";

export function ScoreboardRow({ match }: { match: V2Match }) {
  const isLive = match.statusType === "live";
  const isCompleted = match.statusType === "completed";
  const hasScores = match.homeScore != null && match.awayScore != null;
  const homeWon = hasScores && match.homeScore! > match.awayScore!;
  const awayWon = hasScores && match.awayScore! > match.homeScore!;

  return (
    <Link
      href="/dashboard/matches"
      className={`block bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg ${
        isLive ? "border-l-[3px] border-l-ia-accent" : "border-l-[3px] border-l-transparent"
      }`}
    >
      {/* Desktop / tablet (≥sm): 5-column grid. Mobile: stacked rows. */}
      <div className="grid grid-cols-[90px_1fr_70px_1fr_100px] items-center gap-3.5 px-4 py-3 max-sm:hidden">
        {/* Col 1 — sport + status */}
        <div>
          <div className="font-bebas text-[13px] tracking-[0.12em] text-white">
            {match.sport.toUpperCase()}
          </div>
          <div className="mt-1">
            <StatusPill type={isLive ? "live" : isCompleted ? "final" : "upcoming"}>
              {isLive ? `LIVE · ${match.time}` : match.status}
            </StatusPill>
          </div>
        </div>

        {/* Col 2 — home team */}
        <div className="flex items-center gap-2.5 min-w-0">
          <CollegeBadge code={match.homeCo} size={28} />
          <div className="min-w-0">
            <div
              className={`font-bebas text-lg tracking-[0.04em] leading-none truncate ${
                homeWon || !hasScores ? "text-white" : "text-white/50"
              }`}
            >
              {match.home.toUpperCase()}
            </div>
            <div className="text-[10px] text-white/35 mt-0.5 font-mono">
              {match.homeCo ?? "—"} · HOME
            </div>
          </div>
        </div>

        {/* Col 3 — score */}
        <div className="text-center font-mono font-bold text-[22px] tabular-nums">
          {hasScores ? (
            <span>
              <span className={homeWon ? "text-ia-accent" : "text-white"}>{match.homeScore}</span>
              <span className="text-white/35 px-1">–</span>
              <span className={awayWon ? "text-ia-accent" : "text-white"}>{match.awayScore}</span>
            </span>
          ) : (
            <span className="text-white/35 text-[13px] tracking-[0.1em]">VS</span>
          )}
        </div>

        {/* Col 4 — away team */}
        <div className="flex items-center gap-2.5 min-w-0">
          <CollegeBadge code={match.awayCo} size={28} />
          <div className="min-w-0">
            <div
              className={`font-bebas text-lg tracking-[0.04em] leading-none truncate ${
                awayWon || !hasScores ? "text-white" : "text-white/50"
              }`}
            >
              {match.away.toUpperCase()}
            </div>
            <div className="text-[10px] text-white/35 mt-0.5 font-mono">
              {match.awayCo ?? "—"} · AWAY
            </div>
          </div>
        </div>

        {/* Col 5 — venue + CTA */}
        <div className="text-right">
          <MonoLabel className="text-white/35">{match.venue}</MonoLabel>
          <div className="text-[10px] text-ia-accent mt-0.5 font-bebas tracking-[0.12em]">
            {isLive ? "WATCH →" : isCompleted ? "RECAP →" : "PREVIEW →"}
          </div>
        </div>
      </div>

      {/* Mobile (< sm): compact 2-row layout */}
      <div className="sm:hidden px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="font-bebas text-xs tracking-[0.12em] text-white">
            {match.sport.toUpperCase()}
          </div>
          <StatusPill type={isLive ? "live" : isCompleted ? "final" : "upcoming"}>
            {isLive ? `LIVE · ${match.time}` : match.status}
          </StatusPill>
        </div>
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CollegeBadge code={match.homeCo} size={22} />
            <div className="font-bebas text-sm leading-none tracking-[0.04em] truncate text-white">
              {match.homeCo ?? "—"}
            </div>
          </div>
          {/* Score */}
          <div className="font-mono font-bold text-base tabular-nums shrink-0 text-center min-w-[52px]">
            {hasScores ? (
              <>
                <span className={homeWon ? "text-ia-accent" : "text-white"}>{match.homeScore}</span>
                <span className="text-white/35 px-1">–</span>
                <span className={awayWon ? "text-ia-accent" : "text-white"}>{match.awayScore}</span>
              </>
            ) : (
              <span className="text-white/35 text-xs">VS</span>
            )}
          </div>
          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <div className="font-bebas text-sm leading-none tracking-[0.04em] truncate text-white">
              {match.awayCo ?? "—"}
            </div>
            <CollegeBadge code={match.awayCo} size={22} />
          </div>
        </div>
      </div>
    </Link>
  );
}
