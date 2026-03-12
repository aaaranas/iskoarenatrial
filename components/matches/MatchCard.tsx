"use client";
import React from "react";
import { Match } from "@/types";

export const MatchCard = ({ match }: { match: Match }) => {
  const isLive = match.statusType === "live";

  return (
    <div className="group relative h-[420px] w-full rounded-[32px] p-[1px] transition-all duration-500 hover:-translate-y-2">
      {/* Background with Ambient Glow */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-zinc-900">
        <img 
          src={`https://picsum.photos/seed/${match.id}/1000/1000`} 
          alt="Stadium" 
          className="h-full w-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black" />
      </div>

      {/* Main Content Container */}
      <div className="relative h-full w-full rounded-[31px] bg-black/20 backdrop-blur-md border border-white/5 p-8 flex flex-col justify-between">
        
        {/* Management Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 bg-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm rounded-[31px]">
          <button className="bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105">Edit Match</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105">Delete</button>
        </div>

        {/* HEADER: League & Status */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{match.league}</span>
            <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">{match.country}</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${isLive ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" : "bg-white/5 border-white/10 text-zinc-400"}`}>
            {isLive ? match.minute : match.status}
          </div>
        </div>

        {/* TEAMS & SCORE */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-4 w-[30%]">
            <div className="h-20 w-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-2xl">
              {match.homeTeamShort}
            </div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center leading-tight">{match.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 text-6xl font-black font-mono text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <span>{match.homeScore ?? "0"}</span>
              <span className="text-zinc-700 font-light text-4xl">:</span>
              <span>{match.awayScore ?? "0"}</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 mt-3 tracking-[0.2em] uppercase">{match.time}</span>
          </div>

          <div className="flex flex-col items-center gap-4 w-[30%]">
            <div className="h-20 w-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-2xl">
              {match.awayTeamShort}
            </div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center leading-tight">{match.awayTeam}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
           <span className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">{match.date}</span>
           <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
              <span className="text-[10px]">⚽</span>
              <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">
                {match.homeScorers.length + match.awayScorers.length} Goals
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};
