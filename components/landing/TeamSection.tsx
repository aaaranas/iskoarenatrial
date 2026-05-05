// Team grid — the editorial team behind IskoArena. 5 student-built members
// with role + headshot. Replaces the old components/team.tsx (developer
// "About Us" section) which is archived in Phase 7.
//
// Server component — no interactivity. Hover effect (slight grayscale) is
// pure CSS via Tailwind hover:.

import React from "react";
import Image from "next/image";
import { TEAM } from "./_data";
import SectionLabel from "./SectionLabel";

export default function TeamSection() {
  return (
    // id="team" — Nav "Team" link points here per the design.
    <section id="team" className="mx-auto max-w-[1280px] px-6 py-28">
      {/* Heading block — centered, About Us eyebrow, "Built by Iskos." headline */}
      <div className="mb-12 text-center">
        <SectionLabel>About Us</SectionLabel>
        <h2 className="font-bebas text-[clamp(44px,6vw,80px)] leading-none tracking-[1px] text-[#f0f0f0]">
          Built by Iskos.
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-sm text-white/45">
          The student team behind IskoArena — engineers, designers, and product folks from UP Cebu.
        </p>
      </div>

      {/* Member grid — auto-fit columns, ~180px min, max-width 1100px so 5 cards
          stay roomy on widescreen rather than spreading to the edges */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
        {TEAM.map((m) => (
          <div key={m.name} className="text-center">
            {/* Square photo with subtle grayscale, vignette gradient at the bottom */}
            <div className="relative mb-3.5 aspect-square overflow-hidden rounded-2xl border border-white/[0.08]">
              <Image
                src={m.photo}
                alt={m.name}
                fill
                // Auto-fit columns of minmax(180px, 1fr) inside max-w-1100. Roughly
                // half viewport on mobile, capped at ~220px on desktop.
                sizes="(max-width: 768px) 50vw, 220px"
                className="object-cover [filter:grayscale(0.2)] transition-[filter] duration-300 hover:[filter:grayscale(0)]"
              />
              {/* Vignette — fades the bottom 40% to black for legibility on hover */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)",
                }}
              />
            </div>

            {/* Name in Bebas, role in gold uppercase */}
            <div className="font-bebas text-[22px] tracking-[1.2px] text-[#f0f0f0]">
              {m.name}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[1.5px] text-ia-gold">
              {m.role}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
