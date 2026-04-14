// src/components/pages/DashboardPage.tsx
"use client";

import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentMatchesTable, MatchUI } from "@/components/dashboard/RecentMatchesTable";

interface DashboardPageProps {
  matches: MatchUI[];
  playersCount?: number;
}

const DashboardPage = ({ matches, playersCount = 3104 }: DashboardPageProps) => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner with Maroon Glass Effect */}
      <section className="relative h-52 rounded-2xl overflow-hidden glass-panel-maroon flex items-center px-10 shadow-2xl border border-white/10">
        <div className="relative z-10 space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide font-maroons">
            Welcome back, Admin.
          </h1>
          <p className="text-secondary font-bold text-lg uppercase tracking-widest opacity-90">
            Here's what's happening today.
          </p>
        </div>
        {/* Decorative mask for the right side */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/10 -skew-x-12 translate-x-16" />
      </section>

      {/* Stats Grid - Using Black/30 Glass Panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Live Matches" value="04" icon="sensors" variant="live" />
        <StatCard label="Upcoming Games" value="12" icon="event_upcoming" variant="secondary" />
        <StatCard label="Matches Played" value="842" icon="check_circle" variant="default" />
        <StatCard label="Players" value={playersCount.toLocaleString()} icon="person_add" variant="secondary" />
      </section>

      {/* Recent Matches Table */}
      <RecentMatchesTable matches={matches} />
    </div>
  );
};

export default DashboardPage;