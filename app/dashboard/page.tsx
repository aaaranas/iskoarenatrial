"use client";

import React, { useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentMatchesTable, MatchUI } from "@/components/dashboard/RecentMatchesTable";
import { LeaderboardPodium } from "@/components/dashboard/LeaderboardPodium";
import { trpc } from "@/utils/trpc";

const DashboardPage = () => {
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery();
  const { data: playersData } = trpc.players.getAll.useQuery();

  // ── Derive stat counts from real data ──────────────────────────────────────
  const stats = useMemo(() => {
    const matches = matchesData ?? [];
    const live = matches.filter((m) => m.statusType === "live").length;
    const upcoming = matches.filter((m) => m.statusType === "upcoming").length;
    const completed = matches.filter(
      (m) => m.statusType === "completed" || m.statusType === "finished"
    ).length;
    const players = playersData?.length ?? 0;
    return { live, upcoming, completed, players };
  }, [matchesData, playersData]);

  // ── Map real matches to the MatchUI shape for RecentMatchesTable ────────────
  const recentMatches: MatchUI[] = useMemo(() => {
    return (matchesData ?? []).slice(0, 10).map((m) => {
      const statusLabel =
        m.statusType === "live"
          ? "LIVE NOW"
          : m.statusType === "completed" || m.statusType === "finished"
          ? "FINISHED"
          : "UPCOMING";

      const homeScore = m.homeScore != null ? String(m.homeScore).padStart(2, "0") : "00";
      const awayScore = m.awayScore != null ? String(m.awayScore).padStart(2, "0") : "00";

      return {
        id: `#M-${m.id.slice(-4).toUpperCase()}`,
        sport: (m.league ?? "Unknown").toUpperCase(),
        matchup: `${m.homeTeam} VS ${m.awayTeam}`.toUpperCase(),
        schedule: `${m.date}, ${m.time}`,
        status: statusLabel,
        currentScore: `${homeScore} - ${awayScore}`,
      };
    });
  }, [matchesData]);

  return (
    <div className="min-h-screen bg-[#141414] px-6 md:px-10 py-12 pt-28 space-y-16 selection:bg-[#FF3300] selection:text-white pb-24">

      {/* Hero Banner Header */}
      <section className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-wide uppercase leading-tight">
          <span className="text-white">MATCH </span>
          <span className="text-[#FF3300]">SCHEDULE</span>
        </h1>
        <p className="text-zinc-400 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Follow all matches with real-time updates and live scores across all sports and categories.
        </p>
      </section>

      {/* Stats Grid — live counts from tRPC */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700 delay-75">
        <StatCard
          title="Live Matches"
          value={isLoading ? "—" : stats.live}
          isLive={stats.live > 0}
        />
        <StatCard
          title="Upcoming Games"
          value={isLoading ? "—" : stats.upcoming}
          subtitle="Scheduled this season"
        />
        <StatCard
          title="Matches Played"
          value={isLoading ? "—" : stats.completed}
          subtitle="Completed this season"
        />
        <StatCard
          title="Registered Players"
          value={isLoading ? "—" : stats.players.toLocaleString()}
          subtitle="Active roster verified"
        />
      </section>

      {/* Leaderboard Podium */}
      <LeaderboardPodium />

      {/* Recent Matches Table — last 10 matches from DB */}
      <RecentMatchesTable matches={recentMatches} />

    </div>
  );
};

export default DashboardPage;