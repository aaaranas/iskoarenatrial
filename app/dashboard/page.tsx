"use client";

// IskoArena Dashboard V2 — Broadcast Studio.
// Replaces the previous admin/user split with a single live-broadcast layout.
// Cinematic featured-match hero → BottomLine ticker → main body grid:
//   left rail: scoreboard list + headlines
//   right rail: standings (tabbed) + top performer + bracket preview
//                + admin-only: match ops shortcuts
//
// Live data: trpc.match.getAll. Standings/news/player stay mock-backed until
// the corresponding routers (TM3/TM5) exist.

import { useMemo } from "react";
import Link from "next/link";
import { Loader2, Plus, Image as ImageIcon, FileEdit } from "lucide-react";

import { useRole } from "@/providers/RoleProvider";
import { trpc } from "@/lib/trpc";

import { HeroFeaturedMatch } from "@/components/dashboard/HeroFeaturedMatch";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { ScoreboardRow } from "@/components/dashboard/ScoreboardRow";
import { StandingsWidget } from "@/components/dashboard/StandingsWidget";
import { TopPerformerCard } from "@/components/dashboard/TopPerformerCard";
import { NewsCard } from "@/components/dashboard/NewsCard";
import {
  BracketPreview,
  Eyebrow,
  SectionTitle,
} from "@/components/dashboard/DashboardPrimitives";
import {
  NEWS,
  matchToTickerItem,
  toV2Match,
  isToday,
  isTomorrow,
  type V2Match,
} from "@/components/dashboard/dashboard-data";

// ── Admin-only widget — quick CRUD shortcuts ────────────────────────────────
function MatchOpsCard() {
  // Three primary admin actions on the dashboard: new match, record result, upload media.
  // Each links to the page that owns that workflow (already exists in V1).
  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] p-3.5">
      <Eyebrow color="gold" mono className="mb-3">ADMIN · MATCH OPS</Eyebrow>
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/matches"
          className="flex items-center gap-2.5 px-3 py-2 bg-black/40 border border-white/[0.07] rounded-[3px] text-white text-sm hover:bg-ia-accent/10 hover:border-ia-accent transition-colors"
        >
          <Plus className="size-4 text-ia-accent" />
          <span className="font-bebas tracking-[0.08em]">NEW MATCH</span>
        </Link>
        <Link
          href="/dashboard/matches"
          className="flex items-center gap-2.5 px-3 py-2 bg-black/40 border border-white/[0.07] rounded-[3px] text-white text-sm hover:bg-ia-accent/10 hover:border-ia-accent transition-colors"
        >
          <FileEdit className="size-4 text-ia-accent" />
          <span className="font-bebas tracking-[0.08em]">RECORD RESULT</span>
        </Link>
        <Link
          href="/dashboard/media"
          className="flex items-center gap-2.5 px-3 py-2 bg-black/40 border border-white/[0.07] rounded-[3px] text-white text-sm hover:bg-ia-accent/10 hover:border-ia-accent transition-colors"
        >
          <ImageIcon className="size-4 text-ia-accent" />
          <span className="font-bebas tracking-[0.08em]">UPLOAD MEDIA</span>
        </Link>
      </div>
    </div>
  );
}

// ── Bracket card wrapper ────────────────────────────────────────────────────
// Wraps the <BracketPreview> primitive with the same card chrome as the
// other right-rail widgets (border + eyebrow + "VIEW ALL" link).
function BracketCard() {
  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] px-3.5 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <Eyebrow color="gold" mono>BASKETBALL · BRACKET</Eyebrow>
        <span className="text-[10px] text-ia-accent font-mono">VIEW ALL →</span>
      </div>
      <div className="overflow-x-auto">
        <BracketPreview compact />
      </div>
    </div>
  );
}

