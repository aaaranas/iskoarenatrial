"use client";
import React from "react";
import { Crown } from "lucide-react";

interface Props {
  name?: string;
  prize?: string;
  logo?: string | null;
}

export const LeaderboardToggleSection = ({
  name = "---",
  prize = "---",
  logo,
}: Props) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Crown badge above */}
      <Crown className="w-5 h-5 text-yellow-400 mb-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

      {/* Logo circle — larger for 1st place */}
      <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-2 border-yellow-400/50 ring-2 ring-yellow-400/30 bg-[#17191d] shadow-2xl transition-transform duration-300 hover:scale-105">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-4xl font-black">
            {name?.[0] ?? "?"}
          </div>
        )}
      </div>

      {/* Name + prize */}
      <div className="text-center">
        <p className="font-bold text-2xl text-white tracking-tight leading-tight">{name}</p>
        <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest mt-0.5">{prize}</p>
      </div>
    </div>
  );
};
