"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Match, Result, Player, Team } from "@/types";
import { MatIcon } from "@/components/ui/MatIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";

interface DashboardPageProps {
  matches: Match[];
  results: Result[];
  players: Player[];
  teams: Team[];
}

const sportIconMap: Record<string, string> = {
  basketball: "sports_basketball",
  football:   "sports_soccer",
  volleyball: "sports_volleyball",
  tennis:     "sports_tennis",
  baseball:   "sports_baseball",
  swimming:   "pool",
};

export default function DashboardPage({ matches, results, players, teams }: DashboardPageProps) {
  const now = new Date();

  const ongoingMatches = matches.filter((match) => {
    const matchDateTime = new Date(`${match.date}T${match.time}`);
    const timeDiff = now.getTime() - matchDateTime.getTime();
    const hasResult = results.some((r) => r.matchId === match.id);
    return timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000 && !hasResult;
  });

  const recentMatches = [...matches].slice(-5).reverse();

  const getSportIcon = (league: string) =>
    sportIconMap[league?.toLowerCase() ?? ""] ?? "sports";

  const stats = [
    {
      label: "Live Matches",
      value: String(ongoingMatches.length).padStart(2, "0"),
      icon: "sensors",
      iconFill: true,
      iconClass: "text-red-500",
      bgClass: "bg-primary/30 shadow-primary/20",
    },
    {
      label: "Upcoming Games",
      value: String(matches.filter((m) => new Date(`${m.date}T${m.time}`) > now).length).padStart(2, "0"),
      icon: "event_upcoming",
      iconFill: false,
      iconClass: "text-secondary",
      bgClass: "bg-secondary/20 shadow-secondary/10",
    },
    {
      label: "Matches Played",
      value: String(results.length).padStart(2, "0"),
      icon: "check_circle",
      iconFill: false,
      iconClass: "text-on-surface-variant",
      bgClass: "bg-white/10",
    },
    {
      label: "Players",
      value: String(players.length).padStart(2, "0"),
      icon: "person_add",
      iconFill: true,
      iconClass: "text-secondary",
      bgClass: "bg-primary/30 shadow-primary/20",
    },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* ── Hero Banner ── */}
      <section
        className="relative h-48 rounded-2xl overflow-hidden flex items-center px-10 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(128,0,0,0.85), rgba(65,0,2,0.90))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Subtle radial glow behind text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, rgba(200,0,0,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 space-y-2">
          {/*
            HTML reference:
              class="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight"
              font-family: Oswald (h-tags auto-apply this in the HTML)
          */}
          <h1
            className="text-white"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",   /* 3xl → 5xl */
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",              /* tracking-tight */
              lineHeight: 1.1,
            }}
          >
            Welcome back, Admin.
          </h1>
          {/*
            HTML reference:
              class="text-secondary/90 max-w-md font-bold text-lg"
              font-family: Roboto (body)
          */}
          <p
            className="text-secondary/90 max-w-md"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1.125rem",   /* text-lg */
              fontWeight: 700,
            }}
          >
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      {/* ── Recent Matches Table ── */}
      <section
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(0,0,0,0.20)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Table header bar */}
        <div
          className="px-8 py-6 flex justify-between items-center border-b"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div>
            {/* HTML: text-xl font-bold text-white tracking-tight uppercase — Oswald */}
            <h3
              className="text-white"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
            >
              Recent Matches
            </h3>
            {/* HTML: text-xs text-on-surface-variant font-bold uppercase tracking-wider — Roboto */}
            <p
              className="text-on-surface-variant"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 2,
              }}
            >
              Real-time status of current and past matchups
            </p>
          </div>

          {/* HTML: text-sm font-bold uppercase tracking-tighter — Roboto */}
          <button
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              padding: "10px 20px",
              boxShadow: "0 4px 24px rgba(128,0,0,0.30)",
            }}
          >
            View Schedule
            <MatIcon icon="calendar_month" className="text-secondary text-lg" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table
            className="w-full text-left"
            style={{ borderCollapse: "separate", borderSpacing: "0 4px", padding: "0 2rem 1.5rem" }}
          >
            <thead>
              <tr className="text-on-surface-variant">
                {["Sport", "Matchup", "Schedule", "Status", "Action"].map((h, i) => (
                  <th
                    key={h}
                    className={cn(i === 4 && "text-right")}
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",         /* tracking-[0.15em] from HTML */
                      padding: "24px 16px 12px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentMatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-on-surface-variant"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.875rem",
                      padding: "3rem 0",
                    }}
                  >
                    No matches found.
                  </td>
                </tr>
              ) : (
                recentMatches.map((match) => {
                  const hasResult = results.some((r) => r.matchId === match.id);
                  const isLive    = ongoingMatches.some((m) => m.id === match.id);

                  return (
                    <tr
                      key={match.id}
                      className="group transition-all"
                      style={{ borderRadius: "12px" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      {/* Sport */}
                      <td style={{ padding: "20px 16px", verticalAlign: "middle" }}>
                        <div className="flex items-center gap-3">
                          <MatIcon icon={getSportIcon(match.league)} className="text-secondary" />
                          {/* HTML: text-sm font-bold text-white uppercase — Roboto */}
                          <span
                            className="text-white"
                            style={{
                              fontFamily: "'Roboto', sans-serif",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {match.league}
                          </span>
                        </div>
                      </td>

                      {/* Matchup */}
                      <td style={{ padding: "20px 16px" }}>
                        {/* HTML: text-sm font-bold text-white uppercase — Roboto */}
                        <p
                          className="text-white"
                          style={{
                            fontFamily: "'Roboto', sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {match.homeTeam} vs {match.awayTeam}
                        </p>
                      </td>

                      {/* Schedule */}
                      <td style={{ padding: "20px 16px" }}>
                        {/* HTML: text-sm font-bold text-on-surface uppercase tracking-tight — Roboto */}
                        <p
                          className="text-on-surface"
                          style={{
                            fontFamily: "'Roboto', sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {match.date}
                        </p>
                        {/* HTML: text-[10px] text-on-surface-variant font-bold uppercase — Roboto */}
                        <p
                          className="text-on-surface-variant"
                          style={{
                            fontFamily: "'Roboto', sans-serif",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginTop: 2,
                          }}
                        >
                          {match.time}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "20px 16px" }}>
                        <StatusBadge isLive={isLive} isCompleted={hasResult} />
                      </td>

                      {/* Action */}
                      <td style={{ padding: "20px 16px", textAlign: "right" }}>
                        <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                          <MatIcon icon="more_vert" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}