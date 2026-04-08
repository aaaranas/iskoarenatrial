"use client";
import React from "react";
import type { College } from "@/components/pages/TeamsPage";

interface CollegeRowProps {
  data: College;
  onDelete: (college: College) => void;
}

export const CollegeRow = ({ data, onDelete }: CollegeRowProps) => (
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
      {data.sports.map((sport) => (
        <span
          key={sport}
          className="text-[10px] bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800 text-gray-400"
        >
          {sport}
        </span>
      ))}
    </td>
    <td>
      <span
        className={`text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest ${
          data.status === "Active"
            ? "text-emerald-500"
            : data.status === "Pending"
            ? "text-yellow-500"
            : "text-zinc-500"
        }`}
      >
        ● {data.status}
      </span>
    </td>
    <td>
      <button
        onClick={() => onDelete(data)}
        className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-[#A91D3A] transition-colors"
      >
        Remove
      </button>
    </td>
  </tr>
);