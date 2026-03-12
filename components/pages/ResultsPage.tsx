"use client";

import React, { useMemo, useState } from "react";
import type { Match, Result } from "@/types";
import { TEAMS, exportCSV, csvEscape } from "@/lib/dataManager";
import {
  AlertTriangle, Award, CheckCircle2, ChevronDown, ChevronUp,
  ClipboardList, Download, Handshake, LayoutList, Medal,
  Search, Star, Swords, Trophy, X,
} from "lucide-react";

interface ResultsPageProps {
  matches: Match[];
  results: Result[];
  onRecordResult: (matchId: string, teamA: string, teamB: string, scoreA: number, scoreB: number, sport: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RANK_POINTS: Record<number, number> = { 1: 25, 2: 20, 3: 15, 4: 10 };

const SPORT_ICONS: Record<string, string> = {
  "Basketball Men": "🏀", "Basketball Women": "🏀",
  "Volleyball Men": "🏐", "Volleyball Women": "🏐",
  Badminton: "🏸", Soccer: "⚽", Softball: "🥎", "Table Tennis": "🏓",
  Chess: "♟️", Scrabble: "🔤", Sudoku: "🔢", Frisbee: "🥏", Petanque: "🎯",
  Cheerdance: "📣", Dancesports: "💃", "Rubik's Cube": "🟥",
  "Mr. and Ms. Fitness": "💪", "Pinoy Games": "🎮",
  "Esports - Mobile Legends: Bang Bang": "🎮", "Esports - DOTA 2": "🎮",
  "Esports - Valorant": "🎮", "Esports - Block Blast!": "🎮",
  "Esports - Cosplay": "🎭", "Esports - Tetris": "🟦",
};

const NON_SCORE_SPORTS = new Set([
  "Cheerdance", "Dancesports", "Esports - Cosplay", "Mr. and Ms. Fitness", "Pinoy Games",
]);

const RANK_STYLE: Record<number, { label: string; color: string; bg: string; border: string; badge: string }> = {
  1: { label: "Champion",  color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-500 text-white"  },
  2: { label: "2nd Place", color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200",  badge: "bg-slate-400 text-white"  },
  3: { label: "3rd Place", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400 text-white" },
  4: { label: "4th Place", color: "text-gray-400",   bg: "bg-gray-50",   border: "border-gray-200",   badge: "bg-gray-300 text-gray-700"},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEAM_EMOJI: Record<string, string> = Object.fromEntries(
  TEAMS.map((t) => [t.value, t.label.split(" ")[0]])
);

const getSportIcon = (s: string) => SPORT_ICONS[s] ?? "🏅";
const isScoreSport = (s: string) => !NON_SCORE_SPORTS.has(s);
const getRecordedIds = (results: Result[]) => new Set(results.map((r) => String(r.matchId)));

const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtShort = (iso: string) =>
  iso ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

// ── Standing calculations ─────────────────────────────────────────────────────

type SportRow = { team: string; played: number; wins: number; draws: number; losses: number; gf: number; ga: number; rank: number; champPts: number };

function calcSportStandings(sportResults: Result[]): SportRow[] {
  const m: Record<string, Omit<SportRow, "rank" | "champPts">> = {};
  const ensure = (t: string) => { if (!m[t]) m[t] = { team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 }; };
  sportResults.forEach((r) => {
    ensure(r.teamA); ensure(r.teamB);
    m[r.teamA].played++; m[r.teamB].played++;
    m[r.teamA].gf += r.scoreA; m[r.teamA].ga += r.scoreB;
    m[r.teamB].gf += r.scoreB; m[r.teamB].ga += r.scoreA;
    if (r.winner === "Draw") { m[r.teamA].draws++; m[r.teamB].draws++; }
    else if (r.winner === r.teamA) { m[r.teamA].wins++; m[r.teamB].losses++; }
    else { m[r.teamB].wins++; m[r.teamA].losses++; }
  });
  return Object.values(m)
    .sort((a, b) => b.wins - a.wins || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
    .map((row, i) => ({ ...row, rank: i + 1, champPts: RANK_POINTS[i + 1] ?? 0 }));
}

type OverallRow = { team: string; totalPts: number; gold: number; silver: number; bronze: number; sportsCount: number };

function calcOverall(results: Result[]): OverallRow[] {
  const map: Record<string, OverallRow> = {};
  TEAMS.forEach((t) => { map[t.value] = { team: t.value, totalPts: 0, gold: 0, silver: 0, bronze: 0, sportsCount: 0 }; });
  const sports = [...new Set(results.map((r) => r.sport))];
  sports.forEach((sport) => {
    const rows = calcSportStandings(results.filter((r) => r.sport === sport));
    rows.forEach((row) => {
      if (!map[row.team]) map[row.team] = { team: row.team, totalPts: 0, gold: 0, silver: 0, bronze: 0, sportsCount: 0 };
      map[row.team].totalPts += row.champPts;
      map[row.team].sportsCount++;
      if (row.rank === 1) map[row.team].gold++;
      if (row.rank === 2) map[row.team].silver++;
      if (row.rank === 3) map[row.team].bronze++;
    });
  });
  return Object.values(map)
    .filter((r) => r.totalPts > 0)
    .sort((a, b) => b.totalPts - a.totalPts || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze);
}

// ── Small UI pieces ───────────────────────────────────────────────────────────

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-orange-400" />;
  return <span className="text-xs font-bold text-gray-400">{rank}</span>;
}

function PtsBadge({ pts, rank }: { pts: number; rank: number }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md text-xs font-black ${RANK_STYLE[rank]?.badge ?? "bg-gray-100 text-gray-500"}`}>
      {pts}
    </span>
  );
}

// ── Overall Standings ─────────────────────────────────────────────────────────

function OverallStandings({ results }: { results: Result[] }) {
  const table = useMemo(() => calcOverall(results), [results]);
  if (table.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-gray-800">Overall Championship Standings</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
          {[["bg-amber-500","1st=25"],["bg-slate-400","2nd=20"],["bg-orange-400","3rd=15"],["bg-gray-300","4th=10"]].map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-sm inline-block ${bg}`} />{label} pts
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["#","College","🥇 Gold","🥈 Silver","🥉 Bronze","Sports","Total Pts"].map((h) => (
                <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${h === "Total Pts" ? "text-[#A91D3A] text-center" : h === "#" ? "text-gray-500 text-left" : "text-gray-500 text-center"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={row.team} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors ${i === 0 ? "bg-amber-50/30" : ""}`}>
                <td className="px-4 py-3.5 text-left"><RankIcon rank={i + 1} /></td>
                <td className="px-4 py-3.5 font-semibold text-gray-800">{TEAM_EMOJI[row.team] ?? ""} {row.team}</td>
                <td className="px-4 py-3.5 text-center font-bold text-amber-600">{row.gold || "—"}</td>
                <td className="px-4 py-3.5 text-center font-bold text-slate-400">{row.silver || "—"}</td>
                <td className="px-4 py-3.5 text-center font-bold text-orange-400">{row.bronze || "—"}</td>
                <td className="px-4 py-3.5 text-center text-gray-500 text-xs">{row.sportsCount}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black ${i === 0 ? "bg-[#A91D3A] text-white" : i === 1 ? "bg-[#A91D3A]/10 text-[#A91D3A]" : "bg-gray-100 text-gray-700"}`}>
                    {row.totalPts}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sport Accordion Row ───────────────────────────────────────────────────────

function SportAccordion({ sport, sportResults, defaultOpen }: { sport: string; sportResults: Result[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const standings = useMemo(() => calcSportStandings(sportResults), [sportResults]);
  const champion = standings[0];

  return (
    <div className={`border border-gray-100 rounded-xl overflow-hidden ${open ? "shadow-sm" : ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${open ? "bg-[#A91D3A]/5 border-b border-[#A91D3A]/10" : "bg-white hover:bg-gray-50"}`}
      >
        <span className="text-xl shrink-0">{getSportIcon(sport)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{sport}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {sportResults.length} result{sportResults.length !== 1 ? "s" : ""}
            {champion && <span className="ml-2 text-amber-600 font-semibold">· 🏆 {champion.team}</span>}
          </p>
        </div>
        {/* Mini rank strip */}
        <div className="hidden sm:flex items-center gap-1 mr-2">
          {standings.slice(0, 4).map((row) => (
            <span key={row.team} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${RANK_STYLE[row.rank]?.bg} ${RANK_STYLE[row.rank]?.color} ${RANK_STYLE[row.rank]?.border}`}>
              {TEAM_EMOJI[row.team] ?? ""} {row.team.split(" ").pop()}
            </span>
          ))}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="bg-white">
          {/* Standings table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {["Rank","Team","P","W","D","L","GF","GA","Pts Earned"].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${h === "Pts Earned" ? "text-[#A91D3A] text-center" : h === "Rank" || h === "Team" ? "text-gray-400 text-left" : "text-gray-400 text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.team} className={`border-b border-gray-50 last:border-0 ${row.rank === 1 ? "bg-amber-50/20" : "hover:bg-gray-50/40"}`}>
                    <td className="px-4 py-3 text-left"><RankIcon rank={row.rank} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">{TEAM_EMOJI[row.team] ?? ""} {row.team}</span>
                        {RANK_STYLE[row.rank] && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${RANK_STYLE[row.rank].bg} ${RANK_STYLE[row.rank].color} ${RANK_STYLE[row.rank].border}`}>
                            {RANK_STYLE[row.rank].label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.played}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">{row.wins}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.draws}</td>
                    <td className="px-4 py-3 text-center text-red-400">{row.losses}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.gf}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.ga}</td>
                    <td className="px-4 py-3 text-center">
                      {row.champPts > 0 ? <PtsBadge pts={row.champPts} rank={row.rank} /> : <span className="text-xs text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Individual match results */}
          <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Match Results</p>
            <div className="space-y-1.5">
              {sportResults.map((r) => {
                const aWins = r.winner === r.teamA, isDraw = r.winner === "Draw";
                return (
                  <div key={r.id} className="flex items-center gap-3 text-xs bg-white rounded-lg border border-gray-100 px-3 py-2">
                    <span className={`flex-1 text-right font-semibold ${aWins ? "text-gray-800" : "text-gray-400"}`}>{r.teamA}</span>
                    <span className="font-black tabular-nums text-gray-700 text-sm">{r.scoreA}</span>
                    <span className="text-gray-300 font-bold">–</span>
                    <span className="font-black tabular-nums text-gray-700 text-sm">{r.scoreB}</span>
                    <span className={`flex-1 font-semibold ${!aWins && !isDraw ? "text-gray-800" : "text-gray-400"}`}>{r.teamB}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full font-bold border text-[10px] ${isDraw ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                      {isDraw ? "Draw" : r.winner}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Per-Sport Standings Section ───────────────────────────────────────────────

function PerSportStandings({ results }: { results: Result[] }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const activeSports = useMemo(() => [...new Set(results.map((r) => r.sport))].sort(), [results]);
  const filtered = activeSports.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  if (activeSports.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-[#A91D3A]" />
          <h3 className="font-bold text-gray-800">Standings by Sport</h3>
          <span className="text-xs text-gray-400 font-medium">({activeSports.length} sport{activeSports.length !== 1 ? "s" : ""})</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter sport…"
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white w-40" />
        </div>
      </div>
      {filtered.length === 0
        ? <p className="text-sm text-gray-400 text-center py-6">No sports match your search.</p>
        : (
          <>
            <div className="space-y-2">
              {displayed.map((sport, i) => (
                <SportAccordion key={sport} sport={sport} sportResults={results.filter((r) => r.sport === sport)} defaultOpen={i === 0} />
              ))}
            </div>
            {filtered.length > 6 && (
              <button onClick={() => setShowAll((s) => !s)}
                className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#A91D3A]/40 hover:text-[#A91D3A] transition flex items-center justify-center gap-1.5">
                {showAll ? <><ChevronUp className="h-3.5 w-3.5" />Show less</> : <><ChevronDown className="h-3.5 w-3.5" />Show {filtered.length - 6} more sports</>}
              </button>
            )}
          </>
        )
      }
    </div>
  );
}

// ── Record Panel ──────────────────────────────────────────────────────────────

function RecordPanel({ matches, results, onSave, onClose }: {
  matches: Match[]; results: Result[];
  onSave: (matchId: string, teamA: string, teamB: string, scoreA: number, scoreB: number, sport: string) => void;
  onClose: () => void;
}) {
  const [matchKey, setMatchKey] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [winner, setWinner] = useState<"A"|"B"|"Draw"|"">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recorded  = getRecordedIds(results);
  const available = matches.filter((m) => !recorded.has(String(m.id)));
  const parsed    = matchKey ? matchKey.split("|") : null;
  const selId     = parsed?.[0] ?? "";
  const selMatch  = matches.find((m) => String(m.id) === selId) ?? null;
  const scored    = selMatch ? isScoreSport(selMatch.sport) : true;
  const numA = parseInt(scoreA), numB = parseInt(scoreB);

  const derived = scored
    ? (!isNaN(numA) && !isNaN(numB)) ? numA > numB ? selMatch?.teamA : numB > numA ? selMatch?.teamB : "Draw" : ""
    : winner === "A" ? selMatch?.teamA : winner === "B" ? selMatch?.teamB : winner === "Draw" ? "Draw" : "";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!matchKey) e.match = "Please select a match";
    if (scored) {
      if (!scoreA) e.scoreA = "Required"; else if (isNaN(numA)||numA<0) e.scoreA = "Invalid";
      if (!scoreB) e.scoreB = "Required"; else if (isNaN(numB)||numB<0) e.scoreB = "Invalid";
    } else { if (!winner) e.winner = "Please select an outcome"; }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const sa = scored ? numA : winner === "A" ? 1 : 0;
    const sb = scored ? numB : winner === "B" ? 1 : 0;
    onSave(selId, selMatch!.teamA, selMatch!.teamB, sa, sb, selMatch!.sport);
    onClose();
  };

  const field = (k: string) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#A91D3A]/20 focus:border-[#A91D3A] bg-white ${errors[k] ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-[#A91D3A] to-[#741029] flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-0.5">Results Center</p>
            <h3 className="text-lg font-black text-white">Record Match Result</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Match *</label>
            {available.length === 0
              ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-600">All matches recorded!</p>
                </div>
              ) : (
                <select className={field("match")} value={matchKey}
                  onChange={(e) => { setMatchKey(e.target.value); setScoreA(""); setScoreB(""); setWinner(""); setErrors({}); }}>
                  <option value="">Choose a match…</option>
                  {available.map((m) => (
                    <option key={m.id} value={`${m.id}|${m.teamA}|${m.teamB}`}>
                      {getSportIcon(m.sport)} {m.teamA} vs {m.teamB} — {fmtShort(m.date)}
                    </option>
                  ))}
                </select>
              )
            }
            {errors.match && <p className="text-xs text-red-500 mt-1">{errors.match}</p>}
          </div>

          {selMatch && (
            <div className="rounded-xl border border-[#A91D3A]/15 bg-gradient-to-r from-[#A91D3A]/5 via-white to-[#A91D3A]/5 px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mb-3">
                {getSportIcon(selMatch.sport)} {selMatch.sport} · {fmtShort(selMatch.date)} · {selMatch.venue}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-right">
                  <p className="font-black text-gray-900 text-base">{selMatch.teamA}</p>
                  <p className="text-xs text-gray-400">{TEAM_EMOJI[selMatch.teamA]}</p>
                </div>
                <div className="shrink-0 h-9 w-9 rounded-full bg-[#A91D3A] flex items-center justify-center shadow-sm">
                  <Swords className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-base">{selMatch.teamB}</p>
                  <p className="text-xs text-gray-400">{TEAM_EMOJI[selMatch.teamB]}</p>
                </div>
              </div>
            </div>
          )}

          {selMatch && scored && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Final Score</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-gray-400 mb-1 truncate">{selMatch.teamA}</p>
                  <input type="number" min="0" className={`${field("scoreA")} text-center text-2xl font-black`} placeholder="0"
                    value={scoreA} onChange={(e) => { setScoreA(e.target.value); setErrors((er) => ({ ...er, scoreA: "" })); }} />
                  {errors.scoreA && <p className="text-xs text-red-500 mt-1">{errors.scoreA}</p>}
                </div>
                <div className="shrink-0 pt-4 text-gray-300 text-xl font-black">—</div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-gray-400 mb-1 truncate">{selMatch.teamB}</p>
                  <input type="number" min="0" className={`${field("scoreB")} text-center text-2xl font-black`} placeholder="0"
                    value={scoreB} onChange={(e) => { setScoreB(e.target.value); setErrors((er) => ({ ...er, scoreB: "" })); }} />
                  {errors.scoreB && <p className="text-xs text-red-500 mt-1">{errors.scoreB}</p>}
                </div>
              </div>
              {derived && (
                <div className={`mt-3 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold ${derived === "Draw" ? "bg-amber-50 border border-amber-200 text-amber-700" : "bg-emerald-50 border border-emerald-200 text-emerald-700"}`}>
                  {derived === "Draw" ? <><Handshake className="h-4 w-4 shrink-0" />Draw</> : <><Trophy className="h-4 w-4 shrink-0" />{derived} wins!</>}
                </div>
              )}
            </div>
          )}

          {selMatch && !scored && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Outcome *</label>
              <div className="grid grid-cols-3 gap-2">
                {([["A", selMatch.teamA, <Trophy className="h-3.5 w-3.5" key="t"/>], ["Draw", "Draw", <Handshake className="h-3.5 w-3.5" key="h"/>], ["B", selMatch.teamB, <Medal className="h-3.5 w-3.5" key="m"/>]] as const).map(([k, label, icon]) => (
                  <button key={k} type="button" onClick={() => { setWinner(k as "A"|"B"|"Draw"); setErrors((er) => ({ ...er, winner: "" })); }}
                    className={`px-2 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${winner === k ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-[#A91D3A]/40 hover:text-[#A91D3A]"}`}>
                    {icon}<span className="truncate w-full text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
              {errors.winner && <p className="text-xs text-red-500 mt-1">{errors.winner}</p>}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50/80 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button onClick={handleSave} disabled={available.length === 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#8B1528] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition shadow-sm">
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResultsPage({ matches, results, onRecordResult }: ResultsPageProps) {
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [query,       setQuery]       = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [sortDir,     setSortDir]     = useState<"asc"|"desc">("desc");

  const recorded = getRecordedIds(results);
  const pending  = matches.filter((m) => !recorded.has(String(m.id)));
  const activeSports = useMemo(() => [...new Set(results.map((r) => r.sport))].sort(), [results]);

  const stats = useMemo(() => {
    const draws = results.filter((r) => r.winner === "Draw").length;
    const totalGoals = results.reduce((s, r) => s + r.scoreA + r.scoreB, 0);
    return { total: results.length, pending: pending.length, draws, totalGoals };
  }, [results, pending]);

  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() =>
    [...results]
      .filter((r) => sportFilter === "all" || r.sport === sportFilter)
      .filter((r) => !normalized || [r.teamA, r.teamB, r.sport, r.winner].join(" ").toLowerCase().includes(normalized))
      .sort((a, b) => {
        const da = new Date(a.createdAt).getTime(), db = new Date(b.createdAt).getTime();
        return sortDir === "desc" ? db - da : da - db;
      }),
    [results, sportFilter, normalized, sortDir]
  );

  const handleSave = (matchId: string, teamA: string, teamB: string, scoreA: number, scoreB: number, sport: string) => {
    onRecordResult(matchId, teamA, teamB, scoreA, scoreB, sport);
    setPanelOpen(false);
  };

  const handleExport = () => {
    exportCSV(
      ["Sport","Team A","Score A","Score B","Team B","Winner","Date"],
      results.map((r) => [csvEscape(r.sport),csvEscape(r.teamA),String(r.scoreA),String(r.scoreB),csvEscape(r.teamB),csvEscape(r.winner),csvEscape(fmtDate(r.createdAt))]),
      "iskoarena-results.csv"
    );
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-[#A91D3A] via-[#8a1630] to-[#741029] p-6 text-white shadow-lg relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-1">Admin Control Center</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Results & Standings</h2>
              <p className="text-white/65 mt-1.5 text-sm max-w-lg">Record match results, track per-sport standings, and monitor the overall championship points table.</p>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              {results.length > 0 && (
                <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition">
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              )}
              <button onClick={() => setPanelOpen(true)} disabled={pending.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#A91D3A] font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                <ClipboardList className="h-4 w-4" />
                Record Result
                {pending.length > 0 && <span className="bg-[#A91D3A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pending.length}</span>}
              </button>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["📋","Results Recorded",stats.total],["⏳","Pending",stats.pending],["🤝","Draws",stats.draws],["🎯","Total Scores",stats.totalGoals]].map(([e,l,v]) => (
              <div key={String(l)} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3">
                <p className="text-2xl font-black leading-none">{v}</p>
                <p className="text-xs text-white/65 mt-1">{e} {l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending alert */}
        {pending.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-bold">{pending.length} match{pending.length !== 1 ? "es" : ""}</span> still awaiting results.{" "}
              <button onClick={() => setPanelOpen(true)} className="underline underline-offset-2 font-semibold hover:text-amber-800">Record now →</button>
            </p>
          </div>
        )}

        {/* Overall standings */}
        {results.length > 0 && <OverallStandings results={results} />}

        {/* Per-sport accordion */}
        {results.length > 0 && <PerSportStandings results={results} />}

        {/* Results history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 mr-auto">
              <Award className="h-4 w-4 text-[#A91D3A]" />
              <h3 className="font-bold text-gray-800">Results History</h3>
              <span className="text-xs text-gray-400">({results.length})</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
                className="pl-8 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white w-44" />
              {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>}
            </div>
            {activeSports.length > 1 && (
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#A91D3A] bg-white">
                <option value="all">All Sports</option>
                {activeSports.map((s) => <option key={s} value={s}>{getSportIcon(s)} {s}</option>)}
              </select>
            )}
            <button onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-[#A91D3A]/40 hover:text-[#A91D3A] transition bg-white">
              {sortDir === "desc" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              {sortDir === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Sport","Match","Result","Winner","Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-10 w-10 text-gray-200" />
                        <p className="font-semibold text-gray-500">{results.length === 0 ? "No results recorded yet" : "No results match your filter"}</p>
                        {results.length === 0 && pending.length > 0 && (
                          <button onClick={() => setPanelOpen(true)} className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A91D3A] text-white text-xs font-bold hover:bg-[#8B1528] transition">
                            <ClipboardList className="h-3.5 w-3.5" /> Record First Result
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : visible.map((r) => {
                  const isDraw = r.winner === "Draw", aWins = r.winner === r.teamA;
                  return (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5"><span>{getSportIcon(r.sport)}</span><span className="text-gray-600 text-xs font-medium">{r.sport}</span></span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${aWins ? "text-gray-900" : "text-gray-400"}`}>{r.teamA}</span>
                          <span className="text-gray-300 text-xs font-bold">vs</span>
                          <span className={`text-sm font-semibold ${!aWins && !isDraw ? "text-gray-900" : "text-gray-400"}`}>{r.teamB}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                          <span className={`text-base font-black tabular-nums ${aWins ? "text-[#A91D3A]" : "text-gray-400"}`}>{r.scoreA}</span>
                          <span className="text-gray-300 font-bold">–</span>
                          <span className={`text-base font-black tabular-nums ${!aWins && !isDraw ? "text-[#A91D3A]" : "text-gray-400"}`}>{r.scoreB}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isDraw ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {isDraw ? <><Handshake className="h-3 w-3" />Draw</> : <><Trophy className="h-3 w-3" />{r.winner}</>}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{fmtDate(r.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visible.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 text-xs text-gray-400 flex items-center justify-between">
              <span>Showing <strong className="text-gray-600">{visible.length}</strong> of <strong className="text-gray-600">{results.length}</strong> results</span>
              <span className="hidden sm:block text-gray-300">1st=25 · 2nd=20 · 3rd=15 · 4th=10 championship pts</span>
            </div>
          )}
        </div>
      </div>

      {panelOpen && <RecordPanel matches={matches} results={results} onSave={handleSave} onClose={() => setPanelOpen(false)} />}
    </>
  );
}