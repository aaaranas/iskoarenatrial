// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const utils = trpc.useUtils();
  
  // 1. Fetch Session for Sidebar Info
  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.refresh();
    router.push("/");
  };

  // Extract the current page name from the URL for the header
  const currentPage = pathname.split("/").pop() || "dashboard";

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        variant="sidebar"
        onLogout={handleLogout} 
        adminName={auth?.profile?.fullName || "Operator"} 
      />

      <SidebarInset className="bg-[#050505]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800 px-4 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-20">
          <SidebarTrigger className="-ml-1 text-zinc-400" />
          <div className="flex-1">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {currentPage === "dashboard" ? "System Overview" : currentPage}
            </h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
