// Domain constants for IskoArena.
// These are the canonical source of truth for sports, teams, colleges,
// and valid player positions used across the admin dashboard and forms.
// Import from here — never redefine inline in a component.

export const SPORTS = [
  "Badminton",
  "Basketball Men",
  "Basketball Women",
  "Cheerdance",
  "Chess",
  "Dancesports",
  "Esports - Block Blast!",
  "Esports - Cosplay",
  "Esports - Mobile Legends: Bang Bang",
  "Esports - DOTA 2",
  "Esports - Valorant",
  "Esports - Tetris",
  "Frisbee",
  "Pinoy Games",
  "Mr. and Ms. Fitness",
  "Rubik's Cube",
  "Soccer",
  "Scrabble",
  "Softball",
  "Table Tennis",
  "Volleyball Men",
  "Volleyball Women",
  "Petanque",
  "Sudoku",
] as const;

export type Sport = (typeof SPORTS)[number];

// College org codes — canonical identifiers used for filtering and grouping.
// Display names come from the teams table; org codes are stable references.
export const COLLEGE_ORGS = ["COS", "CCAD", "CSS", "SOM"] as const;

export type CollegeOrg = (typeof COLLEGE_ORGS)[number];

// Full college display names — matches teams.college column (display-only).
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
  { value: "CSS Stallions", label: "CSS Stallions"  },
  { value: "CCAD Phoenix",  label: "CCAD Phoenix"   },
] as const;

// Valid positions keyed by sport name.
// Used by player registration and roster management forms.
export const POSITIONS_BY_SPORT: Record<string, readonly string[]> = {
  Badminton:                              ["Singles", "Doubles"],
  Basketball:                             ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  "Basketball Men":                       ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  "Basketball Women":                     ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Cheerdance:                             ["Base", "Flyer", "Backspot", "Spotter"],
  Chess:                                  ["Player"],
  Dancesports:                            ["Leader", "Follower", "Solo"],
  "Esports - Block Blast!":              ["Player"],
  "Esports - Cosplay":                   ["Contestant"],
  "Esports - Mobile Legends: Bang Bang": ["Carry", "Support", "Roamer", "Jungler", "Mid Laner", "Offlaner"],
  "Esports - DOTA 2":                    ["Carry", "Support", "Offlaner", "Mid", "Roamer"],
  "Esports - Valorant":                  ["Duelist", "Initiator", "Controller", "Sentinel"],
  "Esports - Tetris":                    ["Player"],
  Frisbee:                               ["Handler", "Cutter", "Defender"],
  "Pinoy Games":                         ["Participant"],
  "Mr. and Ms. Fitness":                 ["Competitor"],
  "Rubik's Cube":                        ["Competitor"],
  Soccer:                                ["Goalkeeper", "Left Back", "Right Back", "Center Back", "Left Midfielder", "Center Midfielder", "Right Midfielder", "Left Wing", "Right Wing", "Striker"],
  Scrabble:                              ["Player"],
  Softball:                              ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Hitter"],
  "Table Tennis":                        ["Singles", "Doubles"],
  Volleyball:                            ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
  "Volleyball Men":                      ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
  "Volleyball Women":                    ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero"],
  Petanque:                              ["Player"],
  Sudoku:                                ["Participant"],
};
