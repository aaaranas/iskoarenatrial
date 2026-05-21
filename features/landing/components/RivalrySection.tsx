"use client";

// Rivalry — animated horizontal bars showing cumulative season points per college.
//
// DATA SOURCE (now live)
//   Fetches from trpc.match.getAll and computes the same aggregate standings shown
//   on the /dashboard/leaderboards podium:
//     • For each (sport, category) event with at least one completed match,
//       colleges are ranked by win-pct descending (1st → 20 pts, 2nd → 15,
//       3rd → 10, 4th → 5).
//     • Totals are summed across all events.
//
// FALLBACK
//   While loading (or if no completed matches exist yet), the section stays
//   hidden to avoid showing misleading zeros. Once data is ready and at least
//   one college has a non-zero total it becomes visible.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { COLLEGES } from "./data";
import SectionLabel from "./SectionLabel";

// ─── Standings computation (mirrors StatsPage logic) ──────────────────────
const POINTS_BY_RANK = [20, 15, 10, 5] as const;

function computeCollegeTotals(matchesData: any[] | undefined): Record<string, number> {
  const totals: Record<string, number> = { COS: 0, CSS: 0, CCAD: 0, SOM: 0 };
  if (!matchesData?.length) return totals;

  // Collect unique (sport, category) event keys from all matches.
  const events = new Map<string, { sport: string; category: string | null }>();
  for (const m of matchesData) {
    const key = m.category ? `${m.league}·${m.category}` : m.league;
    if (!events.has(key)) events.set(key, { sport: m.league, category: m.category ?? null });
  }

  // For each event, tally W/L per college, rank by win-pct, award points.
  for (const { sport, category } of events.values()) {
    const eventMatches = matchesData.filter(
      (m) =>
        m.statusType === "completed" &&
        m.league === sport &&
        (category === null ? !m.category : m.category === category)
    );
    if (!eventMatches.length) continue;

    const tally: Record<string, { w: number; l: number }> = {
      COS: { w: 0, l: 0 }, CSS: { w: 0, l: 0 },
      CCAD: { w: 0, l: 0 }, SOM: { w: 0, l: 0 },
    };

    for (const m of eventMatches) {
      const home = (m.homeTeamOrg ?? "").toUpperCase();
      const away = (m.awayTeamOrg ?? "").toUpperCase();
      if (!tally[home] || !tally[away]) continue;
      const hs = m.homeScore ?? 0;
      const as_ = m.awayScore ?? 0;
      if (hs === as_) continue; // ties ignored
      if (hs > as_) { tally[home].w++; tally[away].l++; }
      else           { tally[away].w++; tally[home].l++; }
    }

    // Only award points when at least one game was actually played.
    const anyGame = Object.values(tally).some((t) => t.w + t.l > 0);
    if (!anyGame) continue;

    // Sort: win-pct descending, then wins descending (same tiebreak as leaderboard).
    const ranked = Object.entries(tally)
      .map(([code, { w, l }]) => ({ code, pct: (w + l) === 0 ? 0 : w / (w + l), w }))
      .sort((a, b) => b.pct - a.pct || b.w - a.w);

    ranked.forEach(({ code }, idx) => {
      if (idx < 4 && totals[code] !== undefined) {
        totals[code] += POINTS_BY_RANK[idx];
      }
    });
  }

  return totals;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function RivalrySection() {
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery(undefined, {
    staleTime: 60_000, // refresh at most once per minute
  });

  // Merge live points into the static COLLEGES display data (logo, color, mascot).
  const collegeTotals = useMemo(
    () => computeCollegeTotals(matchesData),
    [matchesData]
  );

  const enrichedColleges = useMemo(
    () => COLLEGES.map((c) => ({ ...c, points: collegeTotals[c.code] ?? 0 })),
    [collegeTotals]
  );

  // Hide the section while loading or when no completed matches exist yet —
  // showing all-zero bars would look broken on a public-facing page.
  const hasData = !isLoading && enrichedColleges.some((c) => c.points > 0);
  if (!hasData) return null;

  const sorted = [...enrichedColleges].sort((a, b) => b.points - a.points);
  const max    = sorted[0].points;
  const total  = enrichedColleges.reduce((s, c) => s + c.points, 0);
  const gap    = sorted[0].points - sorted[1].points;

  return <RivalrySectionInner sorted={sorted} max={max} total={total} gap={gap} />;
}

// ─── Inner component ──────────────────────────────────────────────────────
// Separated so the IntersectionObserver + animation state lives close to the
// DOM node that was just mounted (parent conditionally renders this).
function RivalrySectionInner({
  sorted,
  max,
  total,
  gap,
}: {
  sorted: typeof COLLEGES;
  max: number;
  total: number;
  gap: number;
}) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="rivalry"
      ref={ref}
      className="relative overflow-hidden border-y border-white/[0.05] bg-ia-bg-alt px-6 py-28"
    >
      {/* Decorative radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 50% 60% at 30% 50%, rgba(128,0,0,0.2) 0%, transparent 70%),
                       radial-gradient(ellipse 50% 60% at 70% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1280px]">
        {/* Heading */}
        <div className="mb-14 text-center">
          <SectionLabel>Overall Standings</SectionLabel>
          <h2 className="mb-3.5 inline-block font-bebas text-[clamp(56px,9vw,140px)] leading-[0.9] tracking-[2px] text-[#f0f0f0]">
            College{" "}
            <span className="italic text-ia-gold">Rivalry</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-[540px] text-[15px] text-white/50">
            Cumulative season points across all sports. Who will lift the Iskolaro Cup this year?
          </p>
        </div>

        {/* Rivalry rows */}
        <div className="mx-auto flex max-w-[880px] flex-col gap-[18px]">
          {sorted.map((c, i) => {
            const pct      = (c.points / max) * 100;
            const isLeader = i === 0;
            return (
              <div key={c.code} className="grid grid-cols-[auto_1fr_auto] items-center gap-5">
                {/* Left: rank + crest + code + mascot */}
                <div className="flex min-w-[200px] items-center gap-3.5">
                  <span
                    className={`w-9 font-bebas text-[42px] leading-none tracking-[1px] ${
                      isLeader ? "text-ia-gold" : "text-white/25"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={`relative h-[42px] w-[42px] overflow-hidden rounded-[10px] bg-white ${
                      isLeader ? "border-2 border-ia-gold" : "border"
                    }`}
                    style={!isLeader ? { borderColor: `${c.color}66` } : undefined}
                  >
                    <Image src={c.logo} alt="" fill sizes="42px" className="object-cover" />
                  </div>
                  <div>
                    <div className="font-bebas text-[22px] tracking-[1.5px]" style={{ color: c.color }}>
                      {c.code}
                    </div>
                    <div className="text-[10px] tracking-[1px] text-white/40">
                      {c.short.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div className="relative h-[30px] overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.04]">
                  <div
                    className="relative h-full overflow-hidden transition-[width] duration-[1500ms] ease-[cubic-bezier(.2,.7,.3,1)]"
                    style={{
                      width: animated ? `${pct}%` : "0%",
                      background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`,
                      boxShadow: isLeader ? `0 0 22px ${c.color}88` : "none",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.08) 8px 9px)",
                      }}
                    />
                  </div>
                </div>

                {/* Points */}
                <div className="min-w-[90px] text-right">
                  <div className="font-mono text-2xl font-bold leading-none tabular-nums text-[#f0f0f0]">
                    {c.points}
                  </div>
                  <div className="mt-0.5 text-[9px] tracking-[1.5px] text-white/40">PTS</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stat trio */}
        <div className="mt-12 flex flex-wrap justify-center gap-12 text-center">
          <div>
            <div className="font-bebas text-[42px] tracking-[2px] text-ia-gold">{total}</div>
            <div className="text-[10px] tracking-[2.5px] text-white/40">TOTAL POINTS</div>
          </div>
          <div>
            <div className="font-bebas text-[42px] tracking-[2px] text-[#f0f0f0]">24</div>
            <div className="text-[10px] tracking-[2.5px] text-white/40">SPORTS TRACKED</div>
          </div>
          <div>
            <div className="font-bebas text-[42px] tracking-[2px] text-ia-accent">{gap}</div>
            <div className="text-[10px] tracking-[2.5px] text-white/40">POINT GAP (TOP 2)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
