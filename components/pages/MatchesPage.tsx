//matchespage

"use client";
import { Box } from "../matches/Box";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.match.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Loading Matches...</span>
      </div>
    );
  }

  return <Box matches={matches || []} />;
}