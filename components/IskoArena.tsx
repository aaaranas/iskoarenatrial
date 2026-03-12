"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthManager, DataManager } from "@/lib/dataManager";
import type { Admin, AppData, Match, Result, Player, Stat, MediaItem, Notification, PageName } from "@/types";

// Page Components
import LandingPage from "@/components/pages/LandingPage"; 
import DashboardPage from "@/components/pages/DashboardPage";
import MatchesPage from "@/components/pages/MatchesPage";
import ResultsPage from "@/components/pages/ResultsPage";
import StatsPage from "@/components/pages/StatsPage";
import MediaPage from "@/components/pages/MediaPage";
import TeamsPage from "@/components/pages/TeamsPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import ArchivesPage from "@/components/pages/ArchivesPage";

// Shadcn Sidebar Components
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Layout & UI
import { Toaster } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";

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

  const handleAddMatch = (match: Omit<Match, "id" | "createdAt">) => {
    DataManager.add("matches", match);
    refresh();
    toast({ title: "Success", description: "Match added." });
  };

  const handleDeleteMatch = (id: number) => {
    DataManager.delete("matches", String(id));
    refresh();
  };

  const handleUpdateMatch = (id: number, patch: Partial<Match>) => {
    DataManager.update("matches", String(id), patch);
    refresh();
  };

  const handleAddStat = (stat: any) => {
    DataManager.add("stats", stat);
    refresh();
  };

  const handleUpdateStat = (id: string, stat: any) => {
    DataManager.update("stats", String(id), stat);
    refresh();
  };

  const handleDeleteStat = (id: string) => {
    DataManager.delete("stats", String(id));
    refresh();
  };

  const handleDeletePlayer = (id: number) => {
    DataManager.delete("players", String(id));
    refresh();
  };

  // ── Eligibility status handler ──────────────────────────────────────────────
  const handleUpdatePlayerStatus = (id: number, status: "in_review" | "eligible" | "ineligible") => {
    DataManager.update("players", String(id), { eligibilityStatus: status });
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
        return <DashboardPage matches={data.matches} results={data.results} players={data.players} teams={data.teams} />;
      case "matches":
        return <MatchesPage matches={data.matches} onAddMatch={handleAddMatch} onDeleteMatch={handleDeleteMatch} onUpdateMatch={handleUpdateMatch} />;
      case "results":
        return <ResultsPage matches={data.matches} results={data.results} onRecordResult={(mId, tA, tB, sA, sB, sp) => {
          const winner = sA > sB ? tA : sB > sA ? tB : "Draw";
          DataManager.add("results", { matchId: mId, teamA: tA, teamB: tB, scoreA: sA, scoreB: sB, winner, sport: sp });
          refresh();
        }} />;
      case "stats":
        return (
          <StatsPage
            stats={data.stats}
            players={data.players}
            onAddStat={handleAddStat}
            onUpdateStat={handleUpdateStat}
            onDeleteStat={handleDeleteStat}
            onLoadDemoStats={() => { refresh(); }}
          />
        );
      case "media":
        return <MediaPage matches={data.matches} media={data.media} onUploadMedia={(m) => { DataManager.add("media", m); refresh(); }} />;
      case "teams":
        return (
          <TeamsPage
            players={data.players}
            onAddPlayer={(p) => { DataManager.add("players", p); refresh(); }}
            onDeletePlayer={handleDeletePlayer}
            onDeleteAllPlayers={() => { data.players = []; DataManager.saveData(data); refresh(); }}
            onImportPlayers={(ps) => { ps.forEach(p => DataManager.add("players", p)); refresh(); }}
            onUpdatePlayerStatus={handleUpdatePlayerStatus}
          />
        );
      case "notifications":
        return <NotificationsPage notifications={data.notifications} onSend={(n) => { DataManager.add("notifications", n); refresh(); }} />;
      case "archives":
        return <ArchivesPage results={data.results} media={data.media} />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        variant="sidebar"
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        adminName={currentAdmin.fullName}
      />
      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight capitalize">{currentPage}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          {renderPage()}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}