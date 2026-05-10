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
  { id: 3, sport: "MLBB",       home: "CSS Stallions",   away: "CCAD Phoenix", homeScore: 4,    awayScore: 2,    status: "LIVE",     statusType: "live",     venue: "Online",   time: "Game 7",  cat: "Esports",     homeCo: "CSS",  awayCo: "CCAD", img: null                     },
  { id: 4, sport: "Chess",      home: "COS Scions",   away: "SOM Tycoons", homeScore: null, awayScore: null, status: "4:30 PM", statusType: "upcoming", venue: "Room 101", time: "4:30 PM", cat: "Mind",        homeCo: "COS",  awayCo: "SOM",  img: null                     },
  { id: 5, sport: "Badminton",  home: "CSS Stallions", away: "COS Scions", homeScore: null, awayScore: null, status: "5:00 PM", statusType: "upcoming", venue: "Gym C",    time: "5:00 PM", cat: "Traditional", homeCo: "CSS",  awayCo: "COS",  img: "/iskolarobadminton.jpg" },
  { id: 6, sport: "Valorant",   home: "SOM Tycoons", away: "COS Scions",   homeScore: null, awayScore: null, status: "6:00 PM", statusType: "upcoming", venue: "Online",   time: "6:00 PM", cat: "Esports",     homeCo: "SOM",  awayCo: "COS",  img: null                     },
];

// ---------------------------------------------------------------------------
// STANDINGS (Standings table with sport tabs)
// ---------------------------------------------------------------------------
// Mock W-L-PCT-GB rows per sport. Object keyed by sport name so the section
// can render tabs from Object.keys(STANDINGS) and switch active rows.
export interface StandingsRow {
  code: CollegeCode;
  w: number;
  l: number;
  pct: string;     // pre-formatted (".800") so the display is mock-stable
  gb: string;      // games-behind ("—" for the leader)
}

// TODO real-data hook: compute from trpc.match.getAll grouped by sport,
// summing W/L per team. PCT = w / (w+l). GB = (leader.w - own.w + own.l - leader.l) / 2.
export const STANDINGS: Record<string, StandingsRow[]> = {
  Basketball: [
    { code: "CSS",  w: 4, l: 1, pct: ".800", gb: "—"   },
    { code: "COS",  w: 3, l: 2, pct: ".600", gb: "1.0" },
    { code: "CCAD", w: 2, l: 3, pct: ".400", gb: "2.0" },
    { code: "SOM",  w: 1, l: 4, pct: ".200", gb: "3.0" },
  ],
  Volleyball: [
    { code: "CCAD", w: 5, l: 0, pct: "1.000", gb: "—"   },
    { code: "SOM",  w: 3, l: 2, pct: ".600",  gb: "2.0" },
    { code: "CSS",  w: 2, l: 3, pct: ".400",  gb: "3.0" },
    { code: "COS",  w: 0, l: 5, pct: ".000",  gb: "5.0" },
  ],
  MLBB: [
    { code: "CSS",  w: 6, l: 1, pct: ".857", gb: "—"   },
    { code: "CCAD", w: 5, l: 2, pct: ".714", gb: "1.0" },
    { code: "SOM",  w: 2, l: 5, pct: ".286", gb: "4.0" },
    { code: "COS",  w: 1, l: 6, pct: ".143", gb: "5.0" },
  ],
  Chess: [
    { code: "COS",  w: 4, l: 0, pct: "1.000", gb: "—"   },
    { code: "SOM",  w: 3, l: 1, pct: ".750",  gb: "1.0" },
    { code: "CSS",  w: 1, l: 3, pct: ".250",  gb: "3.0" },
    { code: "CCAD", w: 0, l: 4, pct: ".000",  gb: "4.0" },
  ],
};

// ---------------------------------------------------------------------------
// PLAYER (Isko of the Week — Spotlight section)
// ---------------------------------------------------------------------------
// Single featured player, rotated weekly by the editorial team.
export interface FeaturedPlayer {
  name: string;
  nickname: string;
  college: CollegeCode;
  collegeFull: string;
  sport: string;
  number: number;
  year: string;
  stats: Record<string, number | string>;  // small per-sport stat block (4-6 entries)
  quote: string;
  awards: string[];
  photo: string;  // path under /public — uses dev-team headshots as placeholders
}

// TODO real-data hook: needs a featured_players or weekly_spotlight table in
// Supabase. For v1, edited manually here. Photo is a dev-team headshot
// placeholder (jonel.jpg) until real player photography arrives.
export const PLAYER: FeaturedPlayer = {
  name: "Marco Reyes",
  nickname: "Laser",
  college: "CSS",
  collegeFull: "College of Social Sciences",
  sport: "Basketball",
  number: 23,
  year: "3rd Year · BS Psychology",
  stats: { PPG: 22.4, RPG: 8.1, APG: 5.3, STL: 2.1 },
  quote: "Every game I play is for my college, my blockmates, my Isko family.",
  awards: ["Top Scorer · Apr 20", "Player of the Week · Apr 13", "Most Assists · Apr 6"],
  photo: "/jonel.jpg",
};

// ---------------------------------------------------------------------------
// NEWS (News masonry section)
// ---------------------------------------------------------------------------
export interface NewsArticle {
  id: number;
  tag: string;       // matches a key in NEWS_TAG_COLORS
  title: string;
  author: string;
  date: string;
  read: string;      // e.g. "3 min"
  img: string | null;
}

// Per-tag accent color used for the tag pill + the "no image" placeholder.
// Most tags map to college brand colors; Feature uses gold; Frisbee gets pink.
export const NEWS_TAG_COLORS: Record<string, string> = {
  Basketball: "#3B82F6",
  Esports:    "#A78BFA",
  Volleyball: "#10B981",
  Feature:    "#D4AF37",
  Frisbee:    "#F472B6",
};

