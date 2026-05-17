"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { User, Bell, LogOut, Menu, ChevronRight, X, Circle, Trophy, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "new_match" | "match_live" | "match_finished";

type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  matchId?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function buildNotificationWithNames(
  type: NotificationType,
  record: Record<string, any>
): Promise<AppNotification> {
  const id = `${type}-${record.id}-${Date.now()}`;

  // Fetch both team names in one query using the UUID foreign keys
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", [record.home_team_id, record.away_team_id].filter(Boolean));

  const homeTeam = teams?.find(t => t.id === record.home_team_id)?.name ?? "Home Team";
  const awayTeam = teams?.find(t => t.id === record.away_team_id)?.name ?? "Away Team";
  const matchLabel = `${homeTeam} vs ${awayTeam}`;

  const map: Record<NotificationType, { title: string; body: string }> = {
    new_match:      { title: "New Match Scheduled", body: `${matchLabel} has been added.` },
    match_live:     { title: "Match is LIVE 🔴",     body: `${matchLabel} has just kicked off!` },
    match_finished: { title: "Match Finished",       body: `${matchLabel} has ended.` },
  };

  return {
    id,
    type,
    title: map[type].title,
    body:  map[type].body,
    timestamp: new Date(),
    read: false,
    matchId: record.id,
  };
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const notificationIcon: Record<NotificationType, React.ReactNode> = {
  new_match:      <CalendarPlus size={14} className="text-blue-400" />,
  match_live:     <Circle size={14} className="text-red-500 fill-red-500 animate-pulse" />,
  match_finished: <Trophy size={14} className="text-yellow-400" />,
};

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
  anchorRect,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  anchorRect: DOMRect | null;
}) {
  const unread = notifications.filter(n => !n.read).length;

  const panelStyle: React.CSSProperties = {
    ...(anchorRect
      ? { top: anchorRect.bottom + 8, right: window.innerWidth - anchorRect.right }
      : { top: 64, right: 24 }),
    position: "fixed",
    backgroundColor: "hsl(var(--topbar-bg))",
    borderColor: "hsl(var(--topbar-border))",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      {/* Panel */}
      <div
        style={panelStyle}
        className="w-80 z-[100] rounded-2xl overflow-hidden border shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "hsl(var(--topbar-border))" }}
        >
          <div className="flex items-center gap-2">
            <Bell size={14} style={{ color: "hsl(var(--topbar-text))" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Notifications
            </span>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#A91D3A] text-[10px] font-bold text-white leading-none">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--topbar-text))" }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ backgroundColor: "var(--surface-sunken)", color: "hsl(var(--topbar-text))" }}
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* List */}
        <div
          className="max-h-[360px] overflow-y-auto divide-y"
          style={{ borderColor: "hsl(var(--topbar-border))" }}
        >
          {notifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 gap-2"
              style={{ color: "hsl(var(--topbar-text))" }}
            >
              <Bell size={28} strokeWidth={1.2} />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:opacity-80"
                style={{
                  backgroundColor: !n.read ? "var(--border-ghost)" : "transparent",
                  borderColor: "hsl(var(--topbar-border))",
                }}
              >
                <div
                  className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--surface-sunken)" }}
                >
                  {notificationIcon[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: n.read ? "hsl(var(--topbar-text))" : "var(--text)" }}
                  >
                    {n.title}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                    style={{ color: "hsl(var(--topbar-text))" }}
                  >
                    {n.body}
                  </p>
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: "hsl(var(--topbar-text))", opacity: 0.6 }}
                  >
                    {timeAgo(n.timestamp)}
                  </p>
                </div>
                {!n.read && (
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#A91D3A] flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  onLogout: () => void;
}

const allNavItems = [
  { label: "Dashboard",    url: "/dashboard"              },
  { label: "Matches",      url: "/dashboard/matches"      },
  { label: "Leaderboards", url: "/dashboard/leaderboards" },
  { label: "Media",        url: "/dashboard/media"        },
  { label: "Teams",        url: "/dashboard/teams"        },
];

export function TopBar({ onLogout }: TopBarProps) {
  const pathname = usePathname();
  const [notifications,      setNotifications]      = useState<AppNotification[]>([]);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [bellRect,           setBellRect]           = useState<DOMRect | null>(null);

  const desktopBellRef = useRef<HTMLButtonElement>(null);
  const mobileBellRef  = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Bell click — capture position then toggle ────────────────────────────
  const handleBellClick = (ref: React.RefObject<HTMLButtonElement>) => {
    if (!showNotifications && ref.current) {
      setBellRect(ref.current.getBoundingClientRect());
    }
    setShowNotifications(v => !v);
  };

  // ── Push notification (deduped, max 50) ──────────────────────────────────
  const pushNotification = useCallback((notif: AppNotification) => {
    setNotifications(prev => {
      if (prev.find(n => n.id === notif.id)) return prev;
      return [notif, ...prev].slice(0, 50);
    });
  }, []);

  // ── Supabase Realtime — uses corrected status values + async team names ──
  useEffect(() => {
    const channel = supabase
      .channel("match-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        async (payload) => {
          const notif = await buildNotificationWithNames("new_match", payload.new as Record<string, any>);
          pushNotification(notif);
          toast.info(notif.title, { description: notif.body });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        async (payload) => {
          const oldStatus = (payload.old as any)?.status?.toLowerCase();
          const newStatus = (payload.new as any)?.status?.toLowerCase();

          if (oldStatus === "scheduled" && newStatus === "live") {
            const notif = await buildNotificationWithNames("match_live", payload.new as Record<string, any>);
            pushNotification(notif);
            toast.warning(notif.title, { description: notif.body });
          } else if (oldStatus === "live" && newStatus === "finished") {
            const notif = await buildNotificationWithNames("match_finished", payload.new as Record<string, any>);
            pushNotification(notif);
            toast.success(notif.title, { description: notif.body });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pushNotification]);

  // ── Shared bell button (used for both desktop + mobile) ──────────────────
  const BellButton = ({ refProp }: { refProp: React.RefObject<HTMLButtonElement> }) => (
    <button
      ref={refProp}
      onClick={() => handleBellClick(refProp)}
      aria-label="Notifications"
      className="relative h-auto w-auto p-0 hover:opacity-70 transition-opacity"
      style={{ color: "hsl(var(--topbar-text))" }}
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#A91D3A] text-[9px] font-bold text-white flex items-center justify-center leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-5 md:px-7 border-b transition-colors duration-300"
        style={{
          backgroundColor: "hsl(var(--topbar-bg))",
          borderColor: "hsl(var(--topbar-border))",
        }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-4 pr-4 md:pr-6 shrink-0">
          <div
            className="p-1.5 rounded-full shadow-sm border"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--border-ghost)",
            }}
          >
            <Image src="/logo.png" width={32} height={32} alt="IskoArena Logo" className="rounded-full" />
          </div>
          <h1
            className="hidden md:block text-xl font-bold tracking-wide font-heading"
            style={{ color: "var(--text)" }}
          >
            IskoArena
          </h1>
        </div>

        {/* ── Desktop + Tablet nav (md+) ── */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 px-4">
          {allNavItems.map((item) => {
            const active = pathname === item.url;
            return (
              <Link
                key={item.label}
                href={item.url}
                className="transition-colors text-xs font-semibold uppercase tracking-wider py-1.5 whitespace-nowrap"
                style={{ color: active ? "var(--topbar-active)" : "hsl(var(--topbar-text))" }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Desktop + Tablet (md+) ── */}
        <div
          className="hidden md:flex items-center gap-4 lg:gap-6 pl-4 h-8 shrink-0 border-l"
          style={{ borderColor: "hsl(var(--topbar-border))" }}
        >
          <BellButton refProp={desktopBellRef} />

          <div
            className="flex size-8 items-center justify-center rounded-full border shadow-inner"
            style={{ backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-strong)" }}
          >
            <User className="size-4" style={{ color: "var(--text)" }} />
          </div>

          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-xs font-semibold uppercase tracking-wider h-auto p-0 hover:bg-transparent"
            style={{ color: "hsl(var(--topbar-text))" }}
          >
            Log out
          </Button>
        </div>

        {/* ── Right: Mobile only ── */}
        <div className="flex md:hidden flex-1 justify-end items-center gap-3">
          <BellButton refProp={mobileBellRef} />

          <div
            className="flex size-8 items-center justify-center rounded-full border shadow-inner"
            style={{ backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-strong)" }}
          >
            <User className="size-4" style={{ color: "var(--text)" }} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Log out"
            className="h-auto w-auto p-0 hover:bg-transparent"
            style={{ color: "hsl(var(--topbar-text))" }}
          >
            <LogOut className="size-4" />
          </Button>

          {/* Mobile nav Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle navigation"
                className="h-auto w-auto p-0 hover:bg-transparent"
                style={{ color: "hsl(var(--topbar-text))" }}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className="mt-16 border-b shadow-2xl p-0"
              style={{
                backgroundColor: "hsl(var(--topbar-bg))",
                borderColor: "hsl(var(--topbar-border))",
              }}
            >
              <nav className="flex flex-col py-2">
                {allNavItems.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center justify-between px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors border-l-2",
                          active ? "border-l-2" : "border-transparent"
                        )}
                        style={{
                          color: active ? "var(--topbar-active)" : "hsl(var(--topbar-text))",
                          borderLeftColor: active ? "var(--topbar-active)" : "transparent",
                          backgroundColor: active ? "var(--border-ghost)" : "transparent",
                        }}
                      >
                        {item.label}
                        <ChevronRight
                          className="size-3.5"
                          style={{ color: active ? "var(--topbar-active)" : "var(--text)" }}
                        />
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Notification panel — outside <header> to escape stacking context */}
      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          anchorRect={bellRect}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        />
      )}
    </>
  );
}
