"use client";

import React from "react";
import type { Stat, Player } from "@/types";

interface StatsPageProps {
  stats: Stat[];
  players: Player[];
  onAddStat: (stat: Omit<Stat, "id" | "createdAt">) => void;
  onUpdateStat: (id: string, stat: Partial<Omit<Stat, "id" | "createdAt">>) => void;
  onDeleteStat: (id: string) => void;
  onLoadDemoStats: () => void;
}

export default function StatsPage({
  stats,
  players,
  onAddStat,
  onUpdateStat,
  onDeleteStat,
  onLoadDemoStats,
}: StatsPageProps) {
  // ── Replace with your actual StatsPage UI ────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Stats</h2>
        <button
          onClick={onLoadDemoStats}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-md transition-colors"
        >
          Load Demo Stats
        </button>
      </div>

      {stats.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">No stats recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Player / Team</th>
                <th className="py-3 pr-4">Sport</th>
                <th className="py-3 pr-4">Stat</th>
                <th className="py-3 pr-4">Value</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => {
                const player = players.find((p) => p.id === stat.playerId);
                return (
                  <tr key={stat.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="py-3 pr-4 font-medium">
                      {player ? player.name : stat.college}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{stat.sport}</td>
                    <td className="py-3 pr-4">{stat.statName}</td>
                    <td className="py-3 pr-4">{stat.statValue}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onDeleteStat(stat.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}