"use client";

import { useState } from "react";
import { Box } from "@/features/matches/components/Box";
import { Match } from "@/types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MatchDetailsView } from "@/features/matches/components/MatchDetailsView";

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="flex-1 w-full bg-[#050505]">
      {/* Pass the selection handler into Box */}
      <Box onSelectMatch={setSelectedMatch} />

      {/* The global Sheet for details */}
      <Sheet 
        open={!!selectedMatch} 
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl bg-[#050505] border-l border-white/10 p-0 overflow-y-auto text-white">
          {selectedMatch && <MatchDetailsView match={selectedMatch} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
