// Dashboard V2 — shared atom components.
// Kept in one file because each is <30 LOC and they're always imported together.
//
// Animation classes (iaPulse, iaTicker) live in app/globals.css.
"use client";

import Image from "next/image";
import { COLLEGE_LOGOS, COLLEGE_COLORS, type CollegeCode } from "./dashboard-data";

// ── LiveDot ──────────────────────────────────────────────────────────────────
// Pulsing indicator dot. Uses iaPulse keyframe.
export function LiveDot({ size = 8, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full bg-current animate-[iaPulse_1.4s_ease-in-out_infinite] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// ── Eyebrow ──────────────────────────────────────────────────────────────────
// Tiny uppercase label used above titles/sections.
export function Eyebrow({
  children,
  color = "gold",
  mono = false,
  className = "",
}: {
  children: React.ReactNode;
  color?: "gold" | "maroon" | "accent" | "muted";
  mono?: boolean;
  className?: string;
}) {
  // Map color names to design tokens. text-ia-* are defined in tailwind.config.ts.
  const colorClass =
    color === "gold"   ? "text-ia-gold" :
    color === "maroon" ? "text-ia-maroon" :
    color === "accent" ? "text-ia-accent" :
    "text-white/35";

  return (
    <div
      className={`text-[10px] font-bold uppercase tracking-[0.22em] ${mono ? "font-mono" : "font-sans"} ${colorClass} ${className}`}
    >
      {children}
    </div>
  );
}

// ── CollegeBadge ─────────────────────────────────────────────────────────────
// Circular badge with the college logo. Ring uses the per-college brand color.
export function CollegeBadge({
  code,
  size = 28,
  ring = true,
  className = "",
}: {
  code: CollegeCode | null;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  // Fallback for missing/null code: empty black circle with subtle border so layout doesn't shift.
  if (!code) {
    return (
      <div
        className={`rounded-full bg-black/60 border border-white/10 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const c = COLLEGE_COLORS[code];
  return (
    <div
      className={`rounded-full bg-black overflow-hidden relative shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        // Color-ring + soft outer glow; falls back to no glow when ring=false.
        boxShadow: ring ? `0 0 0 1.5px ${c}, 0 0 12px ${c}55` : "none",
      }}
    >
      <Image
        src={COLLEGE_LOGOS[code]}
        alt={code}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}

// ── MonoLabel ────────────────────────────────────────────────────────────────
// Monospaced caption with tabular-nums for telemetry-style values.
export function MonoLabel({
  children,
  size = 10,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`font-mono tabular-nums tracking-[0.08em] ${className}`}
      style={{ fontSize: size }}
    >
      {children}
    </span>
  );
}

// ── StatusPill ───────────────────────────────────────────────────────────────
// Badge pill: live (maroon w/ pulsing dot), upcoming (gold), final (muted gray).
export function StatusPill({
  type = "live",
  children,
}: {
  type?: "live" | "upcoming" | "final";
  children: React.ReactNode;
}) {
  // Three visual variants, all narrow / mono / tracking-wide.
  const styles =
    type === "live"
      ? "bg-ia-accent border-transparent text-white"
      : type === "final"
      ? "bg-white/[0.04] border-white/[0.07] text-white/35"
      : "bg-ia-gold/[0.08] border-ia-gold/25 text-ia-gold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-sm border font-mono font-bold text-[9px] tracking-[0.14em] ${styles}`}
    >
      {type === "live" && <LiveDot size={6} className="text-white" />}
      {children}
    </span>
  );
}

// ── SectionTitle ─────────────────────────────────────────────────────────────
// Skewed accent bar + Bebas italic + flex-1 hairline rule. Used above each section.
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {/* 4px-wide maroon skewed bar */}
      <span className="block w-1 h-[22px] bg-ia-accent" style={{ transform: "skewX(-12deg)" }} />
      <h2 className="font-bebas italic text-2xl tracking-[0.05em] m-0 text-white">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.07]" />
    </div>
  );
}

