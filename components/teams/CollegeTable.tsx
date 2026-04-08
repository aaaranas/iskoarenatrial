"use client";
import React from "react";
import { Plus } from "lucide-react";
import { CollegeRow } from "./CollegeRow";
import type { College } from "@/components/pages/TeamsPage"; // adjust path

interface CollegeTableProps {
  colleges: College[];
  onDelete: (college: College) => void;
}

export const CollegeTable = ({ colleges, onDelete }: CollegeTableProps) => (
  <div className="bg-[#111] border border-gray-800 rounded-3xl p-8">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-xl font-bold text-white">Participating Colleges</h3>
      <button className="flex items-center gap-2 bg-[#A91D3A] px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#8B1528] transition-all">
        <Plus className="w-4 h-4" /> Register Team
      </button>
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
          <th className="pb-4">College Name</th>
          <th className="pb-4">Active Teams</th>
          <th className="pb-4">Primary Sports</th>
          <th className="pb-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {colleges.map((c, i) => (
          <CollegeRow key={i} data={c} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  </div>
);