"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Match } from "@/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditMatchModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Status values must match the matchStatus zod enum in server/routers/match.ts.
type MatchStatus =
  | "scheduled"
  | "upcoming"
  | "live"
  | "in_progress"
  | "finished"
  | "completed"
  | "cancelled"
  | "postponed";

export const EditMatchModal = ({ match, open, onOpenChange }: EditMatchModalProps) => {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "0");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "0");
  const [status, setStatus] = useState<MatchStatus>((match.statusType as MatchStatus) || "upcoming");
  const [venue, setVenue] = useState(match.venue || "");

  const utils = trpc.useUtils();
  const editMatch = trpc.match.updateMatch.useMutation({
    onSuccess: () => {
      toast.success("Match details updated!");
      utils.match.getAll.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);
    if (Number.isNaN(home) || Number.isNaN(away)) {
      toast.error("Scores must be valid numbers");
      return;
    }
    // venue is collected for future use; updateMatch mutation doesn't persist it yet.
    void venue;
    editMatch.mutate({
      id: match.id,
      home_score: home,
      away_score: away,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#050505] border border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059] font-black uppercase tracking-widest">Edit Match</DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">
            Update score, status, and venue for this match.
          </DialogDescription>
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
            <Select value={status} onValueChange={(v) => setStatus(v as MatchStatus)}>
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
          disabled={editMatch.isPending}
          className="w-full bg-[#C5A059] text-black font-black uppercase text-[10px] py-3 rounded-sm hover:opacity-90 transition-opacity"
        >
          {editMatch.isPending ? "Updating..." : "Save Changes"}
        </button>
      </DialogContent>
    </Dialog>
  );
};
