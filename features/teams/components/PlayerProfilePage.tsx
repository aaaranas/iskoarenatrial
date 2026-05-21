"use client";

// ─────────────────────────────────────────────────────────────────────────
// Player Profile — opened when a player card is clicked from CollegeProfilePage.
//
// Design source: _design-import/teams-bundle/.../PlayerProfilePage.tsx
//
// Scope:
//   This is a simplified port. The original design surfaces stats / ratings /
//   awards / per-player match history — but IskoArena has none of that data
//   infrastructure yet (no player-level stats, no ratings table, no awards
//   table). The page focuses on the data we DO have:
//     • Hero: photo (or initials), name, sport+position, college, jersey
//     • Editable Player Info card (admin only) — name, position, jersey, photo URL
//     • Recent Matches: derived from trpc.match.getAll, filtered to the team's
//       (= college's) games. Team-level not player-level, but useful context.
// ─────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/format-match-date";
import type { College } from "./CollegeRow";

// Player row shape passed in from CollegeProfilePage. Matches the DBPlayer
// type used over there (FK columns + display columns, no joined relations).
export interface PlayerForProfile {
  id: string;
  name: string;
  college_id: string;
  sport_id: string;
  position: string | null;
  jersey_number: number | null;
  photo_url: string | null;
}

interface PlayerProfilePageProps {
  player:        PlayerForProfile;
  college:       College;       // for college display name + org
  sportName:     string;        // resolved by parent (we don't query sports here)
  collegeColor:  string;        // brand accent for the hero
  textOnColor:   string;        // contrast colour for badges over the brand colour
  onBack:        () => void;
  onPlayerUpdate: (updated: PlayerForProfile) => void;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Field config for the Player Info card — drives both view and edit modes.
type FieldKey = "name" | "position" | "jersey_number" | "photo_url";
const INFO_FIELDS: Array<{ key: FieldKey; label: string; type: "text" | "number" | "url"; }> = [
  { key: "name",          label: "Full Name",  type: "text"   },
  { key: "position",      label: "Position",   type: "text"   },
  { key: "jersey_number", label: "Jersey No.", type: "number" },
  { key: "photo_url",     label: "Photo URL",  type: "url"    },
];

export function PlayerProfilePage({
  player,
  college,
  sportName,
  collegeColor,
  textOnColor,
  onBack,
  onPlayerUpdate,
}: PlayerProfilePageProps) {
  const { isAdmin } = useRole();

  const [isEditing, setIsEditing] = useState(false);
  const [draft,     setDraft]     = useState<PlayerForProfile>(player);
  const [isSaving,  setIsSaving]  = useState(false);

  // ── Recent matches — pull from trpc cache (already populated elsewhere) ──
  const { data: matchesData } = trpc.match.getAll.useQuery();

  // Filter to matches where the player's college is on either side.
  // College = team in this schema (1:1), so match.homeTeamId or awayTeamId
  // matching player.college_id are this player's team's matches.
  const recentMatches = useMemo(() => {
    if (!matchesData) return [];
    return matchesData
      .filter(m =>
        m.statusType === "completed" &&
        (m.homeTeamId === player.college_id || m.awayTeamId === player.college_id)
      )
      .slice(0, 5)
      .map(m => {
        const isHome  = m.homeTeamId === player.college_id;
        const myScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
        const opScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
        const result: "W" | "L" | "T" =
          myScore > opScore ? "W" : myScore < opScore ? "L" : "T";
        return {
          id:       m.id,
          date:     formatMatchDate(m.rawDate),
          time:     formatMatchTime(m.rawDate),
          opponent: isHome ? (m.awayTeam || "?") : (m.homeTeam || "?"),
          opOrg:    isHome ? m.awayTeamOrg : m.homeTeamOrg,
          sport:    m.league,
          category: m.category,
          score:    `${myScore} – ${opScore}`,
          result,
        };
      });
  }, [matchesData, player.college_id]);

  // ── Edit handlers ──────────────────────────────────────────────────────
  const handleEdit = () => {
    setDraft({ ...player });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...player });
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Light validation: name must not be blank.
    if (!draft.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    const payload = {
      name:          draft.name.trim(),
      position:      draft.position?.trim() || null,
      jersey_number: draft.jersey_number,
      photo_url:     draft.photo_url?.trim() || null,
    };

    const { error } = await (supabase as any)
      .from("players")
      .update(payload)
      .eq("id", player.id);

    setIsSaving(false);

    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }

