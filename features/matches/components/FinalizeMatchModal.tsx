"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Match } from "@/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

interface FinalizeMatchModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export const FinalizeMatchModal = ({ match, isOpen, onClose }: FinalizeMatchModalProps) => {
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const utils = trpc.useUtils();

  // Calls updateScore — the single procedure for recording a final score.
  // Previously called trpc.match.finalize which didn't exist; corrected to
  // the existing updateScore procedure which is identical in behaviour.
  const mutation = trpc.match.updateScore.useMutation({
    onSuccess: () => {
      toast.success("Match finalized!");
      utils.match.getAll.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to finalize: " + error.message);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ id: match.id, homeScore, awayScore });
  };

  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="bg-[#050505] border border-white/10 text-white max-w-md p-0 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#A91D3A]/30 via-[#050505] to-[#050505] px-6 pt-6 pb-4 border-b border-white/5">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C5A059]">
                  End of Match
                </span>
              </div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-white">
                Confirm Final Score
              </DialogTitle>
              <DialogDescription className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                {match.league} · {match.venue}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Score Inputs */}
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

              {/* Home */}
              <div className="flex flex-col items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${homeWins ? "text-[#C5A059]" : "text-zinc-500"}`}>
                  {match.homeTeam}
                </span>
                <div className="relative w-full">
                  <input
                    type="number"
                    min={0}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full text-center text-4xl font-black bg-zinc-900/60 border rounded-sm py-3 px-2 focus:outline-none transition-all tabular-nums ${
                      homeWins
                        ? "border-[#C5A059]/50 text-[#C5A059] focus:border-[#C5A059]"
                        : "border-white/10 text-white focus:border-white/30"
                    }`}
                  />
                  {homeWins && (
                    <span className="absolute -top-2 -right-2 text-[8px] font-black uppercase tracking-wider bg-[#C5A059] text-black px-1.5 py-0.5 rounded-[2px]">
                      WIN
                    </span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center gap-1 pb-1">
                <span className="text-2xl font-thin text-zinc-700">—</span>
                {isDraw && (
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">
                    Draw
                  </span>
                )}
              </div>

              {/* Away */}
              <div className="flex flex-col items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight transition-colors ${awayWins ? "text-[#C5A059]" : "text-zinc-500"}`}>
                  {match.awayTeam}
                </span>
                <div className="relative w-full">
                  <input
                    type="number"
                    min={0}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full text-center text-4xl font-black bg-zinc-900/60 border rounded-sm py-3 px-2 focus:outline-none transition-all tabular-nums ${
                      awayWins
                        ? "border-[#C5A059]/50 text-[#C5A059] focus:border-[#C5A059]"
                        : "border-white/10 text-white focus:border-white/30"
                    }`}
                  />
                  {awayWins && (
                    <span className="absolute -top-2 -right-2 text-[8px] font-black uppercase tracking-wider bg-[#C5A059] text-black px-1.5 py-0.5 rounded-[2px]">
                      WIN
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Result Summary */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-sm px-4 py-3 text-center">
              {isDraw ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Match ends in a <span className="text-white">Draw</span>
                </p>
              ) : (
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="text-[#C5A059]">
                    {homeWins ? match.homeTeam : match.awayTeam}
                  </span>{" "}
                  wins the match
                </p>
              )}
            </div>

            <p className="text-[9px] text-zinc-600 uppercase tracking-widest text-center font-bold">
              ⚠ This will mark the match as concluded. This cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex gap-3 px-6 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex-1 h-10 bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
              disabled={mutation.isPending}
              className="flex-1 h-10 bg-[#A91D3A] hover:bg-[#A91D3A]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all"
            >
              {mutation.isPending ? "Finalizing..." : "Confirm & End Match"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};