import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Media",
  description: "Match highlights, photos, and recaps from IskoArena.",
};

// Pass-through wrapper — real layout chrome lives in app/dashboard/layout.tsx.
export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
