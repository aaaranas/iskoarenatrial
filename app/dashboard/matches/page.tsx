// src/app/dashboard/matches/page.tsx
"use client";

import { Box } from "@/components/matches/Box";

export default function MatchesPage() {
  return (
    <div className="flex-1 w-full bg-[#050505]">
      {/* 
        The Box component contains the cinematic backdrop, 
        the filter bar, and the match grid.
      */}
      <Box />
    </div>
  );
}
