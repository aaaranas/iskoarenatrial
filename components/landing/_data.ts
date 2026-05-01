// IskoArena landing-page mock data + brand constants.
// Mirrors the design handoff's ia-data.jsx but typed and curated for the project's
// canonical mascot mapping (Scions / Stallions / Phoenix / Tycoons — overrides the
// design's Maroons/Pixels/Bulls per Dominique 2026-04-26).
//
// V1 STATUS: All exports are static mock data. Sections that should eventually
// pull from real Supabase data are marked with TODO comments below. When wiring
// to real data, replace the mock with trpc.<router>.useQuery() in the consumer.

export type CollegeCode = "COS" | "CSS" | "CCAD" | "SOM";

export interface College {
  code: CollegeCode;
  name: string;       // Full official UP Cebu college name (display-only)
  short: string;      // Mascot — used in Hero/CompetingColleges/Rivalry
  points: number;     // Cumulative season points (mock — Phase 5 Rivalry uses this)
  color: string;      // Per-team brand color (matches tailwind.config colors.college.*)
  logo: string;       // Path under /public — already deduped against design assets
}

// The 4 UP Cebu colleges. Mascots: Scions/Stallions/Phoenix/Tycoons (Dominique's mapping).
// TODO Phase wiring: codes + full names should eventually derive from the colleges
// table (when one exists; currently not in Supabase per project memory). Mascots and
// colors stay as a frontend-only static map even when colleges goes to DB — they're
// presentation layer, not domain data.
export const COLLEGES: College[] = [
  { code: "COS",  name: "College of Science",                       short: "Scions",    points: 847, color: "#3B82F6", logo: "/colleges/cos_logo.jpg"  },
  { code: "CSS",  name: "College of Social Sciences",               short: "Stallions", points: 912, color: "#10B981", logo: "/colleges/css_logo.jpg"  },
  { code: "CCAD", name: "College of Communication, Art and Design", short: "Phoenix",   points: 763, color: "#A78BFA", logo: "/colleges/ccad_logo.jpg" },
  { code: "SOM",  name: "School of Management",                     short: "Tycoons",   points: 698, color: "#F59E0B", logo: "/colleges/som_logo.jpg"  },
];

// Convenience lookup maps derived from COLLEGES — used by carousel cards
// (MatchesTodayCard) and any consumer that has a college code in hand and
// needs the brand color or logo path without iterating the full list.
export const COLLEGE_COLORS: Record<CollegeCode, string> = Object.fromEntries(
  COLLEGES.map((c) => [c.code, c.color]),
) as Record<CollegeCode, string>;

export const COLLEGE_LOGOS: Record<CollegeCode, string> = Object.fromEntries(
  COLLEGES.map((c) => [c.code, c.logo]),
) as Record<CollegeCode, string>;

// ---------------------------------------------------------------------------
// SPONSORS
// ---------------------------------------------------------------------------
// Mock sponsor list — typographic placeholders until marketing supplies real
// logos. Tiers drive accent colors in the SponsorLogoCard and the order of
// emphasis in the carousel.
export type SponsorTier = "Host" | "Platinum" | "Gold" | "Esports" | "Silver" | "Partner";

export interface Sponsor {
  name: string;  // Full company name (small caps below the wordmark)
  mono: string;  // Short typographic wordmark (Bebas Neue, large)
  tier: SponsorTier;
}

