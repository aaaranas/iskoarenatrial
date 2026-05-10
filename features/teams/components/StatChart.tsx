"use client";
import React from "react";

export const StatChart = () => (
  <div className="relative w-40 h-40 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full border-[12px] border-t-[#A91D3A] border-r-[#C5A059] border-b-[#A91D3A]/20 border-l-[#1A1A1A]" />
    <div className="text-center">
      <span className="text-3xl font-black block text-white">124</span>
      <span className="text-gray-500 text-[9px] uppercase tracking-widest">Teams</span>
    </div>
  </div>
);
