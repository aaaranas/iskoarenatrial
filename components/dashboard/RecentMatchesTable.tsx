// src/components/dashboard/RecentMatchesTable.tsx
import React from "react";

export interface MatchUI {
  id: string;
  sport: string;
  matchup: string;
  location: string;
  schedule: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
}

interface RecentMatchesTableProps {
  matches?: MatchUI[];
}

export const RecentMatchesTable = ({ matches = [] }: RecentMatchesTableProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "LIVE": return "bg-primary/30 text-red-400 border-primary/40";
      case "UPCOMING": return "bg-secondary/20 text-secondary border-secondary/30";
      default: return "bg-white/5 text-on-surface-variant border-white/10";
    }
  };

  return (
    <section className="bg-black/20 glass-panel rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-8 py-6 flex justify-between items-center bg-white/5 border-b border-white/5">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-wider uppercase font-maroons">RECENT MATCHES</h3>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
            Real-time status of current and past matchups
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-primary/30 uppercase tracking-tighter">
          View Schedule
          <span className="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2 px-8 pb-6">
          <thead>
            <tr className="text-on-surface-variant">
              <th className="pb-3 pt-6 px-4 text-[10px] font-bold uppercase tracking-[0.15em]">SPORT</th>
              <th className="pb-3 pt-6 px-4 text-[10px] font-bold uppercase tracking-[0.15em]">MATCHUP</th>
              <th className="pb-3 pt-6 px-4 text-[10px] font-bold uppercase tracking-[0.15em]">SCHEDULE</th>
              <th className="pb-3 pt-6 px-4 text-[10px] font-bold uppercase tracking-[0.15em]">STATUS</th>
              <th className="pb-3 pt-6 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {matches.length > 0 ? (
              matches.map((match) => (
                <tr key={match.id} className="group hover:bg-white/5 transition-all rounded-xl">
                  <td className="py-5 px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">sports_esports</span>
                      <span className="text-sm font-bold text-white uppercase">{match.sport}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-sm font-bold text-white uppercase">{match.matchup}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase opacity-70">{match.location}</p>
                  </td>
                  <td className="py-5 px-4 text-sm font-bold text-on-surface uppercase tracking-tight">
                    {match.schedule}
                  </td>
                  <td className="py-5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border shadow-sm ${getStatusStyle(match.status)}`}>
                      {match.status === "LIVE" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                      {match.status}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-on-surface-variant font-bold uppercase opacity-50">
                  No matches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};