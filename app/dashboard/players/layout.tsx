import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Players",
  description: "Browse every IskoArena player — by college, sport, or position.",
};

// Pass-through wrapper — real layout chrome lives in app/dashboard/layout.tsx.
export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
