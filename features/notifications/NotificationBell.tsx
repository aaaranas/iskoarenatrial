"use client";

// ─── NotificationBell ────────────────────────────────────────────────────────
// Bell icon + unread badge + the panel toggle. Drop-in replacement for any
// static <Bell /> button in the app. Self-contained: holds its own open
// state and anchor rect, reads counts from the shared NotificationProvider.

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import { NotificationPanel } from "./NotificationPanel";

interface Props {
  className?: string;  // Optional override so this matches whatever toolbar it sits in
}

export function NotificationBell({ className }: Props) {
  const { unreadCount } = useNotifications();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const handleToggle = () => {
    // Capture position on the way OPEN so the panel anchors correctly even
    // after a scroll. Don't recapture on close — panel is already unmounting.
    if (!open && buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className={className ?? "relative h-auto w-auto p-0 hover:bg-transparent text-zinc-400 hover:text-white transition-colors"}
        style={{ color: "hsl(var(--topbar-text))" }}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          // Pill badge in upper-right of the bell — clamped to "9+" so it never overflows
          <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-[#A91D3A] text-[9px] font-bold text-white leading-none flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel is only mounted when open — keeps the DOM tidy and avoids hidden listeners */}
      {open && <NotificationPanel onClose={() => setOpen(false)} anchorRect={anchorRect} />}
    </>
  );
}
