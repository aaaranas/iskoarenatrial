"use client";

// FIX (Bug 1): This page previously showed hardcoded mock match cards to ALL users
// with no role check, no live data, and a MatchUI type that didn't match the shape
// returned by trpc.match.getAll (which returns league/homeTeam/date, not sport/matchup/schedule).
//
// Changes:
//  - useRole() now branches the view: admin sees the admin summary; users see a live view.
//  - trpc.match.getAll is fetched and filtered to today's date for the user view.
//  - StatCards show live counts from the real match feed instead of hardcoded numbers.
//  - LeaderboardPodium is preserved for both views (it is still mock — TM3 owns standings).
//  - The MatchCenter table is replaced by a simpler today-only match list for users.
//    Admin users continue to use /dashboard/matches (Box.tsx) for full management.

import { useMemo } from "react";
import { useRole } from "@/providers/RoleProvider";
import { trpc } from "@/lib/trpc";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeaderboardPodium } from "@/components/dashboard/LeaderboardPodium";
import { MatchCenter, MatchUI } from "@/components/dashboard/MatchCenter";
import { Loader2 } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if a match_date ISO string falls on today (local time). */
function isToday(dateStr: string): boolean {
  const matchDate = new Date(dateStr);
  const now = new Date();
  return (
    matchDate.getFullYear() === now.getFullYear() &&
    matchDate.getMonth() === now.getMonth() &&
    matchDate.getDate() === now.getDate()
  );
}

/**
 * Maps the shape returned by trpc.match.getAll (Match type from types/index.ts)
 * to the MatchUI shape expected by MatchCenter (sport/matchup/schedule/status/currentScore).
 * Previously these two types were incompatible, causing the table to always be empty.
 */
function toMatchUI(m: {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  date: string;
  time: string;
}): MatchUI {
  const statusMap: Record<string, MatchUI["status"]> = {
    live:      "LIVE NOW",
    upcoming:  "UPCOMING",
    completed: "FINISHED",
    finished:  "FINISHED",
  };
  const mapped = statusMap[m.status?.toLowerCase()] ?? "UPCOMING";

  // Reconstruct a Date from the separate date/time strings the router returns.
  // Fallback to now so formatSchedule never throws on bad data.
  const parsed = new Date(`${m.date} ${m.time}`);
  const schedule = isNaN(parsed.getTime()) ? new Date() : parsed;

  const scoreStr =
    m.homeScore != null && m.awayScore != null
      ? `${m.homeScore} - ${m.awayScore}`
      : "00 - 00";

  return {
    id: m.id,
    sport: m.league,
    matchup: `${m.homeTeam} vs ${m.awayTeam}`,
    schedule,
    status: mapped,
    currentScore: scoreStr,
  };
}

// ── Admin view ────────────────────────────────────────────────────────────────
// Keeps the original StatCards + Podium layout. MatchCenter shows all matches
// so admin gets a full overview without navigating to /dashboard/matches.
function AdminDashboard({ matches }: { matches: MatchUI[] }) {
  const liveCount     = matches.filter((m) => m.status === "LIVE NOW").length;
  const upcomingCount = matches.filter((m) => m.status === "UPCOMING").length;
  const finishedCount = matches.filter((m) => m.status === "FINISHED").length;

  return (
    <div className="px-6 md:px-10 py-12 pb-24">
      {/* Hero */}
      <section className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-14 pt-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-wide uppercase leading-tight font-heading">
          <span style={{ color: "var(--text-primary)" }}>ADMIN </span>
          <span style={{ color: "var(--accent-maroon)" }}>DASHBOARD</span>
        </h1>
        <p
          className="font-normal text-base md:text-lg max-w-3xl mx-auto leading-relaxed text-pretty"
          style={{ color: "var(--text-primary)" }}
        >
          Live overview of all matches, scores, and standings across all sports.
        </p>
      </section>

      {/* Stats + Podium */}
      <section className="animate-in fade-in duration-700 delay-75 mb-16 flex justify-center">
        <div className="hidden xl:flex flex-row gap-20 items-end">
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-4 w-[480px]">
              <StatCard title="Live Matches"    value={liveCount}     isLive={true} />
              <StatCard title="Upcoming Games"  value={upcomingCount} subtitle="Scheduled this season" />
              <StatCard title="Matches Played"  value={finishedCount} subtitle="Completed this season" />
              <StatCard title="Total Matches"   value={matches.length} subtitle="All time" />
            </div>
          </div>
          <div className="flex-shrink-0">
            <LeaderboardPodium />
          </div>
        </div>

        {/* Tablet */}
        <div className="hidden md:flex xl:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-4 gap-4 w-full">
            <StatCard title="Live Matches"   value={liveCount}     isLive={true} />
            <StatCard title="Upcoming Games" value={upcomingCount} subtitle="Scheduled" />
            <StatCard title="Played"         value={finishedCount} subtitle="Completed" />
            <StatCard title="Total"          value={matches.length} />
          </div>
          <LeaderboardPodium />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <StatCard title="Live Matches"   value={liveCount}     isLive={true} />
            <StatCard title="Upcoming Games" value={upcomingCount} />
            <StatCard title="Played"         value={finishedCount} />
            <StatCard title="Total"          value={matches.length} />
          </div>
          <LeaderboardPodium />
        </div>
      </section>

      <MatchCenter matches={matches} title="All Matches" />
    </div>
  );
}