// ── Main Dashboard component ────────────────────────────────────────────────
export default function DashboardPage() {
  const { isAdmin, loading: roleLoading } = useRole();
  const { data: matchesData, isLoading: matchesLoading } = trpc.match.getAll.useQuery();

  // Adapt tRPC matches → V2 shape, then derive all derived state in one pass.
  // Re-runs only when match data changes (not on StandingsWidget tab clicks).
  const { featured, scoreboardMatches, tickerItems, tickerMode, showTicker } = useMemo(() => {
    const v2 = (matchesData ?? []).map(toV2Match);

    // ── Hero (featured match) ───────────────────────────────────────────────
    // Picks the most interesting match regardless of date: live first, then
    // next upcoming, then most-recent completed. Hero is always visible.
    const featuredMatch: V2Match | null =
      v2.find((m) => m.statusType === "live") ??
      v2.find((m) => m.statusType === "upcoming") ??
      v2[0] ??
      null;

    // ── Scoreboard (today only) ─────────────────────────────────────────────
    // Show only matches whose rawDate falls on today's calendar day (local time).
    // Sort: live → upcoming (chronological) → completed (chronological).
    // Excludes the featured match since it already appears prominently in the hero.
    const todayMatches = v2
      .filter((m) => isToday(m.rawDate) && m.id !== featuredMatch?.id)
      .sort((a, b) => {
        // Priority bucket: live=0, upcoming=1, completed=2
        const bucket = (s: V2Match["statusType"]) =>
          s === "live" ? 0 : s === "upcoming" ? 1 : 2;
        const bucketDiff = bucket(a.statusType) - bucket(b.statusType);
        if (bucketDiff !== 0) return bucketDiff;
        // Within the same bucket, sort chronologically by rawDate.
        const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return dateA - dateB;
      });

    // ── Ticker ──────────────────────────────────────────────────────────────
    // Three states:
    //   'live'     → today has live or upcoming matches → show them in ticker.
    //   'upcoming' → today's matches are all done (or none), but tomorrow has
    //                upcoming matches → show tomorrow's schedule with gold tab.
    //   hidden     → no future matches at all (event ended) → don't render ticker.
    const todayActive = v2.filter(
      (m) => isToday(m.rawDate) && (m.statusType === "live" || m.statusType === "upcoming")
    );
    const tomorrowUpcoming = v2.filter(
      (m) => isTomorrow(m.rawDate) && m.statusType === "upcoming"
    );

    let tickerMode: "live" | "upcoming" = "live";
    let showTicker = false;
    let tickerItems: ReturnType<typeof matchToTickerItem>[] = [];

    if (todayActive.length > 0) {
      // Today still has live or upcoming — show all of today's matches in ticker.
      tickerMode = "live";
      showTicker = true;
      tickerItems = v2
        .filter((m) => isToday(m.rawDate))
        .map(matchToTickerItem);
    } else if (tomorrowUpcoming.length > 0) {
      // Today is done, but tomorrow has matches — show them with UPCOMING tab.
      tickerMode = "upcoming";
      showTicker = true;
      tickerItems = tomorrowUpcoming.map(matchToTickerItem);
    }
    // else: no future matches → showTicker stays false → ticker is hidden.

    return { featured: featuredMatch, scoreboardMatches: todayMatches, tickerItems, tickerMode, showTicker };
  }, [matchesData]);

  // Loading state — neutral spinner over page bg, matches the rest of the app.
  if (roleLoading || matchesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#060606]">
        <Loader2 className="size-8 animate-spin text-ia-accent" />
      </div>
    );
  }

  return (
    <div className="bg-[#060606] text-zinc-100 min-h-screen -mx-0">
      {/* ─── ① Cinematic hero ─── */}
      <HeroFeaturedMatch match={featured} />

      {/* ─── ② BottomLine ticker — hidden when event has no future matches ─── */}
      {showTicker && <LiveTicker items={tickerItems} mode={tickerMode} />}

      {/* ─── ③ Main body grid ─── */}
      {/* Mobile: stacked single column. lg+: 1fr + 360px fixed right rail. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 px-4 sm:px-7 pt-6 pb-10">
        {/* Left column — scoreboard + headlines */}
        <main className="min-w-0">
          <SectionTitle>SCOREBOARD · TODAY</SectionTitle>
          <div className="flex flex-col gap-2.5 mt-3.5">
            {scoreboardMatches.length > 0 ? (
              scoreboardMatches.map((m) => <ScoreboardRow key={m.id} match={m} />)
            ) : (
              <div className="text-sm text-white/40 px-4 py-6 bg-[#0d0d0d] border border-white/[0.07] rounded-[3px]">
                No matches scheduled for today.
              </div>
            )}
          </div>

          <div className="mt-8">
            <SectionTitle>HEADLINES</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3.5">
              {NEWS.slice(0, 3).map((n) => (
                <NewsCard key={n.id} news={n} />
              ))}
            </div>
          </div>
        </main>

        {/* Right column — standings + spotlight + bracket. Sticky-ish on lg+. */}
        <aside className="min-w-0 flex flex-col gap-4">
          <StandingsWidget />
          <TopPerformerCard />
          <BracketCard />
          {/* Admin-only widget appears at the bottom of the right rail. */}
          {isAdmin && <MatchOpsCard />}
        </aside>
      </div>
    </div>
  );
}
