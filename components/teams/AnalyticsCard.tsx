"use client";
import React from "react";
import { StatChart } from "./StatChart";

export const AnalyticsCard = () => (
  <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 mb-12 flex items-center justify-between shadow-2xl">
    <div className="space-y-6">
      <div>
        <span className="text-[#A91D3A] text-[10px] font-bold uppercase tracking-widest bg-[#A91D3A]/10 px-3 py-1 rounded-full">Live Distribution</span>
        <h2 className="text-3xl font-black mt-3 text-white">Sport Participation</h2>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="border-l-2 border-[#C5A059] pl-4">
          <p className="text-gray-500 text-[10px] uppercase">Top College</p>
          <p className="font-bold text-white">Engineering</p>
        </div>
        <div className="border-l-2 border-[#A91D3A] pl-4">
          <p className="text-gray-500 text-[10px] uppercase">Growth</p>
          <p className="font-bold text-[#A91D3A]">+12.4%</p>
        </div>
      </div>
    </div>
    <StatChart />
  </div>
);
