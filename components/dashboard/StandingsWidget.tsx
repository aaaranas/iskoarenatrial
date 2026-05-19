// Dashboard V2 — Tabbed standings widget.
// Sport tabs across the top (Basketball, Volleyball, MLBB, Chess); table below.
// Rank-1 row gets gold-tinted #, maroon-tinted PCT. All other rows muted.
//
// Data is static (STANDINGS) — wire to trpc.stats.getStandings when TM3 lands.
"use client";

import { useState } from "react";
import { CollegeBadge, MonoLabel } from "./DashboardPrimitives";
import { STANDINGS, type StandingsSport } from "./dashboard-data";

const SPORTS: StandingsSport[] = ["Basketball", "Volleyball", "MLBB", "Chess"];

export function StandingsWidget() {
  const [tab, setTab] = useState<StandingsSport>("Basketball");
  const rows = STANDINGS[tab];

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden">
      {/* Tab strip — 4 equal-width sport buttons. Active: black bg + maroon underline. */}
      <div className="flex border-b border-white/[0.07]">
        {SPORTS.map((sport) => {
          const isActive = tab === sport;
          return (
            <button
              key={sport}
              type="button"
              onClick={() => setTab(sport)}
              className={`flex-1 px-2 py-2.5 font-bebas text-xs tracking-[0.12em] cursor-pointer border-r border-white/[0.07] last:border-r-0 transition-colors ${
                isActive
                  ? "bg-black text-white border-b-2 border-b-ia-accent -mb-px"
                  : "bg-transparent text-white/35 hover:text-white/60"
              }`}
            >
              {sport.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="px-3.5 pb-3.5 pt-1">
        {/* Header row */}
        <div className="grid grid-cols-[24px_1fr_30px_30px_40px_36px] py-2.5 border-b border-white/[0.07] font-mono text-[9px] text-white/35 tracking-[0.1em]">
          <span>#</span>
          <span>TEAM</span>
          <span className="text-right">W</span>
          <span className="text-right">L</span>
          <span className="text-right">PCT</span>
          <span className="text-right">GB</span>
        </div>

        {/* Body rows */}
        {rows.map((row, i) => {
          const isLeader = i === 0;
          const isLast = i === rows.length - 1;
          return (
            <div
              key={row.code}
              className={`grid grid-cols-[24px_1fr_30px_30px_40px_36px] items-center py-2 text-xs ${
                !isLast ? "border-b border-white/[0.07]" : ""
              }`}
            >
              <span
                className={`font-bebas text-sm ${
                  isLeader ? "text-ia-gold" : "text-white/50"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex items-center gap-2">
                <CollegeBadge code={row.code} size={20} ring={false} />
                <span className="font-semibold text-white">{row.code}</span>
              </span>
              <MonoLabel className="text-white text-right block">{row.w}</MonoLabel>
              <MonoLabel className="text-white/50 text-right block">{row.l}</MonoLabel>
              <MonoLabel className={`${isLeader ? "text-ia-accent" : "text-white"} text-right block`}>
                {row.pct}
              </MonoLabel>
              <MonoLabel className="text-white/35 text-right block">{row.gb}</MonoLabel>
            </div>
          );
        })}
      </div>
    </div>
  );
}
