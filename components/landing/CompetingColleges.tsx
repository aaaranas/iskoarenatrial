"use client";

// CompetingColleges — single horizontal row of 4 large circular crests.
// Replaces components/landing/PublicColleges.tsx (the previous "Team" section
// that showed the 4 colleges with team counts). The new design strips the
// team count for cleaner visuals and shows only the crest + code + mascot.
//
// V1 STATUS: 4 colleges hardcoded in components/landing/_data.ts (mock).
// TODO: when teams.org querying is wired in (Phase 4 carousel onwards),
// could verify that all 4 mock codes still match real Supabase teams data —
// but the codes themselves are part of the product spec so they'll never drift.

import React from "react";
import Image from "next/image";
import { COLLEGES } from "./_data";

export default function CompetingColleges() {
  return (
    // id="colleges" — anchor target for any future "Colleges" nav entry. Not currently
    // in the Nav links list, which is fine; users land here naturally by scrolling.
    <section
      id="colleges"
      className="relative border-t border-white/[0.06] bg-ia-bg px-6 pb-20 pt-24"
    >
      <div className="mx-auto max-w-[1280px] text-center">
        {/* Eyebrow with accent rules — mirrors the Hero/Sponsors visual rhythm */}
        <div className="mb-4 inline-flex items-center gap-3.5">
          <span className="inline-block h-px w-7 bg-ia-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[4px] text-ia-accent">
            The Contenders
          </span>
          <span className="inline-block h-px w-7 bg-ia-accent" />
        </div>

        <h2 className="mb-3.5 font-bebas text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[2px] text-[#f0f0f0]">
          Competing Colleges
        </h2>
        <p className="mx-auto mb-16 max-w-[560px] text-[15px] leading-relaxed text-white/50">
          Four UP Cebu colleges. One champion.
        </p>

        {/* Single horizontal flex row — wraps on narrow viewports */}
        <div className="flex flex-wrap items-start justify-center gap-[clamp(24px,5vw,80px)]">
          {COLLEGES.map((c, i) => (
            <div
              key={c.code}
              className="group flex cursor-pointer flex-col items-center transition-transform duration-200 hover:-translate-y-1.5"
              // Stagger fade-in by 80ms per crest so the row "lights up" on scroll
              style={{ animation: `fadeInUp 0.6s ease ${0.1 + i * 0.08}s both` }}
            >
              {/* Crest — white circle housing the logo, with a colored shadow ring.
                  Box-shadow stacks (drop shadow + ring + colored glow) — easier to keep inline
                  than building three separate Tailwind shadow utilities. */}
              <div
                className="relative mb-5 overflow-hidden rounded-full bg-white p-2.5"
                style={{
                  width: "clamp(120px, 16vw, 180px)",
                  height: "clamp(120px, 16vw, 180px)",
                  boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${c.color}33, 0 0 30px ${c.color}22`,
                }}
              >
                <Image
                  src={c.logo}
                  alt={`${c.code} crest`}
                  fill
                  // Crest size is clamp(120px, 16vw, 180px) — matches the wrapper above.
                  sizes="(max-width: 768px) 120px, 180px"
                  className="rounded-full object-contain"
                />
              </div>

              {/* College code — Bebas Neue in the team's brand color */}
              <div
                className="font-bebas text-[clamp(28px,3vw,42px)] leading-none tracking-[2px]"
                style={{ color: c.color }}
              >
                {c.code}
              </div>

              {/* Mascot ("short" name) — muted small caps */}
              <div className="mt-2 max-w-[160px] text-[11px] uppercase tracking-[2px] text-white/40">
                {c.short}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
