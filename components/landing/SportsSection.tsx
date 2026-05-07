"use client";

// Sports — 24 sport categories grid with category filter pills (All / Traditional /
// Esports / Mind & Culture). Each card shows an icon, name, category, optional
// LIVE pulse badge, and a gold "→" cue on hover.
//
// V1 STATUS: SPORTS data is mock in components/landing/_data.ts (24 entries
// matching the seeded Supabase sports table). TODO: could merge real names from
// trpc.sport.getAll while keeping cat/icon/status as a static frontend map.

import React, { useState } from "react";
import { SPORTS, type SportItem } from "./_data";
import SectionLabel from "./SectionLabel";

// All-tab plus the 3 categories from SportItem.cat — matches the design's filter row.
type Filter = "All" | SportItem["cat"];
const FILTERS: Filter[] = ["All", "Traditional", "Esports", "Mind & Culture"];

export default function SportsSection() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? SPORTS : SPORTS.filter((s) => s.cat === filter);

  return (
    <section id="sports" className="mx-auto max-w-[1280px] px-6 py-28">
      {/* Header row — heading on the left, filter pills on the right */}
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

        {/* Category filter — pills, active = maroon fill */}
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

      {/* Sport card grid — auto-fill columns, ~180px min, slightly taller than wide */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
        {visible.map((s) => {
          const isLive = s.status === "ongoing";
          return (
            <div
              key={s.name}
              className="group relative flex aspect-[1.05/1] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] border border-white/[0.06] bg-ia-card p-5 transition-all duration-[250ms] hover:-translate-y-[3px] hover:border-ia-maroon/55 hover:bg-gradient-to-br hover:from-ia-maroon/25 hover:to-ia-card"
            >
              {/* Top row: icon + optional LIVE badge */}
              <div className="flex items-start justify-between">
                <span className="text-3xl leading-none opacity-70 transition-opacity group-hover:opacity-100">
                  {s.icon}
                </span>
                {isLive && (
                  <span className="rounded-sm bg-ia-accent px-1.5 py-0.5 text-[8px] font-extrabold tracking-[1.5px] text-white transition-shadow group-hover:shadow-[0_0_12px_#A91D3A]">
                    LIVE
                  </span>
                )}
              </div>

              {/* Bottom: sport name (Bebas) + category caption */}
              <div>
                <div className="font-bebas text-lg leading-[1.05] tracking-[1.2px] text-[#f0f0f0]">
                  {s.name}
                </div>
                <div className="mt-1 text-[9px] tracking-[1.5px] text-white/35">
                  {s.cat.toUpperCase()}
                </div>
              </div>

              {/* Hover-only gold arrow cue, fades up from below */}
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
