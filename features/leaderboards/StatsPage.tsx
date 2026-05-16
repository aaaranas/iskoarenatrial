"use client";

import { useState, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, ArrowRight, Layers, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Podium } from "./components/Podium";
import { LeaderboardTable } from "./components/LeaderboardTable";

// ── College logo mapping — keyed by org abbreviation (matches teams DB field) ─
const COLLEGE_LOGO_MAP: Record<string, string> = {
  COS:  "/colleges/cos_logo.jpg",
  CSS:  "/colleges/css_logo.jpg",
  CCAD: "/colleges/ccad_logo.jpg",
  SOM:  "/colleges/som_logo.jpg",
};

function collegeLogo(org: string | null | undefined): string | null {
  if (!org) return null;
  return COLLEGE_LOGO_MAP[org] ?? null;
}

interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number;
  sport: string;
  category: string;
  logo?: string | null;
}

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");
  const [timeframe, setTimeframe] = useState<string>("Season");
  const [searchQuery, setSearchQuery] = useState("");

  // ── DATA FETCHING ──
  const { data: players, isLoading: plLoading } = trpc.players.getAll.useQuery();
  const { data: teams,   isLoading: tmLoading } = trpc.team.getAll.useQuery();
  const { data: stats,   isLoading: stLoading } = trpc.stats.getLeaderboard.useQuery({
    type: viewMode,
    timeframe,
  });

  // ── team_id → team lookup (for players who only have team_id) ──
  const teamMap = useMemo(() => {
    if (!teams) return new Map<string, any>();
    return new Map((teams as any[]).map(t => [t.id, t]));
  }, [teams]);

  // ── DATA TRANSFORMATION ──
  const topPerformers = useMemo((): Performer[] => {
    if (!teams) return [];
    return (teams as any[]).slice(0, 3).map((team, index) => ({
      id:       team.id,
      name:     team.college ?? team.name,   // full college name e.g. "COS Scions"
      prize:    `${1000 - index * 100} PTS`,
      rank:     index + 1,
      value:    1000 - index * 100,
      sport:    team.sport ?? "—",
      category: team.org   ?? "—",           // org abbreviation
      logo:     collegeLogo(team.org),        // keyed by org
    }));
  }, [teams]);

  const mappedPlayers = useMemo(() => {
    if (!players) return [];
    return players
      .filter((p: any) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((p: any, i) => {
        const team    = teamMap.get(p.team_id);
        const org     = team?.org     ?? null;
        const college = team?.college ?? null;
        return {
          id:       p.id,
          rank:     i + 1,
          name:     p.name,
          college,                            // full name for display
          logo:     collegeLogo(org),         // keyed by org abbreviation
          username: org ? `@${org.toLowerCase()}` : "@unknown",
          points:   "2,400",
        };
      });
  }, [players, teamMap, searchQuery]);

  const mappedTeams = useMemo(() => {
    if (!teams) return [];
    return (teams as any[])
      .filter((t: any) => t.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((t: any, i: number) => ({
        id:       t.id,
        rank:     i + 1,
        name:     t.college ?? t.name,        // full college name for display
        college:  t.college ?? null,
        logo:     collegeLogo(t.org),          // keyed by org abbreviation
        username: t.org ? `@${t.org.toLowerCase()}` : "@unknown",
        points:   "12,400",
      }));
  }, [teams, searchQuery]);

  const { scrollY } = useScroll();
  const ghostTextX = useTransform(scrollY, [0, 1000], [0, 120]);

  if (plLoading || tmLoading || stLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Syncing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="relative bg-[#050505] min-h-screen text-zinc-100 w-full overflow-x-hidden font-sans selection:bg-[#A91D3A]">

      {/* Background */}
      <div className="fixed top-0 right-0 w-[50%] h-screen z-0 opacity-25 grayscale brightness-[0.3]">
        <div className="absolute inset-0 bg-[url('/iskolarosocer.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 lg:px-20 pt-32">

        {/* Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          />
          <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter mb-6">
            Leaderboard
          </h1>
          <p className="max-w-xl text-zinc-500 text-xs font-medium tracking-[0.2em] uppercase">
            Quantifying campus dominance across every bracket.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center py-6 mb-32 sticky top-24 z-30">
          <div className="bg-[#0f0f0f] border border-white/10 shadow-2xl p-4 flex items-center gap-16 backdrop-blur-md">

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-[#C5A059] outline-none transition-colors px-4">
                <Layers className="w-3.5 h-3.5 text-[#A91D3A]" />
                {timeframe}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border border-white/10 text-white rounded-none">
                {["Weekly", "Monthly", "Season"].map(t => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className="text-[10px] font-black uppercase tracking-widest hover:bg-[#A91D3A] focus:bg-[#A91D3A]"
                  >
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-[1px] h-6 bg-white/10" />

            <div className="relative group px-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-hover:text-[#C5A059] transition-colors" />
              <input
                type="text"
                placeholder="QUERY LEDGER..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none pl-10 text-[10px] font-black tracking-widest uppercase focus:outline-none w-48 text-white placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-72 pb-72">
          <section className="relative">
            <motion.div style={{ x: ghostTextX }} className="absolute -top-32 left-0 text-[18rem] font-black text-white/[0.012] select-none pointer-events-none uppercase italic">
              Summit
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end">
              <div className="lg:col-span-3 pb-16">
                <h3 className="text-7xl font-black uppercase italic tracking-tighter leading-[0.85] mb-10">Elite <br /> Tier</h3>
                <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] group">
                  View More <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
              <motion.div className="lg:col-span-9 bg-[#080808] border border-white/5 p-12 relative shadow-2xl">
                <Podium performers={topPerformers} />
              </motion.div>
            </div>
          </section>

          <section>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
              <h3 className="text-9xl font-black uppercase italic tracking-tighter">Standings</h3>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl"
              >
                <LeaderboardTable
                  players={viewMode === "players" ? mappedPlayers : []}
                  teams={viewMode === "teams" ? mappedTeams : []}
                />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
