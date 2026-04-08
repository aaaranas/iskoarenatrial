import React from "react";

interface StatusBadgeProps {
  isLive: boolean;
  isCompleted: boolean;
}

/**
 * Displays a match status pill: LIVE, UPCOMING, or COMPLETED.
 *
 * Usage:
 *   <StatusBadge isLive={true} isCompleted={false} />
 */
export function StatusBadge({ isLive, isCompleted }: StatusBadgeProps) {
  if (isLive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/30 text-red-400 text-[10px] font-black tracking-widest border border-primary/40 shadow-sm font-label"
      >
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        LIVE
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-on-surface-variant text-[10px] font-black tracking-widest border border-white/10 shadow-sm font-label"
      >
        COMPLETED
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black tracking-widest border border-secondary/30 shadow-sm font-label"
    >
      UPCOMING
    </span>
  );
}