"use client";
import React from "react";
import { Diamond, Trophy } from "lucide-react";

export const LeaderboardToggleSection = ({ name = "Jolie Joie", prize = "100,000" }) => {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Profile section */}
      <div className="flex flex-col items-center gap-[11px]">
        <div className="w-[140px] h-[140px] bg-gray-700 rounded-full object-cover" />
        <div className="font-semibold text-white text-2xl tracking-tight">
          {name}
        </div>
      </div>

    </div>
  );
};
