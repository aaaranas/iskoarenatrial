"use client";

import React from "react";
import LeaderboardPage from "@/components/pages/StatsPage";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

export default function LeaderboardsRoute() {
  const utils = trpc.useUtils();

  // 1. Fetch live stats and players from your routers
    // Correct way to destructure and rename
const { data: players, isLoading: plLoading } = trpc.players.getAll.useQuery();
const { data: teams, isLoading: tmLoading } = trpc.teams.getAll.useQuery();
const { data: stats, isLoading: stLoading } = trpc.stats.getAll.useQuery();

  // 2. Setup Mutations (Replacing DataManager.add/update/delete)
  const addStat = trpc.stats.addStat.useMutation({
    onSuccess: () => utils.stats.getAll.invalidate(),
  });

  const deleteStat = trpc.stats.deleteStat.useMutation({
    onSuccess: () => utils.stats.getAll.invalidate(),
  });

const isActuallyLoading = (plLoading || tmLoading || stLoading) && (!players && !teams && !stats);

if (isActuallyLoading) {
  return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Accessing Ledger...</span>
    </div>
  );
}
  return (
    <div className="flex-1 w-full bg-[#050505]">
      {/* 
        We pass the live tRPC data and mutation handlers 
        directly into your existing StatsPage component.
      */}
      <LeaderboardPage
        stats={stats || []}
        players={players || []}
        onAddStat={(s) => addStat.mutate(s as any)}
        onUpdateStat={(id, s) => { /* call update mutation */ }}
        onDeleteStat={(id) => deleteStat.mutate({ id })}
        onLoadDemoStats={() => utils.stats.getAll.invalidate()}
      />
    </div>
  );
}
