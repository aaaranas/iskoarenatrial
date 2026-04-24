"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

interface AddMatchModalProps {
  children: React.ReactNode;
}

export const AddMatchModal = ({ children }: AddMatchModalProps) => {
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState("");

  // ✅ Load sports, teams, and venues from the DB — no more hardcoded arrays
  const { data: sportsData } = trpc.sport.getAll.useQuery();
  const { data: teamsData } = trpc.teams.getAll.useQuery();

  // Venues aren't in the current router — use a hardcoded fallback until
  // a venueRouter is added. IDs must match actual venue UUIDs in the DB.
  const VENUE_FALLBACK = [
    { id: "venue_1", name: "UP High School Gymnasium" },
    { id: "venue_2", name: "AS Hall" },
    { id: "venue_3", name: "Admin Field" },
    { id: "venue_4", name: "SOM Court" },
    { id: "venue_5", name: "PAH" },
  ];

  const utils = trpc.useUtils();
  const addMatch = trpc.match.addMatch.useMutation({
    onSuccess: () => {
      toast.success("Match created successfully!");
      utils.match.getAll.invalidate();
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create match: " + error.message);
    },
  });

  const resetForm = () => {
    setSport("");
    setHomeTeam("");
    setAwayTeam("");
    setDate(undefined);
    setVenue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sport || !homeTeam || !awayTeam || !date || !venue) {
      toast.error("Please fill in all fields.");
      return;
    }

    // ✅ Guard: prevent the same team being selected for both sides
    if (homeTeam === awayTeam) {
      toast.error("Home and away teams must be different.");
      return;
    }

    addMatch.mutate({
      sport_id: sport,
      home_team_id: homeTeam,
      away_team_id: awayTeam,
      match_date: date.toISOString(),
      venue_id: venue,
      status: "upcoming",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#0A0A0A] border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">

        {/* MODAL HEADER WITH ACCENT STRIP */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50" />

        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-[0.1em]">
                Initialize New Entry
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 font-medium tracking-wide text-xs uppercase">
              Enter the parameters for the upcoming showdown in the compendium.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: CORE DETAILS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sport Discipline</Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT SPORT" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {(sportsData ?? []).map((s: { id: string; name: string }) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Home Team</Label>
                <Select value={homeTeam} onValueChange={setHomeTeam}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT HOME TEAM" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {(teamsData ?? []).map((t: any) => (
                      // ✅ Exclude already-selected away team from home options
                      t.id !== awayTeam && (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SECTION 2: AWAY TEAM */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Away Team</Label>
              <Select value={awayTeam} onValueChange={setAwayTeam}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                  <SelectValue placeholder="SELECT AWAY TEAM" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                  {(teamsData ?? []).map((t: any) => (
                    // ✅ Exclude already-selected home team from away options
                    t.id !== homeTeam && (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SECTION 3: LOGISTICS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Match Schedule</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-4 h-10 bg-zinc-900/50 border border-zinc-800 rounded-md text-[10px] font-bold tracking-widest uppercase text-left transition-all hover:border-zinc-600",
                        !date && "text-zinc-600"
                      )}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-zinc-800" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-[#0A0A0A] text-zinc-300"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Venue / Location</Label>
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT VENUE" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {VENUE_FALLBACK.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMatch.isPending}
                className="px-8 py-2 bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4B475] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)]"
              >
                {addMatch.isPending ? "Creating..." : "Confirm Entry"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AddMatchModalProps {
  children: React.ReactNode;
}

export const AddMatchModal = ({ children }: AddMatchModalProps) => {
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState("");

  const utils = trpc.useUtils();
  const addMatch = trpc.match.addMatch.useMutation({
    onSuccess: () => {
      toast.success("Match created successfully!");
      utils.match.getAll.invalidate();
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create match: " + error.message);
    },
  });

  const resetForm = () => {
    setSport("");
    setHomeTeam("");
    setAwayTeam("");
    setDate(undefined);
    setVenue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sport || !homeTeam || !awayTeam || !date || !venue) {
      toast.error("Please fill in all fields");
      return;
    }

    addMatch.mutate({
      sport_id: sport,
      home_team_id: homeTeam,
      away_team_id: awayTeam,
      match_date: date.toISOString(),
      venue_id: venue,
      status: "upcoming",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#0A0A0A] border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">

        {/* MODAL HEADER WITH ACCENT STRIP */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50" />

        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-[0.1em]">
                Initialize New Entry
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 font-medium tracking-wide text-xs uppercase">
              Enter the parameters for the upcoming showdown in the compendium.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: CORE DETAILS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sport Discipline</Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT SPORT" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {SPORTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Home Team</Label>
                <Select value={homeTeam} onValueChange={setHomeTeam}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT HOME TEAM" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {TEAMS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SECTION 2: AWAY TEAM */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Away Team</Label>
              <Select value={awayTeam} onValueChange={setAwayTeam}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                  <SelectValue placeholder="SELECT AWAY TEAM" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                  {TEAMS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SECTION 3: LOGISTICS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Match Schedule</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-4 h-10 bg-zinc-900/50 border border-zinc-800 rounded-md text-[10px] font-bold tracking-widest uppercase text-left transition-all hover:border-zinc-600",
                        !date && "text-zinc-600"
                      )}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-zinc-800" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-[#0A0A0A] text-zinc-300"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Venue / Location</Label>
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT VENUE" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    {VENUES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMatch.isPending}
                className="px-8 py-2 bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4B475] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)]"
              >
                {addMatch.isPending ? "Creating..." : "Confirm Entry"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
