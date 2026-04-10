import { Database } from "./supabase";

// --- Helper Types from Supabase ---
export type DbRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type AdminRole = Database['public']['Enums']['admin_role'];

export interface Admin {
  id: string; // Changed from number to string (UUID)
  email: string; // Supabase uses email as identifier
  role: AdminRole;
  fullName: string; // Maps to full_name
  collegeAffiliation?: string | null;
  createdAt: string;
}

export interface Match {
  id: string;
  league: string; // Sport name
  status: string; // e.g., "UPCOMING", "LIVE", "CONCLUDED"
  statusType: "live" | "finished" | "upcoming";
  date: string; // Formatted match_date
  time: string; // Formatted match_date
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string; // Venue name
  category?: string; // Match category (e.g., "Intramurals")
  isOwner?: boolean; // UI logic: true if created_by === current_user.id
}

export interface MatchUI {
  id: string; // Changed from number to string (UUID)
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
  id: string; // Changed from number to string (UUID)
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
  id: string; // UUID
  name: string;
  teamId: string;
  college: string;
  sport: string;
  position: string;
  jersey: number; // jersey_number in DB
  photo?: string | null;
  createdAt: string;
}

export interface Team {
  id: string; // UUID
  org: string; // usually 'college' in DB
  name: string;
  shortName: string; // short_name in DB
  primarySport: string;
  logoUrl?: string | null;
  createdAt: string;
}

export interface Stat {
  id: string; // UUID
  type: "Player" | "Team";
  sport: string;
  college: string;
  playerId: string | null; // Changed from number to string (UUID)
  statName: string;
  statValue: string | number;
  createdAt: string;
}

export interface MediaItem {
  id: string; // UUID
  title: string;
  type: "image" | "video";
  url: string; // Maps to 'data' or public URL
  fileName: string;
  matchId: string | null; // Changed from number to string (UUID)
  sport: string;
  size: string;
  createdAt: string;
}

export interface Notification {
  id: string; // UUID
  message: string;
  type: string;
  sport: string;
  timestamp: string;
  createdAt: string;
}

export interface AppData {
  matches: Match[];
  teams: Team[];
  players: Player[];
  stats: Stat[];
  results: Result[];
  media: MediaItem[];
  notifications: Notification[];
}

export type PageName =
  | "dashboard"
  | "matches"
  | "results"
  | "stats"
  | "media"
  | "teams"
  | "notifications"
  | "archives";
