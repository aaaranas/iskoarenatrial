"use client";
import React from "react";
import { Match } from "@/types";
import { CalendarDays, Trophy } from "lucide-react";

export const MatchCard = ({ match }: { match: Match }) => {
  const isLive = match.statusType === "live";

  return (
    <div className="group relative h-[420px] w-full rounded-[24px] bg-[#0A0A0A] border border-white/[0.05] p-[1px] transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#A91D3A]/10">
      
      {/* Management Overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 bg-[#0A0A0A]/90 opacity-0 group-hover:opacity-100 backdrop-blur-md transition-all duration-300 rounded-[23px]">
        <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 border border-white/10">
          Edit Match
        </button>
        <button className="bg-[#A91D3A] hover:bg-[#8B1528] text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-105">
          Delete
        </button>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 rounded-[23px] overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${match.id}/1000/1000`} 
          alt="Stadium" 
          className="h-full w-full object-cover opacity-[0.08] group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/70 to-black/30" />
      </div>

      <div className="relative h-full w-full p-8 flex flex-col justify-between">
        
        {/* HEADER: League Info */}
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.25em]">{match.league}</p>
            <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-[0.15em]">{match.country}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${isLive ? "bg-[#A91D3A]/20 border-[#A91D3A] text-[#A91D3A] animate-pulse" : "bg-white/5 border-white/5 text-zinc-600"}`}>
            {isLive ? "LIVE" : match.status}
          </div>
        </div>

        {/* TEAMS & SCORE - Tabular Numerals used for professional look */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col items-center gap-4 w-[35%]">
            <div className="h-16 w-16 rounded-full bg-[#111] border border-white/[0.05] flex items-center justify-center font-black text-xl text-white shadow-inner">
              {match.homeTeamShort}
            </div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center">{match.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 text-5xl font-black text-white tabular-nums tracking-tighter">
              <span>{match.homeScore ?? "0"}</span>
              <span className="text-zinc-800 font-light text-3xl opacity-50">/</span>
              <span>{match.awayScore ?? "0"}</span>
            </div>
            {isLive && <span className="text-[10px] font-bold text-[#A91D3A] mt-2 tracking-[0.2em] uppercase">{match.minute}'</span>}
          </div>

          <div className="flex flex-col items-center gap-4 w-[35%]">
            <div className="h-16 w-16 rounded-full bg-[#111] border border-white/[0.05] flex items-center justify-center font-black text-xl text-white shadow-inner">
              {match.awayTeamShort}
            </div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-center">{match.awayTeam}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-6 border-t border-white/[0.05] flex justify-between items-center text-zinc-600">
           <div className="flex items-center gap-2 text-[8px] uppercase font-bold tracking-[0.2em]">
             <CalendarDays className="w-3 h-3" /> {match.date}
           </div>
           <div className="flex items-center gap-2 text-[8px] uppercase font-bold tracking-[0.2em]">
             <Trophy className="w-3 h-3" /> 
             {match.homeScorers.length + match.awayScorers.length} GOALS
           </div>
        </div>
      </div>
    </div>
  );
};
