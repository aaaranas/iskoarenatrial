// Domain constants for IskoArena.
//
// SOURCE-OF-TRUTH NOTES
//   • Sports list — the `sports` table in Supabase is the canonical source.
//     Query via trpc.sport.getAll. Do NOT hardcode the sports list here.
//   • Categories — fixed enum that also lives in Postgres (`match_category`).
//     The values below MUST match the DB enum exactly.
//   • Category-per-sport mapping — kept here in code per design decision so
//     the Add/Edit match forms can filter the category dropdown by sport
//     without an extra DB roundtrip. When a sport is missing from
//     CATEGORIES_BY_SPORT the form skips the dropdown and category stays NULL.

// ─── Category enum (mirror of Postgres match_category) ─────────────────────
// IMPORTANT: keep the array order matching the DB enum declaration. If you
// add/rename a value, run the SQL migration AND update this array in the same PR.
export const CATEGORIES = [
  "Men",
  "Women",
  "Men Singles",
  "Men Doubles",
  "Women Singles",
  "Women Doubles",
  "Mixed Doubles",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ─── Category-per-sport mapping ────────────────────────────────────────────
// Sports NOT listed here are inherently mixed-or-open (Frisbee, Soccer, Chess,
// Esports, etc.) — their matches have category = NULL and the admin form
// hides the category dropdown for them.
//
// Sport names MUST match the canonical DB sports.name values exactly.
// Verified against `SELECT name FROM sports ORDER BY name` on 2026-05-20.
export const CATEGORIES_BY_SPORT: Record<string, readonly Category[]> = {
  // Team sports — Men/Women divisions
  Basketball: ["Men", "Women"],
  Volleyball: ["Men", "Women"],

  // Racquet sports — 4 gendered singles/doubles + Mixed Doubles (no Mixed Singles)
  Badminton:      ["Men Singles", "Men Doubles", "Women Singles", "Women Doubles", "Mixed Doubles"],
  "Table Tennis": ["Men Singles", "Men Doubles", "Women Singles", "Women Doubles", "Mixed Doubles"],
  Pickleball:     ["Men Singles", "Men Doubles", "Women Singles", "Women Doubles", "Mixed Doubles"],

  // Contest — Mr. (Men) and Ms. (Women) divisions
  "Mr. & Ms. Fitness": ["Men", "Women"],
};

/** Helper: returns the categories for a sport, or an empty array if none. */
export function categoriesForSport(sportName: string | null | undefined): readonly Category[] {
  if (!sportName) return [];
  return CATEGORIES_BY_SPORT[sportName] ?? [];
}

// ─── Colleges (display-only constants — DB stores `teams.org` as canonical) ──
export const COLLEGE_ORGS = ["COS", "CCAD", "CSS", "SOM"] as const;
export type CollegeOrg = (typeof COLLEGE_ORGS)[number];

// Full college display names — mirrors the seeded teams.college values.
export const COLLEGES = [
  "COS Scions",
  "SOM Tycoons",
  "CSS Stallions",
  "CCAD Phoenix",
] as const;

// Select-compatible team options for form dropdowns.
export const TEAM_OPTIONS = [
  { value: "COS Scions",    label: "COS Scions"    },
  { value: "SOM Tycoons",   label: "SOM Tycoons"   },
  { value: "CSS Stallions", label: "CSS Stallions" },
  { value: "CCAD Phoenix",  label: "CCAD Phoenix"  },
] as const;

// ─── Player positions keyed by canonical DB sport name ─────────────────────
// Used by player registration forms. Keys MUST match sports.name exactly —
// query the DB if you're unsure. Sports without distinct positions get a
// single "Player" / "Participant" entry rather than an empty list so the
// dropdown still renders something selectable.
export const POSITIONS_BY_SPORT: Record<string, readonly string[]> = {
  Badminton:           ["Singles", "Doubles"],
  Basketball:          ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  "Block Blast":       ["Player"],
  Cheerdance:          ["Base", "Flyer", "Backspot", "Spotter"],
  Chess:               ["Player"],
  CODM:                ["Assault", "SMG", "Sniper", "Support"],
  Cosplay:             ["Contestant"],
  Dancesports:         ["Leader", "Follower", "Solo"],
  "Dota 2":            ["Carry", "Support", "Offlaner", "Mid", "Roamer"],
  Frisbee:             ["Handler", "Cutter", "Defender"],
  MLBB:                ["Gold Laner", "EXP Laner", "Mid Laner", "Jungler", "Roamer"],
  "Mr. & Ms. Fitness": ["Competitor"],
  Petanque:            ["Player"],
  Pickleball:          ["Singles", "Doubles"],
  "Pinoy Games":       ["Participant"],
  "Rubiks Cube":       ["Competitor"],
  Scrabble:            ["Player"],
  Soccer:              ["Goalkeeper", "Left Back", "Right Back", "Center Back", "Left Midfielder", "Center Midfielder", "Right Midfielder", "Left Wing", "Right Wing", "Striker"],
  Softball:            ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Hitter"],
  Sudoku:              ["Participant"],
  "Table Tennis":      ["Singles", "Doubles"],
  Tetris:              ["Player"],
  Valorant:            ["Duelist", "Initiator", "Controller", "Sentinel"],
  Volleyball:          ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
};
