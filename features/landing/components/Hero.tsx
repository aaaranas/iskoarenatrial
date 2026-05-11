"use client";

// Hero — full-viewport opening section per the design's ia-hero.jsx.
// Replaces components/hero-section.tsx. Visual recipe:
//   - Sport-photo backdrop, heavily darkened with maroon radial glow + noise
//   - Logo + gold-flanked eyebrow ("UP CEBU ISKOLARO 2026")
//   - Massive ISKOARENA headline (ISKO solid white, ARENA accent italic with
//     a 1px text-stroke for the "stadium signage" feel)
//   - One-line tagline + animated gold scroll cue
// No buttons in the hero — public users read, admins log in via Nav/Footer.

import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    // id="top" — Nav logo click smooth-scrolls back here.
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Photo background layer — grayscaled and darkened so headline copy reads cleanly */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/iskolarobaseball.jpg"
          alt=""
          fill
          priority
          // Hero photo is full-bleed at every breakpoint — tells Next to skip the
          // "this might be 100vw, hedge with the largest variant" guess.
          sizes="100vw"
          className="object-cover [filter:grayscale(0.6)_contrast(1.05)_brightness(0.35)]"
        />
        {/* Linear vertical fade to ia-bg + a maroon radial glow centered on the headline.
            Inline style: combines two backgrounds in a single layer, easier to read here than splitting. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(8,0,0,0.7) 50%, #060606 100%),
                         radial-gradient(ellipse 70% 60% at 50% 40%, rgba(128,0,0,0.15) 0%, transparent 70%)`,
          }}
        />
        {/* Noise texture — adds the "vintage broadcast" feel. SVG fractalNoise via data-URI. */}
        <div
          className="absolute inset-0 opacity-45 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* Centered content stack — logo, eyebrow, headline, tagline, scroll cue */}
      <div className="relative z-[2] flex flex-1 flex-col items-center justify-center px-6 py-[120px] pb-20 text-center">
        {/* Logo — animated fadeInUp, with a soft drop shadow for separation */}
        <Image
          src="/logo.png"
          alt="IskoArena"
          width={96}
          height={96}
          priority
          // width:auto + height:auto silences Next's "you sized one but not the
          // other" warning; the explicit width/height props still set the box.
          style={{ width: "auto", height: "auto" }}
          className="mb-7 object-contain animate-[fadeInUp_0.8s_ease_both] drop-shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        />

        {/* Eyebrow: gold rule + label + gold rule */}
        <div className="mb-6 flex items-center gap-3.5 animate-[fadeInUp_0.8s_ease_0.1s_both]">
          <span className="inline-block h-px w-7 bg-ia-gold" />
          <span className="text-[11px] font-bold uppercase tracking-[5px] text-ia-gold">
            UP Cebu Iskolaro 2026
          </span>
          <span className="inline-block h-px w-7 bg-ia-gold" />
        </div>

        {/* Massive ISKOARENA headline. Bebas Neue, fluid clamp size.
            ARENA gets the accent color, italic, and a 1px text-stroke for the broadcast-poster feel.
            text-stroke isn't in Tailwind so it lives inline. */}
        <h1 className="m-0 font-bebas text-[clamp(80px,16vw,240px)] leading-[0.85] tracking-[2px] text-[#f5f0f0] animate-[fadeInUp_0.9s_ease_0.2s_both]">
          ISKO
          <span
            className="italic text-ia-accent"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}
          >
            ARENA
          </span>
        </h1>

        {/* Tagline — fluid sized, muted */}
        <p className="mt-6 max-w-[560px] text-[clamp(14px,1.4vw,17px)] leading-relaxed text-white/60 animate-[fadeInUp_1s_ease_0.35s_both]">
          The official home of UP Cebu Intramurals — live scores, standings, and full coverage of every sport.
        </p>

        {/* Scroll cue — gold gradient line that pulses (keyframe in globals.css: scrollPulse) */}
        <div className="mt-16 flex flex-col items-center gap-2.5 animate-[fadeInUp_1.1s_ease_0.6s_both]">
          <span className="text-[10px] uppercase tracking-[3px] text-white/40">Scroll</span>
          <div
            className="h-12 w-px animate-[scrollPulse_2.2s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.6), transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
