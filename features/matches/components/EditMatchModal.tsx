"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Match } from "@/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { categoriesForSport, type Category } from "@/lib/constants";

interface EditMatchModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MatchStatus = "upcoming" | "live" | "completed";

export const EditMatchModal = ({ match, open, onOpenChange }: EditMatchModalProps) => {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "0");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "0");
  const [status, setStatus] = useState<MatchStatus>((match.statusType as MatchStatus) || "upcoming");
  const [venueId, setVenueId] = useState(match.venueId || "");
  // Initialise from rawDate so the calendar pre-selects the existing match date.
  const [date, setDate] = useState<Date | undefined>(
    match.rawDate ? new Date(match.rawDate) : undefined
  );
  // Category derives from match.league (sport name). Pre-seed from the row's
  // current value so the dropdown displays the existing category.
  const availableCategories = categoriesForSport(match.league);
  const requiresCategory = availableCategories.length > 0;
  const [category, setCategory] = useState<Category | "">(
    (match.category as Category | null) ?? ""
  );

  const { data: venues = [] } = trpc.venue.getAll.useQuery();

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
    // Block save if the sport requires a category and admin cleared it.
    if (requiresCategory && !category) {
      toast.error("Please select a category for this sport");
      return;
    }

    editMatch.mutate({
      id: match.id,
      home_score: home,
      away_score: away,
      status,
      ...(venueId ? { venue_id: venueId } : {}),
      ...(date ? { match_date: date.toISOString() } : {}),
      // Only send category when the sport supports it. Sports without a
      // categorical division (Frisbee, Soccer, Chess, Esports) preserve NULL.
      ...(requiresCategory ? { category: (category as Category) } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#050505] border border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#C5A059] font-black uppercase tracking-widest">Edit Match</DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">
            Update score, status, venue, and date for this match.
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
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category — shown only when the sport supports categories.
              Sport itself isn't editable in this modal, so the dropdown
              options are fixed for the match's lifetime. */}
          {requiresCategory && (
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">
                Category <span className="text-[#C5A059]">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="bg-black border-white/10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                  {availableCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Match Date */}
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Match Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 h-10 bg-black border border-white/10 rounded-md text-[11px] text-left transition-colors hover:border-white/30",
                    !date && "text-zinc-500"
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-white/10">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Venue Dropdown */}
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Venue Location</Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger className="bg-black border-white/10">
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                {venues.length ? (
                  venues.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No venues available</SelectItem>
                )}
              </SelectContent>
            </Select>
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
