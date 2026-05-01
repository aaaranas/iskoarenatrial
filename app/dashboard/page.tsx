"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { RecentMatchesTable, MatchUI } from "@/components/dashboard/RecentMatchesTable";
import { LeaderboardPodium } from "@/components/dashboard/LeaderboardPodium";

interface DashboardPageProps {
  matches?: MatchUI[];
}

// Dummy matches for the exact custom columns you requested
const defaultMatches: MatchUI[] = [
  { id: "#M-7721", sport: "BASKETBALL", matchup: "COS SCIONS VS CSS STALLIONS", schedule: "TODAY, 18:00", status: "LIVE NOW", currentScore: "12 - 08" },
  { id: "#M-7718", sport: "VOLLEYBALL", matchup: "ARTSCOMM PHOENIX VS SOM TYCOONS", schedule: "TOMORROW, 14:30", status: "UPCOMING", currentScore: "00 - 00" },
  { id: "#M-7715", sport: "E-SPORTS", matchup: "SOM TYCOONS VS COS SCIONS", schedule: "YESTERDAY, 20:00", status: "FINISHED", currentScore: "16 - 14" },
];

const DashboardPage = ({ matches = defaultMatches }: DashboardPageProps) => {
  return (
    <div className="min-h-screen bg-[#141414] px-6 md:px-10 py-12 pt-28 space-y-16 selection:bg-[#FF3300] selection:text-white pb-24">
      
      {/* Hero Banner Header */}
      <section className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-wide uppercase leading-tight">
          <span className="text-white">MATCH </span> 
          <span className="text-[#FF3300]">SCHEDULE</span>
        </h1>
        <p className="text-zinc-400 font-normal text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Follow all matches with real-time updates and live scores across all sports and categories.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700 delay-75">
        <StatCard title="Live Matches" value="14" isLive={true} />
        <StatCard title="Upcoming Games" value="32" subtitle="Next Kickoff in 45m" />
        <StatCard title="Matches Played" value="128" subtitle="Current Season Total" />
        <StatCard title="Registered Players" value="2,450" subtitle="Active Roster Verified" />
      </section>

      {/* Leaderboard Podium */}
      <LeaderboardPodium />

      {/* Recent Matches Table */}
      <RecentMatchesTable matches={matches} />
      
    </div>
  );
};

export default DashboardPage; 