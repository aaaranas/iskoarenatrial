import React from "react";

export interface MatchUI {
  id: string;
  sport: string;
  matchup: string;
  schedule: string;
  status: "LIVE NOW" | "UPCOMING" | "FINISHED";
  currentScore: string;
}

interface RecentMatchesTableProps {
  matches?: MatchUI[];
}

export const RecentMatchesTable = ({ matches = [] }: RecentMatchesTableProps) => {
  return (
    <section className="bg-transparent animate-in fade-in duration-700 delay-300 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pl-2 pr-1 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-zinc-300 tracking-[0.15em] uppercase">
            Recent Matches
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#1C1C1C] hover:bg-zinc-800 text-zinc-300 px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border border-zinc-700/50">
            Filter
          </button>
          <button className="bg-[#1C1C1C] hover:bg-zinc-800 text-zinc-300 px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors border border-zinc-700/50">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1C1C1C] rounded-xl border border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#181818]">
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Sport</th>
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Matchup</th>
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Schedule</th>
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/5 transition-colors bg-[#222222]">
                    <td className="py-5 px-6 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                      {match.sport}
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-base font-bold text-white tracking-tight leading-tight">{match.matchup}</p>
                    </td>
                    <td className="py-5 px-6 text-sm font-medium text-zinc-400 tracking-wide">
                      {match.schedule}
                    </td>
                    <td className="py-5 px-6">
                      {match.status === "LIVE NOW" ? (
                        <span className="inline-flex items-center gap-2 bg-[#3A1D1A] text-[#FF3300] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#FF3300]/20">
                          <span className="w-2 h-2 bg-[#FF3300] rounded-full animate-pulse"></span>
                          Live Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-zinc-700">
                          {match.status}
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-base font-bold text-white tracking-wide">
                      {match.currentScore}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-zinc-500 font-medium tracking-wide text-sm">
                    No match data available at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};