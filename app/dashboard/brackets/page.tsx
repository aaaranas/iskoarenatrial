"use client";

// /dashboard/brackets — Tournament bracket management.
// Left panel: list of tournaments + Create New (admin).
// Right panel: double-elimination bracket tree for the selected tournament.
//   - Admin can seed WB R1 (assign 4 teams to the first round)
//   - Admin can enter results per slot — winner auto-advances
//   - Status: upcoming → active → completed

import React, { useState, useMemo } from "react";
import {
  Plus, Trophy, ChevronRight, Loader2, CheckCircle2,
  Circle, PlayCircle, GitBranch
} from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import { COLLEGE_COLORS } from "@/components/dashboard/dashboard-data";
import type { CollegeCode } from "@/components/dashboard/dashboard-data";

// ── Types (mirrors router return) ─────────────────────────────────────────────
type BracketSlot = {
  id: string; roundKey: string; slotOrder: number; roundLabel: string;
  homeTeamId: string | null; homeTeamOrg: string | null; homeTeamName: string | null;
  awayTeamId: string | null; awayTeamOrg: string | null; awayTeamName: string | null;
  homeScore: number | null; awayScore: number | null;
  winnerId: string | null; status: string;
};

type Tournament = {
  id: string; name: string; sportId: string; sportName: string | null;
  category: string | null; year: number; status: string; createdAt: string;
  slots?: BracketSlot[];
};

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    upcoming:  { color: "text-white/60",   bg: "bg-white/5 border-white/10",   icon: <Circle size={9} />         },
    active:    { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", icon: <PlayCircle size={9} />    },
    completed: { color: "text-ia-gold",     bg: "bg-ia-gold/10 border-ia-gold/30",    icon: <CheckCircle2 size={9} />  },
    pending:   { color: "text-white/30",   bg: "bg-transparent border-white/[0.06]", icon: <Circle size={9} />         },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${s.color} ${s.bg}`}>
      {s.icon} {status}
    </span>
  );
}

// ── Slot card ─────────────────────────────────────────────────────────────────
function SlotCard({
  slot, onEnterResult, isAdmin,
}: {
  slot: BracketSlot; onEnterResult: (s: BracketSlot) => void; isAdmin: boolean;
}) {
  const isPending   = slot.status === "pending";
  const isCompleted = slot.status === "completed";

  const TeamSide = ({ name, org, score, isWinner }: {
    name: string | null; org: string | null; score: number | null; isWinner: boolean;
  }) => {
    const color = org ? (COLLEGE_COLORS[org as CollegeCode] ?? "#fff") : "#666";
    return (
      <div className={`flex items-center justify-between py-2 px-3 ${isWinner ? "bg-white/[0.04]" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          {org ? (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          ) : (
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-white/10" />
          )}
          <span className={`text-[11px] font-bold truncate ${name ? "text-white" : "text-white/25"}`}>
            {name ?? "TBD"}
          </span>
          {isWinner && <CheckCircle2 size={10} className="text-ia-gold flex-shrink-0" />}
        </div>
        <span className={`font-mono text-xs tabular-nums flex-shrink-0 ml-2 ${
          isWinner ? "font-black text-white" : "text-white/40"
        }`}>
          {score ?? (isPending ? "—" : "-")}
        </span>
      </div>
    );
  };

  return (
    <div className={`rounded-[8px] border overflow-hidden ${
      isPending ? "border-white/[0.06] opacity-60" : "border-white/[0.12]"
    } ${isCompleted ? "bg-white/[0.02]" : "bg-[#0d0d0d]"}`}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
          {slot.roundLabel}
        </span>
        <StatusBadge status={slot.status} />
      </div>

      <div className="divide-y divide-white/[0.04]">
        <TeamSide name={slot.homeTeamName} org={slot.homeTeamOrg}
          score={slot.homeScore} isWinner={!!slot.winnerId && slot.winnerId === slot.homeTeamId} />
        <TeamSide name={slot.awayTeamName} org={slot.awayTeamOrg}
          score={slot.awayScore} isWinner={!!slot.winnerId && slot.winnerId === slot.awayTeamId} />
      </div>

      {isAdmin && slot.status === "active" && !isCompleted && (
        <button
          onClick={() => onEnterResult(slot)}
          className="w-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-ia-accent hover:bg-ia-accent/10 transition-colors border-t border-white/[0.06]"
        >
          Enter Result →
        </button>
      )}
    </div>
  );
}

