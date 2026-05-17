"use client";
import React from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { RoleProvider } from "@/providers/RoleProvider";
// Single shared notification context for the whole dashboard — wraps both
// the TopBar bell and any future consumer in one realtime subscription.
import { NotificationProvider } from "@/features/notifications/NotificationProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Route protection lives in middleware.ts. By the time this layout renders,
  // the cookie-based session has already been validated server-side.
  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-surface-page flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--accent-maroon)" }}
        />
      </div>
    );
  }

  // Render nothing while the redirect is in flight
  if (!auth) return null;

  return (
    // RoleProvider wraps the entire dashboard so every child component
    // that calls useRole() receives the real role from Supabase profiles.
    <RoleProvider>
      {/* NotificationProvider sits inside RoleProvider so future role-gated
          notifications (e.g. admin-only events) can hook into useRole(). */}
      <NotificationProvider>
        {/* overflow-x-hidden is a defensive safety net — any single child that
            accidentally exceeds the viewport width (wide podium, table, image,
            etc.) gets clipped at the layout boundary instead of horizontally
            scrolling the entire page on mobile. */}
        <div className="flex flex-col min-h-screen bg-surface-page overflow-x-hidden">
          <TopBar
            onLogout={handleLogout}
            avatarUrl={auth?.profile?.avatar_url ?? null}
            displayName={auth?.profile?.full_name ?? ""}
          />
          <main className="flex-1 w-full pt-16">
            {children}
          </main>
          <Toaster />
        </div>
      </NotificationProvider>
    </RoleProvider>
  );
}