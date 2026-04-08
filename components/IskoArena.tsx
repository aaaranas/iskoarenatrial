"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthManager, DataManager } from "@/lib/dataManager";
import type {
  Admin,
  AppData,
  Match,
  Result,
  Player,
  Stat,
  MediaItem,
  Notification,
  PageName,
} from "@/types";

// Page Components
import LandingPage from "@/components/pages/LandingPage";
import DashboardPage from "@/components/pages/DashboardPage";
import MatchesPage from "@/components/pages/MatchesPage";
import StatsPage from "@/components/pages/StatsPage";
import MediaPage from "@/components/pages/MediaPage";
import TeamsPage from "@/components/pages/TeamsPage";
import ArchivesPage from "@/components/pages/ArchivesPage";
import NotificationsPage from "@/components/pages/NotificationsPage";

// Shadcn Sidebar Components
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Layout & UI
import { Toaster } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";
import { MatIcon } from "@/components/ui/MatIcon";

const titleMap: Record<PageName, string> = {
  dashboard: "Dashboard",
  matches: "Match Management",
  stats: "Analytics & Statistics",
  results: "Record Results",
  media: "Media Library",
  teams: "Teams & Players",
  notifications: "System Notifications",
  archives: "Data Archives",
};

export default function IskoArena() {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");
  const [data, setData] = useState<AppData | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    AuthManager.initializeAdmins();
    DataManager.initializeData();
    setData(DataManager.getData());
  }, []);

  const refresh = useCallback(() => setData(DataManager.getData()), []);

  const handleLogin = (admin: Admin) => {
    setCurrentAdmin(admin);
    refresh();
    toast({
      title: "Welcome back!",
      description: `Successfully signed in as ${admin.fullName}`,
    });
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setCurrentPage("dashboard");
    toast({
      title: "Logged Out",
      description: "You have been securely logged out.",
    });
  };

  // ── Matches ─────────────────────────────────────────────────────────────────
  const handleAddMatch = (match: Omit<Match, "id" | "createdAt">) => {
    DataManager.add("matches", match);
    refresh();
    toast({ title: "Success", description: "Match added.", variant: "success" });
  };

  const handleDeleteMatch = (id: number) => {
    DataManager.delete("matches", String(id));
    refresh();
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const handleAddStat = (stat: Omit<Stat, "id" | "createdAt">) => {
    DataManager.add("stats", stat);
    refresh();
  };

  const handleUpdateStat = (
    id: string,
    stat: Partial<Omit<Stat, "id" | "createdAt">>
  ) => {
    DataManager.update("stats", id, stat);
    refresh();
  };

  const handleDeleteStat = (id: string) => {
    DataManager.delete("stats", id);
    refresh();
  };

  // ── Players ──────────────────────────────────────────────────────────────────
  const handleAddPlayer = (p: Omit<Player, "id" | "createdAt">) => {
    DataManager.add("players", p);
    refresh();
  };

  const handleDeletePlayer = (id: number) => {
    DataManager.delete("players", String(id));
    refresh();
  };

  const handleDeleteAllPlayers = () => {
    if (!data) return;
    data.players = [];
    DataManager.saveData(data);
    refresh();
  };

  const handleImportPlayers = (ps: Omit<Player, "id" | "createdAt">[]) => {
    ps.forEach((p) => DataManager.add("players", p));
    refresh();
  };

  // ── Notifications ────────────────────────────────────────────────────────────
  const handleSendNotification = (
    n: Omit<Notification, "id" | "createdAt">
  ) => {
    DataManager.add("notifications", n);
    refresh();
  };

  if (!currentAdmin) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (!data) return null;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            matches={data.matches}
            results={data.results}
            players={data.players}
            teams={data.teams}
          />
        );
      case "matches":
        return (
          <MatchesPage
            matches={data.matches}
            onAddMatch={handleAddMatch}
            onDeleteMatch={handleDeleteMatch}
          />
        );
      case "stats":
        return (
          <StatsPage
            stats={data.stats}
            players={data.players}
            onAddStat={handleAddStat}
            onUpdateStat={handleUpdateStat}
            onDeleteStat={handleDeleteStat}
            onLoadDemoStats={refresh}
          />
        );
      case "media":
        return (
          <MediaPage
            matches={data.matches}
            media={data.media}
            onUploadMedia={(m: Omit<MediaItem, "id" | "createdAt">) => {
              DataManager.add("media", m);
              refresh();
            }}
          />
        );
      case "teams":
        return (
          <TeamsPage
            players={data.players}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onDeleteAllPlayers={handleDeleteAllPlayers}
            onImportPlayers={handleImportPlayers}
          />
        );
      case "notifications":
        return (
          <NotificationsPage
            notifications={data.notifications}
            onSend={handleSendNotification}
          />
        );
      case "archives":
        return <ArchivesPage results={data.results} media={data.media} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen text-on-surface bg-gradient-dark">
        <SidebarProvider>
          <AppSidebar
            variant="sidebar"
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            adminName={currentAdmin.fullName}
          />

          <SidebarInset style={{ background: "transparent" }}>
            {/* Top App Bar */}
            <header
              className="sticky top-0 z-20 flex justify-between items-center px-8 py-4 w-full glass-panel"
              style={{
                background: "rgba(0,0,0,0.5)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-on-surface-variant hover:text-on-surface transition-colors" />
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-headline">
                  {titleMap[currentPage]}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-bold text-white uppercase font-label">
                    {currentAdmin.fullName}
                  </p>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label">
                    Admin Officer
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderColor: "#800000",
                  }}
                >
                  <span className="text-sm font-black text-white font-headline">
                    {currentAdmin.fullName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {renderPage()}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      <Toaster />
    </>
  );
}