// Dashboard V2 — types, static mock data, and the tRPC → V2 match adapter.
//
// Live data sources:
//   - matches: trpc.match.getAll  (wired via toV2Match below)
//
// Static fallbacks (no backend yet — TM3/TM5 own these):
//   - STANDINGS: per-sport win/loss table
//   - NEWS: headlines feed
//   - PLAYER: top-performer spotlight subject
//   - TICKER_FALLBACK: BottomLine items when match feed is empty

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
  time: string;
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

  // Live matches show their clock; upcoming show wall time; completed show 'FINAL'.
  const statusLabel =
    statusType === "live" ? "LIVE" :
    statusType === "completed" ? "FINAL" :
    m.time || "TBD";

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
    time: m.time,
    homeCo: toCollegeCode(m.homeTeamOrg),
    rawDate: m.rawDate,
    awayCo: toCollegeCode(m.awayTeamOrg),
    img: pickSportPhoto(m.league || ""),
  };
}

// ── Ticker items (used when live matches list is empty) ─────────────────────
export type TickerItem = { sport: string; match: string; status: string };

export const TICKER_FALLBACK: TickerItem[] = [
  { sport: "Basketball", match: "CSS 67 – 54 COS", status: "LIVE" },
  { sport: "Volleyball", match: "CCAD 2 – 1 SOM", status: "LIVE" },
  { sport: "MLBB", match: "CSS 4 – 2 CCAD", status: "LIVE" },
  { sport: "Chess", match: "COS vs SOM", status: "4:30 PM" },
  { sport: "Badminton", match: "CSS vs COS", status: "5:00 PM" },
  { sport: "Valorant", match: "SOM vs COS", status: "6:00 PM" },
];

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

// ── Standings (static mock — replace once stats router exists) ──────────────
export type StandingsRow = { code: CollegeCode; w: number; l: number; pct: string; gb: string };
export type StandingsSport = "Basketball" | "Volleyball" | "MLBB" | "Chess";

export const STANDINGS: Record<StandingsSport, StandingsRow[]> = {
  Basketball: [
    { code: "CSS",  w: 4, l: 1, pct: ".800",  gb: "—" },
    { code: "COS",  w: 3, l: 2, pct: ".600",  gb: "1.0" },
    { code: "CCAD", w: 2, l: 3, pct: ".400",  gb: "2.0" },
    { code: "SOM",  w: 1, l: 4, pct: ".200",  gb: "3.0" },
  ],
  Volleyball: [
    { code: "CCAD", w: 5, l: 0, pct: "1.000", gb: "—" },
    { code: "SOM",  w: 3, l: 2, pct: ".600",  gb: "2.0" },
    { code: "CSS",  w: 2, l: 3, pct: ".400",  gb: "3.0" },
    { code: "COS",  w: 0, l: 5, pct: ".000",  gb: "5.0" },
  ],
  MLBB: [
    { code: "CSS",  w: 6, l: 1, pct: ".857",  gb: "—" },
    { code: "CCAD", w: 5, l: 2, pct: ".714",  gb: "1.0" },
    { code: "SOM",  w: 2, l: 5, pct: ".286",  gb: "4.0" },
    { code: "COS",  w: 1, l: 6, pct: ".143",  gb: "5.0" },
  ],
  Chess: [
    { code: "COS",  w: 4, l: 0, pct: "1.000", gb: "—" },
    { code: "SOM",  w: 3, l: 1, pct: ".750",  gb: "1.0" },
    { code: "CSS",  w: 1, l: 3, pct: ".250",  gb: "3.0" },
    { code: "CCAD", w: 0, l: 4, pct: ".000",  gb: "4.0" },
  ],
};

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

// ── Hero live-stat-tracker values (static — no box-score feed yet) ──────────
// 4 rows shown next to the scorebug. Wire to live data when stats table exists.
export const HERO_STATS: { label: string; home: number; away: number; invert?: boolean }[] = [
  { label: "FIELD GOAL %", home: 48, away: 39 },
  { label: "REBOUNDS",     home: 32, away: 28 },
  { label: "ASSISTS",      home: 14, away: 10 },
  { label: "TURNOVERS",    home: 8,  away: 12, invert: true },
];
