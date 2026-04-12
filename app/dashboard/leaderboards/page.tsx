"use client";
import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import LeaderboardPage from "@/components/pages/StatsPage";

export default function LeaderboardsRoute() {
  const [type, setType] = useState<"players" | "teams">("players");
  const [timeframe, setTimeframe] = useState("Season");

  const { data: stats, isLoading: stLoading } = trpc.stats.getLeaderboard.useQuery({ type, timeframe });
  const { data: players, isLoading: plLoading } = trpc.players.getAll.useQuery();

  const isLoading = (stLoading || plLoading) && (!stats && !players);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Accessing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#050505]">
      <LeaderboardPage
        stats={stats || []}
        players={players || []}
        onAddStat={() => {}}
        onUpdateStat={() => {}}
        onDeleteStat={() => {}}
      />
    </div>
  );
}