// TODO real-data hook: swap to a CMS-driven list (Supabase `sponsors` table or
// a JSON file managed by marketing) once approved sponsors arrive.
export const SPONSORS: Sponsor[] = [
  { name: "UP Cebu",       mono: "UPC",      tier: "Host" },
  { name: "Globe Telecom", mono: "GLOBE",    tier: "Platinum" },
  { name: "Smart Sports",  mono: "SMART",    tier: "Platinum" },
  { name: "Jollibee",      mono: "JOLLIBEE", tier: "Gold" },
  { name: "San Miguel",    mono: "SMC",      tier: "Gold" },
  { name: "Cebu Pacific",  mono: "CEB",      tier: "Gold" },
  { name: "Mineski",       mono: "MINESKI",  tier: "Esports" },
  { name: "PLDT Home",     mono: "PLDT",     tier: "Silver" },
  { name: "BPI",           mono: "BPI",      tier: "Silver" },
  { name: "Coca-Cola",     mono: "COKE",     tier: "Silver" },
  { name: "7-Eleven",      mono: "7-11",     tier: "Partner" },
  { name: "Ayala Cebu",    mono: "AYALA",    tier: "Partner" },
];

// ---------------------------------------------------------------------------
// LIVE MATCHES (Matches Today carousel)
// ---------------------------------------------------------------------------
// Mock match feed for the auto-scroll carousel. Mix of LIVE and UPCOMING.
// Each match references its college codes (homeCo/awayCo) so the card can
// render the correct brand color for the team name + the right logo.
export type MatchStatusType = "live" | "upcoming" | "finished";
export type SportCategory = "Traditional" | "Esports" | "Mind";

export interface LiveMatch {
  id: number;
  sport: string;          // Display name in the small "sport tag" pill
  home: string;           // Team display name (e.g. "CSS Maroons")
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;         // Display label — "LIVE", "UPCOMING", or a time string
  statusType: MatchStatusType;
  venue: string;
  time: string;           // Display time — used in the card footer (mono)
  cat: SportCategory;
  homeCo: CollegeCode;
  awayCo: CollegeCode;
  img: string | null;     // Optional sport hero image (mostly unused in v1)
}

// TODO real-data hook: swap with trpc.match.getAll filtered to today + live,
// shaped through a small adapter that maps team names to college codes.
export const LIVE_MATCHES: LiveMatch[] = [
  { id: 1, sport: "Basketball", home: "CSS Stallions", away: "COS Scions",   homeScore: 67,   awayScore: 54,   status: "LIVE",     statusType: "live",     venue: "Gym A",    time: "Q3 8:42", cat: "Traditional", homeCo: "CSS",  awayCo: "COS",  img: "/iskolarobaseball.jpg" },
  { id: 2, sport: "Volleyball", home: "CCAD Phoenix",  away: "SOM Tycoons",  homeScore: 2,    awayScore: 1,    status: "LIVE",     statusType: "live",     venue: "Gym B",    time: "Set 3",   cat: "Traditional", homeCo: "CCAD", awayCo: "SOM",  img: "/iskolarovolley.jpg"   },
  { id: 3, sport: "MLBB",       home: "CSS Esports",   away: "CCAD Digital", homeScore: 4,    awayScore: 2,    status: "LIVE",     statusType: "live",     venue: "Online",   time: "Game 7",  cat: "Esports",     homeCo: "CSS",  awayCo: "CCAD", img: null                     },
  { id: 4, sport: "Chess",      home: "COS Knights",   away: "SOM Tacticians", homeScore: null, awayScore: null, status: "4:30 PM", statusType: "upcoming", venue: "Room 101", time: "4:30 PM", cat: "Mind",        homeCo: "COS",  awayCo: "SOM",  img: null                     },
  { id: 5, sport: "Badminton",  home: "CSS Shuttlers", away: "COS Smashers", homeScore: null, awayScore: null, status: "5:00 PM", statusType: "upcoming", venue: "Gym C",    time: "5:00 PM", cat: "Traditional", homeCo: "CSS",  awayCo: "COS",  img: "/iskolarobadminton.jpg" },
  { id: 6, sport: "Valorant",   home: "SOM Sentinels", away: "COS Gamers",   homeScore: null, awayScore: null, status: "6:00 PM", statusType: "upcoming", venue: "Online",   time: "6:00 PM", cat: "Esports",     homeCo: "SOM",  awayCo: "COS",  img: null                     },
];
