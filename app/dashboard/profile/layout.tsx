import type { Metadata } from "next";

// Server-only metadata shim — the sibling page.tsx is a client component and can't export metadata itself.
export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your IskoArena account, avatar, and password.",
};

// Pass-through wrapper — real layout chrome lives in app/dashboard/layout.tsx.
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
