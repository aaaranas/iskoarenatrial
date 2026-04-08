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

  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.refresh();
    router.push("/");
  };

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

      <SidebarInset className="bg-transparent">
        {/* TopAppBar — glass panel matching HTML header */}
        <header
          className="sticky top-0 z-10 flex items-center gap-6 border-b"
          style={{
            height: "56px",
            padding: "0 2rem",
            background: "rgba(0, 0, 0, 0.40)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Mobile menu toggle */}
          <SidebarTrigger
            className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "#F3F4F6" }}
          />

          {/* Page title — Oswald text-xl bold uppercase, matches HTML h2 */}
          <h2
            className="text-white"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "0.025em",
              textTransform: "uppercase",
            }}
          >
            {currentPage === "dashboard" ? "Dashboard" : currentPage}
          </h2>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  );
}