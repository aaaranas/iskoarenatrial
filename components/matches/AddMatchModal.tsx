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

  // ✅ UUID state only
  const [sportId, setSportId] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [date, setDate] = useState<Date>();

  const utils = trpc.useUtils();

  // ✅ fetch DB data
  const { data: sports = [], isLoading: sportsLoading } =
    trpc.sport.getAll.useQuery();

  const { data: teams = [], isLoading: teamsLoading } =
    trpc.team.getAll.useQuery();

  const { data: venues = [], isLoading: venuesLoading } =
    trpc.venue.getAll.useQuery();

  const addMatch = trpc.match.addMatch.useMutation({
    onSuccess: () => {
      toast.success("Match created successfully!");
      utils.match.getAll.invalidate();
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSportId("");
    setHomeTeamId("");
    setAwayTeamId("");
    setVenueId("");
    setDate(undefined);
  };

  const isLoading = sportsLoading || teamsLoading || venuesLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 HARD GUARD: prevent undefined/empty UUIDs
    if (
      !sportId.trim() ||
      !homeTeamId.trim() ||
      !awayTeamId.trim() ||
      !venueId.trim() ||
      !date
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // 🔥 prevent same team
    if (homeTeamId === awayTeamId) {
      toast.error("Home and Away teams cannot be the same");
      return;
    }

    // 🔥 FINAL safety check (UUID sanity)
	const isValidUUID = (v: string) =>
	    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    if (
      !isValidUUID(sportId) ||
      !isValidUUID(homeTeamId) ||
      !isValidUUID(awayTeamId) ||
      !isValidUUID(venueId)
    ) {
      toast.error("Invalid selection detected (UUID mismatch)");
      return;
    }

    addMatch.mutate({
      sport_id: sportId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      venue_id: venueId,
      match_date: date.toISOString(),
      status: "scheduled",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[700px] bg-[#0A0A0A] border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">

        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50" />

        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black uppercase tracking-[0.1em]">
              Initialize New Entry
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase">
              Enter match details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* SPORT */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-zinc-500">Sport</Label>

              <Select value={sportId} onValueChange={setSportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports?.length ? (
                    sports.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No sports available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* TEAMS */}
            <div className="grid grid-cols-2 gap-6">

              {/* HOME */}
              <div className="space-y-4">
                <Label className="text-xs uppercase text-zinc-500">
                  Home Team
                </Label>

                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.length ? (
                      teams.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No teams available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* AWAY */}
              <div className="space-y-4">
                <Label className="text-xs uppercase text-zinc-500">
                  Away Team
                </Label>

                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.length ? (
                      teams.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No teams available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* DATE */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-zinc-500">
                Match Date
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-3 h-10 border rounded",
                      !date && "text-zinc-500"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </button>
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* VENUE */}
            <div className="space-y-4">
              <Label className="text-xs uppercase text-zinc-500">
                Venue
              </Label>

              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues?.length ? (
                    venues.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No venues available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={addMatch.isPending || isLoading}
                className="bg-[#C5A059] px-6 py-2 text-black font-bold disabled:opacity-50"
              >
                {addMatch.isPending ? "Creating..." : "Create Match"}
              </button>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
