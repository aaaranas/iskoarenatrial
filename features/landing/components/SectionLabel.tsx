// Shared eyebrow label used across landing sections — short rule + uppercase
// label in an accent color. Matches the design's `SectionLabel` helper from
// ia-matches.jsx; lives in its own file because it's used 6+ times across Phase 5.

import React from "react";

interface SectionLabelProps {
  children: React.ReactNode;
  // Defaults to ia-accent (#A91D3A); pass GOLD or per-section color to override.
  color?: string;
}

export default function SectionLabel({ children, color = "#A91D3A" }: SectionLabelProps) {
  return (
    <div className="mb-3.5 inline-flex items-center gap-2.5">
      {/* Solid 28px rule in the section accent */}
      <span
        className="inline-block h-0.5 w-7 rounded"
        style={{ background: color }}
      />
      <span
        className="text-[11px] font-bold uppercase tracking-[3px]"
        style={{ color }}
      >
        {children}
      </span>
    </div>
  );
}