// TODO real-data hook: ingest from a CMS or a `news` table in Supabase.
// Mock content kept in line with the design's Apr 2026 dating.
export const NEWS: NewsArticle[] = [
  { id: 1, tag: "Basketball", title: "CSS Stallions Dominate Finals Opener with Clutch Fourth Quarter Run",  author: "IskoArena Staff", date: "Apr 26", read: "3 min", img: "/iskolarobaseball.jpg" },
  { id: 2, tag: "Esports",    title: "CCAD Digital Secures MLBB Championship with Flawless Series Sweep",   author: "Isko Media",      date: "Apr 25", read: "4 min", img: null },
  { id: 3, tag: "Volleyball", title: "COS Scions End Three-Game Skid with Emphatic 3–0 Straight-Set Win",   author: "IskoArena Staff", date: "Apr 25", read: "2 min", img: "/iskolarovolley2.jpg" },
  { id: 4, tag: "Feature",    title: "Inside IskoArena: Meet the Student Team Behind UP Cebu's Sports Hub", author: "Isko Media",      date: "Apr 24", read: "6 min", img: null },
  { id: 5, tag: "Frisbee",    title: "CCAD Goes for Back-to-Back Crown as Frisbee Season Officially Opens", author: "IskoArena Staff", date: "Apr 23", read: "3 min", img: "/iskolarofrisbee.jpg" },
];

// ---------------------------------------------------------------------------
// SPORTS (Sports categories grid)
// ---------------------------------------------------------------------------
export type SportStatus = "ongoing" | "upcoming";
export type SportGroup = "Traditional" | "Esports" | "Mind & Culture";

export interface SportItem {
  name: string;
  cat: SportGroup;
  icon: string;       // emoji or single-glyph fallback (design uses emojis)
  status: SportStatus;
}

// ---------------------------------------------------------------------------
// TEAM (editorial team grid)
// ---------------------------------------------------------------------------
// The 5 students who built and run IskoArena. Roles are public-facing and
// reflect Dominique's chosen mapping (2026-04-26): Ako=Team Leader,
// Andre/Jonel/Rex=Frontend, Dom=Backend. This differs from internal real
// roles — Dom is internally a UI/UX Designer doing full-stack work — but the
// public team page displays the role each member self-identifies with.
export interface TeamMember {
  name: string;
  role: string;
  photo: string;  // path under /public — dev-team headshots already in repo
}

export const TEAM: TeamMember[] = [
  { name: "Ako",    role: "Team Leader", photo: "/ako.jpg"   },
  { name: "Andre",  role: "Frontend",    photo: "/andre.jpg" },
  { name: "Jonel",  role: "Frontend",    photo: "/jonel.jpg" },
  { name: "Rex",    role: "Frontend",    photo: "/rex.jpg"   },
  { name: "Dom",    role: "Backend",     photo: "/dom.jpg"   },
];

// TODO real-data hook: trpc.sport.getAll returns 24 sports already (seeded).
// Could merge real names with this static `cat` + `icon` + `status` map.
export const SPORTS: SportItem[] = [
  { name: "Basketball",        cat: "Traditional",    icon: "🏀", status: "ongoing"  },
  { name: "Volleyball",        cat: "Traditional",    icon: "🏐", status: "ongoing"  },
  { name: "Badminton",         cat: "Traditional",    icon: "🏸", status: "ongoing"  },
  { name: "Table Tennis",      cat: "Traditional",    icon: "🏓", status: "upcoming" },
  { name: "Soccer",            cat: "Traditional",    icon: "⚽", status: "upcoming" },
  { name: "Softball",          cat: "Traditional",    icon: "🥎", status: "upcoming" },
  { name: "Pickleball",        cat: "Traditional",    icon: "🎾", status: "upcoming" },
  { name: "Petanque",          cat: "Traditional",    icon: "⚙️", status: "upcoming" },
  { name: "Frisbee",           cat: "Traditional",    icon: "🥏", status: "ongoing"  },
  { name: "MLBB",              cat: "Esports",        icon: "⚔️", status: "ongoing"  },
  { name: "CODM",              cat: "Esports",        icon: "🎯", status: "ongoing"  },
  { name: "Valorant",          cat: "Esports",        icon: "◈",  status: "upcoming" },
  { name: "Dota 2",            cat: "Esports",        icon: "🔮", status: "upcoming" },
  { name: "Chess",             cat: "Mind & Culture", icon: "♟️", status: "ongoing"  },
  { name: "Scrabble",          cat: "Mind & Culture", icon: "🔤", status: "upcoming" },
  { name: "Sudoku",            cat: "Mind & Culture", icon: "#",  status: "upcoming" },
  { name: "Tetris",            cat: "Mind & Culture", icon: "▦",  status: "upcoming" },
  { name: "Rubik's Cube",      cat: "Mind & Culture", icon: "⬛", status: "upcoming" },
  { name: "Blockblast",        cat: "Mind & Culture", icon: "💥", status: "upcoming" },
  { name: "Cosplay",           cat: "Mind & Culture", icon: "🎭", status: "upcoming" },
  { name: "Dancesport",        cat: "Mind & Culture", icon: "💃", status: "ongoing"  },
  { name: "Cheerdance",        cat: "Mind & Culture", icon: "📣", status: "upcoming" },
  { name: "Mr. & Ms. Fitness", cat: "Mind & Culture", icon: "🏋", status: "upcoming" },
  { name: "Pinoy Games",       cat: "Mind & Culture", icon: "🪅", status: "upcoming" },
];
