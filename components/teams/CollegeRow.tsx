"use client";
import React from "react";

export const CollegeRow = ({ data }: { data: any }) => (
  <tr className="hover:bg-[#1A1A1A]/40 transition-colors border-b border-gray-800">
    <td className="py-6 flex items-center gap-4">
      <div className="w-10 h-10 bg-[#A91D3A] rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-[#A91D3A]/20">
        {data.name[0]}
      </div>
      <div>
        <p className="font-bold text-white">{data.name}</p>
        <p className="text-gray-500 text-[10px] uppercase tracking-wider">Est. {data.established}</p>
      </div>
    </td>
    <td className="font-bold text-white">{data.activeTeams}</td>
    <td className="space-x-2">
      {data.sports.map((sport: string) => (
        <span key={sport} className="text-[10px] bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800 text-gray-400">
          {sport}
        </span>
      ))}
    </td>
    <td>
      <span className="text-green-500 text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
        ● {data.status}
      </span>
    </td>
  </tr>
);
