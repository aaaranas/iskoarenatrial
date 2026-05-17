// ─── Notification helpers ────────────────────────────────────────────────────
// Build a UI-ready notification from a raw `matches` row delivered by Supabase
// Realtime, and format relative timestamps for the panel.

import { supabase } from "@/lib/supabase/client";
import type { AppNotification, NotificationType } from "./types";

// Maps each event type to its title/body template (label = "TeamA vs TeamB")
const TEMPLATES: Record<NotificationType, (label: string) => { title: string; body: string }> = {
  new_match: (label) => ({
    title: "New Match Scheduled",
    body: `${label} has been added to upcoming matches.`,
  }),
  match_live: (label) => ({
    title: "Match is LIVE",
    body: `${label} has just kicked off!`,
  }),
  match_finished: (label) => ({
    title: "Match Finished",
    body: `${label} has ended.`,
  }),
};

// Generate a collision-resistant id (prefers crypto.randomUUID, falls back for older browsers)
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// The matches row from Realtime only contains team UUIDs (home_team_id / away_team_id),
// not names. Look up both teams in a single query to produce a readable label.
async function fetchTeamLabel(homeId: string | null, awayId: string | null): Promise<string> {
  const ids = [homeId, awayId].filter((v): v is string => typeof v === "string" && v.length > 0);
  if (ids.length === 0) return "Match";

  const { data } = await supabase.from("teams").select("id, name").in("id", ids);
  // Build name lookup from result
  const byId = new Map<string, string>((data ?? []).map(t => [t.id as string, t.name as string]));
  const home = homeId ? byId.get(homeId) ?? "TBD" : "TBD";
  const away = awayId ? byId.get(awayId) ?? "TBD" : "TBD";
  return `${home} vs ${away}`;
}

// Build an AppNotification from a raw matches row. Async because team names
// require a small follow-up query (realtime payload only has FK ids).
export async function buildNotification(
  type: NotificationType,
  row: Record<string, any>,
): Promise<AppNotification> {
  const label = await fetchTeamLabel(row.home_team_id ?? null, row.away_team_id ?? null);
  const { title, body } = TEMPLATES[type](label);

  return {
    id: generateId(),
    type,
    title,
    body,
    timestamp: new Date(),
    read: false,
    matchId: typeof row.id === "string" ? row.id : undefined,
  };
}

// Compact relative time string for the panel list (e.g. "5m ago", "2h ago")
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
