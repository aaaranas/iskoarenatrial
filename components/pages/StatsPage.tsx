"use client";

import React, { useMemo, useState } from "react";
import type { Stat, Player } from "@/types";
import { COLLEGES, TEAMS, exportCSV, csvEscape } from "@/lib/dataManager";
import {
  AlertCircle, BarChart3, ChevronDown, ChevronUp, ClipboardList,
  Download, Pencil, Plus, Search, Trash2, Users, X, User,
} from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsPageProps {
  stats: Stat[];
  players: Player[];
  onAddStat: (stat: Omit<Stat, "id" | "createdAt">) => void;
  onUpdateStat: (id: string, stat: Omit<Stat, "id" | "createdAt">) => void;
  onDeleteStat: (id: string) => void;
}

// ─── Sport stat templates ─────────────────────────────────────────────────────

type StatField = { key: string; label: string; unit?: string; type?: "number" | "text" | "percent" };

const SPORT_STAT_FIELDS: Record<string, { player: StatField[]; team: StatField[] }> = {
  "Basketball Men": {
    player: [
      { key: "PTS", label: "Points", type: "number" },
      { key: "REB", label: "Rebounds", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "STL", label: "Steals", type: "number" },
      { key: "BLK", label: "Blocks", type: "number" },
      { key: "TO",  label: "Turnovers", type: "number" },
      { key: "FGM", label: "FG Made", type: "number" },
      { key: "FGA", label: "FG Attempted", type: "number" },
      { key: "3PM", label: "3PT Made", type: "number" },
      { key: "3PA", label: "3PT Attempted", type: "number" },
      { key: "FTM", label: "FT Made", type: "number" },
      { key: "FTA", label: "FT Attempted", type: "number" },
      { key: "MIN", label: "Minutes Played", type: "number" },
    ],
    team: [
      { key: "PTS", label: "Team Points", type: "number" },
      { key: "REB", label: "Total Rebounds", type: "number" },
      { key: "AST", label: "Total Assists", type: "number" },
      { key: "STL", label: "Total Steals", type: "number" },
      { key: "BLK", label: "Total Blocks", type: "number" },
      { key: "TO",  label: "Total Turnovers", type: "number" },
      { key: "FG%", label: "FG%", unit: "%", type: "text" },
      { key: "3P%", label: "3PT%", unit: "%", type: "text" },
      { key: "FT%", label: "FT%", unit: "%", type: "text" },
    ],
  },
  "Basketball Women": {
    player: [
      { key: "PTS", label: "Points", type: "number" },
      { key: "REB", label: "Rebounds", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "STL", label: "Steals", type: "number" },
      { key: "BLK", label: "Blocks", type: "number" },
      { key: "TO",  label: "Turnovers", type: "number" },
      { key: "FGM", label: "FG Made", type: "number" },
      { key: "FGA", label: "FG Attempted", type: "number" },
      { key: "3PM", label: "3PT Made", type: "number" },
      { key: "FTM", label: "FT Made", type: "number" },
      { key: "FTA", label: "FT Attempted", type: "number" },
      { key: "MIN", label: "Minutes Played", type: "number" },
    ],
    team: [
      { key: "PTS", label: "Team Points", type: "number" },
      { key: "REB", label: "Total Rebounds", type: "number" },
      { key: "AST", label: "Total Assists", type: "number" },
      { key: "FG%", label: "FG%", unit: "%", type: "text" },
      { key: "3P%", label: "3PT%", unit: "%", type: "text" },
      { key: "FT%", label: "FT%", unit: "%", type: "text" },
    ],
  },
  "Volleyball Men": {
    player: [
      { key: "KIL", label: "Kills", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "DIG", label: "Digs", type: "number" },
      { key: "BLK", label: "Blocks", type: "number" },
      { key: "ACE", label: "Aces", type: "number" },
      { key: "ERR", label: "Errors", type: "number" },
      { key: "ATK", label: "Attack Attempts", type: "number" },
      { key: "SRV", label: "Serve Attempts", type: "number" },
    ],
    team: [
      { key: "KIL", label: "Total Kills", type: "number" },
      { key: "ACE", label: "Total Aces", type: "number" },
      { key: "BLK", label: "Total Blocks", type: "number" },
      { key: "DIG", label: "Total Digs", type: "number" },
      { key: "ERR", label: "Total Errors", type: "number" },
      { key: "ATK%", label: "Attack %", unit: "%", type: "text" },
    ],
  },
  "Volleyball Women": {
    player: [
      { key: "KIL", label: "Kills", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "DIG", label: "Digs", type: "number" },
      { key: "BLK", label: "Blocks", type: "number" },
      { key: "ACE", label: "Aces", type: "number" },
      { key: "ERR", label: "Errors", type: "number" },
      { key: "ATK", label: "Attack Attempts", type: "number" },
    ],
    team: [
      { key: "KIL", label: "Total Kills", type: "number" },
      { key: "ACE", label: "Total Aces", type: "number" },
      { key: "BLK", label: "Total Blocks", type: "number" },
      { key: "DIG", label: "Total Digs", type: "number" },
      { key: "ERR", label: "Total Errors", type: "number" },
    ],
  },
  Soccer: {
    player: [
      { key: "GOL", label: "Goals", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "SHT", label: "Shots", type: "number" },
      { key: "SOT", label: "Shots on Target", type: "number" },
      { key: "YC",  label: "Yellow Cards", type: "number" },
      { key: "RC",  label: "Red Cards", type: "number" },
      { key: "SAV", label: "Saves (GK)", type: "number" },
      { key: "MIN", label: "Minutes Played", type: "number" },
    ],
    team: [
      { key: "GOL", label: "Goals Scored", type: "number" },
      { key: "GA",  label: "Goals Against", type: "number" },
      { key: "CS",  label: "Clean Sheets", type: "number" },
      { key: "SHT", label: "Total Shots", type: "number" },
      { key: "SOT", label: "Shots on Target", type: "number" },
      { key: "YC",  label: "Yellow Cards", type: "number" },
      { key: "RC",  label: "Red Cards", type: "number" },
      { key: "POS", label: "Possession %", unit: "%", type: "text" },
    ],
  },
  Softball: {
    player: [
      { key: "AB",  label: "At Bats", type: "number" },
      { key: "H",   label: "Hits", type: "number" },
      { key: "R",   label: "Runs", type: "number" },
      { key: "RBI", label: "RBI", type: "number" },
      { key: "HR",  label: "Home Runs", type: "number" },
      { key: "BB",  label: "Walks", type: "number" },
      { key: "K",   label: "Strikeouts (batting)", type: "number" },
      { key: "AVG", label: "Batting Avg", type: "text" },
      { key: "ERA", label: "ERA (pitchers)", type: "text" },
      { key: "IP",  label: "Innings Pitched", type: "text" },
      { key: "KP",  label: "Strikeouts (pitching)", type: "number" },
    ],
    team: [
      { key: "R",   label: "Runs Scored", type: "number" },
      { key: "RA",  label: "Runs Allowed", type: "number" },
      { key: "H",   label: "Total Hits", type: "number" },
      { key: "E",   label: "Errors", type: "number" },
      { key: "AVG", label: "Team Batting Avg", type: "text" },
      { key: "ERA", label: "Team ERA", type: "text" },
    ],
  },
  Badminton: {
    player: [
      { key: "GW",  label: "Games Won", type: "number" },
      { key: "GL",  label: "Games Lost", type: "number" },
      { key: "PTS", label: "Points Scored", type: "number" },
      { key: "ACE", label: "Aces", type: "number" },
      { key: "ERR", label: "Unforced Errors", type: "number" },
      { key: "SMH", label: "Smashes", type: "number" },
    ],
    team: [
      { key: "GW",  label: "Games Won", type: "number" },
      { key: "GL",  label: "Games Lost", type: "number" },
      { key: "PTS", label: "Total Points", type: "number" },
    ],
  },
  "Table Tennis": {
    player: [
      { key: "GW",  label: "Games Won", type: "number" },
      { key: "GL",  label: "Games Lost", type: "number" },
      { key: "PTS", label: "Points Scored", type: "number" },
      { key: "ERR", label: "Unforced Errors", type: "number" },
      { key: "SRV", label: "Service Aces", type: "number" },
    ],
    team: [
      { key: "GW", label: "Games Won", type: "number" },
      { key: "GL", label: "Games Lost", type: "number" },
    ],
  },
  Frisbee: {
    player: [
      { key: "GOL", label: "Goals", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "DEF", label: "Defensive Plays (D's)", type: "number" },
      { key: "TO",  label: "Turnovers", type: "number" },
      { key: "COM", label: "Completions", type: "number" },
      { key: "THR", label: "Throws", type: "number" },
    ],
    team: [
      { key: "GOL", label: "Goals Scored", type: "number" },
      { key: "DEF", label: "Total D's", type: "number" },
      { key: "TO",  label: "Turnovers", type: "number" },
      { key: "COM%", label: "Completion %", unit: "%", type: "text" },
    ],
  },
  Chess: {
    player: [
      { key: "W",  label: "Wins", type: "number" },
      { key: "L",  label: "Losses", type: "number" },
      { key: "D",  label: "Draws", type: "number" },
      { key: "PTS", label: "Points", type: "text" },
      { key: "RTG", label: "Rating", type: "number" },
    ],
    team: [
      { key: "W",  label: "Wins", type: "number" },
      { key: "L",  label: "Losses", type: "number" },
      { key: "D",  label: "Draws", type: "number" },
      { key: "PTS", label: "Total Points", type: "text" },
    ],
  },
  Scrabble: {
    player: [
      { key: "SCR", label: "Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
      { key: "HW",  label: "Highest Word Score", type: "number" },
    ],
    team: [
      { key: "SCR", label: "Total Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  Sudoku: {
    player: [
      { key: "TME", label: "Completion Time (sec)", type: "number" },
      { key: "SCR", label: "Score", type: "number" },
      { key: "ACC", label: "Accuracy %", unit: "%", type: "text" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  "Rubik's Cube": {
    player: [
      { key: "TME", label: "Best Time (sec)", type: "number" },
      { key: "AVG", label: "Average Time (sec)", type: "text" },
      { key: "SCR", label: "Score", type: "number" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  Petanque: {
    player: [
      { key: "PTS", label: "Points", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
    ],
    team: [
      { key: "PTS", label: "Team Points", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
    ],
  },
  Cheerdance: {
    player: [
      { key: "SCR", label: "Score", type: "text" },
      { key: "DED", label: "Deductions", type: "text" },
      { key: "RNK", label: "Rank", type: "number" },
    ],
    team: [
      { key: "SCR", label: "Final Score", type: "text" },
      { key: "DED", label: "Deductions", type: "text" },
      { key: "RNK", label: "Final Rank", type: "number" },
    ],
  },
  Dancesports: {
    player: [
      { key: "SCR", label: "Score", type: "text" },
      { key: "RNK", label: "Rank", type: "number" },
      { key: "STY", label: "Style", type: "text" },
    ],
    team: [
      { key: "SCR", label: "Final Score", type: "text" },
      { key: "RNK", label: "Final Rank", type: "number" },
    ],
  },
  "Mr. and Ms. Fitness": {
    player: [
      { key: "SCR", label: "Score", type: "text" },
      { key: "RNK", label: "Rank", type: "number" },
      { key: "DED", label: "Deductions", type: "text" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "text" },
      { key: "RNK", label: "Final Rank", type: "number" },
    ],
  },
  "Pinoy Games": {
    player: [
      { key: "SCR", label: "Score / Points", type: "text" },
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
    ],
    team: [
      { key: "PTS", label: "Total Points", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  "Esports - Mobile Legends: Bang Bang": {
    player: [
      { key: "KIL", label: "Kills", type: "number" },
      { key: "DTH", label: "Deaths", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "KDA", label: "KDA Ratio", type: "text" },
      { key: "DMG", label: "Damage Dealt", type: "number" },
      { key: "GPM", label: "Gold/Min", type: "number" },
      { key: "HER", label: "Hero", type: "text" },
    ],
    team: [
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
      { key: "KIL", label: "Total Kills", type: "number" },
      { key: "DTH", label: "Total Deaths", type: "number" },
      { key: "KDR", label: "Kill/Death Ratio", type: "text" },
    ],
  },
  "Esports - DOTA 2": {
    player: [
      { key: "KIL", label: "Kills", type: "number" },
      { key: "DTH", label: "Deaths", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "KDA", label: "KDA", type: "text" },
      { key: "LH",  label: "Last Hits", type: "number" },
      { key: "GPM", label: "GPM", type: "number" },
      { key: "XPM", label: "XPM", type: "number" },
      { key: "HER", label: "Hero", type: "text" },
    ],
    team: [
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
      { key: "KIL", label: "Total Kills", type: "number" },
    ],
  },
  "Esports - Valorant": {
    player: [
      { key: "KIL", label: "Kills", type: "number" },
      { key: "DTH", label: "Deaths", type: "number" },
      { key: "AST", label: "Assists", type: "number" },
      { key: "KDA", label: "KDA", type: "text" },
      { key: "ACS", label: "Avg Combat Score", type: "number" },
      { key: "HSP", label: "Headshot %", unit: "%", type: "text" },
      { key: "AGT", label: "Agent", type: "text" },
    ],
    team: [
      { key: "W",   label: "Wins", type: "number" },
      { key: "L",   label: "Losses", type: "number" },
      { key: "RWR", label: "Round Win Rate", unit: "%", type: "text" },
    ],
  },
  "Esports - Block Blast!": {
    player: [
      { key: "SCR", label: "Score", type: "number" },
      { key: "LVL", label: "Level Reached", type: "number" },
      { key: "LNS", label: "Lines Cleared", type: "number" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  "Esports - Tetris": {
    player: [
      { key: "SCR", label: "Score", type: "number" },
      { key: "LNS", label: "Lines Cleared", type: "number" },
      { key: "LVL", label: "Level", type: "number" },
      { key: "TET", label: "Tetrises", type: "number" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "number" },
      { key: "W",   label: "Wins", type: "number" },
    ],
  },
  "Esports - Cosplay": {
    player: [
      { key: "SCR", label: "Score", type: "text" },
      { key: "RNK", label: "Rank", type: "number" },
      { key: "CHR", label: "Character", type: "text" },
    ],
    team: [
      { key: "SCR", label: "Team Score", type: "text" },
      { key: "RNK", label: "Final Rank", type: "number" },
    ],
  },
};

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

const TEAM_EMOJI: Record<string, string> = Object.fromEntries(
  TEAMS.map((t) => [t.value, t.label.split(" ")[0]])
);

const SPORTS_WITH_STATS = Object.keys(SPORT_STAT_FIELDS).sort();

function getSportIcon(s: string) { return SPORT_ICONS[s] ?? "🏅"; }

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Batch entry row type ─────────────────────────────────────────────────────
type EntryRow = { statName: string; statValue: string; playerId: string };

// ─── Add/Edit Panel ───────────────────────────────────────────────────────────

function StatPanel({
  players,
  stats,
  editingStat,
  onSave,
  onClose,
}: {
  players: Player[];
  stats: Stat[];
  editingStat: Stat | null;
  onSave: (rows: Omit<Stat, "id" | "createdAt">[]) => void;
  onClose: () => void;
}) {
  const isEdit = !!editingStat;

  const [sport,   setSport]   = useState(editingStat?.sport   ?? "");
  const [college, setCollege] = useState(editingStat?.college ?? "");
  const [type,    setType]    = useState<"Player"|"Team">(editingStat?.type ?? "Team");
  const [rows,    setRows]    = useState<EntryRow[]>(
    editingStat
      ? [{ statName: editingStat.statName, statValue: String(editingStat.statValue), playerId: String(editingStat.playerId ?? "") }]
      : [{ statName: "", statValue: "", playerId: "" }]
  );
  const [errors, setErrors] = useState<string[]>([]);

  const template = sport ? SPORT_STAT_FIELDS[sport] : null;
  const fields   = template ? (type === "Player" ? template.player : template.team) : [];

  const collegePlayers = useMemo(
    () => players.filter((p) => (!college || p.college === college) && (!sport || p.sport === sport)),
    [players, college, sport]
  );

  // When sport or type changes, repopulate rows with template fields
  const loadTemplate = () => {
    if (!fields.length) return;
    setRows(fields.map((f) => ({ statName: f.key, statValue: "", playerId: rows[0]?.playerId ?? "" })));
  };

  const updateRow = (i: number, key: keyof EntryRow, value: string) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  };

  const addRow = () => setRows((prev) => [...prev, { statName: "", statValue: "", playerId: rows[0]?.playerId ?? "" }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const errs: string[] = [];
    if (!sport)   errs.push("Sport is required");
    if (!college) errs.push("College is required");
    rows.forEach((r, i) => {
      if (!r.statName)  errs.push(`Row ${i + 1}: Stat name required`);
      if (!r.statValue) errs.push(`Row ${i + 1}: Value required`);
      if (type === "Player" && !r.playerId) errs.push(`Row ${i + 1}: Player required`);
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    const toSave: Omit<Stat, "id" | "createdAt">[] = rows
      .filter((r) => r.statName && r.statValue)
      .map((r) => ({
        type,
        sport,
        college,
        playerId: type === "Player" && r.playerId ? parseInt(r.playerId) : null,
        statName: r.statName,
        statValue: r.statValue,
      }));
    onSave(toSave);
  };

  const inputCls = (err?: boolean) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#A91D3A]/20 focus:border-[#A91D3A] bg-white ${err ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`;

  // Get label for a stat key from template
  const getFieldLabel = (key: string) => fields.find((f) => f.key === key)?.label ?? key;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-[#A91D3A] to-[#741029] flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-0.5">Statistics Center</p>
            <h3 className="text-lg font-black text-white">{isEdit ? "Edit Stat" : "Record Statistics"}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 flex items-center gap-1.5"><AlertCircle className="h-3 w-3 shrink-0" />{e}</p>
              ))}
            </div>
          )}

          {/* Step 1: Context */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Context</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sport *</label>
                <select className={inputCls()} value={sport}
                  onChange={(e) => { setSport(e.target.value); setRows([{ statName: "", statValue: "", playerId: "" }]); setErrors([]); }}>
                  <option value="">Select sport…</option>
                  {SPORTS_WITH_STATS.map((s) => <option key={s} value={s}>{getSportIcon(s)} {s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">College / Team *</label>
                <select className={inputCls()} value={college}
                  onChange={(e) => { setCollege(e.target.value); setErrors([]); }}>
                  <option value="">Select college…</option>
                  {COLLEGES.map((c) => <option key={c} value={c}>{TEAM_EMOJI[c] ?? ""} {c}</option>)}
                </select>
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Recording for *</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Team", "Player"] as const).map((t) => (
                  <button key={t} type="button"
                    onClick={() => { setType(t); setRows([{ statName: "", statValue: "", playerId: "" }]); setErrors([]); }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${type === t ? "bg-[#A91D3A] border-[#A91D3A] text-white" : "bg-white border-gray-200 text-gray-600 hover:border-[#A91D3A]/40"}`}>
                    {t === "Team" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template loader */}
          {sport && fields.length > 0 && !isEdit && (
            <div className="rounded-xl border border-dashed border-[#A91D3A]/30 bg-[#A91D3A]/3 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#A91D3A]">{getSportIcon(sport)} {sport} template ready</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{fields.length} stat fields available</p>
              </div>
              <button onClick={loadTemplate}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#A91D3A] text-white text-xs font-bold hover:bg-[#8B1528] transition">
                Load Template
              </button>
            </div>
          )}

          {/* Stat rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Stat Entries ({rows.length})
              </p>
              {!isEdit && (
                <button onClick={addRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A91D3A] hover:text-[#8B1528] transition">
                  <Plus className="h-3.5 w-3.5" /> Add row
                </button>
              )}
            </div>

            {rows.map((row, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500">Entry {i + 1}</p>
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500 transition">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Player selector (if player type) */}
                {type === "Player" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Player *</label>
                    {collegePlayers.length === 0 ? (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        No players found for {college || "selected college"} in {sport || "selected sport"}. Add players in the Teams tab first.
                      </p>
                    ) : (
                      <select className={inputCls()} value={row.playerId}
                        onChange={(e) => updateRow(i, "playerId", e.target.value)}>
                        <option value="">Select player…</option>
                        {collegePlayers.map((p) => (
                          <option key={p.id} value={p.id}>#{p.jersey} {p.name} — {p.position}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Stat name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stat *</label>
                    {fields.length > 0 ? (
                      <select className={inputCls()} value={row.statName}
                        onChange={(e) => updateRow(i, "statName", e.target.value)}>
                        <option value="">Choose stat…</option>
                        {fields.map((f) => (
                          <option key={f.key} value={f.key}>{f.label}{f.unit ? ` (${f.unit})` : ""}</option>
                        ))}
                        <option value="__custom">Custom…</option>
                      </select>
                    ) : (
                      <input className={inputCls()} placeholder="e.g., Points" value={row.statName}
                        onChange={(e) => updateRow(i, "statName", e.target.value)} />
                    )}
                    {row.statName === "__custom" && (
                      <input className={`${inputCls()} mt-2`} placeholder="Custom stat name"
                        onChange={(e) => updateRow(i, "statName", e.target.value)} />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Value * {row.statName && fields.find(f=>f.key===row.statName)?.unit ? `(${fields.find(f=>f.key===row.statName)?.unit})` : ""}
                    </label>
                    <input
                      type={fields.find(f => f.key === row.statName)?.type === "number" ? "number" : "text"}
                      min="0"
                      className={inputCls()}
                      placeholder={fields.find(f => f.key === row.statName)?.type === "percent" ? "e.g., 45.2" : "Value"}
                      value={row.statValue}
                      onChange={(e) => updateRow(i, "statValue", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50/80 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#8B1528] text-white text-sm font-bold transition shadow-sm">
            {isEdit ? "Update Stat" : `Save ${rows.filter(r=>r.statName&&r.statValue).length || ""} Stat${rows.filter(r=>r.statName&&r.statValue).length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sport Stats Card ─────────────────────────────────────────────────────────

function SportStatCard({
  sport, stats, players,
  onEdit, onDelete,
}: {
  sport: string; stats: Stat[]; players: Player[];
  onEdit: (s: Stat) => void; onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const teamStats   = stats.filter(s => s.type === "Team");
  const playerStats = stats.filter(s => s.type === "Player");

  const getPlayer = (id: number | null) => id != null ? players.find(p => p.id === id) : null;

  // Group player stats by player
  const byPlayer = useMemo(() => {
    const map: Record<string, { player: Player | null; stats: Stat[] }> = {};
    playerStats.forEach(s => {
      const key = String(s.playerId ?? "unknown");
      if (!map[key]) map[key] = { player: getPlayer(s.playerId), stats: [] };
      map[key].stats.push(s);
    });
    return Object.values(map);
  }, [playerStats, players]);

  // Group team stats by college
  const byTeam = useMemo(() => {
    const map: Record<string, Stat[]> = {};
    teamStats.forEach(s => {
      if (!map[s.college]) map[s.college] = [];
      map[s.college].push(s);
    });
    return Object.entries(map);
  }, [teamStats]);

  return (
    <div className={`border border-gray-100 rounded-xl overflow-hidden ${open ? "shadow-sm" : ""}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${open ? "bg-[#A91D3A]/5 border-b border-[#A91D3A]/10" : "bg-white hover:bg-gray-50"}`}
      >
        <span className="text-xl shrink-0">{getSportIcon(sport)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{sport}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {stats.length} entr{stats.length !== 1 ? "ies" : "y"}
            {teamStats.length > 0 && <span className="ml-2">· <Users className="h-2.5 w-2.5 inline" /> {byTeam.length} team{byTeam.length !== 1?"s":""}</span>}
            {playerStats.length > 0 && <span className="ml-2">· <User className="h-2.5 w-2.5 inline" /> {byPlayer.length} player{byPlayer.length !== 1?"s":""}</span>}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="bg-white divide-y divide-gray-50">

          {/* Team Stats */}
          {byTeam.length > 0 && (
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Team Statistics
              </p>
              <div className="space-y-3">
                {byTeam.map(([college, tStats]) => (
                  <div key={college} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-3 py-2 flex items-center gap-2">
                      <span className="text-sm">{TEAM_EMOJI[college] ?? ""}</span>
                      <span className="font-semibold text-gray-700 text-sm">{college}</span>
                      <span className="ml-auto text-[10px] text-gray-400">{tStats.length} stat{tStats.length!==1?"s":""}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                      {tStats.map(s => (
                        <div key={s.id} className="group relative flex items-center justify-between gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2 hover:border-[#A91D3A]/20 hover:bg-[#A91D3A]/2 transition">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 truncate">
                              {SPORT_STAT_FIELDS[sport]?.team.find(f=>f.key===s.statName)?.label ?? s.statName}
                            </p>
                            <p className="text-base font-black text-gray-900 leading-tight">{s.statValue}</p>
                          </div>
                          <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => onEdit(s)} className="p-1 rounded text-gray-400 hover:text-[#A91D3A] hover:bg-[#A91D3A]/10 transition">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => onDelete(s.id)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Stats */}
          {byPlayer.length > 0 && (
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="h-3 w-3" /> Player Statistics
              </p>
              <div className="space-y-3">
                {byPlayer.map(({ player, stats: pStats }) => (
                  <div key={String(pStats[0].playerId)} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-3 py-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#A91D3A]/10 flex items-center justify-center text-[10px] font-black text-[#A91D3A]">
                        {player ? `#${player.jersey}` : "?"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-700 text-sm">{player?.name ?? "Unknown Player"}</span>
                        {player && <span className="ml-2 text-[10px] text-gray-400">{player.position} · {TEAM_EMOJI[player.college] ?? ""} {player.college}</span>}
                      </div>
                      <span className="ml-auto text-[10px] text-gray-400">{pStats.length} stat{pStats.length!==1?"s":""}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                      {pStats.map(s => (
                        <div key={s.id} className="group relative flex items-center justify-between gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2 hover:border-[#A91D3A]/20 transition">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 truncate">
                              {SPORT_STAT_FIELDS[sport]?.player.find(f=>f.key===s.statName)?.label ?? s.statName}
                            </p>
                            <p className="text-base font-black text-gray-900 leading-tight">{s.statValue}</p>
                          </div>
                          <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => onEdit(s)} className="p-1 rounded text-gray-400 hover:text-[#A91D3A] hover:bg-[#A91D3A]/10 transition">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => onDelete(s.id)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ stat, players, onConfirm, onCancel }: {
  stat: Stat; players: Player[];
  onConfirm: () => void; onCancel: () => void;
}) {
  const player = stat.playerId != null ? players.find(p => p.id === stat.playerId) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Delete Stat Entry?</p>
            <p className="text-xs text-gray-500 mt-0.5">This cannot be undone.</p>
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm space-y-1">
          <p><span className="text-gray-400 text-xs">Sport:</span> <span className="font-semibold">{stat.sport}</span></p>
          <p><span className="text-gray-400 text-xs">Stat:</span> <span className="font-semibold">{stat.statName} = {stat.statValue}</span></p>
          {player && <p><span className="text-gray-400 text-xs">Player:</span> <span className="font-semibold">{player.name}</span></p>}
          <p><span className="text-gray-400 text-xs">Team:</span> <span className="font-semibold">{stat.college}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatsPage({ stats, players, onAddStat, onUpdateStat, onDeleteStat }: StatsPageProps) {
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [deleteStat, setDeleteStat] = useState<Stat | null>(null);
  const [search,     setSearch]     = useState("");
  const [viewMode,   setViewMode]   = useState<"sport" | "list">("sport");
  const [sortDir,    setSortDir]    = useState<"asc"|"desc">("desc");

  const activeSports = useMemo(() => [...new Set(stats.map(s => s.sport))].sort(), [stats]);

  const normalized = search.trim().toLowerCase();
  const filteredStats = useMemo(() =>
    stats.filter(s => {
      if (!normalized) return true;
      const player = s.playerId != null ? players.find(p => p.id === s.playerId) : null;
      return [s.sport, s.college, s.statName, String(s.statValue), player?.name ?? ""].join(" ").toLowerCase().includes(normalized);
    }).sort((a, b) => {
      const da = new Date(a.createdAt).getTime(), db = new Date(b.createdAt).getTime();
      return sortDir === "desc" ? db - da : da - db;
    }),
    [stats, players, normalized, sortDir]
  );

  const handleSave = (rows: Omit<Stat, "id" | "createdAt">[]) => {
    if (editingStat) {
      onUpdateStat(editingStat.id, rows[0]);
    } else {
      rows.forEach(r => onAddStat(r));
    }
    setPanelOpen(false);
    setEditingStat(null);
  };

  const openEdit = (s: Stat) => { setEditingStat(s); setPanelOpen(true); };
  const openAdd  = () => { setEditingStat(null); setPanelOpen(true); };

  const handleExport = () => {
    exportCSV(
      ["Type", "Sport", "College", "Player", "Stat", "Value", "Date"],
      stats.map(s => {
        const player = s.playerId != null ? players.find(p => p.id === s.playerId) : null;
        return [csvEscape(s.type), csvEscape(s.sport), csvEscape(s.college),
          csvEscape(player?.name ?? ""), csvEscape(s.statName), csvEscape(s.statValue), csvEscape(fmtDate(s.createdAt))];
      }),
      "iskoarena-stats.csv"
    );
  };

  const totalEntries  = stats.length;
  const teamEntries   = stats.filter(s => s.type === "Team").length;
  const playerEntries = stats.filter(s => s.type === "Player").length;
  const sportsCount   = activeSports.length;

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-[#A91D3A] via-[#8a1630] to-[#741029] p-6 text-white shadow-lg relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-1">Admin Control Center</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Statistics</h2>
              <p className="text-white/65 mt-1.5 text-sm max-w-lg">
                Record sport-specific stats for teams and players. Templates auto-load for each sport.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              {stats.length > 0 && (
                <button onClick={handleExport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition">
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              )}
              <button onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#A91D3A] font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Plus className="h-4 w-4" /> Record Stats
              </button>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["📊", "Total Entries",   totalEntries],
              ["🏐", "Sports Covered",  sportsCount],
              ["👥", "Team Entries",    teamEntries],
              ["👤", "Player Entries",  playerEntries],
            ].map(([e, l, v]) => (
              <div key={String(l)} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3">
                <p className="text-2xl font-black leading-none">{v}</p>
                <p className="text-xs text-white/65 mt-1">{e} {l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {stats.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
            <BarChart3 className="h-14 w-14 mx-auto text-gray-200 mb-4" />
            <p className="font-bold text-gray-600 text-lg mb-1">No statistics recorded yet</p>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Start by selecting a sport — the form will auto-load the correct stat fields for that sport.
            </p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A91D3A] text-white font-bold hover:bg-[#8B1528] transition shadow-sm">
              <Plus className="h-4 w-4" /> Record First Stat
            </button>
          </div>
        )}

        {/* Stats content */}
        {stats.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stats, players, teams…"
                  className="pl-8 pr-7 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white w-full" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>}
              </div>

              {/* View toggle */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white shrink-0">
                {(["sport", "list"] as const).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-xs font-semibold transition ${viewMode === mode ? "bg-[#A91D3A] text-white" : "text-gray-600 hover:text-[#A91D3A]"}`}>
                    {mode === "sport" ? "By Sport" : "List"}
                  </button>
                ))}
              </div>

              {viewMode === "list" && (
                <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#A91D3A]/40 hover:text-[#A91D3A] transition bg-white">
                  {sortDir === "desc" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  {sortDir === "desc" ? "Newest" : "Oldest"}
                </button>
              )}
            </div>

            {/* By Sport view */}
            {viewMode === "sport" && (
              <div className="space-y-2">
                {activeSports
                  .filter(sport => !normalized || stats.filter(s => s.sport === sport).some(s => {
                    const player = s.playerId != null ? players.find(p => p.id === s.playerId) : null;
                    return [s.sport, s.college, s.statName, String(s.statValue), player?.name ?? ""].join(" ").toLowerCase().includes(normalized);
                  }))
                  .map((sport, i) => (
                    <SportStatCard
                      key={sport}
                      sport={sport}
                      stats={stats.filter(s => s.sport === sport).filter(s => {
                        if (!normalized) return true;
                        const player = s.playerId != null ? players.find(p => p.id === s.playerId) : null;
                        return [s.sport, s.college, s.statName, String(s.statValue), player?.name ?? ""].join(" ").toLowerCase().includes(normalized);
                      })}
                      players={players}
                      onEdit={openEdit}
                      onDelete={(id) => { const s = stats.find(x => x.id === id); if (s) setDeleteStat(s); }}
                    />
                  ))}
              </div>
            )}

            {/* List view */}
            {viewMode === "list" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#A91D3A]" />
                  <h3 className="font-bold text-gray-800">All Stats</h3>
                  <span className="text-xs text-gray-400">({filteredStats.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {["Sport","Type","College","Player","Stat","Value","Date",""].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center">
                            <p className="text-gray-400 font-medium">No stats match your search.</p>
                          </td>
                        </tr>
                      ) : filteredStats.map(s => {
                        const player = s.playerId != null ? players.find(p => p.id === s.playerId) : null;
                        const fieldLabel = s.type === "Player"
                          ? SPORT_STAT_FIELDS[s.sport]?.player.find(f => f.key === s.statName)?.label ?? s.statName
                          : SPORT_STAT_FIELDS[s.sport]?.team.find(f => f.key === s.statName)?.label ?? s.statName;
                        return (
                          <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5">
                                <span>{getSportIcon(s.sport)}</span>
                                <span className="text-xs text-gray-600 font-medium">{s.sport}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.type === "Team" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}`}>
                                {s.type === "Team" ? <Users className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                                {s.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{TEAM_EMOJI[s.college] ?? ""} {s.college}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{player ? `#${player.jersey} ${player.name}` : "—"}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{fieldLabel}</td>
                            <td className="px-4 py-3 font-black text-gray-900">{s.statValue}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(s.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#A91D3A] hover:bg-[#A91D3A]/10 transition">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setDeleteStat(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredStats.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 text-xs text-gray-400">
                    Showing <strong className="text-gray-600">{filteredStats.length}</strong> of <strong className="text-gray-600">{stats.length}</strong> entries
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Panels & modals */}
      {panelOpen && (
        <StatPanel
          players={players}
          stats={stats}
          editingStat={editingStat}
          onSave={handleSave}
          onClose={() => { setPanelOpen(false); setEditingStat(null); }}
        />
      )}

      {deleteStat && (
        <DeleteModal
          stat={deleteStat}
          players={players}
          onConfirm={() => { onDeleteStat(deleteStat.id); setDeleteStat(null); }}
          onCancel={() => setDeleteStat(null)}
        />
      )}
    </>
  );
}