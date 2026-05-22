import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Teams",
  description: "COS Scions, CSS Stallions, CCAD Phoenix, and SOM Tycoons — rosters and team profiles.",
};

// Pass-through wrapper — real layout chrome lives in app/dashboard/layout.tsx.
export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
