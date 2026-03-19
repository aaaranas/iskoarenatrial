"use client";
import React from "react";
import { AnalyticsCard } from "../teams/AnalyticsCard";
import { CollegeTable } from "../teams/CollegeTable";

const MOCK_COLLEGES = [
  { name: "College of Engineering", established: "1910", activeTeams: 42, sports: ["Basketball", "Esports"], status: "Active" },
  { name: "Arts & Sciences", established: "1908", activeTeams: 35, sports: ["Volleyball", "Debate"], status: "Active" },
  { name: "Business School", established: "1922", activeTeams: 28, sports: ["Basketball", "Football"], status: "Pending" },
  { name: "College of Medicine", established: "1915", activeTeams: 12, sports: ["Badminton", "Tennis"], status: "Active" },
];

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
	
	          <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8  px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-5xl font-black flex items-center gap-6 italic tracking-tight text-white">
      {/* Increased height to 12 (48px) and width to 2 (8px) */}
      <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" /> 
	TEAMS & ORGANIZATIONS
    </h1>
    </div>
    </header>
      <AnalyticsCard />
      <CollegeTable colleges={MOCK_COLLEGES} />
    </div>
  );
}
