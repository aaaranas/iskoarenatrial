"use client";

// Public read-only schedules section embedded on the landing page.
// Pulls from the same trpc.match.getAll procedure used by the admin dashboard,
// but renders match cards without any add/edit/delete affordances.

import React from "react";
import { trpc } from "@/utils/trpc";
import { Loader2, MapPin, Clock } from "lucide-react";
import type { Match } from "@/types";

// Hide finished matches — landing page focuses on live + upcoming.
function isVisible(match: Match) {
  const t = (match.statusType || "").toLowerCase();
  return t === "live" || t === "upcoming";
}

// Read-only match card — mirrors MatchCard styling but strips admin actions.
function PublicMatchCard({ match }: { match: Match }) {
  const isLive = match.statusType?.toLowerCase() === "live";

  return (
    <div className="group relative h-[320px] sm:h-[380px] w-full bg-[#050505] rounded-sm overflow-hidden border border-white/5 transition-all duration-500 hover:border-[#7B1113]/40 hover:shadow-2xl hover:shadow-[#7B1113]/10">
      {/* Background gradient — no image (admin uses random fallback images; public stays minimal) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a0001] via-[#050505] to-black" />

      {/* Card content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-100">{match.league}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 pl-3">
              <MapPin className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{match.venue}</span>
            </div>
          </div>
          {/* Live pill in UP maroon */}
          <div
            className={`px-2 py-0.5 rounded-[2px] text-[8px] font-black tracking-[0.2em] border ${
              isLive
                ? "bg-[#7B1113] border-[#7B1113] text-white shadow-[0_0_15px_rgba(123,17,19,0.4)]"
                : "bg-black/40 backdrop-blur-md border-white/10 text-zinc-400"
            }`}
          >
            {isLive ? "LIVE" : match.status}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">
              {match.homeTeam} <br />
              <span className="text-zinc-500 not-italic font-light text-lg">vs</span> <br />
              {match.awayTeam}
            </h3>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-end justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tabular-nums text-white">{match.homeScore ?? 0}</span>
              <span className="text-xl font-thin text-zinc-700">-</span>
              <span className="text-4xl font-black tabular-nums text-white">{match.awayScore ?? 0}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{match.date}</span>
              </div>
              <span className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">
                {match.category || "Intramurals"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicSchedules() {
  // Public procedure — no auth required.
  const { data: matches, isLoading, error } = trpc.match.getAll.useQuery();

  const visibleMatches = (matches || []).filter(isVisible);

  return (
    // id="schedules" — header nav + hero/CTA "View Schedules" buttons scroll here
    <section id="schedules" className="relative w-full bg-neutral-950 py-20 px-4 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Section header — same visual rhythm as NewsCarousel */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7B1113] mb-3">
            <span className="w-6 h-0.5 bg-[#7B1113] inline-block" />
            Schedules
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-white leading-tight">
            Live &amp; Upcoming Matches
          </h2>
          <p className="text-white/55 mt-3 text-sm max-w-xl mx-auto">
            Real-time schedule of UP Cebu Intramurals matches. Updated by Iskolaro Committee admins.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#7B1113] animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Loading Matches...</span>
          </div>
        )}

        {/* Error state — fail soft, don't break the rest of the landing page */}
        {error && (
          <div className="text-center py-12 text-sm text-zinc-500">
            Could not load matches right now. Please try again later.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && visibleMatches.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-500">
            No live or upcoming matches at the moment. Check back soon.
          </div>
        )}

        {/* Grid of read-only match cards */}
        {!isLoading && !error && visibleMatches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMatches.map((m) => (
              <PublicMatchCard key={m.id} match={m as Match} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
