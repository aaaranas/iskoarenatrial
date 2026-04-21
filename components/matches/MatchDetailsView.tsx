import React from "react";
import { Match } from "@/types";
import { MapPin, Clock, Trophy, Target, Shield, Users, Activity } from "lucide-react";

export const MatchDetailsView = ({ match }: { match: Match }) => {
  // Mock data structure - replace these with actual match properties from your DB
  const stats = { possession: [60, 40], shots: [15, 8], fouls: [4, 7] };
  const events = [
    { time: "12'", type: "goal", player: "Juan Dela Cruz", team: "Home" },
    { time: "45'+2", type: "card", player: "Pedro Penduko", team: "Away" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      {/* 1. Header Section */}
      <div className="p-8 bg-gradient-to-b from-[#111] to-transparent border-b border-white/10">
        <div className="flex items-center gap-2 text-[#C5A059] mb-4">
          <Trophy size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{match.league}</span>
        </div>
        <h1 className="text-3xl font-black italic uppercase leading-none">{match.homeTeam} vs {match.awayTeam}</h1>
        <div className="flex gap-4 mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
          <span className="flex items-center gap-1"><MapPin size={12} /> {match.venue}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {match.date}</span>
        </div>
      </div>

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
                <p className="text-xs font-bold text-white">{e.player} <span className="text-zinc-500">({e.type})</span></p>
                <p className="text-[10px] text-zinc-500">{e.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for layout
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
