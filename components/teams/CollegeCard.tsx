"use client";
import React from "react";
import { College } from "./CollegeRow";

export function CollegeCard({
  college,
  onViewProfile,
}: {
  college: College;
  onViewProfile: (college: College) => void;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden flex flex-col items-center group hover:border-[#A91D3A]/40 hover:-translate-y-0.5 transition-all duration-200">
      {/* Logo area */}
      <div className="w-full aspect-square bg-[#080808] flex items-center justify-center border-b border-[#111]">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {college.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 text-center w-full">
        <p className="text-white font-bold text-sm leading-snug mb-1">{college.name}</p>
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            college.status === "Active" ? "bg-emerald-400"
            : college.status === "Pending" ? "bg-yellow-400"
            : "bg-white/20"
          }`} />
          <span className="text-[10px] text-[#444] font-semibold uppercase tracking-wider">
            {college.status} · {college.activeTeams} Teams
          </span>
        </div>
        <button
          onClick={() => onViewProfile(college)}
          className="w-full bg-[#111] border border-[#1a1a1a] hover:border-[#333] hover:text-white text-[#555] rounded-md py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1.5"
        >
          <span className="text-[#A91D3A] text-sm leading-none">+</span> View Profile
        </button>
      </div>
    </div>
  );
}