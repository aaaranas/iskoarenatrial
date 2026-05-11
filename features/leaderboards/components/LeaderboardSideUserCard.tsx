"use client";
import React from "react";
import { Gem, Trophy } from "lucide-react";

export const LeaderboardSideUserCardSection = ({ name = "Brian Ngo", prize = "50,000" }) => {
  return (
    <div className="flex flex-col w-[117px] items-center gap-8">
      {/* User avatar and name */}
      <div className="inline-flex flex-col items-center gap-[11px] relative">
        <div className="w-[114px] h-[114px] bg-gray-800 rounded-full object-cover" />
        <div className="font-semibold text-2xl text-white tracking-tight">
          {name}
        </div>
      </div>

    </div>
  );
};
