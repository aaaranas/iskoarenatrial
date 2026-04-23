"use client";
import React from "react";
import { College } from "./CollegeRow";


interface Player {
  name: string;
  sport: string;
  position: string;
  year: string;
  color: string;
}

const PLAYER_DATA: Record<string, Player[]> = {
  "College of Engineering": [
    { name: "Marco Reyes", sport: "Basketball", position: "PG", year: "3rd Year", color: "#A91D3A" },
    { name: "Luis Santos", sport: "Basketball", position: "SF", year: "2nd Year", color: "#C5A059" },
    { name: "Dana Cruz", sport: "Esports", position: "Mid", year: "4th Year", color: "#3b82f6" },
    { name: "Raf Dizon", sport: "Esports", position: "ADC", year: "1st Year", color: "#3b82f6" },
    { name: "Mia Lim", sport: "Basketball", position: "PF", year: "3rd Year", color: "#A91D3A" },
  ],
  "Arts & Sciences": [
    { name: "Cara Mendoza", sport: "Volleyball", position: "Setter", year: "2nd Year", color: "#8b5cf6" },
    { name: "Jana Torres", sport: "Volleyball", position: "Libero", year: "3rd Year", color: "#8b5cf6" },
    { name: "Leo Bautista", sport: "Debate", position: "1st Speaker", year: "4th Year", color: "#C5A059" },
    { name: "Sam Flores", sport: "Debate", position: "2nd Speaker", year: "2nd Year", color: "#C5A059" },
    { name: "Pia Garcia", sport: "Volleyball", position: "OH", year: "1st Year", color: "#8b5cf6" },
  ],
  "Business School": [
    { name: "Rico Tan", sport: "Basketball", position: "SG", year: "3rd Year", color: "#A91D3A" },
    { name: "Bea Ong", sport: "Football", position: "FW", year: "2nd Year", color: "#10b981" },
    { name: "Nino Ramos", sport: "Football", position: "MF", year: "3rd Year", color: "#10b981" },
    { name: "Tia Villanueva", sport: "Basketball", position: "C", year: "1st Year", color: "#A91D3A" },
  ],
  "College of Medicine": [
    { name: "Doc Rivera", sport: "Badminton", position: "Singles", year: "5th Year", color: "#f59e0b" },
    { name: "Ana Soriano", sport: "Tennis", position: "Doubles", year: "4th Year", color: "#3b82f6" },
    { name: "Josh Dela Cruz", sport: "Badminton", position: "Doubles", year: "3rd Year", color: "#f59e0b" },
  ],
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

export function CollegeProfilePage({
  college,
  onBack,
}: {
  college: College;
  onBack: () => void;
}) {
  const players = PLAYER_DATA[college.name] ?? [];

  const sportGroups = college.sports.map((sport) => ({
    name: sport,
    players: players.filter((p) => p.sport === sport),
  }));

  return (
    <div className="flex flex-col min-h-full bg-[#050505]">
      {/* Hero */}
      <div className="bg-[#0a0a0a] border-b border-[#111] px-9 pt-10 pb-8 relative">
        <button
          onClick={onBack}
          className="absolute top-5 left-9 flex items-center gap-1.5 text-[10px] font-bold text-[#444] uppercase tracking-widest hover:text-white transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Colleges
        </button>

        <div className="flex items-center gap-7 mt-6">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0 text-3xl font-black text-[#A91D3A]"
            style={{ fontFamily: "'Anton', sans-serif" }}>
            {college.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2 ${
              college.status === "Active"
                ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/8"
                : college.status === "Pending"
                ? "text-yellow-400 border-yellow-400/25 bg-yellow-400/8"
                : "text-white/20 border-white/10 bg-white/3"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                college.status === "Active" ? "bg-emerald-400"
                : college.status === "Pending" ? "bg-yellow-400"
                : "bg-white/20"
              }`} />
              {college.status}
            </div>
            <h1
              className="text-white text-4xl uppercase leading-none tracking-wide mb-1.5"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {college.name}
            </h1>
            <p className="text-[#444] text-xs tracking-wider">
              Est. {college.established} · Participating since Season 1
            </p>
          </div>

          {/* Stat strip */}
          <div className="flex border border-[#111] rounded-xl overflow-hidden flex-shrink-0">
            {[
              { val: players.length, label: "Players" },
              { val: college.activeTeams, label: "Teams" },
              { val: college.sports.length, label: "Sports" },
              { val: 3, label: "Wins" },
            ].map(({ val, label }, i) => (
              <div key={label} className={`px-6 py-4 bg-[#0f0f0f] text-center ${i < 3 ? "border-r border-[#111]" : ""}`}>
                <div className="text-white text-2xl font-black" style={{ fontFamily: "'Anton', sans-serif" }}>{val}</div>
                <div className="text-[#444] text-[9px] uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Left — Roster */}
        <div className="flex-1 px-9 py-7 border-r border-[#111] min-w-0">
          {/* Sports */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">
            Sports <span className="text-[#A91D3A]">{college.sports.length}</span>
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {sportGroups.map((s) => (
              <div key={s.name} className="bg-[#0a0a0a] border border-[#111] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A91D3A]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#A91D3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-[12px] font-bold">{s.name}</p>
                  <p className="text-[#444] text-[10px] mt-0.5">{s.players.length} players</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#111] mb-6" />

          {/* Roster */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">
            Roster <span className="text-[#A91D3A]">{players.length}</span>
          </p>

          {players.length === 0 ? (
            <p className="text-[#333] text-sm text-center py-12">No players listed.</p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <div
                  key={p.name}
                  className="bg-[#0a0a0a] border border-[#111] hover:border-[#A91D3A]/30 transition-colors rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                    style={{ backgroundColor: `${p.color}18`, color: p.color }}
                  >
                    {initials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-bold truncate">{p.name}</p>
                    <p className="text-[#444] text-[10px] mt-0.5">{p.sport}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#A91D3A] text-[10px] font-black uppercase tracking-widest">{p.position}</p>
                    <p className="text-[#333] text-[10px] mt-0.5">{p.year}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="w-72 px-6 py-7 flex-shrink-0">
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">College Info</p>
          <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden">
            {[
              { key: "Established", val: college.established },
              { key: "Active Teams", val: college.activeTeams },
              { key: "Sports", val: college.sports.length },
              { key: "Total Players", val: players.length },
            ].map(({ key, val }, i) => (
              <div key={key} className={`flex items-center justify-between px-4 py-3 ${i < 3 ? "border-b border-[#0f0f0f]" : ""}`}>
                <span className="text-[10px] text-[#444] font-semibold">{key}</span>
                <span className="text-[11px] text-white font-bold">{val}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#0f0f0f]">
              <span className="text-[10px] text-[#444] font-semibold">Status</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                college.status === "Active"
                  ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/8"
                  : college.status === "Pending"
                  ? "text-yellow-400 border-yellow-400/25 bg-yellow-400/8"
                  : "text-white/20 border-white/10"
              }`}>{college.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}