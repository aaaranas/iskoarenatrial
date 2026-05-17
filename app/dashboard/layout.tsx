"use client";
import React from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { RoleProvider } from "@/providers/RoleProvider";

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
      <div className="flex flex-col min-h-screen bg-surface-page">
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
    </RoleProvider>
  );
}