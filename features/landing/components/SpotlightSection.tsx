"use client";

// Spotlight — Isko of the Week. Two-column section: rich player card on the
// left (photo + jersey number + name + tag pills + stat pills), narrative on
// the right.
//
// Data is LIVE — driven by trpc.featuredPlayer.getCurrent (the same endpoint
// used by the dashboard Top Performer card). Admin sets the featured player
// from /dashboard. If no player is set, the entire section is hidden — no
// placeholder shown to the public.
//
// Editorial fields (nickname, quote, awards, year) are not in the featured_players
// schema — they're omitted gracefully. College brand color is resolved from the
// player's collegeOrg code.

import React from "react";
import Image from "next/image";
import { trpc } from "@/lib/trpc";
import { COLLEGE_COLORS } from "./data";
import SectionLabel from "./SectionLabel";
import type { CollegeCode } from "./data";

// Stat pill — reusable block for the stats footer of the player card.
function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[84px] rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-center">
      <div className="font-mono text-2xl font-bold leading-none tabular-nums text-[#f0f0f0]">
        {value}
      </div>
      <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[2px] text-white/35">
        {label}
      </div>
    </div>
  );
}

export default function SpotlightSection() {
  const { data: featured, isLoading } = trpc.featuredPlayer.getCurrent.useQuery();

  // Hide section entirely while loading (prevents layout shift on public page)
  // and when no featured player has been set by admin.
  if (isLoading || !featured) return null;

  // Resolve college brand color from org code. Falls back to maroon when
  // the player has no college affiliation in the DB.
  const collegeColor: string =
    featured.collegeOrg
      ? (COLLEGE_COLORS[featured.collegeOrg as CollegeCode] ?? "#A91D3A")
      : "#A91D3A";

  // Split the player name into first/last for the big Bebas Neue overlay.
  // If the name has only one word, it renders on a single line.
  const nameParts = featured.playerName.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : featured.playerName;
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  // Tag pills shown below the name on the player card photo overlay.
  // Only render a pill when the value is actually available.
  const tagPills = [
    featured.collegeOrg,
    featured.sportName,
  ].filter(Boolean) as string[];

  return (
    <section id="spotlight" className="mx-auto max-w-[1280px] px-6 py-28">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">

        {/* LEFT — player card */}
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-[20px] border bg-ia-card"
            style={{ borderColor: `${collegeColor}33` }}
          >
            {/* Photo block (4:5 aspect) */}
            <div className="relative aspect-[4/5] overflow-hidden">
              {featured.photoUrl ? (
                <Image
                  src={featured.photoUrl}
                  alt={featured.playerName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover [filter:grayscale(0.2)_contrast(1.05)]"
                />
              ) : (
                // Photoless fallback — college-tinted gradient with an initial avatar
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${collegeColor}33 0%, #0a0a0a 70%)`,
                  }}
                >
                  <span
                    className="font-bebas text-[120px] leading-none opacity-20"
                    style={{ color: collegeColor }}
                  >
                    {featured.playerName.charAt(0)}
                  </span>
                </div>
              )}

              {/* Gradient overlay for text legibility */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.95) 95%),
                               linear-gradient(135deg, ${collegeColor}22 0%, transparent 50%)`,
                }}
              />

              {/* Top-left badge */}
              <div
                className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 backdrop-blur-md"
                style={{
                  background: "rgba(128,0,0,0.8)",
                  borderColor: "rgba(212,175,55,0.4)",
                }}
              >
                <span className="text-[13px] text-ia-gold">★</span>
                <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-ia-gold">
                  {featured.label}
                </span>
              </div>

              {/* Top-right jersey number */}
              {featured.jerseyNumber != null && (
                <div
                  className="absolute right-6 top-5 font-bebas text-[88px] leading-[0.85] tracking-[1px] text-white opacity-90"
                  style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}
                >
                  #{featured.jerseyNumber}
                </div>
              )}

              {/* Bottom name overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-bebas text-[clamp(36px,4.5vw,52px)] leading-[0.95] tracking-[2px] text-white">
                  {firstName}
                </div>
                {lastName && (
                  <div
                    className="font-bebas text-[clamp(36px,4.5vw,52px)] leading-[0.95] tracking-[2px]"
                    style={{ color: collegeColor }}
                  >
                    {lastName}
                  </div>
                )}
                {/* Tag pills — college org + sport (editorial fields not in DB) */}
                {tagPills.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {tagPills.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats footer — renders only when stats are stored */}
            {featured.stats.length > 0 && (
              <div
                className="flex flex-wrap gap-2 border-t bg-[#070707] px-6 py-5"
                style={{ borderTopColor: `${collegeColor}22` }}
              >
                {featured.stats.map((s) => (
                  <StatPill key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — narrative */}
        <div>
          <SectionLabel>Player Spotlight</SectionLabel>
          <h2 className="mb-6 font-bebas text-[clamp(44px,5.5vw,80px)] leading-[0.95] tracking-[1px] text-[#f0f0f0]">
            The Isko of
            <br />
            <span style={{ color: collegeColor }}>the Week</span>
          </h2>

          <p className="mb-6 max-w-[440px] text-[15px] leading-[1.8] text-white/55">
            Every week, IskoArena spotlights the student-athlete who went above
            and beyond — on the court, on the board, or in the arena. This week,
            it&apos;s{" "}
            <strong className="text-[#f0f0f0]">{featured.playerName}</strong>
            {featured.sportName ? ` of ${featured.sportName}` : ""}.
          </p>

          {/* Sport context block — replaces the pull quote when no quote is stored */}
          {featured.sportName && (
            <div
              className="mb-8 max-w-[480px] rounded-[12px] border px-6 py-5"
              style={{ borderColor: `${collegeColor}33`, background: `${collegeColor}0a` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-ia-gold text-sm">★</span>
                <span
                  className="text-[10px] font-black uppercase tracking-[2px]"
                  style={{ color: collegeColor }}
                >
                  {featured.label}
                </span>
              </div>
              <p className="text-sm leading-[1.7] text-white/70">
                {featured.playerName} is IskoArena&apos;s featured athlete this
                period — recognized by the committee for outstanding performance
                in{" "}
                <strong className="text-[#f0f0f0]">{featured.sportName}</strong>.
              </p>
            </div>
          )}

          {/* Stats summary on the right side too, for narrow screens where
              the card's stat footer may be below the fold */}
          {featured.stats.length > 0 && (
            <div>
              <div className="mb-3.5 text-[11px] font-bold tracking-[2px] text-white/40">
                KEY STATS
              </div>
              <div className="flex flex-wrap gap-3">
                {featured.stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-baseline gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                  >
                    <span className="font-mono text-xl font-bold text-[#f0f0f0] tabular-nums">
                      {s.value}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/40">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
