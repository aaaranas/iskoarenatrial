"use client";
import React, { useState } from "react";
import type { Match, Result } from "@/types";

interface ResultsPageProps {
  matches: Match[];
  results: Result[];
  onRecordResult: (matchId: string, teamA: string, teamB: string, scoreA: number, scoreB: number, sport: string) => void;
}

export default function ResultsPage({ matches, results, onRecordResult }: ResultsPageProps) {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white text-black";
  const labelCls = "block text-sm font-medium text-black mb-2";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) { alert("Please select a match"); return; }

    const [matchId, teamA, teamB] = selectedMatch.split("|");
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b)) { alert("Please enter valid scores"); return; }

    const match = matches.find((m) => m.id === matchId);
    if (!match) { alert("Match not found"); return; }

    // Use league as sport since Match type no longer has a sport field
    onRecordResult(matchId, teamA, teamB, a, b, match.league);
    setSelectedMatch("");
    setScoreA("");
    setScoreB("");
  };

  const showScores = selectedMatch !== "";

  const latestResults = [...results]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getResultType = (r: Result) => {
    if (r.winner === "Draw") return "draw";
    if (r.scoreA > r.scoreB) return "teamA";
    return "teamB";
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Latest Results */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[#A91D3A] text-lg font-semibold leading-none">Latest Results</h3>
            <p className="text-xs text-gray-400 mt-1">Most recently recorded match outcomes</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
            {results.length} total
          </span>
        </div>

        {latestResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center text-gray-400">
            <p className="text-sm font-medium">No results recorded yet</p>
            <p className="text-xs mt-1 opacity-60">Use the form below to record your first match result.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {latestResults.map((r, idx) => {
              const resultType = getResultType(r);
              return (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0 text-center">{idx + 1}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#A91D3A] bg-[#f9eaed] border border-[#f0c8cf] px-2 py-1 rounded-md w-24 text-center shrink-0 truncate">
                    {r.sport}
                  </span>
                  <div className="flex-1 text-right min-w-0">
                    <p className={`text-sm font-semibold truncate ${resultType === "teamA" ? "text-gray-900" : "text-gray-400"}`}>{r.teamA}</p>
                    {resultType === "teamA" && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Winner</span>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xl font-black tabular-nums w-8 text-center ${resultType === "teamA" ? "text-gray-900" : "text-gray-400"}`}>{r.scoreA}</span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">vs</span>
                    <span className={`text-xl font-black tabular-nums w-8 text-center ${resultType === "teamB" ? "text-gray-900" : "text-gray-400"}`}>{r.scoreB}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${resultType === "teamB" ? "text-gray-900" : "text-gray-400"}`}>{r.teamB}</p>
                    {resultType === "teamB" && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Winner</span>}
                  </div>
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="text-[11px] font-medium text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Result Form */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Select Match & Record Result</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelCls}>Select Match *</label>
              <select className={inputCls} value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} required>
                <option value="">Choose a match</option>
                {matches.map((m) => (
                  <option key={m.id} value={`${m.id}|${m.homeTeam}|${m.awayTeam}`}>
                    {m.league} — {m.homeTeam} vs {m.awayTeam} ({m.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {showScores && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Home Score *</label>
                <input type="number" min="0" className={inputCls} placeholder="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Away Score *</label>
                <input type="number" min="0" className={inputCls} placeholder="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)} required />
              </div>
            </div>
          )}
          {showScores && (
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold transition-all hover:-translate-y-0.5">
              Save Result
            </button>
          )}
        </form>
      </div>

      {/* Results History */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Results History</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E8CDD1]">
                {["Sport", "Home", "Score", "Away", "Date", "Winner"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[#A91D3A] font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 italic py-10">No results recorded yet.</td></tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-sm">{r.sport}</td>
                    <td className="px-3 py-3 text-sm">{r.teamA}</td>
                    <td className="px-3 py-3 text-sm font-bold">{r.scoreA} – {r.scoreB}</td>
                    <td className="px-3 py-3 text-sm">{r.teamB}</td>
                    <td className="px-3 py-3 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${r.winner === "Draw" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-emerald-700"}`}>
                        {r.winner}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}