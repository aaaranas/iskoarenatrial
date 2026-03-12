"use client";

import React, { useMemo } from "react";
import {
  Trophy, Zap, Users, User, Calendar, ChevronRight,
  Medal, TrendingUp, Clock, MapPin, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match, Result, Player, Team, PageName } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  matches: Match[];
  results: Result[];
  players: Player[];
  teams: Team[];
  onNavigate?: (page: PageName) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLLEGE_META: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  "COS Scions":    { emoji: "🎯", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  "SOM Tycoons":   { emoji: "💼", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
  "CSS Stallions": { emoji: "🐴", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  "CCAD Phoenix":  { emoji: "🔥", color: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
};

const SPORT_ICONS: Record<string, string> = {
  "Basketball Men": "🏀", "Basketball Women": "🏀",
  "Volleyball Men": "🏐", "Volleyball Women": "🏐",
  Badminton: "🏸", Soccer: "⚽", Softball: "🥎",
  "Table Tennis": "🏓", Chess: "♟️", Scrabble: "🔤",
  Frisbee: "🥏", Cheerdance: "📣", Dancesports: "💃",
  "Esports - Mobile Legends: Bang Bang": "🎮",
  "Esports - DOTA 2": "🎮", "Esports - Valorant": "🎮",
  "Esports - Block Blast!": "🎮", "Esports - Tetris": "🟦",
  "Esports - Cosplay": "🎭", "Pinoy Games": "🎲",
  "Mr. and Ms. Fitness": "💪", "Rubik's Cube": "🟥",
  Petanque: "🎯", Sudoku: "🔢",
};

function getSportIcon(sport: string) { return SPORT_ICONS[sport] ?? "🏅"; }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// ── MatchRow ──────────────────────────────────────────────────────────────────

function MatchRow({ match, isLive, hasResult }: { match: Match; isLive: boolean; hasResult: boolean }) {
  const statusCls = isLive
    ? "bg-red-100 text-red-700 border-red-200"
    : hasResult
    ? "bg-gray-100 text-gray-500 border-gray-200"
    : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
      <span className="text-xl shrink-0 w-8 text-center">{getSportIcon(match.sport)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-800 truncate">{match.teamA}</span>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">vs</span>
          <span className="text-sm font-bold text-gray-800 truncate">{match.teamB}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-medium">{match.sport}</span>
          {match.venue && (
            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
              <MapPin className="w-2.5 h-2.5" />{match.venue}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-gray-400 justify-end mb-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(match.date)} · {formatTime(match.time)}</span>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide", statusCls)}>
          {isLive ? "Live" : hasResult ? "Finished" : "Upcoming"}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardPage({ matches, results, players, teams, onNavigate }: DashboardPageProps) {
  const now = new Date();

  const ongoingMatches = useMemo(() => matches.filter((m) => {
    const dt = new Date(`${m.date}T${m.time}`);
    const diff = now.getTime() - dt.getTime();
    const hasResult = results.some((r) => r.matchId === String(m.id));
    return diff > 0 && diff < 2 * 60 * 60 * 1000 && !hasResult;
  }), [matches, results]);

  const upcomingMatches = useMemo(() =>
    matches
      .filter((m) => new Date(`${m.date}T${m.time}`) > now && !results.some((r) => r.matchId === String(m.id)))
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()),
    [matches, results]
  );

  const recentResults = useMemo(() =>
    [...results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [results]
  );

  const recentMatches = useMemo(() =>
    [...matches].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()).slice(0, 6),
    [matches]
  );

  const collegeStandings = useMemo(() => {
    const wins: Record<string, number> = {};
    const losses: Record<string, number> = {};
    const colleges = ["COS Scions", "SOM Tycoons", "CSS Stallions", "CCAD Phoenix"];
    colleges.forEach((c) => { wins[c] = 0; losses[c] = 0; });
    results.forEach((r) => {
      if (r.winner && r.winner !== "Draw") {
        if (wins[r.winner] !== undefined) wins[r.winner]++;
        const loser = r.winner === r.teamA ? r.teamB : r.teamA;
        if (losses[loser] !== undefined) losses[loser]++;
      }
    });
    return colleges
      .map((c) => ({ college: c, wins: wins[c], losses: losses[c], played: wins[c] + losses[c] }))
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  }, [results]);

  const topPlayers = players.slice(0, 5);
  const nextMatch = upcomingMatches[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#A91D3A] via-[#8a1630] to-[#5a0e20] p-6 md:p-8 text-white shadow-lg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -left-8 bottom-0 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">IskoArena</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">UP Cebu Intramurals</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Command Center</h1>
            <p className="text-white/60 text-sm mt-1.5 max-w-md">
              Live overview of all intramural activity — matches, standings, and players at a glance.
            </p>
          </div>

          {/* Live / Next match card */}
          {ongoingMatches.length > 0 ? (
            <div className="shrink-0 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-300">{ongoingMatches.length} Live</span>
              </div>
              <p className="font-bold text-sm">{ongoingMatches[0].teamA}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider my-0.5">vs</p>
              <p className="font-bold text-sm">{ongoingMatches[0].teamB}</p>
              <p className="text-white/50 text-[11px] mt-1.5">{getSportIcon(ongoingMatches[0].sport)} {ongoingMatches[0].sport}</p>
            </div>
          ) : nextMatch ? (
            <div className="shrink-0 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 text-white/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Next Match</span>
              </div>
              <p className="font-bold text-sm">{nextMatch.teamA}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider my-0.5">vs</p>
              <p className="font-bold text-sm">{nextMatch.teamB}</p>
              <p className="text-white/50 text-[11px] mt-1.5">{formatDate(nextMatch.date)} · {formatTime(nextMatch.time)}</p>
            </div>
          ) : null}
        </div>

        {/* Mini stats */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Matches", value: matches.length, icon: "🏟️" },
            { label: "Completed",     value: results.length,         icon: "✅" },
            { label: "Players",       value: players.length,         icon: "👤" },
            { label: "Live Now",      value: ongoingMatches.length,  icon: "⚡" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-xl font-black leading-none">{value}</p>
              <p className="text-[11px] text-white/55 mt-1">{icon} {label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Match Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#A91D3A]" />
                <h2 className="font-bold text-gray-800 text-sm">Match Schedule</h2>
                {ongoingMatches.length > 0 && (
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {ongoingMatches.length} Live
                  </span>
                )}
              </div>
              <button onClick={() => onNavigate?.("matches")} className="flex items-center gap-1 text-xs font-semibold text-[#A91D3A] hover:text-[#8B1528] transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {recentMatches.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">🏟️</p>
                <p className="text-sm font-semibold text-gray-500">No matches scheduled yet</p>
                <p className="text-xs text-gray-400 mt-1">Add matches in the Matches tab</p>
                <button onClick={() => onNavigate?.("matches")} className="mt-4 px-4 py-2 bg-[#A91D3A] text-white text-xs font-bold rounded-lg hover:bg-[#8B1528] transition-colors">
                  Add Match
                </button>
              </div>
            ) : (
              recentMatches.map((m) => (
                <MatchRow key={m.id} match={m}
                  isLive={ongoingMatches.some((x) => x.id === m.id)}
                  hasResult={results.some((r) => r.matchId === String(m.id))}
                />
              ))
            )}
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#A91D3A]" />
                <h2 className="font-bold text-gray-800 text-sm">Recent Results</h2>
              </div>
              <button onClick={() => onNavigate?.("results")} className="flex items-center gap-1 text-xs font-semibold text-[#A91D3A] hover:text-[#8B1528] transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {recentResults.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-3">🏆</p>
                <p className="text-sm font-semibold text-gray-500">No results recorded yet</p>
                <p className="text-xs text-gray-400 mt-1">Record results in the Results tab</p>
              </div>
            ) : (
              recentResults.map((r) => {
                const isDraw = r.winner === "Draw";
                const winnerMeta = COLLEGE_META[r.winner];
                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <span className="text-lg shrink-0">{getSportIcon(r.sport)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-sm font-bold truncate", r.winner === r.teamA ? "text-gray-900" : "text-gray-400")}>{r.teamA}</span>
                        <span className="shrink-0 font-black text-base text-gray-800 tabular-nums">{r.scoreA}–{r.scoreB}</span>
                        <span className={cn("text-sm font-bold truncate", r.winner === r.teamB ? "text-gray-900" : "text-gray-400")}>{r.teamB}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{r.sport}</p>
                    </div>
                    <div className="shrink-0">
                      {isDraw ? (
                        <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">Draw</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={winnerMeta ? { background: winnerMeta.bg, color: winnerMeta.color, borderColor: winnerMeta.border } : { background: "#f0fdf4", color: "#065f46", borderColor: "#a7f3d0" }}>
                          {winnerMeta?.emoji} {r.winner}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-6">

          {/* College Standings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Medal className="w-4 h-4 text-[#A91D3A]" />
              <h2 className="font-bold text-gray-800 text-sm">College Standings</h2>
            </div>
            <div className="p-4 space-y-2">
              {results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">🏅</p>
                  <p className="text-xs text-gray-400">Standings will appear once results are recorded</p>
                </div>
              ) : (
                collegeStandings.map((entry, i) => {
                  const meta = COLLEGE_META[entry.college];
                  const rankIcons = ["🥇", "🥈", "🥉", "4️⃣"];
                  const isLeader = i === 0 && entry.wins > 0;
                  return (
                    <div key={entry.college} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={isLeader ? { background: meta?.bg, border: `1px solid ${meta?.border}` } : { background: "#f9fafb" }}>
                      <span className="text-lg shrink-0">{rankIcons[i]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{meta?.emoji}</span>
                          <span className="text-sm font-bold text-gray-800 truncate">{entry.college}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${entry.played > 0 ? (entry.wins / entry.played) * 100 : 0}%`, background: meta?.color ?? "#A91D3A" }} />
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-black text-gray-800 leading-none">{entry.wins}<span className="text-[10px] font-semibold text-gray-400">W</span></p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.losses}L · {entry.played}G</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Players snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#A91D3A]" />
                <h2 className="font-bold text-gray-800 text-sm">Players</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{players.length}</span>
              </div>
              <button onClick={() => onNavigate?.("teams")} className="flex items-center gap-1 text-xs font-semibold text-[#A91D3A] hover:text-[#8B1528] transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {topPlayers.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">👥</p>
                <p className="text-xs text-gray-400">No players registered yet</p>
                <button onClick={() => onNavigate?.("teams")} className="mt-3 px-3 py-1.5 bg-[#A91D3A] text-white text-xs font-bold rounded-lg hover:bg-[#8B1528] transition-colors">
                  Add Players
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topPlayers.map((p) => {
                  const meta = COLLEGE_META[p.college];
                  const initials = p.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden"
                        style={{ background: meta?.color ?? "#A91D3A" }}>
                        {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{p.position} · {p.sport}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={meta ? { background: meta.bg, color: meta.color } : {}}>
                          {meta?.emoji}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">#{p.jersey}</p>
                      </div>
                    </div>
                  );
                })}
                {players.length > 5 && (
                  <div className="px-5 py-3 text-center">
                    <button onClick={() => onNavigate?.("teams")} className="text-xs font-semibold text-[#A91D3A] hover:text-[#8B1528] transition-colors">
                      +{players.length - 5} more players →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A91D3A]" />
              <h2 className="font-bold text-gray-800 text-sm">Quick Actions</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {([
                { label: "Add Match",      page: "matches",       emoji: "📅" },
                { label: "Record Result",  page: "results",       emoji: "🏆" },
                { label: "Log Stats",      page: "stats",         emoji: "📊" },
                { label: "Add Player",     page: "teams",         emoji: "👤" },
                { label: "Upload Media",   page: "media",         emoji: "📸" },
                { label: "Notify",         page: "notifications", emoji: "🔔" },
              ] as { label: string; page: PageName; emoji: string }[]).map(({ label, page, emoji }) => (
                <button key={page} onClick={() => onNavigate?.(page)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#fdf2f4] hover:text-[#A91D3A] text-gray-600 text-xs font-semibold transition-all border border-transparent hover:border-[#A91D3A]/20 text-left">
                  <span>{emoji}</span><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}