"use client";

import React, { useState, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Podium } from "../leaderboards/Podium";
import { LeaderboardTable } from "../leaderboards/LeaderboardTable";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, ArrowRight, Layers, Activity, Users, Shield, Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc";

interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number;
}

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");
  const [timeframe, setTimeframe] = useState<string>("Season");
  const [searchQuery, setSearchQuery] = useState("");
  
  // ── DATA FETCHING — only use procedures that exist in the routers ──
  const { data: players, isLoading: plLoading } = trpc.players.getAll.useQuery();
  const { data: teams,   isLoading: tmLoading } = trpc.teams.getAll.useQuery();
  const { data: stats,   isLoading: stLoading } = trpc.stats.getLeaderboard.useQuery({
    type: viewMode,
    timeframe,
  });

  // ── DATA TRANSFORMATION ──
  const topPerformers = useMemo((): Performer[] => {
    if (!teams) return [];
    return (teams as any[]).slice(0, 3).map((team, index) => ({
      id: team.id,
      name: team.name,
      prize: `${1000 - index * 100} PTS`,
      rank: index + 1,
      value: 1000 - index * 100,
    }));
  }, [teams]);

  const mappedPlayers = useMemo(() => {
    if (!players) return [];
    return players
      .filter(p => (p as any).name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((p: any, i) => ({
        rank: i + 1,
        name: p.name,
        username: `@${p.college?.toLowerCase() ?? "unknown"}`,
        points: "2,400",
      }));
  }, [players, searchQuery]);

  const mappedTeams = useMemo(() => {
    if (!teams) return [];
    return teams
      .filter(t => (t as any).name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((t: any, i) => ({
        rank: i + 1,
        name: t.name,
        username: `@${t.org?.toLowerCase() ?? "unknown"}`,
        points: "12,400",
      }));
  }, [teams, searchQuery]);

  const { scrollY } = useScroll();
  const athleteOneY  = useTransform(scrollY, [0, 1000], [0, -180]);
  const ghostTextX   = useTransform(scrollY, [0, 1000], [0, 120]);

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

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 lg:px-20 pt-24">
        
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-56">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-10">
              <span className="w-12 h-[1px] bg-[#A91D3A]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A91D3A]">Official Standings</span>
            </motion.div>
            <h1 className="text-8xl lg:text-[11.5rem] font-black leading-[0.72] tracking-tighter uppercase italic mb-14">
              Beyond <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)" }}>Limits</span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <p className="text-xl font-medium italic text-zinc-400 border-l-2 border-[#C5A059] pl-8 leading-relaxed">
                  "The arena only recognizes performance as its universal currency."
                </p>
                <p className="text-[12px] text-zinc-500 tracking-[0.25em]">
                  Quantifying campus dominance across every bracket. An archive of collegiate legacy and individual brilliance.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-[600px] lg:h-auto">
            <motion.div style={{ y: athleteOneY }} className="absolute top-0 right-0 w-72 lg:w-80 aspect-[3/4] bg-zinc-900 border border-white/10 p-2 shadow-2xl z-20">
              <img src="/iskolarofrisbee2.jpg" className="w-full h-full object-cover grayscale brightness-75" />
              <div className="absolute -bottom-6 -left-8 bg-[#C5A059] text-black px-5 py-3 text-[10px] font-black uppercase italic tracking-widest shadow-2xl">
                FEATURED / ISKOLARO 2026
              </div>
            </motion.div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-12 border-y border-white/5 mb-40 sticky top-0 bg-[#050505]/95 backdrop-blur-2xl z-30">
          <div className="flex items-center gap-12">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white outline-none">
                <Layers className="w-4 h-4 text-[#A91D3A]" /> TIMEFRAME: {timeframe}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border border-zinc-800 text-white rounded-none">
                {["Weekly", "Monthly", "Season"].map(t => (
                  <DropdownMenuItem key={t} onClick={() => setTimeframe(t)} className="text-[10px] font-black uppercase tracking-widest hover:bg-[#A91D3A]">
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-hover:text-[#C5A059] transition-all" />
              <input
                type="text"
                placeholder="QUERY LEDGER..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none pl-10 text-xs font-black tracking-widest uppercase focus:outline-none w-48 focus:w-72 border-b border-transparent focus:border-[#A91D3A] transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-72 pb-72">

          {/* Podium */}
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

          {/* Standings */}
          <section>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
              <h3 className="text-9xl font-black uppercase italic tracking-tighter">Standings</h3>
              <div className="flex bg-[#0A0A0A] p-1.5 border border-white/5">
                <button onClick={() => setViewMode("players")} className={`px-14 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === "players" ? "bg-[#A91D3A] text-white" : "text-zinc-600"}`}>
                  Players
                </button>
                <button onClick={() => setViewMode("teams")} className={`px-14 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === "teams" ? "bg-[#A91D3A] text-white" : "text-zinc-600"}`}>
                  Teams
                </button>
              </div>
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