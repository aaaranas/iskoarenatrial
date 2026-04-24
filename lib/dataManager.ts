/**
 * lib/dataManager.ts — Constants & Utilities
 *
 * AuthManager and DataManager (localStorage-based) have been removed.
 * Authentication and data persistence are now handled by Supabase via tRPC.
 *
 * This file retains:
 *  - SPORTS, TEAMS, COLLEGES (used in form dropdowns)
 *  - POSITIONS_BY_SPORT (used in player forms)
 *  - csvEscape / exportCSV (used in export features)
 *  - resizeImageFile (used in media upload)
 */

// ── Sports & Teams ──────────────────────────────────────────────────────────
export const SPORTS = [
  "Badminton", "Basketball Men", "Basketball Women", "Cheerdance", "Chess",
  "Dancesports", "Esports - Block Blast!", "Esports - Cosplay",
  "Esports - Mobile Legends: Bang Bang", "Esports - DOTA 2", "Esports - Valorant",
  "Esports - Tetris", "Frisbee", "Pinoy Games", "Mr. and Ms. Fitness",
  "Rubik's Cube", "Soccer", "Scrabble", "Softball", "Table Tennis",
  "Volleyball Men", "Volleyball Women", "Petanque", "Sudoku",
];

export const TEAMS = [
  { value: "COS Scions",    label: "🎯 COS Scions"   },
  { value: "SOM Tycoons",   label: "💼 SOM Tycoons"  },
  { value: "CSS Stallions", label: "🐴 CSS Stallions" },
  { value: "CCAD Phoenix",  label: "🔥 CCAD Phoenix"  },
];

export const COLLEGES = ["COS Scions", "SOM Tycoons", "CSS Stallions", "CCAD Phoenix"];

export const POSITIONS_BY_SPORT: Record<string, string[]> = {
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

// ── CSV Helpers ─────────────────────────────────────────────────────────────
export function csvEscape(val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportCSV(headers: string[], rows: string[][], filename: string): void {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const blob  = new Blob([lines.join("\n")], { type: "text/csv" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href      = url;
  a.download  = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Image Resize Helper ─────────────────────────────────────────────────────
export function resizeImageFile(
  file: File,
  maxWidth: number,
  callback: (dataUrl: string) => void
): void {
  const img    = new Image();
  const reader = new FileReader();
  reader.onload = (e) => {
    img.onload = () => {
      const ratio  = img.width / img.height;
      const width  = Math.min(maxWidth, img.width);
      const height = Math.round(width / ratio);
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = e.target!.result as string;
  };
  reader.readAsDataURL(file);
}
  "Badminton", "Basketball Men", "Basketball Women", "Cheerdance", "Chess",
  "Dancesports", "Esports - Block Blast!", "Esports - Cosplay",
  "Esports - Mobile Legends: Bang Bang", "Esports - DOTA 2", "Esports - Valorant",
  "Esports - Tetris", "Frisbee", "Pinoy Games", "Mr. and Ms. Fitness",
  "Rubik's Cube", "Soccer", "Scrabble", "Softball", "Table Tennis",
  "Volleyball Men", "Volleyball Women", "Petanque", "Sudoku",
];

export const TEAMS = [
  { value: "COS Scions",    label: "🎯 COS Scions"   },
  { value: "SOM Tycoons",   label: "💼 SOM Tycoons"  },
  { value: "CSS Stallions", label: "🐴 CSS Stallions" },
  { value: "CCAD Phoenix",  label: "🔥 CCAD Phoenix"  },
];

export const COLLEGES = ["COS Scions", "SOM Tycoons", "CSS Stallions", "CCAD Phoenix"];

export const POSITIONS_BY_SPORT: Record<string, string[]> = {
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

// ============================================
// CSV Helpers
// ============================================
export function csvEscape(val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportCSV(headers: string[], rows: string[][], filename: string): void {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const blob  = new Blob([lines.join("\n")], { type: "text/csv" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href      = url;
  a.download  = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============================================
// Image resize helper
// ============================================
export function resizeImageFile(
  file: File,
  maxWidth: number,
  callback: (dataUrl: string) => void
): void {
  const img    = new Image();
  const reader = new FileReader();
  reader.onload = (e) => {
    img.onload = () => {
      const ratio  = img.width / img.height;
      const width  = Math.min(maxWidth, img.width);
      const height = Math.round(width / ratio);
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = e.target!.result as string;
  };
  reader.readAsDataURL(file);
}