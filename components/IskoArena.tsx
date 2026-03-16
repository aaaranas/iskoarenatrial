"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthManager, DataManager } from "@/lib/dataManager";
import type { Admin, AppData, Match, Result, Player, Stat, MediaItem, Notification, PageName } from "@/types";

// Page Components
import LandingPage from "@/components/pages/LandingPage"; 
import DashboardPage from "@/components/pages/DashboardPage";
import MatchesPage from "@/components/pages/MatchesPage";
import StatsPage from "@/components/pages/StatsPage";
import MediaPage from "@/components/pages/MediaPage";
import TeamsPage from "@/components/pages/TeamsPage";
import ArchivesPage from "@/components/pages/ArchivesPage";

// Shadcn Sidebar Components
import { AppSidebar } from "@/components/app-sidebar"; // This is the new component we created
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Layout & UI
import { Toaster } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";

export default function IskoArena() {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");
  const [data, setData] = useState<AppData | null>(null);
  const [logoutModal, setLogoutModal] = useState(false);
  
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

  // ---- Handlers (Matches, Results, etc.) ----
  const handleAddMatch = (match: Omit<Match, "id" | "createdAt">) => {
    DataManager.add("matches", match);
    refresh();
    toast({ title: "Success", description: "Match added.", variant: "success" });
  };

    // Example: MatchesPage handler
const handleDeleteMatch = (id: number) => {
  // coerce number to string for DataManager
  DataManager.delete("matches", String(id));
  refresh();
};

// StatsPage handlers
const handleAddStat = (stat: any) => {
  DataManager.add("stats", stat);
  refresh();
};

const handleUpdateStat = (id: string, stat: any) => {
  DataManager.update("stats", String(id), stat); // coerce number → string
  refresh();
};

const handleDeleteStat = (id: string) => {
  DataManager.delete("stats", String(id)); // coerce number → string
  refresh();
};


// TeamsPage handler
const handleDeletePlayer = (id: number) => {
  DataManager.delete("players", String(id));
  refresh();
};

  // ... (Other handlers remain the same as your original file)

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
        return <MatchesPage matches={data.matches} onAddMatch={handleAddMatch} onDeleteMatch={handleDeleteMatch} />;
      case "stats":
	 return <StatsPage
      stats={data.stats}
      players={data.players}
      onAddStat={handleAddStat}
      onUpdateStat={handleUpdateStat}
      onDeleteStat={handleDeleteStat}
      onLoadDemoStats={() => { refresh(); }}
    />
      case "media":
        return <MediaPage matches={data.matches} media={data.media} onUploadMedia={(m) => { DataManager.add("media", m); refresh(); }} />;
      case "teams":
	return <TeamsPage
  players={data.players}
  onAddPlayer={(p) => { DataManager.add("players", p); refresh(); }}
  onDeletePlayer={handleDeletePlayer}   // numeric ID in, string for DataManager
  onDeleteAllPlayers={() => { data.players = []; DataManager.saveData(data); refresh(); }}
  onImportPlayers={(ps) => { ps.forEach(p => DataManager.add("players", p)); refresh(); }}
/>
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
      {/* New Shadcn UI Sidebar */}
      <AppSidebar 
	variant="sidebar"
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
        adminName={currentAdmin.fullName} 
      />

      {/* Main Content Area using Inset Variant */}
      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight capitalize">{currentPage}</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {renderPage()}
        </div>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  );
}
