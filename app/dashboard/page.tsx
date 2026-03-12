"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { PageName, Player, Match, Result, Notification, MediaItem, Stat } from "@/types";

// Page Components
import DashboardPage from "@/components/pages/DashboardPage";
import MatchesPage from "@/components/pages/MatchesPage";
import ResultsPage from "@/components/pages/ResultsPage";
import StatsPage from "@/components/pages/StatsPage";
import MediaPage from "@/components/pages/MediaPage";
import TeamsPage from "@/components/pages/TeamsPage";
import ArchivesPage from "@/components/pages/ArchivesPage";
import NotificationsPage from "@/components/pages/NotificationsPage";

const PAGE_TITLES: Record<PageName, string> = {
  dashboard: "Dashboard",
  matches: "Matches",
  results: "Results",
  stats: "Statistics",
  media: "Media Hub",
  teams: "Teams",
  archives: "Archives",
  notifications: "Notifications",
};

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");
  const adminName = "Administrator";

  // ── Shared Data State ──
  const [players, setPlayers]             = useState<Player[]>([]);
  const [matches, setMatches]             = useState<Match[]>([]);
  const [results, setResults]             = useState<Result[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [media, setMedia]                 = useState<MediaItem[]>([]);
  const [stats, setStats]                 = useState<Stat[]>([]);

  // ── Player handlers ──
  const handleAddPlayer = (p: Omit<Player, "id" | "createdAt">) => {
    setPlayers((prev) => [...prev, { ...p, id: Date.now(), createdAt: new Date().toISOString() }]);
  };
  const handleDeletePlayer = (id: number) => setPlayers((prev) => prev.filter((p) => p.id !== id));
  const handleDeleteAllPlayers = () => setPlayers([]);
  const handleImportPlayers = (imported: Omit<Player, "id" | "createdAt">[]) => {
    setPlayers((prev) => [...prev, ...imported.map((p) => ({ ...p, id: Date.now() + Math.random(), createdAt: new Date().toISOString() }))]);
  };
  const handleUpdatePlayerStatus = (id: number, status: "in_review" | "eligible" | "ineligible") => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, eligibilityStatus: status } : p));
  };

  // ── Match handlers ──
  const handleAddMatch = (m: Omit<Match, "id" | "createdAt">) => {
    setMatches((prev) => [...prev, { ...m, id: Date.now(), createdAt: new Date().toISOString() }]);
  };
  const handleDeleteMatch = (id: number) => setMatches((prev) => prev.filter((m) => m.id !== id));

  // ── Result handlers ──
  const handleAddResult = (r: Omit<Result, "id" | "createdAt">) => {
    setResults((prev) => [...prev, { ...r, id: Date.now(), createdAt: new Date().toISOString() }]);
  };

  // ── Notification handlers ──
  const handleSendNotification = (n: Omit<Notification, "id" | "createdAt">) => {
    setNotifications((prev) => [...prev, { ...n, id: Date.now(), createdAt: new Date().toISOString() }]);
  };

  // ── Media handlers ──
  const handleAddMedia = (m: Omit<MediaItem, "id" | "createdAt">) => {
    setMedia((prev) => [...prev, { ...m, id: Date.now(), createdAt: new Date().toISOString() }]);
  };

  // ── Stat handlers ──
  // Note: Stat.id is string in the type definition, so we cast Date.now() to string
  const handleAddStat = (s: Omit<Stat, "id" | "createdAt">) => {
    setStats((prev) => [...prev, { ...s, id: String(Date.now()), createdAt: new Date().toISOString() }]);
  };
  const handleDeleteStat = (id: string) => setStats((prev) => prev.filter((s) => s.id !== id));
  const handleUpdateStat = (id: string, updated: Omit<Stat, "id" | "createdAt">) => {
    setStats((prev) => prev.map((s) => s.id === id ? { ...s, ...updated } : s));
  };

  const handleLogout = () => console.log("Logging out...");

  // ── Page renderer ──
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage matches={matches} players={players} results={results} teams={[]} onNavigate={setCurrentPage} />;
      case "matches":
        return <MatchesPage matches={matches} onAddMatch={handleAddMatch} onDeleteMatch={handleDeleteMatch} />;
      case "results":
        return <ResultsPage matches={matches} results={results} onAddResult={handleAddResult} />;
      case "stats":
        return <StatsPage stats={stats} players={players} onAddStat={handleAddStat} onDeleteStat={handleDeleteStat} onUpdateStat={handleUpdateStat} />;
      case "media":
        return <MediaPage media={media} matches={matches} onAddMedia={handleAddMedia} />;
      case "teams":
        return (
          <TeamsPage
            players={players}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onDeleteAllPlayers={handleDeleteAllPlayers}
            onImportPlayers={handleImportPlayers}
            onUpdatePlayerStatus={handleUpdatePlayerStatus}
          />
        );
      case "archives":
        return <ArchivesPage results={results} media={media} />;
      case "notifications":
        return <NotificationsPage notifications={notifications} onSend={handleSendNotification} />;
      default:
        return <DashboardPage matches={matches} players={players} results={results} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        adminName={adminName}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold tracking-tight capitalize">
            {PAGE_TITLES[currentPage]}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}