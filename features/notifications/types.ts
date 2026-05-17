// ─── Notification types ──────────────────────────────────────────────────────
// The kinds of match events the realtime subscription emits as toasts/panel entries.

export type NotificationType = "new_match" | "match_live" | "match_finished";

export interface AppNotification {
  id: string;            // Unique id (UUID where available, fallback random)
  type: NotificationType;
  title: string;         // One-line headline shown in panel + toast
  body: string;          // Detail line shown under the title
  timestamp: Date;       // When the notification was generated (client-side)
  read: boolean;         // Toggled true on click or "mark all read"
  matchId?: string;      // Source matches.id — optional for future deep-linking
}
