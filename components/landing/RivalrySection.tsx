"use client";

// Rivalry — animated horizontal bars showing cumulative season points per
// college. Bars animate from 0 → percentage when the section scrolls into view
// (via IntersectionObserver). Leader (rank 1) gets gold accents + a glow.
//
// V1 STATUS: COLLEGES.points is mock in components/landing/_data.ts. The bar
// width is computed as (points / leader.points) * 100, so the leader is always
// at 100%. TODO: derive points from real match results once the standings
// computation is wired (see _data.ts STANDINGS comment).

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { COLLEGES } from "./_data";
import SectionLabel from "./SectionLabel";

export default function RivalrySection() {
  // Sort descending so the top of the list is the season leader.
  const sorted = [...COLLEGES].sort((a, b) => b.points - a.points);
  const max = sorted[0].points;
  const total = COLLEGES.reduce((s, c) => s + c.points, 0);

  // `animated` flips to true once the section enters the viewport (40% threshold).
  // The bar widths transition from 0% → percentage on this flip.
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimated(true);
      },
      { threshold: 0.4 },
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
      {/* Two soft radial glows behind the content — adds depth without competing with bars */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 50% 60% at 30% 50%, rgba(128,0,0,0.2) 0%, transparent 70%),
                       radial-gradient(ellipse 50% 60% at 70% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1280px]">
        {/* Heading block */}
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

        {/* Rivalry rows — rank + crest + code + bar + points */}
        <div className="mx-auto flex max-w-[880px] flex-col gap-[18px]">
          {sorted.map((c, i) => {
            const pct = (c.points / max) * 100;
            const isLeader = i === 0;
            return (
              <div
                key={c.code}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-5"
              >
                {/* Left cluster: rank, crest, code + mascot */}
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
                    <Image
                      src={c.logo}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div
                      className="font-bebas text-[22px] tracking-[1.5px]"
                      style={{ color: c.color }}
                    >
                      {c.code}
                    </div>
                    <div className="text-[10px] tracking-[1px] text-white/40">
                      {c.short.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Bar — outer track + inner fill that animates width */}
                <div className="relative h-[30px] overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.04]">
                  <div
                    className="relative h-full overflow-hidden transition-[width] duration-[1500ms] ease-[cubic-bezier(.2,.7,.3,1)]"
                    style={{
                      width: animated ? `${pct}%` : "0%",
                      background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`,
                      boxShadow: isLeader ? `0 0 22px ${c.color}88` : "none",
                    }}
                  >
                    {/* Diagonal hairline texture overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.08) 8px 9px)",
                      }}
                    />
                  </div>
                </div>

                {/* Points cell — large mono number + PTS caption */}
                <div className="min-w-[90px] text-right">
                  <div className="font-mono text-2xl font-bold leading-none tabular-nums text-[#f0f0f0]">
                    {c.points}
                  </div>
                  <div className="mt-0.5 text-[9px] tracking-[1.5px] text-white/40">
                    PTS
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stat trio at the bottom — total / sports tracked / point gap */}
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
            <div className="font-bebas text-[42px] tracking-[2px] text-ia-accent">
              {sorted[0].points - sorted[1].points}
            </div>
            <div className="text-[10px] tracking-[2.5px] text-white/40">POINT GAP (TOP 2)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
