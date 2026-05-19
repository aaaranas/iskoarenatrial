// Dashboard V2 — BottomLine running ticker.
// Marquee animation (iaTicker, 40s linear infinite) is defined in app/globals.css.
// Pauses for users with prefers-reduced-motion (handled in CSS too).
"use client";

import { LiveDot } from "./DashboardPrimitives";
import type { TickerItem } from "./dashboard-data";

export function LiveTicker({ items }: { items: TickerItem[] }) {
  // Marquee technique: render the items twice back-to-back and translateX(-50%)
  // over the full keyframe — appears seamless because the second half is
  // identical to the first.
  const doubled = [...items, ...items];

  return (
    <div className="h-9 bg-black border-y border-white/[0.07] overflow-hidden relative flex items-center">
      {/* Left LIVE tab with angled clip-path */}
      <div
        className="bg-ia-accent text-white h-full flex items-center gap-2 flex-shrink-0 font-bebas text-sm tracking-[0.18em] z-[2]"
        style={{
          padding: "0 24px 0 14px",
          // 12px diagonal cut on the right edge for the broadcast-tab feel.
          clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
        }}
      >
        <LiveDot size={8} className="text-white" />
        LIVE
      </div>

      {/* Marquee row */}
      <div
        className="ia-ticker-marquee flex gap-9 animate-[iaTicker_40s_linear_infinite] whitespace-nowrap pl-6 font-mono tabular-nums text-[13px] text-zinc-100"
      >
        {doubled.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2.5">
            <span
              className={`font-bold text-[10px] tracking-[0.15em] ${
                it.status === "LIVE" ? "text-ia-accent" : "text-ia-gold"
              }`}
            >
              {it.status === "LIVE" ? "● LIVE" : it.status}
            </span>
            <span className="text-white/50 text-[11px]">{it.sport.toUpperCase()}</span>
            <span className="text-zinc-100">{it.match}</span>
            <span className="text-white/15">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
