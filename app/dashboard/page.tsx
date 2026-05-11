"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { MatchCenter, MatchUI } from "@/components/dashboard/MatchCenter";
import { LeaderboardPodium } from "@/components/dashboard/LeaderboardPodium";

interface DashboardPageProps {
  matches?: MatchUI[];
}

const defaultMatches: MatchUI[] = [
  {
    id: "#M-7721",
    sport: "Basketball",
    matchup: "COS Scions vs CSS Stallions",
    schedule: new Date(2025, 5, 30, 18, 0),
    status: "LIVE NOW",
    currentScore: "12 - 08",
  },
  {
    id: "#M-7718",
    sport: "Volleyball",
    matchup: "ARTSCOMM Phoenix vs SOM Tycoons",
    schedule: new Date(2025, 6, 1, 14, 30),
    status: "UPCOMING",
    currentScore: "00 - 00",
  },
  {
    id: "#M-7715",
    sport: "E-Sports",
    matchup: "SOM Tycoons vs COS Scions",
    schedule: new Date(2025, 5, 29, 20, 0),
    status: "FINISHED",
    currentScore: "16 - 14",
  },
];

const DashboardPage = ({ matches = defaultMatches }: DashboardPageProps) => {
  return (
    <div className="px-6 md:px-10 py-12 pb-24">

      {/* ── Hero Banner ── */}
      <section className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-14 pt-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-wide uppercase leading-tight font-heading">
          <span style={{ color: "var(--text-primary)" }}>MATCH </span>
          <span style={{ color: "var(--accent-maroon)" }}>SCHEDULE</span>
        </h1>
        <p
          className="font-normal text-base md:text-lg max-w-3xl mx-auto leading-relaxed text-pretty"
          style={{ color: "var(--text-primary)" }}
        >
          Follow all matches with real-time updates and live scores across all sports and categories.
        </p>
      </section>

      {/* ── Stats + Podium ── */}
      {/* flex justify-center on the section centers the inner content without squishing it */}
      <section className="animate-in fade-in duration-700 delay-75 mb-16 flex justify-center">

        {/* Desktop: StatCards left, Podium right — inline-sized, centered as a unit */}
        <div className="hidden xl:flex flex-row gap-20 items-end">
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-4 w-[480px]">
              <StatCard title="Live Matches"       value="14"    isLive={true} />
              <StatCard title="Upcoming Games"     value="32"    subtitle="Next Kickoff in 45m" />
              <StatCard title="Matches Played"     value="128"   subtitle="Current Season Total" />
              <StatCard title="Registered Players" value="2,450" subtitle="Active Roster Verified" />
            </div>
          </div>
          <div className="flex-shrink-0">
            <LeaderboardPodium />
          </div>
        </div>

        {/* Tablet: 4-col StatCards, Podium below */}
        <div className="hidden md:flex xl:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-4 gap-4 w-full">
            <StatCard title="Live Matches"       value="14"    isLive={true} />
            <StatCard title="Upcoming Games"     value="32"    subtitle="Next Kickoff in 45m" />
            <StatCard title="Matches Played"     value="128"   subtitle="Current Season Total" />
            <StatCard title="Registered Players" value="2,450" subtitle="Active Roster Verified" />
          </div>
          <LeaderboardPodium />
        </div>

        {/* Mobile: 2×2 grid, Podium below */}
        <div className="flex md:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <StatCard title="Live Matches"       value="14"    isLive={true} />
            <StatCard title="Upcoming Games"     value="32"    subtitle="Next Kickoff in 45m" />
            <StatCard title="Matches Played"     value="128"   subtitle="Current Season Total" />
            <StatCard title="Registered Players" value="2,450" subtitle="Active Roster Verified" />
          </div>
          <LeaderboardPodium />
        </div>

      </section>

      {/* ── Matches Table ── */}
      <MatchCenter matches={matches} title="Match Tracker" />

    </div>
  );
};

export default DashboardPage;