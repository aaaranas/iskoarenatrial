"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Match } from "@/types";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface EditMatchModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditMatchModal = ({ match, open, onOpenChange }: EditMatchModalProps) => {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "0");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "0");

  const utils = trpc.useUtils();
  const editMatch = trpc.match.updateScore.useMutation({
    onSuccess: () => {
      toast.success("Score updated!");
      utils.match.getAll.invalidate();
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    editMatch.mutate({
      id: match.id,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059] font-black uppercase tracking-widest">Update Match Scores</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">{match.homeTeam} Score</Label>
            <Input value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="bg-zinc-900 border-zinc-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">{match.awayTeam} Score</Label>
            <Input value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="bg-zinc-900 border-zinc-800" />
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="w-full bg-[#C5A059] text-black font-black uppercase text-[10px] py-2 rounded-sm hover:bg-[#D4B475]"
        >
          Confirm Update
        </button>
      </DialogContent>
    </Dialog>
  );
};
