export interface Admin {
  id: number;
  username: string;
  password: string;
  fullName: string;
  createdAt: string;
}

export interface Match {
  id: number;
  sport: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  createdAt: string;
}

export interface Result {
  id: number;
  winnerId: string;
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
  id: number;
  createdAt: string;
  name: string;
  teamId: string;
  college: string;
  sport: string;
  position: string;
  jersey: number;
  photo: string | null;
  eligibilityStatus?: "in_review" | "eligible" | "ineligible"; // ← add this
}

export interface Team {
  id: string;
  org: string;
  name: string;
  primarySport: string;
  createdAt: string;
}

export interface Stat {
  id: string;
  type: "Player" | "Team";
  sport: string;
  college: string;
  playerId: number | null;
  statName: string;
  statValue: string | number;
  createdAt: string;
}

export interface MediaItem {
  id: number;
  title: string;
  type: "image" | "video";
  data: string;
  fileName: string;
  matchId: number | null;
  sport: string;
  size: string;
  createdAt: string;
}

export interface Notification {
  id: number;
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

