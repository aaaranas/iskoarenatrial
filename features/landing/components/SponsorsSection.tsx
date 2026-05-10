"use client";

// Sponsors section — infinite, draggable, pause-on-hover carousel.
// Replaces the static placeholder grid that used to live inside hero-section.tsx.
//
// Implementation notes (faithfully ported from ia-carousels.jsx → TypeScript):
//   • Track contains items duplicated 2× so we can wrap by translating -50% seamlessly.
//   • One rAF loop is the single source of truth for position. Auto-scroll, hover-pause,
//     and drag inertia all push into the same `posRef` channel — no React re-render
//     during animation.
//   • Drag offsets `pos` directly. On pointerup we compute drag velocity and feed it
//     into `inertRef`, which decays exponentially (Math.pow(0.001, dt)).
//   • Soft-fade edges via mask-image disguise the loop seam during drag.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { SPONSORS, type Sponsor, type SponsorTier } from "./data";

// Tier → accent color. Host/Gold use ia-gold, Esports uses ia-accent (live red),
// Platinum/Silver get metallic neutrals, Partner stays muted.
const TIER_COLOR: Record<SponsorTier, string> = {
  Host:     "#D4AF37",            // ia-gold
  Platinum: "#E5E4E2",
  Gold:     "#D4AF37",
  Esports:  "#A91D3A",            // ia-accent
  Silver:   "#C0C0C0",
  Partner:  "rgba(255,255,255,0.45)",
};

