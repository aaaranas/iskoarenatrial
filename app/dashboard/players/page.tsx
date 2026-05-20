"use client";

// /dashboard/players — Read-only player directory.
//
// Shows all players across every college and sport. Management (add, edit,
// remove) stays in /dashboard/teams (CollegeProfilePage). This page is an
// admin-facing overview for finding players quickly and filtering by org/sport.
//
// Data: trpc.players.getAll (name, jersey, position, photo, sport join)
//       trpc.team.getAll    (id → org → name map for college display)

import React, { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { COLLEGE_ORGS } from "@/lib/constants";

// College accent colours — mirrors design tokens (Tailwind college-* classes
// aren't available in inline-style contexts, so we duplicate here).
const COLLEGE_COLOR: Record<string, string> = {
  COS:  "#3B82F6",
  CSS:  "#10B981",
  CCAD: "#A78BFA",
  SOM:  "#F59E0B",
};

// Builds the initials avatar fallback when a player has no photo_url.
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── PlayerRow ──────────────────────────────────────────────────────────────
function PlayerRow({
  player,
  collegeName,
  collegeOrg,
}: {
  player: {
    id: string;
    name: string;
    jersey_number: number | null;
    position: string | null;
    photo_url: string | null;
    sport: { id: string; name: string } | null;
  };
  collegeName: string;
  collegeOrg: string;
}) {
  const accentColor = COLLEGE_COLOR[collegeOrg] ?? "#A91D3A";

  return (
    <tr className="hover:bg-white/[0.03] transition-colors border-b border-white/[0.06] last:border-0">
      {/* Name + avatar */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          {player.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.name}
              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            // Coloured initial avatar using the college accent colour.
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white flex-shrink-0"
              style={{ backgroundColor: `${accentColor}33`, border: `1px solid ${accentColor}55` }}
            >
              <span style={{ color: accentColor }}>{initials(player.name)}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">{player.name}</p>
            {player.jersey_number != null && (
              <p className="text-white/40 text-[10px] font-mono tracking-wider mt-0.5">
                #{String(player.jersey_number).padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* College */}
      <td className="py-4 pr-4">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
        >
          {collegeOrg}
        </span>
      </td>

      {/* Sport */}
      <td className="py-4 pr-4 text-white/60 text-sm">
        {player.sport?.name ?? <span className="text-white/25 italic">—</span>}
      </td>

      {/* Position */}
      <td className="py-4 text-white/60 text-sm">
        {player.position ?? <span className="text-white/25 italic">—</span>}
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PlayersPage() {
  const [search,        setSearch]        = useState("");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterSport,   setFilterSport]   = useState<string>("all");

  const { data: playersRaw = [], isLoading: playersLoading } =
    trpc.players.getAll.useQuery();

  const { data: teams = [], isLoading: teamsLoading } =
    trpc.team.getAll.useQuery();

  const isLoading = playersLoading || teamsLoading;

  // Build a college_id → { org, name } map from the teams list. Used to
  // resolve players.college_id into a displayable college name + org code.
  const collegeMap = useMemo(() => {
    const map = new Map<string, { org: string; name: string }>();
    for (const t of teams as Array<any>) {
      if (t.id) map.set(t.id, { org: t.org ?? "?", name: t.name ?? t.org ?? "?" });
    }
    return map;
  }, [teams]);

  // Derive the unique sport names from the actual player list — used to
  // populate the sport filter dropdown with only sports that exist.
  const availableSports = useMemo(() => {
    const seen = new Set<string>();
    const sports: string[] = [];
    for (const p of playersRaw as Array<any>) {
      const name = p.sport?.name;
      if (name && !seen.has(name)) { seen.add(name); sports.push(name); }
    }
    return sports.sort();
  }, [playersRaw]);

  // Filtered + shaped player list.
  const players = useMemo(() => {
    const searchLower = search.toLowerCase();
    return (playersRaw as Array<any>)
      .map((p) => ({
        id:            p.id as string,
        name:          p.name as string,
        jersey_number: p.jersey_number as number | null,
        position:      p.position as string | null,
        photo_url:     p.photo_url as string | null,
        sport:         p.sport as { id: string; name: string } | null,
        college:       collegeMap.get(p.college_id as string) ?? { org: "?", name: "?" },
      }))
      .filter((p) => {
        const matchesSearch   = !search || p.name.toLowerCase().includes(searchLower);
        const matchesCollege  = filterCollege === "all" || p.college.org === filterCollege;
        const matchesSport    = filterSport === "all" || p.sport?.name === filterSport;
        return matchesSearch && matchesCollege && matchesSport;
      });
  }, [playersRaw, collegeMap, search, filterCollege, filterSport]);

  // Stats for the summary row: total + per-college counts from the full
  // (unfiltered) player list.
  const stats = useMemo(() => {
    const counts: Record<string, number> = { COS: 0, CSS: 0, CCAD: 0, SOM: 0 };
    for (const p of playersRaw as Array<any>) {
      const org = collegeMap.get(p.college_id as string)?.org;
      if (org && org in counts) counts[org]++;
    }
    return { total: (playersRaw as any[]).length, counts };
  }, [playersRaw, collegeMap]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 md:p-8">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06] px-6 md:px-8 py-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-white/60" />
            <h1 className="text-xl font-black text-white tracking-tight">Player Directory</h1>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-ia-accent/50 transition-all w-64"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Stats summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Total */}
          <div className="col-span-2 md:col-span-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Total Players</p>
            <p className="text-4xl font-black text-white">
              {isLoading ? <Loader2 size={24} className="animate-spin text-white/30 mt-1" /> : stats.total}
            </p>
          </div>
          {/* Per-college */}
          {COLLEGE_ORGS.map((org) => {
            const color = COLLEGE_COLOR[org] ?? "#fff";
            return (
              <div
                key={org}
                className="border rounded-xl p-5 cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
                onClick={() => setFilterCollege(filterCollege === org ? "all" : org)}
              >
                <p
                  className="text-[10px] uppercase tracking-widest font-bold mb-2"
                  style={{ color }}
                >
                  {org}
                </p>
                <p className="text-4xl font-black text-white">
                  {isLoading ? "…" : stats.counts[org] ?? 0}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* College filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold mr-1">College</span>
            {(["all", ...COLLEGE_ORGS] as const).map((org) => (
              <button
                key={org}
                onClick={() => setFilterCollege(org)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filterCollege === org
                    ? "bg-ia-accent border-ia-accent text-white shadow-[0_0_10px_rgba(169,29,58,0.4)]"
                    : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {org === "all" ? "All" : org}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10 hidden md:block" />

          {/* Sport filter — dynamic from player data */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold mr-1">Sport</span>
            <button
              onClick={() => setFilterSport("all")}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                filterSport === "all"
                  ? "bg-ia-accent border-ia-accent text-white shadow-[0_0_10px_rgba(169,29,58,0.4)]"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              All
            </button>
            {availableSports.map((sport) => (
              <button
                key={sport}
                onClick={() => setFilterSport(filterSport === sport ? "all" : sport)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filterSport === sport
                    ? "bg-ia-accent border-ia-accent text-white shadow-[0_0_10px_rgba(169,29,58,0.4)]"
                    : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* ── Player table ── */}
        <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={20} className="animate-spin text-white/30" />
            </div>
          ) : players.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-white/30 text-sm">
                {search || filterCollege !== "all" || filterSport !== "all"
                  ? "No players match your filters."
                  : "No players added yet — add them in /dashboard/teams."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/35">
                      Player ({players.length})
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/35">College</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/35">Sport</th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-white/35">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {players.map((p) => (
                    <PlayerRow
                      key={p.id}
                      player={p}
                      collegeName={p.college.name}
                      collegeOrg={p.college.org}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
