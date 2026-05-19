// Dashboard V2 — Top Performer broadcast spotlight card.
// 140px photo header w/ diagonal gradient + corner tag + 2-line italic name overlay,
// then a 4-column stats footer (PPG / RPG / APG / STL).
//
// Subject is static (PLAYER) — replace with trpc.players.getTopPerformer when wired.
"use client";

import Image from "next/image";
import { PLAYER } from "./dashboard-data";

export function TopPerformerCard() {
  // Stats are stored as { PPG: 22.4, ... } — render as ordered columns.
  const statEntries = Object.entries(PLAYER.stats);

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden relative">
      {/* Photo header (140px) with gradient overlay + corner tag + name overlay */}
      <div className="relative h-[140px] overflow-hidden">
        <Image
          src={PLAYER.photo}
          alt={PLAYER.lastName}
          fill
          sizes="360px"
          className="object-cover"
          style={{ objectPosition: "center 20%", filter: "saturate(0.9)" }}
        />
        {/* Diagonal gradient: dark bottom + dark left to make text legible on any photo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.95) 100%), linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 50%)",
          }}
        />
        {/* Top-left corner tag — sharp maroon block with broadcast styling */}
        <div className="absolute top-3 left-3 bg-ia-accent px-2 py-[3px] font-bebas text-[11px] tracking-[0.18em] text-white">
          ★ TOP PERFORMER · WEEK 4
        </div>
        {/* Name overlay — bottom-left, two lines (white + maroon) */}
        <div className="absolute bottom-3 left-3.5 right-3.5">
          <div className="font-bebas italic text-3xl leading-[0.95] tracking-[0.02em] text-white">
            {PLAYER.firstName}
          </div>
          <div className="font-bebas italic text-3xl leading-[0.95] tracking-[0.02em] text-ia-accent">
            {PLAYER.lastName}
          </div>
        </div>
      </div>

      {/* Stats footer — 4 equal columns separated by vertical hairlines */}
      <div className="grid grid-cols-4 border-t border-white/[0.07]">
        {statEntries.map(([key, value], i, arr) => (
          <div
            key={key}
            className={`py-3 px-1.5 text-center ${
              i < arr.length - 1 ? "border-r border-white/[0.07]" : ""
            }`}
          >
            <div className="font-bebas text-[22px] tracking-[0.02em] text-white">{value}</div>
            <div className="text-[9px] text-white/35 tracking-[0.12em] font-mono">{key}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