    toast.success("Player updated");
    setIsEditing(false);
    // Tell parent to refresh its local list so the card grid reflects changes.
    onPlayerUpdate({ ...player, ...payload });
  };

  const updateField = (key: FieldKey, value: string) => {
    setDraft((d) => {
      if (key === "jersey_number") {
        const trimmed = value.trim();
        return { ...d, jersey_number: trimmed === "" ? null : parseInt(trimmed, 10) };
      }
      return { ...d, [key]: value };
    });
  };

  // current = view value when not editing, draft when editing
  const current = isEditing ? draft : player;

  // Display value for the info-card right column (string-coerced).
  const displayValue = (key: FieldKey): string => {
    const v = current[key];
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">

      {/* ── HERO ── */}
      <div className="bg-[#0a0a0a] border-b border-[#111] px-9 pt-8 pb-7">
        {/* Back to college */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-bold text-[#444] uppercase tracking-widest hover:text-white transition-colors mb-5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {college.name}
        </button>

        <div className="flex items-center gap-6 flex-wrap">
          {/* Photo / initials — uses real player photo when available */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black flex-shrink-0 border-2"
            style={{
              backgroundColor: `${collegeColor}18`,
              color: collegeColor,
              borderColor: `${collegeColor}35`,
              fontFamily: "var(--font-bebas), sans-serif",
            }}
          >
            {current.photo_url ? (
              <img
                src={current.photo_url}
                alt={current.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  // Hide broken images so the initials fall-through shows
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              getInitials(current.name)
            )}
          </div>

          {/* Name + sport/position chip + meta */}
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2"
              style={{ color: collegeColor, backgroundColor: `${collegeColor}12`, borderColor: `${collegeColor}25` }}
            >
              {sportName}
              {current.position ? ` · ${current.position}` : ""}
            </div>
            <h1
              className="text-white text-4xl uppercase leading-none tracking-wide mb-1.5"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontStyle: "italic" }}
            >
              {current.name}
            </h1>
            <p className="text-[#666] text-xs tracking-wider">
              {college.name}
              {current.jersey_number != null ? ` · #${String(current.jersey_number).padStart(2, "0")}` : ""}
            </p>
          </div>

          {/* Action buttons — admin only */}
          {isAdmin && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border border-[#1a1a1a] text-[#555] hover:border-[#333] hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </>
                    )}
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
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY: 2 columns — recent matches | player info ── */}
      <div className="flex flex-1 flex-col md:flex-row">

        {/* Main column */}
        <div className="flex-1 px-9 py-7 md:border-r border-[#111] min-w-0">
          {/* Recent matches header */}
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4">
            Recent Matches <span className="text-[#666]">· team-level</span>
          </p>

          {recentMatches.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-[#111] rounded-xl px-5 py-8 text-center">
              <p className="text-[#444] text-xs">
                No completed matches yet for {college.name}.
              </p>
              <p className="text-[#333] text-[10px] mt-1.5">
                Matches will appear here as games finish.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#0a0a0a] border border-[#111] rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <span className="text-[9px] text-[#444] w-16 flex-shrink-0">{m.date}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-white truncate">
                      vs. {m.opponent}{m.opOrg ? ` (${m.opOrg})` : ""}
                    </div>
                    <div className="text-[9px] text-[#555] mt-0.5 tracking-wider">
                      {m.sport}{m.category ? ` · ${m.category}` : ""} · {m.time}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#666]">{m.score}</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest w-5 text-right ${
                      m.result === "W" ? "text-emerald-400" :
                      m.result === "L" ? "text-[#A91D3A]"   : "text-[#666]"
                    }`}
                  >
                    {m.result}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Save-bar hint (mirrors design) — shown only while editing */}
          {isEditing && isAdmin && (
            <div className="mt-8 bg-[#0a0a0a] border border-[#A91D3A]/25 rounded-xl px-5 py-4 flex items-center justify-between">
              <span className="text-[10px] text-[#555]">
                You have <span className="text-[#A91D3A] font-bold">unsaved changes</span> — save before leaving.
              </span>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="border border-[#222] text-[#555] hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side column — Player Info */}
        <div className="w-full md:w-80 px-6 py-7 flex-shrink-0">
          <p className="text-[#333] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
            Player Info
            {isEditing && (
              <span className="text-[8px] font-bold text-[#A91D3A] bg-[#A91D3A]/10 border border-[#A91D3A]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Editing
              </span>
            )}
          </p>

          <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden mb-6">
            {INFO_FIELDS.map(({ key, label, type }, i) => {
              const isLast = i === INFO_FIELDS.length - 1;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between gap-2 px-4 py-2.5 ${!isLast ? "border-b border-[#0f0f0f]" : ""}`}
                >
                  <span className="text-[10px] text-[#444] font-semibold flex-shrink-0">{label}</span>
                  {isEditing ? (
                    <input
                      type={type}
                      value={
                        key === "jersey_number"
                          ? (draft.jersey_number ?? "")
                          : (String(draft[key] ?? ""))
                      }
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder={key === "photo_url" ? "https://…" : ""}
                      className="bg-[#111] border border-[#1f1f1f] focus:border-[#A91D3A]/50 rounded-md px-2 py-1 text-[11px] text-white outline-none transition-all text-right font-bold flex-1 min-w-0 max-w-[12rem]"
                    />
                  ) : (
                    <span
                      className="text-[11px] text-white font-bold text-right truncate flex-1 min-w-0"
                      title={displayValue(key)}
                    >
                      {key === "jersey_number" && current.jersey_number != null
                        ? `#${String(current.jersey_number).padStart(2, "0")}`
                        : displayValue(key)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Read-only meta — college + sport (these aren't editable here;
              changing them would re-affiliate the player and is out of scope
              for a simple edit). */}
          <div className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#0f0f0f]">
              <span className="text-[10px] text-[#444] font-semibold">College</span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded"
                style={{ backgroundColor: `${collegeColor}18`, color: collegeColor, border: `1px solid ${collegeColor}35` }}
              >
                {college.org ?? ""} · {college.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <span className="text-[10px] text-[#444] font-semibold">Sport</span>
              <span className="text-[11px] text-white font-bold">{sportName || "—"}</span>
            </div>
          </div>

          {/* Suppress unused-var lint for textOnColor — reserved for future
              brand-tinted controls; keep the prop so the call-site stays stable. */}
          <span className="hidden" data-color={textOnColor} />
        </div>
      </div>
    </div>
  );
}
