"use client";

// Standings — two-column section. Sport tabs on the left (active = maroon
// pill), table on the right showing W-L-PCT-GB per college. Top row is gold-
// highlighted as the leader.
//
// Data is LIVE — aggregated from completed matches via trpc.match.getStandings.
// Each tab calls getStandings without a category filter, so Men + Women records
// are combined (a deliberate choice for the public landing page overview).
// The full category-split view lives on the Leaderboards page.

import React, { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { COLLEGE_LOGOS } from "./data";
import SectionLabel from "./SectionLabel";
import type { CollegeCode } from "./data";

// Sport tab definitions. sportNames drives the trpc.match.getStandings call;
// aggregates across categories (no category filter = Men + Women combined).
// Sport names MUST match sports.name in the DB exactly.
const TABS = [
  { label: "Basketball", sportNames: ["Basketball"] },
  { label: "Volleyball",  sportNames: ["Volleyball"] },
  { label: "MLBB",        sportNames: ["MLBB"] },
  { label: "Chess",       sportNames: ["Chess"] },
] as const;

type TabLabel = (typeof TABS)[number]["label"];

// Individual standings row — rendered in the table card.
function StandingsRow({
  row,
  rank,
  isLast,
}: {
  row: { code: string; w: number; l: number; pct: string; gb: string };
  rank: number;
  isLast: boolean;
}) {
  const isLeader = rank === 0;
  const code = row.code as CollegeCode;

  return (
    <div
      className={`grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 ${
        !isLast ? "border-b border-white/[0.05]" : ""
      } ${isLeader ? "bg-ia-maroon/[0.07]" : ""}`}
    >
      {/* College cell — rank, logo, code, optional LEAD pill */}
      <div className="flex items-center gap-3.5">
        <span className="w-[18px] font-mono text-[11px] text-white/30">
          #{rank + 1}
        </span>
        <div
          className={`relative h-[34px] w-[34px] overflow-hidden rounded-lg bg-white ${
            isLeader ? "border-2 border-ia-gold" : "border border-white/10"
          }`}
        >
          <Image
            src={COLLEGE_LOGOS[code] ?? "/colleges/cos_logo.jpg"}
            alt={code}
            fill
            sizes="34px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-sm font-bold text-[#f0f0f0]">{code}</div>
          {isLeader && (
            <span className="text-[9px] font-extrabold tracking-[1.5px] text-ia-gold">
              ★ LEAD
            </span>
          )}
        </div>
      </div>

      {/* Stat cells */}
      {[row.w, row.l, row.pct, row.gb].map((v, j) => (
        <span
          key={j}
          className={`text-center font-mono text-sm tabular-nums ${
            j === 0 ? "font-bold text-[#f0f0f0]" : "font-normal text-white/55"
          }`}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export default function StandingsSection() {
  const [activeTab, setActiveTab] = useState<TabLabel>("Basketball");

  const currentTab = TABS.find((t) => t.label === activeTab)!;

  const { data: rows, isLoading } = trpc.match.getStandings.useQuery({
    sportNames: currentTab.sportNames as unknown as string[],
  });

  const hasAnyGames = (rows ?? []).some((r) => r.w + r.l > 0);

  return (
    <section
      id="standings"
      className="border-y border-white/[0.05] bg-ia-bg-alt px-6 py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          {/* Left: section heading + sport tab list */}
          <div>
            <SectionLabel>Standings</SectionLabel>
            <h2 className="mb-6 font-bebas text-[clamp(44px,5.5vw,80px)] leading-[0.95] tracking-[1px] text-[#f0f0f0]">
              College
              <br />
              Rankings
            </h2>
            <p className="mb-8 max-w-[380px] text-sm leading-[1.7] text-white/45">
              Switch between sports to see how COS, CSS, CCAD, and SOM stack up in each discipline.
            </p>

            {/* Sport tabs */}
            <div className="flex flex-col gap-2">
              {TABS.map(({ label }) => {
                const isActive = activeTab === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTab(label)}
                    className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3.5 text-left text-sm transition-all ${
                      isActive
                        ? "border-ia-maroon bg-ia-maroon/[0.16] font-semibold text-[#f0f0f0]"
                        : "border-white/[0.07] bg-transparent text-white/40 hover:border-white/15 hover:text-white/70"
                    }`}
                  >
                    {isActive && <span className="h-[18px] w-1 rounded bg-ia-maroon" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: standings table card */}
          <div className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-ia-card">
            {/* Table header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <span className="font-bebas text-lg tracking-[2px] text-[#f0f0f0]">
                {activeTab.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold tracking-[2px] text-ia-gold">
                SEASON 2026
              </span>
            </div>

            {isLoading ? (
              // Loading skeleton — matches the height of 4 data rows
              <div className="flex items-center justify-center py-20">
                <Loader2 size={18} className="animate-spin text-white/25" />
              </div>
            ) : !hasAnyGames ? (
              // Empty state — no completed matches for this sport yet
              <div className="flex items-center justify-center py-20">
                <p className="text-[11px] text-white/30 uppercase tracking-[0.18em]">
                  No completed matches yet
                </p>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr] border-b border-white/[0.07] px-6 py-3">
                  {["COLLEGE", "W", "L", "PCT", "GB"].map((h, i) => (
                    <span
                      key={h}
                      className={`text-[10px] font-bold tracking-[2px] text-white/30 ${
                        i === 0 ? "text-left" : "text-center"
                      }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Data rows — server returns 4 rows sorted by win pct */}
                {(rows ?? []).map((row, i, arr) => (
                  <StandingsRow
                    key={row.code}
                    row={row}
                    rank={i}
                    isLast={i === arr.length - 1}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
