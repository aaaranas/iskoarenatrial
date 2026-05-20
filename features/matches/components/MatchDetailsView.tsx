"use client";

import React, { useState, useMemo } from "react";
import { Match } from "@/types";
import {
  MapPin, Clock, Trophy, Pencil, Check, X,
  Star, Users, FileText, Loader2,
} from "lucide-react";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FinalizeMatchModal } from "./FinalizeMatchModal";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import { formatMatchDate, formatMatchTime } from "@/lib/format-match-date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Keys are uppercase to match the canonical teams.org form returned by trpc.match.getAll.
// Keep in sync with COLLEGE_LOGOS in components/dashboard/dashboard-data.ts.
const COLLEGE_LOGOS: Record<string, string> = {
  COS:  "/colleges/cos_logo.jpg",
  CSS:  "/colleges/css_logo.jpg",
  CCAD: "/colleges/ccad_logo.jpg",
  SOM:  "/colleges/som_logo.jpg",
};

const COLLEGE_FULL_NAMES: Record<string, string> = {
  COS:  "College of Science",
  CSS:  "College of Social Sciences",
  CCAD: "Communication Arts and Design",
  SOM:  "School of Management",
};


export const MatchDetailsView = ({ match }: { match: Match }) => {
  const { isAdmin } = useRole();
  const utils = trpc.useUtils();
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [isEditingMvp, setIsEditingMvp] = useState(false);
  // Notes editing state: draft seeds from the row's current value each time the
  // Edit button is clicked so the textarea reflects the latest server state.
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>(match.notes ?? "");
  const [mvpPlayerId, setMvpPlayerId] = useState<string>("");
  const [mvpTeamId, setMvpTeamId] = useState<string>(() => {
    // Pre-select the winner's team on completed matches
    if (match.statusType === "completed") {
      if ((match.homeScore ?? 0) > (match.awayScore ?? 0)) return match.homeTeamId ?? "";
      if ((match.awayScore ?? 0) > (match.homeScore ?? 0)) return match.awayTeamId ?? "";
    }
    return "";
  });

  const { data: allPlayers = [] } = trpc.players.getAll.useQuery();

  // Notes mutation: on success, invalidate the match list so the drawer (which
  // reads from getAll's cache via its parent) re-renders with the saved value.
  const updateNotes = trpc.match.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes saved.");
      utils.match.getAll.invalidate();
      setIsEditingNotes(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Players eligible for MVP (same team + same sport)
  const eligiblePlayers = useMemo(() =>
    allPlayers.filter((p: any) =>
      p.college_id === mvpTeamId &&
      p.sport?.name?.toLowerCase() === match.league?.toLowerCase()
    ),
    [allPlayers, mvpTeamId, match.league]
  );

  const mvpPlayer = allPlayers.find((p: any) => p.id === mvpPlayerId);

  // Lineup roster for each side, capped at 6 players shown.
  // Filtering by college_id (not team_id) because in this schema teams ≡ colleges
  // 1:1 and players are tagged with college_id only; players.team_id is unused.
  const homePlayers = useMemo(() =>
    allPlayers.filter((p: any) =>
      p.college_id === match.homeTeamId &&
      p.sport?.name?.toLowerCase() === match.league?.toLowerCase()
    ).slice(0, 6),
    [allPlayers, match.homeTeamId, match.league]
  );

  const awayPlayers = useMemo(() =>
    allPlayers.filter((p: any) =>
      p.college_id === match.awayTeamId &&
      p.sport?.name?.toLowerCase() === match.league?.toLowerCase()
    ).slice(0, 6),
    [allPlayers, match.awayTeamId, match.league]
  );

  const homeLogoSrc  = COLLEGE_LOGOS[match.homeTeamOrg] ?? null;
  const awayLogoSrc  = COLLEGE_LOGOS[match.awayTeamOrg] ?? null;
  const homeFullName = COLLEGE_FULL_NAMES[match.homeTeamOrg] ?? "";
  const awayFullName = COLLEGE_FULL_NAMES[match.awayTeamOrg] ?? "";

  const homeWins = (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <VisuallyHidden>
        <SheetTitle>Match Details: {match.homeTeam} vs {match.awayTeam}</SheetTitle>
      </VisuallyHidden>

      {/* ── Header: sport, status badge, venue, date/time ── */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#C5A059] mb-2">
          <Trophy size={13} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">{match.league}</span>
          {/* Category badge — rendered only when set. Inherently-mixed sports leave this NULL. */}
          {match.category && (
            <span className="px-1.5 py-[1px] border border-[#C5A059]/40 rounded-[2px] text-[8px] font-black uppercase tracking-[0.2em] text-[#C5A059]">
              {match.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap text-[9px] font-bold uppercase tracking-widest text-zinc-500">
          {match.statusType === "live" ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#A91D3A] rounded-[2px] text-white text-[8px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-[2px] border text-[8px] font-black tracking-[0.2em] ${
              match.statusType === "upcoming"
                ? "bg-green-500/20 border-green-500/60 text-green-400"
                : "bg-black/40 border-white/10 text-zinc-400"
            }`}>
              {match.statusType?.toUpperCase()}
            </span>
          )}
          <span className="flex items-center gap-1"><MapPin size={10} /> {match.venue}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {formatMatchDate(match.rawDate)} · {formatMatchTime(match.rawDate)}</span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Hero score: logos, org + college names, large scores ── */}
        <div className="px-6 py-8 bg-gradient-to-b from-zinc-950 to-black">
          <div className="flex items-start justify-between">

            {/* Home team */}
            <div className="flex flex-col items-center gap-3 w-[42%]">
              {homeLogoSrc
                ? <img src={homeLogoSrc} alt={match.homeTeam} className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
                : <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10" />
              }
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest">{match.homeTeamOrg?.toUpperCase()}</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-wider mt-0.5 leading-tight">{homeFullName}</p>
              </div>
              <span className="text-6xl font-black tabular-nums">{match.homeScore ?? 0}</span>
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center pt-12">
              <span className="text-zinc-700 font-bold italic text-sm">VS</span>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-3 w-[42%]">
              {awayLogoSrc
                ? <img src={awayLogoSrc} alt={match.awayTeam} className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
                : <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10" />
              }
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest">{match.awayTeamOrg?.toUpperCase()}</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-wider mt-0.5 leading-tight">{awayFullName}</p>
              </div>
              <span className="text-6xl font-black tabular-nums">{match.awayScore ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 px-6 py-8 space-y-10">

          {/* ── Match MVP ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star size={13} className="text-[#C5A059]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Match MVP</h3>
              </div>
              {isAdmin && !isEditingMvp && (
                <button
                  onClick={() => setIsEditingMvp(true)}
                  className="flex items-center gap-1.5 px-3 h-6 border border-white/10 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm transition-all"
                >
                  <Pencil size={9} /> Edit
                </button>
              )}
              {isAdmin && isEditingMvp && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingMvp(false)}
                    className="flex items-center gap-1 px-3 h-6 bg-[#C5A059] text-black text-[9px] font-black uppercase tracking-widest rounded-sm"
                  >
                    <Check size={9} /> Save
                  </button>
                  <button
                    onClick={() => { setIsEditingMvp(false); setMvpPlayerId(""); }}
                    className="flex items-center gap-1 px-3 h-6 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-sm"
                  >
                    <X size={9} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingMvp ? (
              /* Team + player selectors */
              <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Team</p>
                  <Select value={mvpTeamId} onValueChange={(v) => { setMvpTeamId(v); setMvpPlayerId(""); }}>
                    <SelectTrigger className="bg-black border-white/10 text-white">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                      {match.homeTeamId && (
                        <SelectItem value={match.homeTeamId}>{match.homeTeam} {homeWins && "🏆"}</SelectItem>
                      )}
                      {match.awayTeamId && (
                        <SelectItem value={match.awayTeamId}>{match.awayTeam} {awayWins && "🏆"}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {mvpTeamId && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Player</p>
                    <Select value={mvpPlayerId} onValueChange={setMvpPlayerId}>
                      <SelectTrigger className="bg-black border-white/10 text-white">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10 text-white">
                        {eligiblePlayers.length ? (
                          eligiblePlayers.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No players found for this sport</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : mvpPlayer ? (
              /* MVP display card: photo, name, jersey, org */
              <div className="border border-white/10 rounded-sm p-4 flex gap-4">
                <div className="w-16 h-20 rounded-sm bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                  {mvpPlayer.photo_url ? (
                    <img src={mvpPlayer.photo_url} alt={mvpPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Star size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Star size={9} className="text-[#C5A059]" fill="#C5A059" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#C5A059]">Match MVP</span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight leading-tight">{mvpPlayer.name}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-widest">
                    #{mvpPlayer.jersey_number} · {mvpTeamId === match.homeTeamId ? match.homeTeamOrg?.toUpperCase() : match.awayTeamOrg?.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="border border-white/5 rounded-sm p-6 text-center">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
                  {isAdmin ? "Press Edit to assign the MVP." : "No MVP assigned yet."}
                </p>
              </div>
            )}
          </section>

          {/* ── Lineups: real players from DB filtered by team + sport ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users size={13} className="text-[#C5A059]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Lineups</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">

              {/* Home roster */}
              <div className="border border-white/5 rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    {homeLogoSrc && <img src={homeLogoSrc} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className="text-[9px] font-black uppercase tracking-wider">{match.homeTeamOrg?.toUpperCase()}</span>
                  </div>
                  <span className="text-[8px] text-zinc-600 uppercase tracking-widest">{homePlayers.length} Roster</span>
                </div>
                {homePlayers.length > 0
                  ? homePlayers.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[8px] text-zinc-600 font-bold shrink-0">#{p.jersey_number ?? "—"}</span>
                        <span className="text-[10px] font-bold text-zinc-200 truncate">{p.name}</span>
                      </div>
                      <span className="text-[8px] text-zinc-600 uppercase tracking-widest ml-2 shrink-0">{p.position}</span>
                    </div>
                  ))
                  : <div className="px-3 py-5 text-center text-[9px] text-zinc-700 uppercase tracking-widest">No roster</div>
                }
              </div>

              {/* Away roster */}
              <div className="border border-white/5 rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    {awayLogoSrc && <img src={awayLogoSrc} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className="text-[9px] font-black uppercase tracking-wider">{match.awayTeamOrg?.toUpperCase()}</span>
                  </div>
                  <span className="text-[8px] text-zinc-600 uppercase tracking-widest">{awayPlayers.length} Roster</span>
                </div>
                {awayPlayers.length > 0
                  ? awayPlayers.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.03] last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[8px] text-zinc-600 font-bold shrink-0">#{p.jersey_number ?? "—"}</span>
                        <span className="text-[10px] font-bold text-zinc-200 truncate">{p.name}</span>
                      </div>
                      <span className="text-[8px] text-zinc-600 uppercase tracking-widest ml-2 shrink-0">{p.position}</span>
                    </div>
                  ))
                  : <div className="px-3 py-5 text-center text-[9px] text-zinc-700 uppercase tracking-widest">No roster</div>
                }
              </div>
            </div>
          </section>

          {/* ── Match Notes — admin-editable free-form text persisted on matches.notes ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-[#C5A059]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Match Notes</h3>
              </div>
              {/* Edit button: shown only when admin AND not already editing */}
              {isAdmin && !isEditingNotes && (
                <button
                  onClick={() => {
                    // Reseed draft from latest match.notes so we don't show a stale buffer
                    setNotesDraft(match.notes ?? "");
                    setIsEditingNotes(true);
                  }}
                  className="flex items-center gap-1.5 px-3 h-6 border border-white/10 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-sm transition-all"
                >
                  <Pencil size={9} /> Edit
                </button>
              )}
              {/* Save + Cancel buttons: shown only while admin is editing */}
              {isAdmin && isEditingNotes && (
                <div className="flex gap-2">
                  <button
                    disabled={updateNotes.isPending}
                    onClick={() => updateNotes.mutate({ id: match.id, notes: notesDraft })}
                    className="flex items-center gap-1 px-3 h-6 bg-[#C5A059] text-black text-[9px] font-black uppercase tracking-widest rounded-sm disabled:opacity-60"
                  >
                    {updateNotes.isPending ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />} Save
                  </button>
                  <button
                    disabled={updateNotes.isPending}
                    onClick={() => { setIsEditingNotes(false); setNotesDraft(match.notes ?? ""); }}
                    className="flex items-center gap-1 px-3 h-6 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-sm disabled:opacity-60"
                  >
                    <X size={9} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              /* Textarea — capped to match server-side Zod constraint (2000 chars) */
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Add notes about this match — recap, key plays, attendance, etc."
                className="w-full bg-black border border-white/10 rounded-sm p-3 text-[11px] text-zinc-200 leading-relaxed placeholder:text-zinc-700 focus:outline-none focus:border-[#C5A059]/40 resize-none"
              />
            ) : (
              /* Read-only display: render notes when present, otherwise empty-state hint */
              <div className="border border-white/5 rounded-sm p-4">
                {match.notes ? (
                  <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{match.notes}</p>
                ) : (
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {isAdmin ? "No notes yet — press Edit to add some." : "No notes yet for this match."}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* "What's Next" / bracket preview removed — re-add once tournaments schema lands. */}

          {/* ── End This Match CTA — live matches, admin only ── */}
          {match.statusType === "live" && isAdmin && (
            <div className="border border-[#A91D3A]/20 bg-[#A91D3A]/5 rounded-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy size={13} className="text-[#A91D3A]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A91D3A]">End This Match</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Confirm the final score to mark this match as concluded and update the standings.
              </p>
              <button
                onClick={() => setFinalizeOpen(true)}
                className="w-full h-11 bg-[#A91D3A] hover:bg-[#c02245] text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-sm transition-all"
              >
                Confirm Final Score
              </button>
            </div>
          )}

        </div>
      </div>

      <FinalizeMatchModal
        match={match}
        isOpen={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
      />
    </div>
  );
};
