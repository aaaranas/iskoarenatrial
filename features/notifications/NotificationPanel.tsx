"use client";

// ─── NotificationPanel ───────────────────────────────────────────────────────
// Floating dropdown showing the notification list. Positioned relative to the
// anchor rect of the bell button that opened it. Closes on backdrop click,
// X button, or Escape key.

import { useEffect, useState, type ReactNode } from "react";
import { Bell, Circle, Trophy, CalendarPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "./helpers";
import { useNotifications } from "./NotificationProvider";
import type { NotificationType } from "./types";

// Per-type icon (kept inline — purely presentational, not worth a separate file)
const ICON: Record<NotificationType, ReactNode> = {
  new_match: <CalendarPlus size={14} className="text-blue-400" />,
  match_live: <Circle size={14} className="text-red-500 fill-red-500 animate-pulse" />,
  match_finished: <Trophy size={14} className="text-yellow-400" />,
};

interface Props {
  onClose: () => void;
  anchorRect: DOMRect | null;  // The bell button's bounding box, used for positioning
}

export function NotificationPanel({ onClose, anchorRect }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  // Compute position in an effect so window is never read during SSR/initial render
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",  // Hide until we've measured to avoid a flash at (0,0)
  });

  useEffect(() => {
    if (anchorRect) {
      setStyle({
        position: "fixed",
        top: anchorRect.bottom + 8,
        // Clamp to viewport edge so panel never clips off-screen on narrow widths
        right: Math.max(8, window.innerWidth - anchorRect.right),
        visibility: "visible",
      });
    } else {
      // Fallback when no anchor (shouldn't normally happen)
      setStyle({ position: "fixed", top: 64, right: 24, visibility: "visible" });
    }
  }, [anchorRect]);

  // Escape closes the panel — accessibility + power-user habit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop — click anywhere outside to close */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        style={style}
        role="dialog"
        aria-label="Notifications"
        className="w-80 z-[100] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Header — title + unread badge + mark-all + close */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-zinc-400" />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#A91D3A] text-[10px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-1"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="w-6 h-6 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-800/40">
          {notifications.length === 0 ? (
            // Empty state — neutral, no error tone
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
              <Bell size={28} strokeWidth={1.2} />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-zinc-900/40 transition-colors",
                  !n.read && "bg-zinc-900/20",  // Subtle highlight for unread rows
                )}
              >
                {/* Type icon — visual anchor */}
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                  {ICON[n.type]}
                </div>
                {/* Title + body + relative time */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-semibold truncate",
                    n.read ? "text-zinc-400" : "text-white",
                  )}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.body}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(n.timestamp)}</p>
                </div>
                {/* Unread dot — only when n.read is false */}
                {!n.read && (
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#A91D3A] flex-shrink-0" aria-label="Unread" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
