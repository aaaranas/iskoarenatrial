// Dashboard V2 — types, mock data, and the tRPC → V2 match adapter.
//
// Live data sources:
//   - matches:   trpc.match.getAll       (wired via toV2Match)
//   - standings: trpc.match.getStandings (consumed by StandingsWidget)
//
// Static fallbacks (no backend yet):
//   - NEWS:   headlines feed (until a news router exists)
//   - PLAYER: top-performer spotlight (until player-of-the-week feature lands)

import { formatMatchTime } from "@/lib/format-match-date";

// ── College codes ────────────────────────────────────────────────────────────
// teams.org is the canonical college code per project memory.
export type CollegeCode = "COS" | "CSS" | "CCAD" | "SOM";

const VALID_CODES: readonly CollegeCode[] = ["COS", "CSS", "CCAD", "SOM"];

/** Narrows an unknown string to CollegeCode | null. */
export function toCollegeCode(s: string | null | undefined): CollegeCode | null {
  if (!s) return null;
  const upper = s.toUpperCase() as CollegeCode;
  return VALID_CODES.includes(upper) ? upper : null;
}

// Public paths — files live in /public/colleges/*.jpg
export const COLLEGE_LOGOS: Record<CollegeCode, string> = {
  COS: "/colleges/cos_logo.jpg",
  CSS: "/colleges/css_logo.jpg",
  CCAD: "/colleges/ccad_logo.jpg",
  SOM: "/colleges/som_logo.jpg",
};

// Inline-style fallback values (Tailwind `college-*` tokens are preferred when possible).
export const COLLEGE_COLORS: Record<CollegeCode, string> = {
  COS: "#3B82F6",
  CSS: "#10B981",
  CCAD: "#A78BFA",
  SOM: "#F59E0B",
};

// ── V2 match shape (consumed by Hero, ScoreboardRow, Ticker) ────────────────
export type StatusType = "live" | "upcoming" | "completed" | "final";

export type V2Match = {
  id: string;
  sport: string;        // 'Basketball', 'Volleyball', ...
  home: string;         // 'CSS Maroons'
  away: string;         // 'COS Scions'
  homeScore: number | null;
  awayScore: number | null;
  status: string;       // 'LIVE' | '4:30 PM' | 'FINAL'
  statusType: StatusType;
  venue: string;
  time: string;         // 'Q3 8:42' | '4:30 PM'
  rawDate: string | null;   // ISO string from DB — used for date-based filtering
  homeCo: CollegeCode | null;
  awayCo: CollegeCode | null;
  img: string | null;   // hero background photo (sport-derived)
};

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Returns true if rawDate (ISO string) falls on the same calendar day as refDate (local). */
export function isSameCalendarDay(rawDate: string | null, refDate: Date): boolean {
  if (!rawDate) return false;
  const d = new Date(rawDate);
  return (
    d.getFullYear() === refDate.getFullYear() &&
    d.getMonth()    === refDate.getMonth()    &&
    d.getDate()     === refDate.getDate()
  );
}

/** Returns true if rawDate falls on today (local calendar day). */
export function isToday(rawDate: string | null): boolean {
  return isSameCalendarDay(rawDate, new Date());
}

/** Returns true if rawDate falls on tomorrow (local calendar day). */
export function isTomorrow(rawDate: string | null): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameCalendarDay(rawDate, tomorrow);
}

// Sport → hero photo. Falls back to baseball shot for sports without a stock photo.
// All images live in /public/*.
const SPORT_PHOTOS: Record<string, string> = {
  basketball: "/iskolarobaseball.jpg",   // re-used: cinematic crowd shot
  volleyball: "/iskolarovolley.jpg",
  badminton:  "/iskolarobadminton.jpg",
  frisbee:    "/iskolarofrisbee.jpg",
  soccer:     "/iskolarosocer.jpg",
  football:   "/iskolarosocer.jpg",
};

function pickSportPhoto(sport: string): string | null {
  return SPORT_PHOTOS[sport.toLowerCase()] ?? null;
}

// Shape returned by trpc.match.getAll. Kept loose because we pull only what we need.
// `time` is no longer on the server response (O8 — locale leaks) — derived from rawDate.
type TrpcMatch = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamOrg: string | null;
  awayTeamOrg: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  statusType: string;
  venue: string;
  rawDate: string | null;
};

/** Adapts a tRPC match record into the V2 broadcast shape, preserving rawDate for date-filtering. */
export function toV2Match(m: TrpcMatch): V2Match {
  // Normalize status to one of the V2 buckets. tRPC may return mixed casing.
  const lower = (m.statusType || m.status || "").toLowerCase();
  const statusType: StatusType =
    lower === "live" ? "live" :
    lower === "completed" || lower === "final" || lower === "finished" ? "completed" :
    "upcoming";

  // Format the wall-clock string client-side from the ISO rawDate so the user's
  // locale drives the output (was server-formatted previously — locale could leak).
  const time = formatMatchTime(m.rawDate);

  // Live matches show their clock; upcoming show wall time; completed show 'FINAL'.
  const statusLabel =
    statusType === "live" ? "LIVE" :
    statusType === "completed" ? "FINAL" :
    time || "TBD";

  return {
    id: m.id,
    sport: m.league || "Unknown",
    home: m.homeTeam,
    away: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: statusLabel,
    statusType,
    venue: m.venue,
    time,
    homeCo: toCollegeCode(m.homeTeamOrg),
    rawDate: m.rawDate,
    awayCo: toCollegeCode(m.awayTeamOrg),
    img: pickSportPhoto(m.league || ""),
  };
}

// ── Ticker items ────────────────────────────────────────────────────────────
export type TickerItem = { sport: string; match: string; status: string };

/** Builds a compact ticker item from a V2Match (used when match feed is non-empty). */
export function matchToTickerItem(m: V2Match): TickerItem {
  const scoreOrVs =
    m.homeScore != null && m.awayScore != null
      ? `${m.homeCo ?? m.home} ${m.homeScore} – ${m.awayScore} ${m.awayCo ?? m.away}`
      : `${m.homeCo ?? m.home} vs ${m.awayCo ?? m.away}`;
  return {
    sport: m.sport,
    match: scoreOrVs,
    status: m.statusType === "live" ? "LIVE" : m.time || "TBD",
  };
}

// ── News (static mock — no news router yet) ─────────────────────────────────
export type NewsItem = {
  id: number;
  tag: string;
  title: string;
  date: string;
  read: string;
  img: string | null;
};

export const NEWS: NewsItem[] = [
  { id: 1, tag: "Basketball", title: "CSS Maroons Dominate Finals Opener with Clutch Fourth Quarter Run", date: "Apr 26", read: "3 min", img: "/iskolarobaseball.jpg" },
  { id: 2, tag: "Esports",    title: "CCAD Digital Secures MLBB Championship with Flawless Series Sweep", date: "Apr 25", read: "4 min", img: null },
  { id: 3, tag: "Volleyball", title: "COS Scions End Three-Game Skid with Emphatic 3–0 Straight-Set Win", date: "Apr 25", read: "2 min", img: "/iskolarovolley2.jpg" },
];

// ── Top performer (static mock — no player-of-the-week feature yet) ─────────
export const PLAYER = {
  firstName: 'MARCO "LASER"',
  lastName: "REYES",
  photo: "/jonel.jpg",      // placeholder headshot from team folder
  stats: { PPG: 22.4, RPG: 8.1, APG: 5.3, STL: 2.1 },
};

