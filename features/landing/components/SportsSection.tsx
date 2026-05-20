"use client";

// Sports — 24 sport categories grid with category filter pills (All / Traditional /
// Esports / Mind & Culture). Each card shows an icon, name, category, and a
// real-time status badge:
//   • LIVE   (red pulse)    — a match in this sport is live RIGHT NOW today
//   • UPCOMING (gold, no pulse) — a match is scheduled later today
//   • Nothing — completed or no matches today
//
// Status is derived from trpc.match.getAll filtered to today's matches.
// The static SPORTS array in ./data provides the icon + category metadata
// (these don't live in the DB).

import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { SPORTS, type SportItem } from "./data";
import { isToday } from "@/components/dashboard/dashboard-data";
import SectionLabel from "./SectionLabel";

type Filter = "All" | SportItem["cat"];
const FILTERS: Filter[] = ["All", "Traditional", "Esports", "Mind & Culture"];

export default function SportsSection() {
  const [filter, setFilter] = useState<Filter>("All");

  const { data: matchesData } = trpc.match.getAll.useQuery();

  // Build a sport-name → 'live' | 'upcoming' map from today's non-completed
  // matches. 'live' takes priority over 'upcoming' when both exist for the
  // same sport. Completed matches are intentionally excluded — the user only
  // wants to surface active activity.
  const sportStatusMap = useMemo(() => {
    const map = new Map<string, "live" | "upcoming">();
    if (!matchesData) return map;

    for (const m of matchesData) {
      if (!isToday(m.rawDate)) continue;
      if (m.statusType === "completed") continue;

      const existing = map.get(m.league);
      if (m.statusType === "live") {
        // Live always wins — overwrite any existing upcoming entry.
        map.set(m.league, "live");
      } else if (m.statusType === "upcoming" && existing !== "live") {
        map.set(m.league, "upcoming");
      }
    }
    return map;
  }, [matchesData]);

  const visible = filter === "All" ? SPORTS : SPORTS.filter((s) => s.cat === filter);

  return (
    <section id="sports" className="mx-auto max-w-[1280px] px-6 py-28">
      {/* Header row */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <SectionLabel>Full Coverage</SectionLabel>
          <h2 className="font-bebas text-[clamp(44px,6vw,80px)] leading-none tracking-[1px] text-[#f0f0f0]">
            24 Sports.
            <br />
            One Arena.
          </h2>
          <p className="mt-3.5 max-w-[480px] text-sm text-white/45">
            From basketball to chess, MLBB to cosplay — every Iskolaro discipline tracked in one place.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((c) => {
            const isActive = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4.5 py-2 text-xs font-semibold tracking-[0.5px] transition-colors ${
                  isActive
                    ? "border-ia-maroon bg-ia-maroon text-white"
                    : "border-white/10 bg-transparent text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
                style={{ paddingLeft: 18, paddingRight: 18 }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sport cards — mobile: horizontal scroll-snap; desktop: auto-fill grid */}
      <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((s) => {
          // Exact name match against match.league (sport names fixed to match DB in LP.1).
          const matchStatus = sportStatusMap.get(s.name);
          const isLive     = matchStatus === "live";
          const isUpcoming = matchStatus === "upcoming";

          return (
            <div
              key={s.name}
              className="group relative flex aspect-[1.05/1] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] border border-white/[0.06] bg-ia-card p-5 transition-all duration-[250ms] hover:-translate-y-[3px] hover:border-ia-maroon/55 hover:bg-gradient-to-br hover:from-ia-maroon/25 hover:to-ia-card shrink-0 w-[240px] snap-center md:w-auto md:shrink"
            >
              {/* Top row: icon + status badge */}
              <div className="flex items-start justify-between">
                <span className="text-3xl leading-none opacity-70 transition-opacity group-hover:opacity-100">
                  {s.icon}
                </span>

                {isLive ? (
                  // Live: red pill + pulse dot
                  <span className="flex items-center gap-1 rounded-sm bg-ia-accent px-1.5 py-0.5 text-[8px] font-extrabold tracking-[1.5px] text-white transition-shadow group-hover:shadow-[0_0_12px_#A91D3A]">
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                ) : isUpcoming ? (
                  // Upcoming: gold bordered pill, no pulse
                  <span className="rounded-sm border border-ia-gold/50 bg-ia-gold/10 px-1.5 py-0.5 text-[8px] font-extrabold tracking-[1.5px] text-ia-gold">
                    TODAY
                  </span>
                ) : null}
              </div>

              {/* Bottom: sport name + category */}
              <div>
                <div className="font-bebas text-lg leading-[1.05] tracking-[1.2px] text-[#f0f0f0]">
                  {s.name}
                </div>
                <div className="mt-1 text-[9px] tracking-[1.5px] text-white/35">
                  {s.cat.toUpperCase()}
                </div>
              </div>

              {/* Hover gold arrow */}
              <div className="pointer-events-none absolute bottom-2.5 right-3.5 text-sm text-ia-gold opacity-0 transition-opacity group-hover:animate-[fadeInUp_0.2s_ease_both] group-hover:opacity-100">
                →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
