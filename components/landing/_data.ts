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