// ── User view ─────────────────────────────────────────────────────────────────
// Non-admin users see only today's matches and the podium.
// No admin controls are rendered — the add/edit/delete buttons live in Box.tsx
// which is admin-gated separately.
function UserDashboard({ todayMatches }: { todayMatches: MatchUI[] }) {
  return (
    <div className="px-6 md:px-10 py-12 pb-24">
      {/* Hero */}
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

      {/* Stats + Podium */}
      <section className="animate-in fade-in duration-700 delay-75 mb-16 flex justify-center">
        <div className="hidden xl:flex flex-row gap-20 items-end">
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-4 w-[480px]">
              <StatCard
                title="Today's Matches"
                value={todayMatches.length}
                subtitle={todayMatches.length === 0 ? "No games today" : "Scheduled today"}
              />
              <StatCard
                title="Live Now"
                value={todayMatches.filter((m) => m.status === "LIVE NOW").length}
                isLive={true}
              />
              <StatCard
                title="Upcoming Today"
                value={todayMatches.filter((m) => m.status === "UPCOMING").length}
                subtitle="Starting soon"
              />
              <StatCard
                title="Concluded Today"
                value={todayMatches.filter((m) => m.status === "FINISHED").length}
                subtitle="Final score available"
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <LeaderboardPodium />
          </div>
        </div>

        {/* Tablet */}
        <div className="hidden md:flex xl:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-4 gap-4 w-full">
            <StatCard title="Today's Matches" value={todayMatches.length} />
            <StatCard title="Live Now"        value={todayMatches.filter((m) => m.status === "LIVE NOW").length} isLive={true} />
            <StatCard title="Upcoming"        value={todayMatches.filter((m) => m.status === "UPCOMING").length} />
            <StatCard title="Concluded"       value={todayMatches.filter((m) => m.status === "FINISHED").length} />
          </div>
          <LeaderboardPodium />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col gap-10 items-center w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <StatCard title="Today's Matches" value={todayMatches.length} />
            <StatCard title="Live Now"        value={todayMatches.filter((m) => m.status === "LIVE NOW").length} isLive={true} />
            <StatCard title="Upcoming"        value={todayMatches.filter((m) => m.status === "UPCOMING").length} />
            <StatCard title="Concluded"       value={todayMatches.filter((m) => m.status === "FINISHED").length} />
          </div>
          <LeaderboardPodium />
        </div>
      </section>

      <MatchCenter
        matches={todayMatches}
        title={todayMatches.length === 0 ? "No Matches Today" : "Today's Matches"}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const { data: matchesData, isLoading: matchesLoading } = trpc.match.getAll.useQuery();

  // Convert all matches to MatchUI shape for MatchCenter
  const allMatchesUI = useMemo<MatchUI[]>(() => {
    if (!matchesData) return [];
    return (matchesData as any[]).map(toMatchUI);
  }, [matchesData]);

  // User view: filter to today only
  const todayMatchesUI = useMemo<MatchUI[]>(() => {
    if (!matchesData) return [];
    return (matchesData as any[])
      .filter((m) => {
        // m.date is already a formatted date string from the router ("MM/DD/YYYY").
        // We re-parse via the raw match_date — but the router doesn't expose it.
        // Best effort: compare the formatted date string to today's locale string.
        const today = new Date().toLocaleDateString();
        return m.date === today;
      })
      .map(toMatchUI);
  }, [matchesData]);

  if (roleLoading || matchesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-page">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--accent-maroon)" }}
        />
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard matches={allMatchesUI} />;
  }

  return <UserDashboard todayMatches={todayMatchesUI} />;
};

export default DashboardPage;