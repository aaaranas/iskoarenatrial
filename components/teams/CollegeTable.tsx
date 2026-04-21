"use client";
import React from "react";
import { Plus } from "lucide-react";
import { CollegeRow } from "./CollegeRow";
import type { College } from "./CollegeRow";
export type { College } from "./CollegeRow";

export const CollegeTable = ({
  colleges,
  onDelete,
  onAdd,
  onSelect,
}: {
  colleges: College[];
  onDelete?: (college: College) => void;
  onAdd?: () => void;
  onSelect?: (college: College) => void;
}) => (
  <div className="bg-[#111] border border-gray-800 rounded-3xl p-8">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-xl font-bold text-white">Participating Colleges</h3>
      <button onClick={onAdd} className="flex items-center gap-2 bg-[#A91D3A] px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#8B1528] transition-all">
        <Plus className="w-4 h-4" /> Add
      </button>
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
          <th className="pb-4">College Name</th>
          <th className="pb-4">Active Teams</th>
          <th className="pb-4">Primary Sports</th>
          <th className="pb-4">Status</th>
          <th className="pb-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {colleges.map((c, i) => (
          <CollegeRow key={i} data={c} onDelete={onDelete} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  </div>
);