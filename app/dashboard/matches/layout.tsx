import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
// Title composes via root template into "Matches · IskoArena".
export const metadata: Metadata = {
  title: "Matches",
  description: "Live and upcoming intramural matches across all UP Cebu colleges.",
};

// Pass-through wrapper — no UI; the real layout work happens in app/dashboard/layout.tsx (client).
export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
