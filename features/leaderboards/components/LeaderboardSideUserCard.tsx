"use client";
import React from "react";

interface Props {
  name?: string;
  prize?: string;
  logo?: string | null;
  rank?: 2 | 3;
}

const RING_COLOR = {
  2: "ring-zinc-300/50 border-zinc-300/30",
  3: "ring-amber-700/50 border-amber-700/30",
} as const;

export const LeaderboardSideUserCardSection = ({
  name = "---",
  prize = "---",
  logo,
  rank = 2,
}: Props) => {
  const ringClass = RING_COLOR[rank];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo circle */}
      <div className={`w-[114px] h-[114px] rounded-full overflow-hidden border-2 ${ringClass} ring-2 bg-[#17191d] shadow-xl transition-transform duration-300 hover:scale-105`}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-3xl font-black">
            {name?.[0] ?? "?"}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-semibold text-xl text-white tracking-tight leading-tight">{name}</p>
        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mt-0.5">{prize}</p>
      </div>
    </div>
  );
};
