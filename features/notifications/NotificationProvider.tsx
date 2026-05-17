"use client";

// ─── NotificationProvider ────────────────────────────────────────────────────
// Single source of truth for all match notifications across the dashboard.
// Opens ONE Supabase Realtime channel for the whole app (vs one per bell),
// and exposes notifications + actions via context for any consumer.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { buildNotification } from "./helpers";
import type { AppNotification, NotificationType } from "./types";

// Hard cap on in-memory notifications so the panel can't grow unbounded
const MAX_NOTIFICATIONS = 50;

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Prepend a new notification; keep newest first, drop overflow off the end
  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ── Realtime subscription ────────────────────────────────────────────────
  // Single channel for the entire dashboard, mounted once when the provider
  // mounts and torn down on unmount. Don't add addNotification to deps —
  // it's stable, but listing it would force re-subscription if React ever
  // changes the identity guarantees.
  useEffect(() => {
    // Helper: build + push + toast in one place to keep both handlers DRY
    const emit = async (type: NotificationType, row: Record<string, any>) => {
      const notif = await buildNotification(type, row);
      addNotification(notif);
      toast.info(notif.title, { description: notif.body });
    };

    const channel = supabase
      .channel("match-notifications")
      // INSERT — a brand new match was scheduled
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        (payload) => {
          void emit("new_match", payload.new as Record<string, any>);
        },
      )
      // UPDATE — only emit on actual status transitions (live / completed).
      // Requires REPLICA IDENTITY FULL on matches so payload.old has the old status.
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        (payload) => {
          const oldStatus = (payload.old as Record<string, any> | null)?.status;
          const newStatus = (payload.new as Record<string, any>)?.status;
          // No status field or no change → ignore (irrelevant edits like score updates)
          if (!newStatus || oldStatus === newStatus) return;

          let type: NotificationType | null = null;
          if (newStatus === "live") type = "match_live";
          else if (newStatus === "completed") type = "match_finished";
          if (!type) return;

          void emit(type, payload.new as Record<string, any>);
        },
      )
      .subscribe();

    return () => {
      // Clean unsubscribe on unmount and on React Strict Mode double-invoke
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  // Derived value — avoid recomputing on every consumer render
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  // Stable value object so consumers don't re-render when nothing relevant changed
  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, markRead, markAllRead }),
    [notifications, unreadCount, markRead, markAllRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// Hook for any descendant to read/act on notifications
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
