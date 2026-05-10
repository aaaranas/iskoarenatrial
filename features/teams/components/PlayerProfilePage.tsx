"use client";
import React, { useState } from "react";

interface PlayerStats {
  ppg: number;
  apg: number;
  rpg: number;
  ftPct: number;
  fgPct: number;
  threePct: number;
  spg: number;
}

interface RecentMatch {
  date: string;
  opponent: string;
  result: "W" | "L";
  pts: number;
  ast: number;
}

interface Award {
  name: string;
  season: string;
}

interface PlayerDetail {
  name: string;
  sport: string;
  position: string;
  year: string;
  color: string;
  jersey: string;
  college: string;
  gamesPlayed: number;
  stats: PlayerStats;
  ratings: { label: string; value: number }[];
  recentMatches: RecentMatch[];
  awards: Award[];
}

const PLAYER_DETAILS: Record<string, PlayerDetail> = {
  "Marco Reyes": {
    name: "Marco Reyes", sport: "Basketball", position: "Point Guard", year: "3rd Year", color: "#A91D3A",
    jersey: "7", college: "College of Engineering", gamesPlayed: 14,
    stats: { ppg: 18.4, apg: 5.2, rpg: 4.1, ftPct: 87, fgPct: 46, threePct: 38, spg: 1.8 },
    ratings: [
      { label: "Scoring", value: 88 }, { label: "Playmaking", value: 75 },
      { label: "Defense", value: 62 }, { label: "Athleticism", value: 80 }, { label: "IQ", value: 70 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "Arts & Sciences", result: "W", pts: 24, ast: 6 },
      { date: "Apr 10", opponent: "Business School", result: "W", pts: 18, ast: 4 },
      { date: "Apr 6", opponent: "College of Medicine", result: "L", pts: 12, ast: 3 },
    ],
    awards: [
      { name: "MVP — Season 2", season: "Basketball · 2024" },
      { name: "Best PG — Season 1", season: "Basketball · 2023" },
    ],
  },
  "Luis Santos": {
    name: "Luis Santos", sport: "Basketball", position: "Small Forward", year: "2nd Year", color: "#C5A059",
    jersey: "11", college: "College of Engineering", gamesPlayed: 12,
    stats: { ppg: 14.2, apg: 2.8, rpg: 6.3, ftPct: 78, fgPct: 49, threePct: 34, spg: 1.2 },
    ratings: [
      { label: "Scoring", value: 74 }, { label: "Playmaking", value: 55 },
      { label: "Defense", value: 72 }, { label: "Athleticism", value: 85 }, { label: "IQ", value: 66 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "Arts & Sciences", result: "W", pts: 16, ast: 3 },
      { date: "Apr 10", opponent: "Business School", result: "W", pts: 14, ast: 2 },
      { date: "Apr 6", opponent: "College of Medicine", result: "L", pts: 10, ast: 1 },
    ],
    awards: [{ name: "Best Rookie — Season 2", season: "Basketball · 2024" }],
  },
  "Dana Cruz": {
    name: "Dana Cruz", sport: "Esports", position: "Mid Laner", year: "4th Year", color: "#3b82f6",
    jersey: "1", college: "College of Engineering", gamesPlayed: 18,
    stats: { ppg: 8.4, apg: 6.1, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 3.2 },
    ratings: [
      { label: "Mechanics", value: 91 }, { label: "Vision", value: 85 },
      { label: "Teamwork", value: 78 }, { label: "Consistency", value: 88 }, { label: "Clutch", value: 82 },
    ],
    recentMatches: [
      { date: "Apr 15", opponent: "Arts & Sciences", result: "W", pts: 12, ast: 8 },
      { date: "Apr 11", opponent: "Business School", result: "W", pts: 9, ast: 5 },
      { date: "Apr 7", opponent: "College of Medicine", result: "W", pts: 7, ast: 6 },
    ],
    awards: [
      { name: "Best Mid — Season 2", season: "Esports · 2024" },
      { name: "Tournament MVP", season: "Esports · 2023" },
    ],
  },
  "Raf Dizon": {
    name: "Raf Dizon", sport: "Esports", position: "ADC", year: "1st Year", color: "#3b82f6",
    jersey: "2", college: "College of Engineering", gamesPlayed: 10,
    stats: { ppg: 7.1, apg: 2.4, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 2.1 },
    ratings: [
      { label: "Mechanics", value: 80 }, { label: "Vision", value: 68 },
      { label: "Teamwork", value: 72 }, { label: "Consistency", value: 70 }, { label: "Clutch", value: 65 },
    ],
    recentMatches: [
      { date: "Apr 15", opponent: "Arts & Sciences", result: "W", pts: 10, ast: 3 },
      { date: "Apr 11", opponent: "Business School", result: "W", pts: 8, ast: 2 },
      { date: "Apr 7", opponent: "College of Medicine", result: "W", pts: 6, ast: 2 },
    ],
    awards: [],
  },
  "Mia Lim": {
    name: "Mia Lim", sport: "Basketball", position: "Power Forward", year: "3rd Year", color: "#A91D3A",
    jersey: "23", college: "College of Engineering", gamesPlayed: 13,
    stats: { ppg: 12.6, apg: 2.1, rpg: 7.8, ftPct: 72, fgPct: 52, threePct: 28, spg: 0.9 },
    ratings: [
      { label: "Scoring", value: 70 }, { label: "Playmaking", value: 48 },
      { label: "Defense", value: 80 }, { label: "Athleticism", value: 76 }, { label: "IQ", value: 74 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "Arts & Sciences", result: "W", pts: 15, ast: 2 },
      { date: "Apr 10", opponent: "Business School", result: "W", pts: 11, ast: 3 },
      { date: "Apr 6", opponent: "College of Medicine", result: "L", pts: 9, ast: 1 },
    ],
    awards: [{ name: "Best Defender — Season 2", season: "Basketball · 2024" }],
  },
  "Cara Mendoza": {
    name: "Cara Mendoza", sport: "Volleyball", position: "Setter", year: "2nd Year", color: "#8b5cf6",
    jersey: "5", college: "Arts & Sciences", gamesPlayed: 16,
    stats: { ppg: 0, apg: 9.4, rpg: 2.1, ftPct: 0, fgPct: 0, threePct: 0, spg: 1.4 },
    ratings: [
      { label: "Setting", value: 90 }, { label: "Serving", value: 72 },
      { label: "Defense", value: 68 }, { label: "Leadership", value: 85 }, { label: "Consistency", value: 88 },
    ],
    recentMatches: [
      { date: "Apr 13", opponent: "College of Engineering", result: "L", pts: 0, ast: 10 },
      { date: "Apr 9", opponent: "Business School", result: "W", pts: 0, ast: 12 },
      { date: "Apr 5", opponent: "College of Medicine", result: "W", pts: 0, ast: 9 },
    ],
    awards: [{ name: "Best Setter — Season 2", season: "Volleyball · 2024" }],
  },
  "Jana Torres": {
    name: "Jana Torres", sport: "Volleyball", position: "Libero", year: "3rd Year", color: "#8b5cf6",
    jersey: "3", college: "Arts & Sciences", gamesPlayed: 16,
    stats: { ppg: 0, apg: 3.2, rpg: 8.4, ftPct: 0, fgPct: 0, threePct: 0, spg: 2.8 },
    ratings: [
      { label: "Digging", value: 92 }, { label: "Serving", value: 70 },
      { label: "Passing", value: 88 }, { label: "Leadership", value: 74 }, { label: "Consistency", value: 86 },
    ],
    recentMatches: [
      { date: "Apr 13", opponent: "College of Engineering", result: "L", pts: 0, ast: 4 },
      { date: "Apr 9", opponent: "Business School", result: "W", pts: 0, ast: 5 },
      { date: "Apr 5", opponent: "College of Medicine", result: "W", pts: 0, ast: 6 },
    ],
    awards: [{ name: "Best Libero — Season 1", season: "Volleyball · 2023" }],
  },
  "Leo Bautista": {
    name: "Leo Bautista", sport: "Debate", position: "1st Speaker", year: "4th Year", color: "#C5A059",
    jersey: "1", college: "Arts & Sciences", gamesPlayed: 20,
    stats: { ppg: 0, apg: 0, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 0 },
    ratings: [
      { label: "Argumentation", value: 94 }, { label: "Delivery", value: 88 },
      { label: "Research", value: 90 }, { label: "Rebuttal", value: 85 }, { label: "Clarity", value: 92 },
    ],
    recentMatches: [
      { date: "Apr 12", opponent: "College of Engineering", result: "W", pts: 0, ast: 0 },
      { date: "Apr 8", opponent: "Business School", result: "W", pts: 0, ast: 0 },
      { date: "Apr 4", opponent: "College of Medicine", result: "W", pts: 0, ast: 0 },
    ],
    awards: [
      { name: "Best Speaker — Season 2", season: "Debate · 2024" },
      { name: "Champion — Season 1", season: "Debate · 2023" },
    ],
  },
  "Sam Flores": {
    name: "Sam Flores", sport: "Debate", position: "2nd Speaker", year: "2nd Year", color: "#C5A059",
    jersey: "2", college: "Arts & Sciences", gamesPlayed: 15,
    stats: { ppg: 0, apg: 0, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 0 },
    ratings: [
      { label: "Argumentation", value: 80 }, { label: "Delivery", value: 76 },
      { label: "Research", value: 82 }, { label: "Rebuttal", value: 78 }, { label: "Clarity", value: 80 },
    ],
    recentMatches: [
      { date: "Apr 12", opponent: "College of Engineering", result: "W", pts: 0, ast: 0 },
      { date: "Apr 8", opponent: "Business School", result: "W", pts: 0, ast: 0 },
      { date: "Apr 4", opponent: "College of Medicine", result: "W", pts: 0, ast: 0 },
    ],
    awards: [],
  },
  "Pia Garcia": {
    name: "Pia Garcia", sport: "Volleyball", position: "Outside Hitter", year: "1st Year", color: "#8b5cf6",
    jersey: "9", college: "Arts & Sciences", gamesPlayed: 12,
    stats: { ppg: 0, apg: 2.4, rpg: 4.2, ftPct: 0, fgPct: 0, threePct: 0, spg: 1.6 },
    ratings: [
      { label: "Spiking", value: 78 }, { label: "Serving", value: 74 },
      { label: "Defense", value: 70 }, { label: "Leadership", value: 60 }, { label: "Consistency", value: 72 },
    ],
    recentMatches: [
      { date: "Apr 13", opponent: "College of Engineering", result: "L", pts: 0, ast: 3 },
      { date: "Apr 9", opponent: "Business School", result: "W", pts: 0, ast: 4 },
      { date: "Apr 5", opponent: "College of Medicine", result: "W", pts: 0, ast: 2 },
    ],
    awards: [],
  },
  "Rico Tan": {
    name: "Rico Tan", sport: "Basketball", position: "Shooting Guard", year: "3rd Year", color: "#A91D3A",
    jersey: "3", college: "Business School", gamesPlayed: 11,
    stats: { ppg: 16.8, apg: 3.4, rpg: 3.2, ftPct: 82, fgPct: 44, threePct: 41, spg: 1.5 },
    ratings: [
      { label: "Scoring", value: 84 }, { label: "Playmaking", value: 62 },
      { label: "Defense", value: 58 }, { label: "Athleticism", value: 78 }, { label: "IQ", value: 72 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "College of Engineering", result: "L", pts: 20, ast: 4 },
      { date: "Apr 10", opponent: "Arts & Sciences", result: "L", pts: 14, ast: 2 },
      { date: "Apr 6", opponent: "College of Medicine", result: "W", pts: 18, ast: 3 },
    ],
    awards: [{ name: "Top Scorer — Season 1", season: "Basketball · 2023" }],
  },
  "Bea Ong": {
    name: "Bea Ong", sport: "Football", position: "Forward", year: "2nd Year", color: "#10b981",
    jersey: "9", college: "Business School", gamesPlayed: 10,
    stats: { ppg: 0, apg: 4.2, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 1.1 },
    ratings: [
      { label: "Finishing", value: 82 }, { label: "Dribbling", value: 76 },
      { label: "Pressing", value: 80 }, { label: "Stamina", value: 88 }, { label: "Positioning", value: 78 },
    ],
    recentMatches: [
      { date: "Apr 13", opponent: "College of Engineering", result: "L", pts: 0, ast: 5 },
      { date: "Apr 9", opponent: "Arts & Sciences", result: "W", pts: 0, ast: 4 },
      { date: "Apr 5", opponent: "College of Medicine", result: "W", pts: 0, ast: 6 },
    ],
    awards: [],
  },
  "Nino Ramos": {
    name: "Nino Ramos", sport: "Football", position: "Midfielder", year: "3rd Year", color: "#10b981",
    jersey: "8", college: "Business School", gamesPlayed: 13,
    stats: { ppg: 0, apg: 6.1, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 1.8 },
    ratings: [
      { label: "Passing", value: 86 }, { label: "Dribbling", value: 80 },
      { label: "Pressing", value: 74 }, { label: "Stamina", value: 84 }, { label: "Positioning", value: 82 },
    ],
    recentMatches: [
      { date: "Apr 13", opponent: "College of Engineering", result: "L", pts: 0, ast: 7 },
      { date: "Apr 9", opponent: "Arts & Sciences", result: "W", pts: 0, ast: 5 },
      { date: "Apr 5", opponent: "College of Medicine", result: "W", pts: 0, ast: 6 },
    ],
    awards: [{ name: "Best Midfielder — Season 2", season: "Football · 2024" }],
  },
  "Tia Villanueva": {
    name: "Tia Villanueva", sport: "Basketball", position: "Center", year: "1st Year", color: "#A91D3A",
    jersey: "32", college: "Business School", gamesPlayed: 9,
    stats: { ppg: 10.4, apg: 1.2, rpg: 9.1, ftPct: 65, fgPct: 58, threePct: 15, spg: 0.7 },
    ratings: [
      { label: "Scoring", value: 65 }, { label: "Playmaking", value: 40 },
      { label: "Defense", value: 82 }, { label: "Athleticism", value: 72 }, { label: "IQ", value: 68 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "College of Engineering", result: "L", pts: 12, ast: 1 },
      { date: "Apr 10", opponent: "Arts & Sciences", result: "L", pts: 8, ast: 2 },
      { date: "Apr 6", opponent: "College of Medicine", result: "W", pts: 14, ast: 1 },
    ],
    awards: [],
  },
  "Doc Rivera": {
    name: "Doc Rivera", sport: "Badminton", position: "Singles", year: "5th Year", color: "#f59e0b",
    jersey: "1", college: "College of Medicine", gamesPlayed: 22,
    stats: { ppg: 0, apg: 0, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 0 },
    ratings: [
      { label: "Smash", value: 90 }, { label: "Net Play", value: 86 },
      { label: "Footwork", value: 88 }, { label: "Endurance", value: 84 }, { label: "Strategy", value: 92 },
    ],
    recentMatches: [
      { date: "Apr 15", opponent: "College of Engineering", result: "W", pts: 0, ast: 0 },
      { date: "Apr 11", opponent: "Arts & Sciences", result: "W", pts: 0, ast: 0 },
      { date: "Apr 7", opponent: "Business School", result: "L", pts: 0, ast: 0 },
    ],
    awards: [
      { name: "Singles Champion — Season 2", season: "Badminton · 2024" },
      { name: "Best Athlete — Season 1", season: "Badminton · 2023" },
    ],
  },
  "Ana Soriano": {
    name: "Ana Soriano", sport: "Tennis", position: "Doubles", year: "4th Year", color: "#3b82f6",
    jersey: "2", college: "College of Medicine", gamesPlayed: 18,
    stats: { ppg: 0, apg: 0, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 0 },
    ratings: [
      { label: "Serve", value: 84 }, { label: "Volley", value: 80 },
      { label: "Footwork", value: 78 }, { label: "Endurance", value: 82 }, { label: "Strategy", value: 86 },
    ],
    recentMatches: [
      { date: "Apr 14", opponent: "College of Engineering", result: "W", pts: 0, ast: 0 },
      { date: "Apr 10", opponent: "Arts & Sciences", result: "L", pts: 0, ast: 0 },
      { date: "Apr 6", opponent: "Business School", result: "W", pts: 0, ast: 0 },
    ],
    awards: [{ name: "Doubles Champion — Season 2", season: "Tennis · 2024" }],
  },
  "Josh Dela Cruz": {
    name: "Josh Dela Cruz", sport: "Badminton", position: "Doubles", year: "3rd Year", color: "#f59e0b",
    jersey: "3", college: "College of Medicine", gamesPlayed: 16,
    stats: { ppg: 0, apg: 0, rpg: 0, ftPct: 0, fgPct: 0, threePct: 0, spg: 0 },
    ratings: [
      { label: "Smash", value: 78 }, { label: "Net Play", value: 80 },
      { label: "Footwork", value: 76 }, { label: "Endurance", value: 80 }, { label: "Strategy", value: 74 },
    ],
    recentMatches: [
      { date: "Apr 15", opponent: "College of Engineering", result: "W", pts: 0, ast: 0 },
      { date: "Apr 11", opponent: "Arts & Sciences", result: "W", pts: 0, ast: 0 },
      { date: "Apr 7", opponent: "Business School", result: "L", pts: 0, ast: 0 },
    ],
    awards: [],
  },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

const inputCls = "bg-[#111] border border-[#1f1f1f] focus:border-[#A91D3A]/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-all w-full text-center font-black";
const infoInputCls = "bg-[#111] border border-[#1f1f1f] focus:border-[#A91D3A]/50 rounded-md px-2 py-1 text-[11px] text-white outline-none transition-all text-right font-bold w-28";

export function PlayerProfilePage({
  playerName,
  collegeName,
  onBack,
}: {
  playerName: string;
  collegeName: string;
  onBack: () => void;
}) {
  const original = PLAYER_DETAILS[playerName];
  const [player, setPlayer] = useState<PlayerDetail>(original ?? PLAYER_DETAILS["Marco Reyes"]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<PlayerDetail>(player);
  const [saved, setSaved] = useState(false);

  if (!original) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#444] text-sm mb-4">Player not found.</p>
          <button onClick={onBack} className="text-[#A91D3A] text-xs hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const isNonBallSport = ["Debate", "Badminton", "Tennis", "Esports"].includes(player.sport);

  const handleEdit = () => {
    setDraft({ ...player });
    setIsEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    setPlayer({ ...draft });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDiscard = () => {
    setDraft({ ...player });
    setIsEditing(false);
  };

  const updateStat = (key: keyof PlayerStats, val: string) => {
    setDraft((d) => ({ ...d, stats: { ...d.stats, [key]: parseFloat(val) || 0 } }));
  };

  const updateRating = (index: number, val: string) => {
    const newRatings = [...draft.ratings];
    newRatings[index] = { ...newRatings[index], value: Math.min(100, Math.max(0, parseInt(val) || 0)) };
    setDraft((d) => ({ ...d, ratings: newRatings }));
  };

  const updateInfo = (key: keyof PlayerDetail, val: string) => {
    setDraft((d) => ({ ...d, [key]: key === "gamesPlayed" ? parseInt(val) || 0 : val }));
  };

  const current = isEditing ? draft : player;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Hero */}
      <div className="bg-[#0a0a0a] border-b border-[#111] px-9 pt-8 pb-7">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-bold text-[#444] uppercase tracking-widest hover:text-white transition-colors mb-5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {collegeName}
        </button>

        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0 border-2"
            style={{ backgroundColor: `${player.color}18`, color: player.color, borderColor: `${player.color}35`, fontFamily: "'Anton', sans-serif" }}
          >
            {initials(player.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2"
              style={{ color: player.color, backgroundColor: `${player.color}12`, borderColor: `${player.color}25` }}
            >
              {player.sport} · {player.position}
            </div>
            <h1 className="text-white text-4xl uppercase leading-none tracking-wide mb-1.5" style={{ fontFamily: "'Anton', sans-serif" }}>
              {player.name}
            </h1>
            <p className="text-[#444] text-xs tracking-wider">{player.college} · {player.year} · #{player.jersey}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {saved && (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={handleDiscard}
                  className="border border-[#1a1a1a] text-[#555] hover:border-[#333] hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="border border-[#1a1a1a] hover:border-[#A91D3A]/40 text-[#555] hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Stats
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Main col */}
        <div className="flex-1 px-9 py-7 border-r border-[#111] min-w-0">

          {/* Season stats */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
            Season Stats <span className="text-[#A91D3A]">{current.gamesPlayed} GP</span>
            {isEditing && <span className="text-[8px] font-bold text-[#A91D3A] bg-[#A91D3A]/10 border border-[#A91D3A]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Editing</span>}
          </p>

          {!isNonBallSport ? (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {([
                { key: "ppg" as keyof PlayerStats, label: "Points / Game", highlight: true },
                { key: "apg" as keyof PlayerStats, label: "Assists / Game" },
                { key: "rpg" as keyof PlayerStats, label: "Rebounds / Game" },
                { key: "spg" as keyof PlayerStats, label: "Steals / Game" },
                { key: "fgPct" as keyof PlayerStats, label: "FG%" },
                { key: "threePct" as keyof PlayerStats, label: "3PT%" },
              ]).map(({ key, label, highlight }) => (
                <div key={key} className={`rounded-lg p-3.5 border ${isEditing ? "border-[#A91D3A]/25 bg-[#A91D3A]/5" : highlight ? "border-[#A91D3A]/25 bg-[#A91D3A]/8" : "border-[#111] bg-[#0a0a0a]"}`}>
                  <div className="text-[9px] text-[#444] uppercase tracking-widest mb-2">{label}</div>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={draft.stats[key]}
                      onChange={(e) => updateStat(key, e.target.value)}
                      className={inputCls}
                      style={{ fontFamily: "'Anton', sans-serif", fontSize: "18px" }}
                    />
                  ) : (
                    <div className={`text-xl font-black text-center ${highlight ? "text-[#A91D3A]" : "text-white"}`} style={{ fontFamily: "'Anton', sans-serif" }}>
                      {current.stats[key]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className={`rounded-lg p-3.5 border ${isEditing ? "border-[#A91D3A]/25 bg-[#A91D3A]/5" : "border-[#A91D3A]/25 bg-[#A91D3A]/8"}`}>
                <div className="text-[9px] text-[#444] uppercase tracking-widest mb-2">Games Played</div>
                {isEditing ? (
                  <input type="number" value={draft.gamesPlayed} onChange={(e) => updateInfo("gamesPlayed", e.target.value)} className={inputCls} style={{ fontFamily: "'Anton', sans-serif", fontSize: "18px" }} />
                ) : (
                  <div className="text-xl font-black text-center text-[#A91D3A]" style={{ fontFamily: "'Anton', sans-serif" }}>{current.gamesPlayed}</div>
                )}
              </div>
              <div className="rounded-lg p-3.5 border border-[#111] bg-[#0a0a0a]">
                <div className="text-[9px] text-[#444] uppercase tracking-widest mb-2">Recent Wins</div>
                <div className="text-xl font-black text-center text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
                  {current.recentMatches.filter((m) => m.result === "W").length}
                </div>
              </div>
              <div className="rounded-lg p-3.5 border border-[#111] bg-[#0a0a0a]">
                <div className="text-[9px] text-[#444] uppercase tracking-widest mb-2">Awards</div>
                <div className="text-xl font-black text-center text-white" style={{ fontFamily: "'Anton', sans-serif" }}>{current.awards.length}</div>
              </div>
            </div>
          )}

          <div className="border-t border-[#111] mb-6" />

          {/* Performance ratings */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
            Performance Ratings
            {isEditing && <span className="text-[8px] font-bold text-[#A91D3A] bg-[#A91D3A]/10 border border-[#A91D3A]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Editing</span>}
          </p>
          <div className="mb-8">
            {current.ratings.map((r, i) => (
              <div key={r.label} className="flex items-center gap-3 mb-2.5">
                <span className="text-[10px] text-[#555] w-24 text-right flex-shrink-0">{r.label}</span>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.ratings[i].value}
                    onChange={(e) => updateRating(i, e.target.value)}
                    className="bg-[#111] border border-[#1f1f1f] focus:border-[#A91D3A]/50 rounded-md px-2 py-1 text-[11px] font-black text-white outline-none transition-all w-14 text-center flex-shrink-0"
                  />
                ) : null}
                <div className="flex-1 h-1 bg-[#111] rounded-full overflow-hidden">
                  <div className="h-full bg-[#A91D3A] rounded-full transition-all duration-300" style={{ width: `${isEditing ? draft.ratings[i].value : r.value}%` }} />
                </div>
                {!isEditing && <span className="text-[10px] text-[#666] font-bold w-7 text-right flex-shrink-0">{r.value}</span>}
              </div>
            ))}
          </div>

          <div className="border-t border-[#111] mb-6" />

          {/* Recent matches */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">Recent Matches</p>
          <div className="space-y-2">
            {current.recentMatches.map((m, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#111] rounded-lg px-4 py-3 flex items-center gap-3">
                <span className="text-[9px] text-[#444] w-14 flex-shrink-0">{m.date}</span>
                <span className="text-[12px] font-bold text-white flex-1 truncate">vs. {m.opponent}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.result === "W" ? "text-emerald-400" : "text-[#A91D3A]"}`}>{m.result}</span>
                {(m.pts > 0 || m.ast > 0) && (
                  <span className="text-[10px] text-[#444] ml-2">{m.pts} pts · {m.ast} ast</span>
                )}
              </div>
            ))}
          </div>

          {/* Save bar */}
          {isEditing && (
            <div className="mt-8 bg-[#0a0a0a] border border-[#A91D3A]/25 rounded-xl px-5 py-4 flex items-center justify-between">
              <span className="text-[10px] text-[#555]">
                You have <span className="text-[#A91D3A] font-bold">unsaved changes</span> — save before leaving
              </span>
              <div className="flex gap-3">
                <button onClick={handleDiscard} className="border border-[#222] text-[#555] hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all">
                  Discard
                </button>
                <button onClick={handleSave} className="bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side col */}
        <div className="w-72 px-6 py-7 flex-shrink-0">
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
            Player Info
            {isEditing && <span className="text-[8px] font-bold text-[#A91D3A] bg-[#A91D3A]/10 border border-[#A91D3A]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Editing</span>}
          </p>
          <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden mb-6">
            {([
              { key: "name" as keyof PlayerDetail, label: "Full Name" },
              { key: "position" as keyof PlayerDetail, label: "Position" },
              { key: "jersey" as keyof PlayerDetail, label: "Jersey No." },
              { key: "year" as keyof PlayerDetail, label: "Year Level" },
              { key: "college" as keyof PlayerDetail, label: "College" },
              { key: "sport" as keyof PlayerDetail, label: "Sport" },
              { key: "gamesPlayed" as keyof PlayerDetail, label: "Games Played" },
            ]).map(({ key, label }, i) => (
              <div key={key} className={`flex items-center justify-between px-4 py-2.5 ${i < 6 ? "border-b border-[#0f0f0f]" : ""}`}>
                <span className="text-[10px] text-[#444] font-semibold">{label}</span>
                {isEditing ? (
                  <input
                    type={key === "gamesPlayed" ? "number" : "text"}
                    value={String(draft[key])}
                    onChange={(e) => updateInfo(key, e.target.value)}
                    className={infoInputCls}
                  />
                ) : (
                  <span className="text-[11px] text-white font-bold">{String(current[key])}</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">Awards</p>
          {current.awards.length === 0 ? (
            <p className="text-[#333] text-xs text-center py-6">No awards yet.</p>
          ) : (
            <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden px-4">
              {current.awards.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-3 ${i < current.awards.length - 1 ? "border-b border-[#0f0f0f]" : ""}`}>
                  <div className="w-7 h-7 rounded-lg bg-[#C5A059]/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="#C5A059" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-bold">{a.name}</p>
                    <p className="text-[#444] text-[9px] mt-0.5">{a.season}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}