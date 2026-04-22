import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

export const FinalizeMatchModal = ({ match, isOpen, onClose }: { match: any, isOpen: boolean, onClose: () => void }) => {
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const utils = trpc.useContext();
  
  const mutation = trpc.match.finalize.useMutation({
    onSuccess: () => {
      utils.match.getAll.invalidate();
      onClose();
    }
  });

  const handleSubmit = () => {
    mutation.mutate({ id: match.id, homeScore: scores.home, awayScore: scores.away });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Finalize Match: {match.homeTeam} vs {match.awayTeam}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 p-4">
          <input type="number" onChange={(e) => setScores({...scores, home: +e.target.value})} className="bg-zinc-900 p-2" placeholder="Home Score" />
          <input type="number" onChange={(e) => setScores({...scores, away: +e.target.value})} className="bg-zinc-900 p-2" placeholder="Away Score" />
        </div>
        <Button onClick={handleSubmit} className="bg-[#C5A059]">Confirm Results</Button>
      </DialogContent>
    </Dialog>
  );
};
