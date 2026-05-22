import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Leaderboards",
  description: "Player and team rankings across every IskoArena sport.",
};

// Pass-through wrapper — real layout chrome (sidebar, topbar) lives in app/dashboard/layout.tsx.
export default function LeaderboardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
