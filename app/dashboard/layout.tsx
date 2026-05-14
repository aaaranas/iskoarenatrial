// src/app/dashboard/layout.tsx
"use client";
import React, { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
// FIX (Bug 0): RoleProvider was never mounted anywhere in the component tree.
// Every useRole() call returned the default context { role: null, isAdmin: false, loading: true }
// permanently. Mounting it here wraps the entire dashboard subtree so Box.tsx,
// MediaPage.tsx, and TeamsPage.tsx all receive the real role from Supabase.
import { RoleProvider } from "@/providers/RoleProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.push("/"); // push navigates away; refresh() beforehand was a no-op stutter
  };

  // Client-side session check — reads localStorage where signInWithPassword stores
  // the session. The tRPC getSession query reads cookies (server-side), which are
  // empty because the browser client uses localStorage, so we can't use auth===null
  // as the redirect signal without falsely kicking out every logged-in user.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/");
    });
  }, [router]);

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
        <TopBar onLogout={handleLogout} />
        <main className="flex-1 w-full pt-16">
          {children}
        </main>
        <ThemeToggle />
        <Toaster />
      </div>
    </RoleProvider>
  );
}