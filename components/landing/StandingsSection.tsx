"use client";

// Standings — two-column section. Sport tabs on the left (active = maroon
// pill), table on the right showing W-L-PCT-GB per college. Top row is gold-
// highlighted as the leader.
//
// V1 STATUS: STANDINGS data is mock in components/landing/_data.ts.
// TODO: compute from trpc.match.getAll grouped by sport (see _data.ts comment).

import React, { useState } from "react";
import Image from "next/image";
import { STANDINGS, COLLEGE_LOGOS } from "./_data";
import SectionLabel from "./SectionLabel";

export default function StandingsSection() {
  const sports = Object.keys(STANDINGS);
  const [active, setActive] = useState(sports[0]);
  const rows = STANDINGS[active];

  return (
    <section
      id="standings"
      className="border-y border-white/[0.05] bg-ia-bg-alt px-6 py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Two-col grid — collapses to single col below md */}
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

            {/* Sport tabs — vertical list, active row gets a maroon strip + tinted bg */}
            <div className="flex flex-col gap-2">
              {sports.map((s) => {
                const isActive = active === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActive(s)}
                    className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3.5 text-left text-sm transition-all ${
                      isActive
                        ? "border-ia-maroon bg-ia-maroon/[0.16] font-semibold text-[#f0f0f0]"
                        : "border-white/[0.07] bg-transparent text-white/40 hover:border-white/15 hover:text-white/70"
                    }`}
                  >
                    {/* Active indicator strip */}
                    {isActive && (
                      <span className="h-[18px] w-1 rounded bg-ia-maroon" />
                    )}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: standings table card */}
          <div className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-ia-card">
            {/* Table header — sport name + season badge */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <span className="font-bebas text-lg tracking-[2px] text-[#f0f0f0]">
                {active.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold tracking-[2px] text-ia-gold">
                SEASON 2026
              </span>
            </div>

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

            {/* Data rows */}
            {rows.map((row, i) => {
              const isLeader = i === 0;
              return (
                <div
                  key={row.code}
                  className={`grid grid-cols-[2.4fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 ${
                    i < rows.length - 1 ? "border-b border-white/[0.05]" : ""
                  } ${isLeader ? "bg-ia-maroon/[0.07]" : ""}`}
                >
                  {/* College cell — rank, logo, code, optional LEAD pill */}
                  <div className="flex items-center gap-3.5">
                    <span className="w-[18px] font-mono text-[11px] text-white/30">
                      #{i + 1}
                    </span>
                    <div
                      className={`relative h-[34px] w-[34px] overflow-hidden rounded-lg bg-white ${
                        isLeader
                          ? "border-2 border-ia-gold"
                          : "border border-white/10"
                      }`}
                    >
                      <Image
                        src={COLLEGE_LOGOS[row.code]}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#f0f0f0]">{row.code}</div>
                      {isLeader && (
                        <span className="text-[9px] font-extrabold tracking-[1.5px] text-ia-gold">
                          ★ LEAD
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stat cells — W (white bold), L/PCT/GB (muted regular) */}
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
