import React from "react";
import { User } from "lucide-react";

export const LeaderboardPodium = () => {
  return (
    <section className="space-y-8 animate-in fade-in duration-700 delay-150 pt-4">
      <h3 className="text-lg font-bold text-zinc-400 tracking-[0.15em] uppercase text-center md:text-left ml-2">
        Current Leaderboard Podium
      </h3>

      <div className="flex items-end justify-center gap-6 h-[340px]">
        {/* 2nd Place */}
        <div className="relative bg-[#1E1E1E] w-64 rounded-xl p-6 pt-14 flex flex-col items-center justify-between border border-white/5 h-[230px]">
          <div className="absolute -top-10 flex items-center justify-center size-20 rounded-full bg-[#181818] border border-white/10 p-1 shadow-lg">
            <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
               <User className="size-8 text-zinc-400" />
            </div>
          </div>
          <div className="text-center space-y-1.5 mt-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">ARTSCOMM PHOENIX</p>
          </div>
          <div className="text-center mt-2">
            <p className="text-4xl font-black text-zinc-300 leading-none">2,840</p>
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mt-1.5">TOTAL POINTS</p>
          </div>
          <div className="bg-zinc-800 px-5 py-1.5 rounded-full text-xs font-black text-zinc-400 mt-3">
            02
          </div>
        </div>

        {/* 1st Place */}
        <div className="relative bg-[#2A2A2A] w-72 rounded-t-xl rounded-b-lg p-6 pt-16 flex flex-col items-center justify-between border border-white/10 h-[300px] shadow-2xl">
          <div className="absolute -top-12 flex items-center justify-center size-24 rounded-full bg-[#FF3300] p-0.5 shadow-xl shadow-[#FF3300]/20">
            <div className="w-full h-full bg-zinc-800 rounded-full border-4 border-[#2A2A2A] flex items-center justify-center overflow-hidden">
              <User className="size-10 text-white" />
            </div>
          </div>
          <div className="absolute top-10 bg-[#FF3300] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            CURRENTLY LEADING
          </div>
          <div className="text-center space-y-1.5 mt-7">
            <p className="text-xs font-semibold text-[#FF3300] uppercase tracking-widest">COS SCIONS</p>
          </div>
          <div className="text-center mt-2">
            <p className="text-6xl font-black text-white tracking-tighter leading-none">3,120</p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-2">TOTAL POINTS</p>
          </div>
          <div className="bg-[#FF3300] px-7 py-2 rounded-full text-sm font-black italic text-white mt-5 shadow-lg shadow-[#FF3300]/30">
            01
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF3300] to-transparent"></div>
        </div>

        {/* 3rd Place */}
        <div className="relative bg-[#1E1E1E] w-64 rounded-xl p-6 pt-14 flex flex-col items-center justify-between border border-white/5 h-[230px]">
          <div className="absolute -top-10 flex items-center justify-center size-20 rounded-full bg-[#181818] border border-[#FF3300]/40 p-1 shadow-lg">
            <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
               <User className="size-8 text-zinc-400" />
            </div>
          </div>
          <div className="text-center space-y-1.5 mt-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">CSS STALLIONS</p>
          </div>
          <div className="text-center mt-2">
            <p className="text-4xl font-black text-[#D67C52] leading-none">2,410</p>
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mt-1.5">TOTAL POINTS</p>
          </div>
          <div className="bg-[#3D251A] px-5 py-1.5 rounded-full text-xs font-black text-[#D67C52] mt-3">
            03
          </div>
        </div>
      </div>
    </section>
  );
};