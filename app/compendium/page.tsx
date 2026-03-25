// src/app/compendium/page.tsx
import { Box } from '@/components/matches/Box';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Compendium | IskoArena",
  description: "Live-updated catalog of the intramural landscape.",
};

export default function CompendiumPage() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <Box />
    </main>
  );
}
