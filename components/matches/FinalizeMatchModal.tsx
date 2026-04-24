"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Match } from "@/types";

interface FinalizeMatchModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export const FinalizeMatchModal = ({ match, isOpen, onClose }: FinalizeMatchModalProps) => {
  const [homeScore, setHomeScore] = useState<string>(
    match.homeScore != null ? String(match.homeScore) : "0"
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.awayScore != null ? String(match.awayScore) : "0"
  );

  // ✅ trpc.useUtils() — replaces deprecated trpc.useContext() in tRPC v11
  const utils = trpc.useUtils();

  // ✅ trpc.match.updateScore — the correct procedure name (was trpc.match.finalize)
  const mutation = trpc.match.updateScore.useMutation({
    onSuccess: () => {
      toast.success(`Match finalized: ${homeScore} – ${awayScore}`);
      utils.match.getAll.invalidate();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to finalize match. Please try again.");
    },
  });

  const handleSubmit = () => {
    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      toast.error("Please enter valid non-negative scores.");
      return;
    }

    mutation.mutate({ id: match.id, homeScore: home, awayScore: away });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059] font-black uppercase tracking-widest text-sm">
            Finalize Match
          </DialogTitle>
          <p className="text-zinc-400 text-xs pt-1">
            {match.homeTeam} vs {match.awayTeam}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">
              {match.homeTeam}
            </Label>
            <Input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="bg-black border-white/10 text-white text-center text-lg font-black"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">
              {match.awayTeam}
            </Label>
            <Input
              type="number"
              min={0}
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="bg-black border-white/10 text-white text-center text-lg font-black"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-[#C5A059] text-black font-black uppercase text-[10px] hover:bg-[#C5A059]/90"
        >
          {mutation.isPending ? "Finalizing..." : "Confirm Final Score"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
