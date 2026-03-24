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

    onRecordResult(matchId, teamA, teamB, a, b, match.sport);
    setSelectedMatch("");
    setScoreA("");
    setScoreB("");
  };

  const showScores = selectedMatch !== "";

  // Latest 5 results sorted by most recent
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

      {/* ── Latest Match Results ── */}
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
            <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6h6v6M12 3v2m0 14v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <p className="text-sm font-medium">No results recorded yet</p>
            <p className="text-xs mt-1 opacity-60">Use the form below to record your first match result.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {latestResults.map((r, idx) => {
              const resultType = getResultType(r);
              return (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">

                  {/* Index */}
                  <span className="text-[11px] font-bold text-gray-300 w-4 shrink-0 text-center">{idx + 1}</span>

                  {/* Sport badge */}
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#A91D3A] bg-[#f9eaed] border border-[#f0c8cf] px-2 py-1 rounded-md w-24 text-center shrink-0 truncate">
                    {r.sport}
                  </span>

                  {/* Team A */}
                  <div className="flex-1 text-right min-w-0">
                    <p className={`text-sm font-semibold truncate ${resultType === "teamA" ? "text-gray-900" : "text-gray-400"}`}>
                      {r.teamA}
                    </p>
                    {resultType === "teamA" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Winner</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xl font-black tabular-nums w-8 text-center ${resultType === "teamA" ? "text-gray-900" : "text-gray-400"}`}>
                      {r.scoreA}
                    </span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">vs</span>
                      {resultType === "draw" && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-yellow-500 leading-none">Draw</span>
                      )}
                    </div>
                    <span className={`text-xl font-black tabular-nums w-8 text-center ${resultType === "teamB" ? "text-gray-900" : "text-gray-400"}`}>
                      {r.scoreB}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${resultType === "teamB" ? "text-gray-900" : "text-gray-400"}`}>
                      {r.teamB}
                    </p>
                    {resultType === "teamB" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Winner</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="text-[11px] font-medium text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {new Date(r.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Record Result Form ── */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Select Match & Record Result</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelCls}>Select Match *</label>
              <select className={inputCls} value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} required>
                <option value="">Choose a match</option>
                {matches.map((m) => (
                  <option key={m.id} value={`${m.id}|${m.teamA}|${m.teamB}`}>
                    {m.sport} - {m.teamA} vs {m.teamB} ({m.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showScores && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className={labelCls}>Team A Score *</label>
                <input type="number" min="0" className={inputCls} placeholder="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Team B Score *</label>
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

      {/* ── Results History ── */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Results History</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E8CDD1]">
                {["Sport", "Team A", "Score A", "Score B", "Team B", "Date", "Winner"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[#A91D3A] font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 italic py-10">No results recorded yet.</td></tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-sm">{r.sport}</td>
                    <td className="px-3 py-3 text-sm">{r.teamA}</td>
                    <td className="px-3 py-3 text-sm font-bold">{r.scoreA}</td>
                    <td className="px-3 py-3 text-sm font-bold">{r.scoreB}</td>
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