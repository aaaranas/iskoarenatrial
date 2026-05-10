// src/app/dashboard/layout.tsx
"use client";
import React, { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { RoleProvider } from "@/providers/RoleProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const utils  = trpc.useUtils();

  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.refresh();
    router.push("/");
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
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <RoleProvider>
      <div className="flex flex-col min-h-screen">
        <AppSidebar
          adminName={auth?.profile?.full_name || "Operator"}
          onLogout={handleLogout}
        />
        <main className="flex-1 w-full pt-16 bg-[#050505]">
          {children}
        </main>
        <Toaster />
      </div>
    </RoleProvider>
  );
}