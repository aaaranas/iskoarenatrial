"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gem, Medal, ChevronDown } from "lucide-react";

// ── Rank medal config ────────────────────────────────────────────────────────
const MEDAL = [
  { ring: "ring-yellow-400/40",  border: "border-yellow-400/50",  num: "text-yellow-400",  bar: "bg-yellow-400" },
  { ring: "ring-zinc-300/30",    border: "border-zinc-300/40",    num: "text-zinc-300",    bar: "bg-zinc-400"  },
  { ring: "ring-amber-700/40",   border: "border-amber-700/50",   num: "text-amber-600",   bar: "bg-amber-700" },
] as const;

function collegeAbbr(college: string | null | undefined) {
  return college ? college.split(" ")[0] : null;
}

/* =========================
   Memoized Row Component
========================= */
const LeaderboardRow = React.memo(function LeaderboardRow({ user, index }: any) {
  const medal = index < 3 ? MEDAL[index] : null;

  return (
    <TableRow className="border-none group relative transition-colors duration-200 hover:bg-white/[0.025]">
      {/* Top-3 left accent bar */}
      {medal && (
        <td className="absolute left-0 top-0 bottom-0 w-[3px] p-0 border-none">
          <div className={`h-full w-full ${medal.bar} opacity-70`} />
        </td>
      )}

      {/* Rank */}
      <TableCell className="pl-5 w-[72px]">
        {medal ? (
          <div className="flex items-center gap-2">
            <Medal className={`w-4 h-4 ${medal.num}`} />
            <span className={`font-black text-sm font-mono ${medal.num}`}>{user.rank}</span>
          </div>
        ) : (
          <span className="text-zinc-700 font-mono text-sm">{user.rank}</span>
        )}
      </TableCell>

      {/* Participant: logo + name + college sub-label */}
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          {/* College logo circle */}
          <div className={`relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[#1A1A1A] border ${medal ? `border-2 ${medal.border} ring-2 ${medal.ring}` : "border-white/10"} transition-all group-hover:scale-105`}>
            {user.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.logo} alt={user.college ?? user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-zinc-500 text-sm font-bold">
                {user.name?.[0] ?? "?"}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
            {user.college && (
              <p className="text-[10px] text-zinc-600 uppercase tracking-[0.15em] mt-0.5 truncate">
                {user.college}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* College badge */}
      <TableCell className="hidden sm:table-cell">
        {user.logo && user.college ? (
          <div className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.logo} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {collegeAbbr(user.college)}
            </span>
          </div>
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </TableCell>

      {/* Points */}
      <TableCell className="text-[#C5A059] font-bold text-sm tracking-wide">
        {user.points ?? "—"}
      </TableCell>

      {/* Reward */}
      <TableCell className="text-right pr-4">
        {user.reward ? (
          <div className="inline-flex items-center justify-end gap-1.5 bg-[#121212] px-3 py-1.5 rounded-full border border-[#1A1A1A] group-hover:border-[#A91D3A]/30 transition-colors">
            <Gem className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-xs font-bold text-white tracking-tight">{user.reward}</span>
          </div>
        ) : (
          <span className="text-zinc-800 text-xs">—</span>
        )}
      </TableCell>
    </TableRow>
  );
});

/* =========================
   Main Component
========================= */
export function LeaderboardTable({ players = [], teams = [] }: any) {
  const [mode, setMode] = useState<"players" | "teams">("players");

  const memoPlayers = useMemo(() => players, [players]);
  const memoTeams   = useMemo(() => teams,   [teams]);

  const rows = mode === "players" ? memoPlayers : memoTeams;
  const isEmpty = rows.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">

      {/* Toggle */}
      <div className="flex justify-center gap-2 pt-6">
        {(["players", "teams"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full transition-all ${
              mode === m
                ? "bg-white text-black shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="relative rounded-2xl bg-[#0E0E0E] shadow-2xl overflow-hidden border border-white/[0.04]">
        <div className="[mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[72px] pl-5 text-zinc-700 font-bold uppercase text-[9px] tracking-[0.25em]">
                  Rank
                </TableHead>
                <TableHead className="text-zinc-700 font-bold uppercase text-[9px] tracking-[0.25em]">
                  Participant
                </TableHead>
                <TableHead className="hidden sm:table-cell text-zinc-700 font-bold uppercase text-[9px] tracking-[0.25em]">
                  College
                </TableHead>
                <TableHead className="text-zinc-700 font-bold uppercase text-[9px] tracking-[0.25em]">
                  Points
                </TableHead>
                <TableHead className="text-right pr-4 text-zinc-700 font-bold uppercase text-[9px] tracking-[0.25em]">
                  Reward
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isEmpty ? (
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16 text-zinc-700 text-xs tracking-widest uppercase">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((user: any, index: number) => (
                  <LeaderboardRow key={user.id} user={user} index={index} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* See More */}
        <div className="absolute bottom-0 left-0 w-full px-6 py-5 flex justify-center bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/90 to-transparent">
          <button className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.25em]">
            See More <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