// ── Bracket section wrapper ────────────────────────────────────────────────────
function BracketSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-white/[0.07] bg-[#0a0a0a] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.07] bg-white/[0.02]">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">{title}</span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

// ── Create Tournament Modal ────────────────────────────────────────────────────
function CreateTournamentModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (id: string) => void;
}) {
  const { data: sports = [] } = trpc.sport.getAll.useQuery();
  const utils = trpc.useUtils();
  const [sportId, setSportId] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName]   = useState("Tournament");
  const [year, setYear]   = useState("2026");

  const create = trpc.tournament.create.useMutation({
    onSuccess: (data) => {
      toast.success("Tournament created.");
      utils.tournament.getAll.invalidate();
      utils.tournament.getById.invalidate({ id: data.id });
      onCreate(data.id);
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-base font-black uppercase tracking-[0.15em]">New Tournament</h2>

        <div className="space-y-2">
          <Label className="text-[10px] text-zinc-500 uppercase font-bold">Sport</Label>
          <Select value={sportId} onValueChange={setSportId}>
            <SelectTrigger className="bg-black border-white/10 h-9">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white max-h-60">
              {(sports as Array<any>).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-zinc-500 uppercase font-bold">Category (optional)</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-black border-white/10 h-9">
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
              <SelectItem value="none">None</SelectItem>
              {["Men","Women","Men Singles","Men Doubles","Women Singles","Women Doubles","Mixed Doubles"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-zinc-500 uppercase font-bold">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-white/10 h-9" />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-zinc-500 uppercase font-bold">Year</Label>
          <Input value={year} type="number" onChange={(e) => setYear(e.target.value)} className="bg-black border-white/10 h-9" />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 h-9 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => create.mutate({ sport_id: sportId, category: (category && category !== "none" ? category as any : null), name, year: parseInt(year) })}
            disabled={!sportId || create.isPending}
            className="flex-1 h-9 bg-ia-accent rounded-lg text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
          >
            {create.isPending ? <Loader2 size={12} className="animate-spin mx-auto" /> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Seed Bracket Modal ─────────────────────────────────────────────────────────
function SeedBracketModal({ tournamentId, onClose }: { tournamentId: string; onClose: () => void }) {
  const { data: teams = [] } = trpc.team.getAll.useQuery();
  const utils = trpc.useUtils();
  const [m1Home, setM1Home] = useState("");
  const [m1Away, setM1Away] = useState("");
  const [m2Home, setM2Home] = useState("");
  const [m2Away, setM2Away] = useState("");

  const seed = trpc.tournament.setFirstRound.useMutation({
    onSuccess: () => {
      toast.success("Bracket seeded.");
      utils.tournament.getById.invalidate({ id: tournamentId });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const TeamSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div className="space-y-1">
      <Label className="text-[9px] text-zinc-600 uppercase font-bold">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-black border-white/10 h-8 text-[11px]">
          <SelectValue placeholder="Pick team" />
        </SelectTrigger>
        <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
          {(teams as Array<any>).map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name} ({t.org})</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-base font-black uppercase tracking-[0.15em]">Seed Bracket</h2>
        <p className="text-[11px] text-white/40">Assign the 4 colleges to the WB Round 1 matchups.</p>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-3 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">WB Round 1 — Match 1</span>
          <TeamSelect value={m1Home} onChange={setM1Home} label="Home" />
          <TeamSelect value={m1Away} onChange={setM1Away} label="Away" />
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-3 space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">WB Round 1 — Match 2</span>
          <TeamSelect value={m2Home} onChange={setM2Home} label="Home" />
          <TeamSelect value={m2Away} onChange={setM2Away} label="Away" />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => seed.mutate({ tournamentId, wb_r1_1_home: m1Home, wb_r1_1_away: m1Away, wb_r1_2_home: m2Home, wb_r1_2_away: m2Away })}
            disabled={!m1Home || !m1Away || !m2Home || !m2Away || seed.isPending}
            className="flex-1 h-9 bg-ia-accent rounded-lg text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
          >
            {seed.isPending ? <Loader2 size={12} className="animate-spin mx-auto" /> : "Seed"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Set Result Modal ───────────────────────────────────────────────────────────
function SetResultModal({ slot, tournamentId, onClose }: { slot: BracketSlot; tournamentId: string; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [winnerId, setWinnerId] = useState("");

  const update = trpc.tournament.updateResult.useMutation({
    onSuccess: () => {
      toast.success("Result saved. Bracket advanced.");
      utils.tournament.getById.invalidate({ id: tournamentId });
      utils.tournament.getCurrent.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-base font-black uppercase tracking-[0.15em]">Enter Result</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">{slot.roundLabel}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] text-zinc-600 uppercase font-bold">{slot.homeTeamOrg ?? "Home"}</Label>
            <Input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="bg-black border-white/10 h-9 text-center" placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-zinc-600 uppercase font-bold">{slot.awayTeamOrg ?? "Away"}</Label>
            <Input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="bg-black border-white/10 h-9 text-center" placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-zinc-500 uppercase font-bold">Declare Winner</Label>
          <Select value={winnerId} onValueChange={setWinnerId}>
            <SelectTrigger className="bg-black border-white/10 h-9">
              <SelectValue placeholder="Select winner" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
              {slot.homeTeamId && <SelectItem value={slot.homeTeamId}>{slot.homeTeamOrg} ({slot.homeTeamName})</SelectItem>}
              {slot.awayTeamId && <SelectItem value={slot.awayTeamId}>{slot.awayTeamOrg} ({slot.awayTeamName})</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => update.mutate({ slotId: slot.id, homeScore: parseInt(homeScore)||0, awayScore: parseInt(awayScore)||0, winnerId })}
            disabled={!winnerId || update.isPending}
            className="flex-1 h-9 bg-[#C5A059] rounded-lg text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-40"
          >
            {update.isPending ? <Loader2 size={12} className="animate-spin mx-auto" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BracketsPage() {
  const { isAdmin } = useRole();
  const utils = trpc.useUtils();

  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [showCreate, setShowCreate]           = useState(false);
  const [showSeed, setShowSeed]               = useState(false);
  const [resultSlot, setResultSlot]           = useState<BracketSlot | null>(null);

  const { data: tournaments = [], isLoading: listLoading } = trpc.tournament.getAll.useQuery();
  const { data: selected, isLoading: detailLoading } = trpc.tournament.getById.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  );

  const updateStatus = trpc.tournament.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated."); utils.tournament.getAll.invalidate(); utils.tournament.getById.invalidate({ id: selectedId! }); },
    onError: (err) => toast.error(err.message),
  });

  const deleteTournament = trpc.tournament.delete.useMutation({
    onSuccess: () => { toast.success("Tournament deleted."); setSelectedId(null); utils.tournament.getAll.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  // Group slots by bracket section
  const { wbSlots, lbSlots, finalsSlots } = useMemo(() => {
    const slots = selected?.slots ?? [];
    return {
      wbSlots:     slots.filter((s) => ["wb_r1_1","wb_r1_2","wb_finals"].includes(s.roundKey)),
      lbSlots:     slots.filter((s) => ["lb_r1","lb_finals"].includes(s.roundKey)),
      finalsSlots: slots.filter((s) => ["grand_final","gf_reset"].includes(s.roundKey)),
    };
  }, [selected]);

  const isSeeded = (selected?.slots ?? []).some((s) => s.roundKey === "wb_r1_1" && s.homeTeamId);
  const gfResetActive = (selected?.slots ?? []).some((s) => s.roundKey === "gf_reset" && s.status === "active");

  return (
    <div className="min-h-screen bg-[#060606] p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch size={18} className="text-white/60" />
          <h1 className="text-xl font-black text-white tracking-tight">Brackets</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">

          {/* LEFT — tournament list */}
          <div className="space-y-3">
            {isAdmin && (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-2 h-10 px-4 bg-ia-accent/15 border border-ia-accent/40 rounded-lg text-ia-accent text-[11px] font-black uppercase tracking-widest hover:bg-ia-accent/25 transition-colors"
              >
                <Plus size={13} /> New Tournament
              </button>
            )}

            {listLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={16} className="animate-spin text-white/30" />
              </div>
            ) : (tournaments as Tournament[]).length === 0 ? (
              <div className="text-center py-8 text-[11px] text-white/30 uppercase tracking-widest">
                No tournaments yet
              </div>
            ) : (
              (tournaments as Tournament[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedId === t.id
                      ? "border-ia-accent bg-ia-accent/10"
                      : "border-white/[0.07] bg-[#0d0d0d] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{t.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">
                        {t.sportName}{t.category ? ` · ${t.category}` : ""} · {t.year}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/30 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={t.status} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* RIGHT — bracket view */}
          <div>
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <GitBranch size={28} className="text-white/20 mb-3" />
                <p className="text-[12px] text-white/30 uppercase tracking-widest">
                  Select a tournament to view its bracket
                </p>
              </div>
            ) : detailLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 size={20} className="animate-spin text-white/30" />
              </div>
            ) : !selected ? (
              <div className="text-center py-16 text-[11px] text-white/30">Tournament not found.</div>
            ) : (
              <div className="space-y-4">
                {/* Tournament header */}
                <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-black text-white">{selected.name}</h2>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {selected.sportName}{selected.category ? ` · ${selected.category}` : ""} · {selected.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={selected.status} />
                    {isAdmin && selected.status === "upcoming" && !isSeeded && (
                      <button
                        onClick={() => setShowSeed(true)}
                        className="h-7 px-3 bg-white/5 border border-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white hover:border-white/30 transition-colors"
                      >
                        Seed Bracket
                      </button>
                    )}
                    {isAdmin && selected.status === "upcoming" && isSeeded && (
                      <button
                        onClick={() => updateStatus.mutate({ id: selected.id, status: "active" })}
                        className="h-7 px-3 bg-emerald-400/15 border border-emerald-400/40 rounded text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-400/25 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    {isAdmin && selected.status === "active" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: selected.id, status: "completed" })}
                        className="h-7 px-3 bg-ia-gold/15 border border-ia-gold/40 rounded text-[9px] font-black uppercase tracking-widest text-ia-gold hover:bg-ia-gold/25 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { if (confirm("Delete this tournament?")) deleteTournament.mutate({ id: selected.id }); }}
                        className="h-7 px-3 bg-red-400/10 border border-red-400/30 rounded text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/20 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Bracket sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BracketSection title="Winners Bracket">
                    {wbSlots.map((s) => (
                      <SlotCard key={s.id} slot={s} isAdmin={isAdmin} onEnterResult={setResultSlot} />
                    ))}
                  </BracketSection>

                  <BracketSection title="Losers Bracket">
                    {lbSlots.map((s) => (
                      <SlotCard key={s.id} slot={s} isAdmin={isAdmin} onEnterResult={setResultSlot} />
                    ))}
                  </BracketSection>

                  <BracketSection title={gfResetActive ? "Finals (Reset Active)" : "Finals"}>
                    {finalsSlots.map((s) => (
                      <SlotCard key={s.id} slot={s} isAdmin={isAdmin} onEnterResult={setResultSlot} />
                    ))}
                  </BracketSection>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTournamentModal onClose={() => setShowCreate(false)} onCreate={(id) => setSelectedId(id)} />
      )}
      {showSeed && selectedId && (
        <SeedBracketModal tournamentId={selectedId} onClose={() => setShowSeed(false)} />
      )}
      {resultSlot && selectedId && (
        <SetResultModal slot={resultSlot} tournamentId={selectedId} onClose={() => setResultSlot(null)} />
      )}
    </div>
  );
}
