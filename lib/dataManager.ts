import type { AppData, Match, Player, Stat, Team, Result, MediaItem } from "@/types";

// ============================================
// Data Manager
// ============================================
const DEFAULT_DATA: AppData = {
  matches:  [],
  teams:    [],
  players:  [],
  stats:    [],
  results:  [],
  media:    [],
};

const MOCK_TEAMS: Team[] = [
  { id: "1", name: "COS Scions",    org: "COS",  shortName: "COS",  primarySport: "Basketball Men",   createdAt: new Date().toISOString() },
  { id: "2", name: "SOM Tycoons",   org: "SOM",  shortName: "SOM",  primarySport: "Basketball Men",   createdAt: new Date().toISOString() },
  { id: "3", name: "CSS Stallions", org: "CSS",  shortName: "CSS",  primarySport: "Volleyball Women", createdAt: new Date().toISOString() },
  { id: "4", name: "CCAD Phoenix",  org: "CCAD", shortName: "CCAD", primarySport: "Volleyball Women", createdAt: new Date().toISOString() },
];

const MOCK_PLAYERS: Player[] = [
  { id: "1", teamId: "1", name: "Juan Santos",  college: "COS Scions",    sport: "Basketball Men",   position: "Point Guard",   jersey: 7,  studentId: "2024-001234", verificationStatus: "verified", verifiedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "2", teamId: "2", name: "Maria Garcia", college: "COS Scions",    sport: "Basketball Men",   position: "Small Forward", jersey: 10, studentId: "2024-001235", verificationStatus: "unverified", createdAt: new Date().toISOString() },
  { id: "3", teamId: "3", name: "Carlos Reyes", college: "SOM Tycoons",   sport: "Basketball Men",   position: "Center",        jersey: 5,  studentId: "2024-001236", verificationStatus: "verified", verifiedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "4", teamId: "4", name: "Ana Cruz",     college: "CSS Stallions",  sport: "Volleyball Women", position: "Setter",        jersey: 3,  studentId: "2024-001237", verificationStatus: "rejected", createdAt: new Date().toISOString() },
];

export const DataManager = {
  initializeData(): void {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("iskoarenaData")) {
      const data: AppData = { ...DEFAULT_DATA, teams: MOCK_TEAMS, players: MOCK_PLAYERS };
      localStorage.setItem("iskoarenaData", JSON.stringify(data));
    }
  },

  getData(): AppData {
    if (typeof window === "undefined") return { ...DEFAULT_DATA };
    return JSON.parse(localStorage.getItem("iskoarenaData") || JSON.stringify(DEFAULT_DATA));
  },

  saveData(data: AppData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("iskoarenaData", JSON.stringify(data));
  },

  get<K extends keyof AppData>(type: K): AppData[K] {
    return this.getData()[type];
  },

  add<T extends { id?: string; createdAt?: string }>(
    type: keyof AppData,
    item: Omit<T, "id" | "createdAt">
  ): T & { id: string; createdAt: string } {
    const data = this.getData();
    const newItem = {
      ...item,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    } as T & { id: string; createdAt: string };
    (data[type] as unknown[]).push(newItem);
    this.saveData(data);
    return newItem;
  },

  delete<K extends keyof AppData>(type: K, id: string): void {
    const data = this.getData();
    const arr = data[type] as unknown as { id: unknown }[];
    data[type] = arr.filter((item) => String(item.id) !== id) as unknown as AppData[K];
    this.saveData(data);
  },

  update<K extends keyof AppData>(
    type: K,
    id: string,
    updatedItem: Partial<AppData[K][number]>
  ): void {
    const data = this.getData();
    const arr  = data[type] as AppData[K];
    const index = (arr as unknown as { id: unknown }[]).findIndex((item) => String(item.id) === id);
    if (index !== -1) {
      (arr as any)[index] = { ...(arr as any)[index], ...updatedItem };
      this.saveData(data);
    }
  },
};

// ============================================
// Constants
// ============================================
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