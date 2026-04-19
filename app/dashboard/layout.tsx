"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.refresh();
    router.push("/");
  };

  const currentPage = pathname.split("/").filter(Boolean).pop() || "dashboard";
  const pageLabel = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  if (isLoading) {
    return (
      <div className="h-screen bg-[radial-gradient(circle_at_top_right,_#1a0001,_#000000)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  const adminName = auth?.profile?.fullName || "Operator";
  const adminRole = auth?.profile?.role || "Admin";

  return (
    <SidebarProvider>
      {/* No variant prop here — AppSidebar sets variant="inset" internally */}
      <AppSidebar
        onLogout={handleLogout}
        adminName={adminName}
      />

      <SidebarInset className="bg-[radial-gradient(circle_at_top_right,_#1a0001,_#000000)] min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-20 flex justify-between items-center px-8 py-4 w-full bg-black/40 backdrop-blur-[12px] border-b border-white/[0.08]">
          {/* Left: toggle trigger + page title */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-sm transition-colors" />
            <h2 className="text-xl font-bold tracking-tight text-white uppercase font-headline">
              {pageLabel}
            </h2>
          </div>

          {/* Right: admin info + avatar */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-bold text-white uppercase tracking-tight">{adminName}</p>
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{adminRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#800000] flex items-center justify-center overflow-hidden flex-shrink-0">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto text-[#F3F4F6]">
          {children}
        </main>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  );
}