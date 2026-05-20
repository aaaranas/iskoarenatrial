// Admin-only "Set Top Performer" modal.
//
// Triggered from the pencil icon on TopPerformerCard. Admin picks a player,
// writes an optional label (default 'TOP PERFORMER'), and fills up to 4
// stat-label + value pairs. Save creates a new featured_players row — older
// rows stay in the table as history but no longer drive the dashboard.
"use client";

import { useState, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FeaturedPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional pre-fill values when editing an existing entry (forwards UX —
  // creates a NEW row using these as starting values).
  initial?: {
    playerId?: string;
    label?: string;
    stats?: { label: string; value: number }[];
  };
}

export function FeaturedPlayerModal({ open, onOpenChange, initial }: FeaturedPlayerModalProps) {
  const utils = trpc.useUtils();

  // Form state. Each stat is a label + numeric string pair (numeric string so
  // the input field can hold partial typing like "0." mid-edit).
  const [playerId, setPlayerId]   = useState<string>(initial?.playerId ?? "");
  const [label, setLabel]         = useState<string>(initial?.label ?? "TOP PERFORMER");
  const [stat1Label, setStat1Label] = useState<string>(initial?.stats?.[0]?.label ?? "");
  const [stat1Value, setStat1Value] = useState<string>(initial?.stats?.[0]?.value?.toString() ?? "");
  const [stat2Label, setStat2Label] = useState<string>(initial?.stats?.[1]?.label ?? "");
  const [stat2Value, setStat2Value] = useState<string>(initial?.stats?.[1]?.value?.toString() ?? "");
  const [stat3Label, setStat3Label] = useState<string>(initial?.stats?.[2]?.label ?? "");
  const [stat3Value, setStat3Value] = useState<string>(initial?.stats?.[2]?.value?.toString() ?? "");
  const [stat4Label, setStat4Label] = useState<string>(initial?.stats?.[3]?.label ?? "");
  const [stat4Value, setStat4Value] = useState<string>(initial?.stats?.[3]?.value?.toString() ?? "");

  // 230 players — flat dropdown is acceptable for now. Add search later if needed.
  const { data: players = [], isLoading: playersLoading } = trpc.players.getAll.useQuery();

  // Build display label for each player option: "Name · #7 · Basketball"
  // so admin can disambiguate same-named players across teams.
  const playerOptions = useMemo(() => {
    return (players as Array<any>)
      .filter((p) => p.is_active !== false) // active by default; legacy nulls included
      .map((p) => ({
        id: p.id as string,
        label: [
          p.name,
          p.jersey_number != null ? `#${p.jersey_number}` : null,
          p.sport?.name,
        ].filter(Boolean).join(" · "),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [players]);

  const setMutation = trpc.featuredPlayer.set.useMutation({
    onSuccess: () => {
      toast.success("Top Performer updated.");
      // Invalidate so TopPerformerCard re-fetches and displays the new row.
      utils.featuredPlayer.getCurrent.invalidate();
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setPlayerId("");
    setLabel("TOP PERFORMER");
    setStat1Label(""); setStat1Value("");
    setStat2Label(""); setStat2Value("");
    setStat3Label(""); setStat3Value("");
    setStat4Label(""); setStat4Value("");
  };

  // Parse a stat value string into a number or null. Empty or invalid → null.
  const parseStat = (v: string): number | null => {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = () => {
    if (!playerId) {
      toast.error("Please select a player");
      return;
    }

    setMutation.mutate({
      playerId,
      label: label.trim() || "TOP PERFORMER",
      stat_1_label: stat1Label.trim() || null,
      stat_1_value: parseStat(stat1Value),
      stat_2_label: stat2Label.trim() || null,
      stat_2_value: parseStat(stat2Value),
      stat_3_label: stat3Label.trim() || null,
      stat_3_value: parseStat(stat3Value),
      stat_4_label: stat4Label.trim() || null,
      stat_4_value: parseStat(stat4Value),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border border-white/10 text-white max-w-md p-0 overflow-hidden">
        {/* Accent strip echoes the AddMatchModal styling */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-black uppercase tracking-[0.15em]">
              Set Top Performer
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-[10px] uppercase tracking-widest">
              Picks the spotlight subject on the dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* PLAYER */}
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Player</Label>
              <Select value={playerId} onValueChange={setPlayerId} disabled={playersLoading}>
                <SelectTrigger className="bg-black border-white/10 h-10">
                  <SelectValue placeholder={playersLoading ? "Loading players..." : "Select a player"} />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-white/10 text-white max-h-72">
                  {playerOptions.length > 0 ? (
                    playerOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No players found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* LABEL */}
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={60}
                placeholder="TOP PERFORMER · WEEK 4"
                className="bg-black border-white/10 h-10 text-sm"
              />
            </div>

            {/* STATS GRID — 4 label+value rows. All optional. */}
            <div className="space-y-2 pt-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                Stats (up to 4)
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {/* Each row is rendered identically; using direct state vars
                    keeps it explicit and easy to follow rather than mapping
                    over an array of refs. */}
                <StatRow
                  labelValue={stat1Label}
                  valueValue={stat1Value}
                  onLabelChange={setStat1Label}
                  onValueChange={setStat1Value}
                  labelPlaceholder="PPG"
                  valuePlaceholder="22.4"
                />
                <StatRow
                  labelValue={stat2Label}
                  valueValue={stat2Value}
                  onLabelChange={setStat2Label}
                  onValueChange={setStat2Value}
                  labelPlaceholder="RPG"
                  valuePlaceholder="8.1"
                />
                <StatRow
                  labelValue={stat3Label}
                  valueValue={stat3Value}
                  onLabelChange={setStat3Label}
                  onValueChange={setStat3Value}
                  labelPlaceholder="APG"
                  valuePlaceholder="5.3"
                />
                <StatRow
                  labelValue={stat4Label}
                  valueValue={stat4Value}
                  onLabelChange={setStat4Label}
                  onValueChange={setStat4Value}
                  labelPlaceholder="STL"
                  valuePlaceholder="2.1"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={setMutation.isPending}
              className="px-4 h-9 border border-white/10 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
            >
              <X size={11} className="inline mr-1.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={setMutation.isPending || !playerId}
              className="px-4 h-9 bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-widest rounded-sm disabled:opacity-50"
            >
              {setMutation.isPending ? (
                <><Loader2 size={11} className="inline mr-1.5 animate-spin" /> Saving...</>
              ) : "Save"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Small inner component to keep the 4 stat rows DRY without losing per-row state visibility.
function StatRow(props: {
  labelValue: string;
  valueValue: string;
  onLabelChange: (v: string) => void;
  onValueChange: (v: string) => void;
  labelPlaceholder: string;
  valuePlaceholder: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_90px] gap-2">
      <Input
        value={props.labelValue}
        onChange={(e) => props.onLabelChange(e.target.value)}
        maxLength={12}
        placeholder={props.labelPlaceholder}
        className="bg-black border-white/10 h-9 text-xs uppercase tracking-wider"
      />
      <Input
        value={props.valueValue}
        onChange={(e) => props.onValueChange(e.target.value)}
        type="number"
        step="0.1"
        placeholder={props.valuePlaceholder}
        className="bg-black border-white/10 h-9 text-xs"
      />
    </div>
  );
}
