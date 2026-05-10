import React, { useState } from "react";
import { Match } from "@/types";
import { MapPin, Clock, Trophy, Target, Activity, Flag } from "lucide-react";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FinalizeMatchModal } from "./FinalizeMatchModal";

export const MatchDetailsView = ({ match }: { match: Match }) => {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const isLive = match.statusType?.toLowerCase() === "live";

  const stats = { possession: [60, 40], shots: [15, 8], fouls: [4, 7] };
  const events = [
    { time: "12'", type: "goal", player: "Juan Dela Cruz", team: "Home" },
    { time: "45'+2", type: "card", player: "Pedro Penduko", team: "Away" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      <VisuallyHidden>
        <SheetTitle>Match Details: {match.homeTeam} vs {match.awayTeam}</SheetTitle>
      </VisuallyHidden>

      {/* 1. Header Section */}
      <div className="p-8 bg-gradient-to-b from-[#111] to-transparent border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#C5A059]">
            <Trophy size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{match.league}</span>
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1.5">
    </div>
    <button
      onClick={() => setFinalizeOpen(true)}
      className="flex items-center gap-1.5 px-3 h-7 bg-[#A91D3A]/10 hover:bg-[#A91D3A] border border-[#A91D3A]/40 hover:border-[#A91D3A] text-[#A91D3A] hover:text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-sm transition-all group"
    >
      <Flag size={10} className="group-hover:animate-pulse" />
      End Match
    </button>
  </div>
          </div>
        </div>
        <h1 className="text-3xl font-black italic uppercase leading-none">
          {match.homeTeam} vs {match.awayTeam}
        </h1>
        <div className="flex gap-4 mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
          <span className="flex items-center gap-1"><MapPin size={12} /> {match.venue}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {match.date}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10">

        {/* 2. Scoreboard Hero */}
        <div className="flex items-center justify-between py-6 border-y border-white/5">
          <div className="text-center w-1/3">
            <div className="text-5xl font-black">{match.homeScore ?? 0}</div>
            <div className="text-[10px] font-bold text-zinc-400 mt-2">{match.homeTeam}</div>
          </div>
          <div className="text-zinc-700 font-black italic text-xl">VS</div>
          <div className="text-center w-1/3">
            <div className="text-5xl font-black">{match.awayScore ?? 0}</div>
            <div className="text-[10px] font-bold text-zinc-400 mt-2">{match.awayTeam}</div>
          </div>
        </div>

        {/* 3. Stats Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
            <Activity size={14} /> Match Statistics
          </h3>
          <div className="space-y-4 bg-white/5 p-4 rounded border border-white/5">
            <StatRow label="Possession" values={stats.possession} />
            <StatRow label="Shots on Target" values={stats.shots} />
            <StatRow label="Fouls" values={stats.fouls} />
          </div>
        </div>

        {/* 4. Timeline Events */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
            <Target size={14} /> Match Events
          </h3>
          <div className="border-l border-white/10 ml-2 space-y-6">
            {events.map((e, i) => (
              <div key={i} className="pl-6 relative">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                <p className="text-xs font-bold text-white">
                  {e.player} <span className="text-zinc-500">({e.type})</span>
                </p>
                <p className="text-[10px] text-zinc-500">{e.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Finalize CTA — only visible when live */}
        {isLive && (
          <div className="border border-[#A91D3A]/20 bg-[#A91D3A]/5 rounded-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Flag size={13} className="text-[#A91D3A]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A91D3A]">
                End This Match
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Confirm the final score to mark this match as concluded and update the standings.
            </p>
            <button
              onClick={() => setFinalizeOpen(true)}
              className="w-full h-10 bg-[#A91D3A] hover:bg-[#A91D3A]/80 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all"
            >
              Confirm Final Score
            </button>
          </div>
        )}
      </div>

      {/* Finalize Modal — rendered outside scroll container to avoid clipping */}
      <FinalizeMatchModal
        match={match}
        isOpen={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
      />
    </div>
  );
};

const StatRow = ({ label, values }: { label: string; values: number[] }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
      <span>{values[0]}%</span>
      <span>{label}</span>
      <span>{values[1]}%</span>
    </div>
    <div className="flex h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div style={{ width: `${values[0]}%` }} className="bg-[#C5A059]" />
      <div style={{ width: `${values[1]}%` }} className="bg-white/20" />
    </div>
  </div>
);
