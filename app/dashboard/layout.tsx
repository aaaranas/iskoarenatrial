// src/app/dashboard/layout.tsx
"use client";
import React, { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { RoleProvider } from "@/components/providers/role-provider";

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

  // Redirect unauthenticated visitors; runs after the session query resolves
  useEffect(() => {
    if (!isLoading && !auth) router.push("/");
  }, [auth, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  // Render nothing while the redirect is in flight
  if (!auth) return null;

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