// Single sponsor card — tier ribbon + Bebas mono wordmark + small caps name.
function SponsorLogoCard({ s }: { s: Sponsor }) {
  const tierColor = TIER_COLOR[s.tier];

  return (
    <div
      className="group relative flex aspect-[1.6/1] flex-shrink-0 select-none flex-col justify-between overflow-hidden rounded-[14px] border border-white/[0.06] bg-ia-card px-5 py-[18px] transition-[transform,filter,border-color] duration-[250ms] [filter:grayscale(0.55)] hover:scale-[1.03] hover:[filter:none] will-change-transform"
      style={{
        width: "clamp(180px, 22vw, 240px)",
        // Hover border tint uses the tier color — kept inline because Tailwind
        // can't templatize per-instance arbitrary colors via group-hover.
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${tierColor}55`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      {/* Tier ribbon — top-right, tiny, in tier color */}
      <span
        className="text-[9px] font-extrabold uppercase tracking-[2px]"
        style={{ color: tierColor }}
      >
        {s.tier}
      </span>

      {/* Mono wordmark — large Bebas Neue, color shifts to tier on hover */}
      <div className="mt-1.5 flex flex-1 items-center justify-center">
        <div
          className="text-center font-bebas text-[clamp(22px,2.2vw,30px)] leading-none tracking-[2.5px] text-[#f0f0f0] transition-colors duration-[250ms] group-hover:!text-current"
          style={{ ["--hover-color" as any]: tierColor }}
          // Hover swap inline so each card uses its own tier color
          onMouseEnter={(e) => (e.currentTarget.style.color = tierColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#f0f0f0")}
        >
          {s.mono}
        </div>
      </div>

      {/* Full company name — small caps muted */}
      <div className="text-[10px] uppercase tracking-[1.5px] text-white/40">
        {s.name}
      </div>
    </div>
  );
}

interface SponsorsCarouselProps {
  items?: Sponsor[];
  speed?: number; // px/sec base scroll speed (default tuned for ~32 readable pace)
}

function SponsorsCarousel({ items = SPONSORS, speed = 32 }: SponsorsCarouselProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Refs (not state) so the rAF loop never causes React re-renders.
  const posRef = useRef(0);          // current translate, negative drifts left
  const halfRef = useRef(0);         // single-loop width (track.scrollWidth / 2)
  const speedRef = useRef(speed);    // px/sec base auto-scroll
  const lastTRef = useRef(0);        // last frame timestamp for delta-time
  const pausedRef = useRef(false);   // hover pause flag
  const dragRef = useRef({
    active: false,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    vel: 0,
  });
  const inertRef = useRef(0);        // residual drag velocity, decays exponentially

  // Measure the half-width whenever layout might change (mount + resize).
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    halfRef.current = trackRef.current.scrollWidth / 2;
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  // Single rAF loop drives position. Runs once per mount.
  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (!lastTRef.current) lastTRef.current = t;
      // Cap dt at 50ms so a tab-switch hiccup doesn't fling the carousel.
      const dt = Math.min(0.05, (t - lastTRef.current) / 1000);
      lastTRef.current = t;

      const half = halfRef.current;
      if (half > 0 && !dragRef.current.active) {
        // Auto-speed pauses on hover; inertia keeps moving regardless.
        const base = pausedRef.current ? 0 : speedRef.current;
        const v = base + inertRef.current; // px/sec, total
        posRef.current -= v * dt;

        // Wrap seamlessly — the duplicated track means -half = visually identical to 0.
        if (posRef.current <= -half) posRef.current += half;
        if (posRef.current > 0) posRef.current -= half;

        // Exponential inertia decay (~0.001 per second remaining).
        inertRef.current *= Math.pow(0.001, dt);
        if (Math.abs(inertRef.current) < 0.5) inertRef.current = 0;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hover pause — flip a ref so the rAF loop sees it next frame.
  const onEnter = () => (pausedRef.current = true);
  const onLeave = () => (pausedRef.current = false);

  // Pointer drag — captures the pointer so the drag continues even if the
  // cursor leaves the track. Tracks velocity so we can fling on release.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    wrapRef.current.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      vel: 0,
    };
    inertRef.current = 0; // cancel any in-flight inertia when new drag starts
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    let next = d.startPos + dx;
    const half = halfRef.current;
    if (half > 0) {
      // Keep next inside (-half, 0] for seamless wrap during drag too.
      next = ((next % half) - half) % half;
      if (next > 0) next -= half;
    }
    posRef.current = next;

    // Velocity tracking (px/ms → px/sec) for the inertia hand-off on release.
    const now = performance.now();
    const ddx = e.clientX - d.lastX;
    const ddt = now - d.lastT;
    if (ddt > 0) d.vel = (ddx / ddt) * 1000;
    d.lastX = e.clientX;
    d.lastT = now;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    // Negative inertia = leftward drift (matches base auto-scroll direction sign).
    inertRef.current = -d.vel;
    wrapRef.current?.releasePointerCapture?.(e.pointerId);
  };

  // Duplicate the items so a -50% translate wraps seamlessly.
  const doubled = [...items, ...items];

  return (
    <div
      ref={wrapRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative w-full cursor-grab overflow-hidden touch-pan-y active:cursor-grabbing"
      style={{
        // Soft-fade edges hide the loop seam during drag.
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max gap-[18px] py-2 will-change-transform"
      >
        {doubled.map((s, i) => (
          <SponsorLogoCard key={`${s.mono}-${i}`} s={s} />
        ))}
      </div>
    </div>
  );
}

// Section wrapper — eyebrow, headline, carousel, "Become a sponsor" CTA.
export default function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="border-y border-white/[0.05] bg-ia-bg-alt py-28"
    >
      {/* Heading — gold-flanked eyebrow + Bebas Neue headline + subcopy */}
      <div className="mx-auto max-w-[1280px] px-6 pb-14 text-center">
        <div className="mb-3.5 inline-flex items-center gap-3.5">
          <span className="inline-block h-px w-7 bg-ia-gold" />
          <span className="text-[11px] font-bold uppercase tracking-[4px] text-ia-gold">
            Powered By
          </span>
          <span className="inline-block h-px w-7 bg-ia-gold" />
        </div>
        <h2 className="mb-3.5 font-bebas text-[clamp(44px,7vw,96px)] leading-[0.95] tracking-[2px] text-[#f0f0f0]">
          Our Sponsors
        </h2>
        <p className="mx-auto max-w-[560px] text-[15px] leading-relaxed text-white/50">
          Iskolaro 2026 is made possible by partners who believe in UP Cebu&apos;s student-athletes.
        </p>
      </div>

      {/* Edge-to-edge carousel */}
      <SponsorsCarousel items={SPONSORS} speed={32} />

      {/* Become-a-sponsor CTA — outline pill that gold-shifts on hover */}
      <div className="mt-9 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-7 py-3 text-[13px] text-white/55 transition-colors hover:border-ia-gold hover:text-ia-gold"
        >
          Become a sponsor →
        </a>
      </div>
    </section>
  );
}
