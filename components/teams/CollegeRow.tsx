"use client";
import React from "react";

export const CollegeRow = ({ data, onDelete }: { data: any; onDelete?: (college: any) => void }) => (
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
    <td className="text-right">
      <button
        onClick={() => onDelete?.(data)}
        className="text-white/30 hover:text-[#A91D3A] transition-colors p-2"
        title="Delete team"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </td>
  </tr>
);
