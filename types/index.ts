import { Database } from "./supabase";

// --- Helper Types from Supabase ---
export type DbRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type AdminRole = Database['public']['Enums']['admin_role'];

export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
  fullName: string;
  collegeAffiliation?: string | null;
  createdAt: string;
}

export interface College {
  name: string;
  established: string;
  activeTeams: number;
  sports: string[];
  status: "Active" | "Pending" | "Inactive";
}

export interface Match {
  id: string;
  league: string; // Sport name
  status: string; // e.g., "UPCOMING", "LIVE", "CONCLUDED"
  statusType: "live" | "upcoming" | "completed";
  // rawDate is the unformatted ISO string from match.match_date — used by
  // client code for locale-independent comparisons (e.g. "is this today?").
  // date/time below are the formatted display strings.
  rawDate: string | null;
  date: string;
  time: string;
  homeTeam: string;
  homeTeamId: string | null;
  homeTeamOrg: string;
  awayTeam: string;
  awayTeamId: string | null;
  awayTeamOrg: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;   // Venue name (display)
  venueId: string | null; // Venue UUID — used by EditMatchModal to pre-select
  // Match category (Postgres enum `match_category`) — one of the 7 values in
  // CATEGORIES (lib/constants.ts) or null for sports without a categorical
  // division (Frisbee, Soccer, Chess, Esports, etc.).
  category: string | null;
  isOwner?: boolean; // UI logic: true if created_by === current_user.id
  // Free-form admin-editable notes shown in the Match Details drawer.
  // Persisted on the matches.notes column; null/empty when not yet written.
  notes: string | null;
}

export interface MatchUI {
  id: string;
  league: string;
  homeTeam: string;
  homeTeamShort: string;
  awayTeam: string;
  awayTeamShort: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "LIVE" | "FT" | "UPCOMING";
  time: string;
}

export interface Result {
  id: string;
  winnerId: string | null;
  matchId: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winner: string;
  sport: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  college: string;
  sport: string;
  position: string;
  jersey: number;
  photo?: string | null;
  studentId: string;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  verifiedAt?: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  org: string;
  name: string;
  shortName: string;
  primarySport: string;
  logoUrl?: string | null;
  createdAt: string;
}

export interface Stat {
  id: string;
  type: "Player" | "Team";
  sport: string;
  college: string;
  playerId: string | null;
  statName: string;
  statValue: string | number;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  fileName: string;
  matchId: string | null;
  sport: string;
  size: string;
  createdAt: string;
}

export interface AppData {
  matches:  Match[];
  teams:    Team[];
  players:  Player[];
  stats:    Stat[];
  results:  Result[];
  media:    MediaItem[];
}

export type PageName =
  | "dashboard"
  | "matches"
  | "results"
  | "stats"
  | "media"
  | "teams";