"use client";
import React, { useState } from "react";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";
import { Search, SlidersHorizontal, ArrowDownUp } from "lucide-react"; // Import these

interface BoxProps {
  matches: Match[];
}

export const Box = ({ matches }: BoxProps) => {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 p-8">
      
      {/* STICKY PREMIUM HEADER */}
      <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 bg-zinc-950/80 backdrop-blur-xl px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-black flex items-center gap-6 tracking-tight text-white">
      {/* Increased height to 12 (48px) and width to 2 (8px) */}
      <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" /> 
      LIVE & SCHEDULED GAMES
    </h1>
          <div className="flex gap-4">
            <button className="relative px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
              Schedule Match
            </button>
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-[#A91D3A] to-[#8B1528] hover:from-[#8B1528] hover:to-[#6E1020] text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#A91D3A]/20 transition-all hover:scale-105 active:scale-95">
              + Quick Match
            </button>
          </div>
        </div>
      </header>
      
    

      {/* MATCH GRID */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 mb-8 flex justify-between items-center max-w-[1600px] mx-auto px-8">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          PAGE 1 OF 5
        </p>
        
        <div className="flex gap-2">
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all active:scale-95">
            Previous
          </button>
          
          <div className="flex gap-1 items-center px-1">
            {[1, 2, 3].map((num) => (
              <span 
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all cursor-pointer
                  ${num === 1 ? 'bg-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
              >
                {num}
              </span>
            ))}
          </div>
          
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all active:scale-95">
            Next
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Box;
