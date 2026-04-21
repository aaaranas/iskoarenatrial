"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Match } from "@/types";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export const EditMatchModal = ({ match, open, onOpenChange }: EditMatchModalProps) => {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "0");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "0");
  const [status, setStatus] = useState(match.statusType || "upcoming");
  const [venue, setVenue] = useState(match.venue || "");

  const utils = trpc.useUtils();
  const editMatch = trpc.match.update.useMutation({ // Assuming you have a general update endpoint
    onSuccess: () => {
      toast.success("Match details updated!");
      utils.match.getAll.invalidate();
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    editMatch.mutate({
      id: match.id,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      statusType: status,
      venue: venue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#050505] border border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059] font-black uppercase tracking-widest">Edit Match</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Score Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">{match.homeTeam}</Label>
              <Input type="number" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="bg-black border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">{match.awayTeam}</Label>
              <Input type="number" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="bg-black border-white/10" />
            </div>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Match Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-black border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Venue Update */}
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Venue Location</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="bg-black border-white/10" placeholder="e.g. Blue Pitch" />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={editMatch.isLoading}
          className="w-full bg-[#C5A059] text-black font-black uppercase text-[10px] py-3 rounded-sm hover:opacity-90 transition-opacity"
        >
          {editMatch.isLoading ? "Updating..." : "Save Changes"}
        </button>
      </DialogContent>
    </Dialog>
  );
};
