"use client";
import React from "react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/topbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { RoleProvider } from "@/components/providers/role-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: auth, isLoading } = trpc.auth.getSession.useQuery();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    utils.auth.getSession.invalidate();
    router.refresh();
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

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">
      <TopBar onLogout={handleLogout} />
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
      <ThemeToggle />
      <Toaster />
    </div>
  );
}