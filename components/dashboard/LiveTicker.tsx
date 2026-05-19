// Dashboard V2 — BottomLine running ticker.
// Marquee animation (iaTicker, 40s linear infinite) is defined in app/globals.css.
// Pauses for users with prefers-reduced-motion (handled in globals.css).
//
// mode='live'     → red "● LIVE" tab — shown when today has live/upcoming matches.
// mode='upcoming' → gold "UPCOMING" tab — shown when today is done, tomorrow has matches.
// Callers hide the ticker entirely when the event has no future matches.
"use client";

import { LiveDot } from "./DashboardPrimitives";
import type { TickerItem } from "./dashboard-data";

type TickerMode = "live" | "upcoming";

export function LiveTicker({
  items,
  mode = "live",
}: {
  items: TickerItem[];
  mode?: TickerMode;
}) {
  // Seamless marquee: render items twice so the translateX(-50%) loop looks
  // continuous — when the first half scrolls out, the second half is identical.
  const doubled = [...items, ...items];

  const isLiveMode = mode === "live";

  return (
    <div className="h-9 bg-black border-y border-white/[0.07] overflow-hidden relative flex items-center">
      {/* Left tab — angled clip-path gives the broadcast-channel-bug feel.
          Red with pulsing dot for live mode; gold (no dot) for upcoming mode. */}
      <div
        className={`h-full flex items-center gap-2 flex-shrink-0 font-bebas text-sm tracking-[0.18em] z-[2] text-white ${
          isLiveMode ? "bg-ia-accent" : "bg-ia-gold"
        }`}
        style={{
          padding: "0 24px 0 14px",
          clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
        }}
      >
        {isLiveMode ? (
          <>
            <LiveDot size={8} className="text-white" />
            LIVE
          </>
        ) : (
          // Gold "UPCOMING" tab — no pulse dot, text in black for contrast on gold.
          <span className="text-black">UPCOMING</span>
        )}
      </div>

      {/* Marquee row — items scroll continuously left. */}
      <div className="ia-ticker-marquee flex gap-9 animate-[iaTicker_40s_linear_infinite] whitespace-nowrap pl-6 font-mono tabular-nums text-[13px] text-zinc-100">
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
