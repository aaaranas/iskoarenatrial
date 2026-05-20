// Dashboard V2 — Tabbed standings widget.
// Sport+Category tabs across the top, table below.
// Rank-1 row gets gold-tinted #, maroon-tinted PCT. Other rows muted.
//
// Data is LIVE — aggregated from completed matches via trpc.match.getStandings.
// Each tab is a (sport, category) combination. Curated to 4 prominent featured
// combos for the right-rail space budget; can be expanded later.
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CollegeBadge, MonoLabel } from "./DashboardPrimitives";
import type { CollegeCode } from "./dashboard-data";

// Featured tabs — sport+category combinations that headline the standings
// rail. Sport names MUST match sports.name in the DB. Category MUST be one of
// the match_category enum values or null (when the sport has no division).
type FeaturedTab = {
  label: string;       // Display label shown in the tab strip
  sport: string;       // DB sports.name value
  category: string | null;
};

const FEATURED_TABS: FeaturedTab[] = [
  { label: "BASKETBALL · MEN",   sport: "Basketball", category: "Men" },
  { label: "BASKETBALL · WOMEN", sport: "Basketball", category: "Women" },
  { label: "VOLLEYBALL · MEN",   sport: "Volleyball", category: "Men" },
  { label: "VOLLEYBALL · WOMEN", sport: "Volleyball", category: "Women" },
];

export function StandingsWidget() {
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = FEATURED_TABS[tabIndex];

  // Re-queries on tab change. Result is sorted server-side by win pct desc.
  // category is passed when present; null is omitted so all categories aggregate.
  const { data: rows, isLoading } = trpc.match.getStandings.useQuery({
    sportNames: [activeTab.sport],
    ...(activeTab.category ? { category: activeTab.category as any } : {}),
  });

  // Has any team actually played? Used to choose between table rendering
  // and an empty-state message (rather than showing four .000 rows).
  const hasAnyGames = (rows ?? []).some((r) => r.w + r.l > 0);

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden">
      {/* Tab strip — equal-width buttons. Active: black bg + maroon underline.
          Labels are compact (BASKETBALL · MEN) to fit a 360px rail. */}
      <div className="flex border-b border-white/[0.07]">
        {FEATURED_TABS.map((tab, i) => {
          const isActive = i === tabIndex;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setTabIndex(i)}
              className={`flex-1 px-1.5 py-2.5 font-bebas text-[10px] tracking-[0.1em] cursor-pointer border-r border-white/[0.07] last:border-r-0 transition-colors ${
                isActive
                  ? "bg-black text-white border-b-2 border-b-ia-accent -mb-px"
                  : "bg-transparent text-white/35 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="px-3.5 pb-3.5 pt-1">
        {isLoading ? (
          // Loading state — vertically centered spinner, height matches a 4-row table
          <div className="flex items-center justify-center h-[148px]">
            <Loader2 size={16} className="animate-spin text-white/30" />
          </div>
        ) : !hasAnyGames ? (
          // Empty state — no completed matches yet for this (sport, category)
          <div className="flex items-center justify-center h-[148px]">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.18em]">
              No completed matches yet
            </p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div className="grid grid-cols-[24px_1fr_30px_30px_40px_36px] py-2.5 border-b border-white/[0.07] font-mono text-[9px] text-white/35 tracking-[0.1em]">
              <span>#</span>
              <span>TEAM</span>
              <span className="text-right">W</span>
              <span className="text-right">L</span>
              <span className="text-right">PCT</span>
              <span className="text-right">GB</span>
            </div>

            {/* Body rows — server returns 4 rows already sorted */}
            {(rows ?? []).map((row, i) => {
              const isLeader = i === 0;
              const isLast = i === (rows?.length ?? 0) - 1;
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
                    {/* row.code is one of COS|CSS|CCAD|SOM — server filters out anything else */}
                    <CollegeBadge code={row.code as CollegeCode} size={20} ring={false} />
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
          </>
        )}
      </div>
    </div>
  );
}
