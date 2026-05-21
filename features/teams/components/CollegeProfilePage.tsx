"use client";
import React, { useState, useEffect, useRef } from "react";
import { College } from "./CollegeRow";
import { PlayerPhotoUploader } from "./PlayerPhotoUploader";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import { PlayerProfilePage, type PlayerForProfile } from "./PlayerProfilePage";

// ─── College identity ─────────────────────────────────────────────────────────
const COLLEGE_IDENTITY: Record<string, {
  mascot: string; color: string; tagline: string;
  photo: string; logo: string;
}> = {
  COS:  { mascot: "SCIONS",    color: "#F4D27A", tagline: "BUILT IN THE LAB. BORN IN THE ARENA.",  photo: "/iskolarobadminton.jpg", logo: "/colleges/cos_logo.jpg" },
  CSS:  { mascot: "STALLIONS", color: "#E11D48", tagline: "HOOVES DOWN. EYES UP. FOREVER FIRST.",  photo: "/iskolarobaseball.jpg",  logo: "/colleges/css_logo.jpg" },
  CCAD: { mascot: "PHOENIX",   color: "#22C55E", tagline: "RISE. BURN. RISE AGAIN.",               photo: "/iskolarofrisbee2.jpg",  logo: "/colleges/ccad_logo.jpg" },
  SOM:  { mascot: "TYCOONS",   color: "#3B82F6", tagline: "EVERY POINT IS PROFIT.",                photo: "/iskolarovolley.jpg",    logo: "/colleges/som_logo.jpg" },
};

// Canonical full college name keyed by org code — matches teams.college rows.
// Used as a fallback if college.name (from teams.college) is somehow missing.
const COLLEGE_CANONICAL_NAME: Record<string, string> = {
  COS:  "College of Science",
  CSS:  "College of Social Science",
  CCAD: "Communication Arts and Design",
  SOM:  "School of Management",
};
const TEXT_ON_COLOR: Record<string, string> = {
  COS: "#0a0a0a",
  CCAD: "#0a0a0a",
};

// ─── DB shapes ──────────────────────────────────────────────────────────────
// After the Option A migration, players link to teams/sports via FKs.
// The college/sport text columns are gone.
interface DBPlayer {
  id: string;
  name: string;
  college_id: string;
  sport_id: string;
  position: string | null;
  jersey_number: number | null;
  photo_url: string | null;
}

type Sport = { id: string; name: string };

const AVATAR_COLORS = [
  { bg: "#1a0a2e", fg: "#c4a9f5" }, { bg: "#0a1a2e", fg: "#a9c4f5" },
  { bg: "#0a2e1a", fg: "#a9f5c4" }, { bg: "#2e1a0a", fg: "#f5c4a9" },
  { bg: "#2e0a0a", fg: "#f5a9a9" }, { bg: "#0a2e2e", fg: "#a9f5f5" },
  { bg: "#2e0a1a", fg: "#f5a9c4" }, { bg: "#2e2e0a", fg: "#f5f5a9" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
const ALLOWED_SPORTS = [
  "Badminton","Basketball","Block Blast","Cheerdance","Chess","CODM","Cosplay",
  "Dancesports","Dota 2","Frisbee","MLBB","Mr. & Ms. Fitness","Petanque",
  "Pickleball","Pinoy Games","Rubiks Cube","Scrabble","Soccer","Softball",
  "Sudoku","Table Tennis","Tetris","Valorant","Volleyball",
];

type PlayerCSVRow = { name: string; sport: string; position: string; jersey_number: string; error?: string };

function PlayerCSVModal({ college, onClose, onImport }: {
  college: College;
  onClose: () => void;
  onImport: (rows: PlayerCSVRow[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<PlayerCSVRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const parsed: PlayerCSVRow[] = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      const row: PlayerCSVRow = {
        name: obj["name"] || obj["player"] || "",
        sport: obj["sport"] || "",
        position: obj["position"] || obj["pos"] || "",
        jersey_number: obj["jersey"] || obj["jersey_number"] || obj["number"] || "",
      };
      const errors: string[] = [];
      if (!row.name) errors.push("Missing name");
      if (!row.sport) errors.push("Missing sport");
      else if (!ALLOWED_SPORTS.includes(row.sport)) errors.push(`Unknown sport: "${row.sport}"`);
      if (errors.length) row.error = errors.join("; ");
      return row;
    });
    setRows(parsed);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const downloadTemplate = () => {
    const csv = `name,sport,position,jersey_number\nJuan dela Cruz,Basketball,Point Guard,7\nAna Flores,Volleyball,Setter,1`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "players_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  const handleConfirm = async () => {
    if (!validRows.length) return;
    setIsImporting(true);
    await onImport(validRows);
    setIsImporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/6 shrink-0">
          <div>
            <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{college.name}</p>
            <h2 className="text-base font-bold text-white">Import Players via CSV</h2>
            <p className="text-white/40 text-xs mt-0.5">Bulk-add players to this college.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate} className="text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg">↓ Template</button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/4 hover:bg-white/8 transition-colors flex items-center justify-center text-white/50 hover:text-white text-sm">✕</button>
          </div>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-6 shrink-0">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragging ? "border-white/25 bg-white/4" : "border-white/8 hover:border-white/14"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-lg">👤</div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Drop your CSV file here</p>
                <p className="text-[11px] text-white/40 mt-0.5">or click to browse — .csv files only</p>
              </div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold">Required columns: name, sport, position, jersey_number</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="px-6 pt-4 pb-2 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">{fileName}</span>
                <span className="text-[9px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">{validRows.length} valid</span>
                {errorRows.length > 0 && <span className="text-[9px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">{errorRows.length} errors</span>}
              </div>
              <button onClick={() => { setRows([]); setFileName(""); }} className="text-[9px] text-white/35 hover:text-white uppercase tracking-widest font-bold transition-colors">Change file</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 pb-2">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/6">
                    {["Name","Sport","Position","Jersey",""].map((h) => (
                      <th key={h} className="text-left py-2 pr-3 text-[9px] font-bold text-white/30 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-semibold text-white">{row.name || <span className="text-white/30">—</span>}</td>
                      <td className="py-2 pr-3 text-white/60">{row.sport || <span className="text-white/30">—</span>}</td>
                      <td className="py-2 pr-3 text-white/50">{row.position || <span className="text-white/30">—</span>}</td>
                      <td className="py-2 pr-3 text-white/50">{row.jersey_number || <span className="text-white/30">—</span>}</td>
                      <td className="py-2">
                        {row.error
                          ? <span className="text-[9px] text-red-400 font-semibold">{row.error}</span>
                          : <span className="text-[9px] text-green-500 font-bold">✓</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-white/6 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!validRows.length || isImporting}
            className="flex-1 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#8f1830] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {isImporting ? "Importing…" : `Import ${validRows.length} Player${validRows.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── College Profile Page ─────────────────────────────────────────────────────
export function CollegeProfilePage({
  college,
  onBack,
}: {
  college: College;
  onBack: () => void;
}) {
  const { isAdmin } = useRole();
  const [showCSV, setShowCSV] = useState(false);
  // playerCounts is keyed by sport_id now (was sport name before the FK migration)
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  // activeSportTab now carries the full {id, name} so we can filter by FK
  const [activeSportTab, setActiveSportTab] = useState<Sport | null>(null);
  // Full sport list from the DB — {id, name} pairs
  const [sports, setSports] = useState<Sport[]>([]);
  const [players, setPlayers] = useState<DBPlayer[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", position: "", jersey_number: "", photo_url: "" });
  const [isSaving, setIsSaving] = useState(false);
  // When set, the page renders <PlayerProfilePage> instead of the roster grid.
  const [viewingPlayer, setViewingPlayer] = useState<PlayerForProfile | null>(null);

  const org = college.org ?? "";
  const identity = COLLEGE_IDENTITY[org] ?? { mascot: college.name.toUpperCase(), color: "#A91D3A", tagline: "", photo: "", logo: "" };
  const { mascot, color, tagline, photo, logo } = identity;
  const textOnColor = TEXT_ON_COLOR[org] ?? "#ffffff";

  // Resolved college display name — falls back to canonical map if college.name is empty.
  // Used purely for UI display (toasts, modal labels). The FK value is college.id.
  const resolvedCollegeName = (college.name?.trim() || COLLEGE_CANONICAL_NAME[org] || "").trim();

  const fetchCounts = async () => {
    if (!college.id) return;
    const { data } = await (supabase as any)
      .from("players")
      .select("sport_id")
      .eq("college_id", college.id);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((r: { sport_id: string }) => {
        counts[r.sport_id] = (counts[r.sport_id] || 0) + 1;
      });
      setPlayerCounts(counts);
    }
  };

  const fetchPlayers = async (sport: Sport) => {
    if (!college.id) return;
    setIsLoadingPlayers(true);
    const { data } = await (supabase as any)
      .from("players")
      .select("*")
      .eq("college_id", college.id)
      .eq("sport_id", sport.id);
    if (data) setPlayers(data);
    setIsLoadingPlayers(false);
  };

  const handleAddPlayer = async () => {
    const name = addForm.name.trim();
    if (!name) {
      toast.error("Player name is required");
      return;
    }
    if (!activeSportTab) {
      toast.error("Pick a sport first");
      return;
    }
    if (!college.id) {
      toast.error("Cannot determine college for this profile");
      return;
    }

    // jersey_number is an int column — coerce or null. Empty string crashes the insert.
    const jerseyRaw = addForm.jersey_number.trim();
    let jerseyNumber: number | null = null;
    if (jerseyRaw) {
      const parsed = parseInt(jerseyRaw, 10);
      if (Number.isNaN(parsed)) {
        toast.error("Jersey number must be a number");
        return;
      }
      jerseyNumber = parsed;
    }

    setIsSaving(true);
    // college_id + sport_id are auto-tagged from page context, never from the form
    const payload = {
      name,
      college_id: college.id,
      sport_id: activeSportTab.id,
      position: addForm.position.trim() || null,
      jersey_number: jerseyNumber,
      photo_url: addForm.photo_url.trim() || null,
    };

    const { data, error } = await (supabase as any)
      .from("players")
      .insert([payload])
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      toast.error(`Failed to add player: ${error.message}`);
      return;
    }
    if (data) {
      setPlayers((p) => [...p, data]);
      setAddForm({ name: "", position: "", jersey_number: "", photo_url: "" });
      setShowAddPlayer(false);
      fetchCounts();
      toast.success(`${name} added to ${resolvedCollegeName} · ${activeSportTab.name}`);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    const { error } = await (supabase as any).from("players").delete().eq("id", id);
    if (error) {
      toast.error(`Failed to remove player: ${error.message}`);
      return;
    }
    setPlayers((p) => p.filter((x) => x.id !== id));
    fetchCounts();
    toast.success("Player removed");
  };

  // Fetch the full sports list on mount, then auto-select the first one
  useEffect(() => {
    fetchCounts();

    async function fetchSports() {
      const { data } = await (supabase as any)
        .from("sports")
        .select("id, name")
        .order("name", { ascending: true });
      if (data && data.length > 0) {
        const list: Sport[] = data.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }));
        setSports(list);
        setActiveSportTab(list[0]);
      }
    }
    fetchSports();
  }, [college.id]);

  // Re-fetch the roster every time the dropdown selection changes
  useEffect(() => {
    if (activeSportTab) fetchPlayers(activeSportTab);
  }, [activeSportTab, college.id]);

  const handleImportPlayers = async (rows: PlayerCSVRow[]) => {
    if (!college.id) {
      toast.error("Cannot determine college for this import");
      return;
    }
    // Map sport name → sport_id once, then resolve each row against it
    const sportIdByName = new Map(sports.map((s) => [s.name.toLowerCase(), s.id]));

    let inserted = 0;
    let failed = 0;
    for (const row of rows) {
      const sportId = sportIdByName.get(row.sport.toLowerCase());
      if (!sportId) {
        failed++;
        continue;
      }
      // jersey_number is an int column; treat blank/non-numeric as null
      const jerseyRaw = (row.jersey_number ?? "").trim();
      const parsed = jerseyRaw ? parseInt(jerseyRaw, 10) : NaN;
      const jerseyNumber = Number.isNaN(parsed) ? null : parsed;

      const { error } = await (supabase as any).from("players").insert([{
        name: row.name,
        college_id: college.id,
        sport_id: sportId,
        position: row.position || null,
        jersey_number: jerseyNumber,
      }]);
      if (error) failed++; else inserted++;
    }
    fetchCounts();
    if (inserted > 0) toast.success(`${inserted} player${inserted === 1 ? "" : "s"} imported`);
    if (failed > 0)   toast.error(`${failed} row${failed === 1 ? "" : "s"} failed to import`);
  };

  const totalPlayers = Object.values(playerCounts).reduce((a, b) => a + b, 0);

  // ── Player profile sub-view ──────────────────────────────────────────
  // When a card is clicked, viewingPlayer is set and we render the dedicated
  // PlayerProfilePage. onBack returns to the roster grid; onPlayerUpdate
  // patches the local players[] so the grid reflects edits immediately.
  if (viewingPlayer) {
    return (
      <PlayerProfilePage
        player={viewingPlayer}
        college={college}
        sportName={activeSportTab?.name ?? ""}
        collegeColor={color}
        textOnColor={textOnColor}
        onBack={() => setViewingPlayer(null)}
        onPlayerUpdate={(updated) => {
          // Sync local roster grid + the active viewingPlayer state so the
          // header reflects edits without needing a re-open.
          setPlayers((arr) => arr.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
          setViewingPlayer(updated);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f0f0f0" }}>
      {/* Add Player modal */}
      {showAddPlayer && activeSportTab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddPlayer(false); }}
        >
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 flex items-start justify-between rounded-t-2xl" style={{ background: color }}>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: TEXT_ON_COLOR[org] ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}>
                  {college.name} · {activeSportTab.name}
                </p>
                <h2 className="text-xl font-black uppercase" style={{ fontFamily: "var(--font-bebas)", color: TEXT_ON_COLOR[org] ?? "#fff" }}>
                  Add Player
                </h2>
              </div>
              <button
                onClick={() => setShowAddPlayer(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: "rgba(0,0,0,0.15)", color: TEXT_ON_COLOR[org] ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}
              >✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Auto-tag panel — these are set from page context, NOT user input.
                  Shown read-only so the user can verify exactly what will be saved. */}
              <div style={{
                background: `${color}0d`,
                border: `1px solid ${color}33`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                rowGap: 8,
                columnGap: 14,
                alignItems: "center",
              }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: `${color}cc`, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                  College
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {resolvedCollegeName}
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, color: `${color}cc`, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                  Sport
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  {activeSportTab.name}
                </div>
                <div style={{ gridColumn: "1 / -1", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                  Auto-tagged from the profile you're viewing — change the sport using the dropdown above.
                </div>
              </div>

              {/* Player photo upload — replaces the old "Photo URL" text input */}
              <div className="flex items-center gap-4">
                <PlayerPhotoUploader
                  currentUrl={addForm.photo_url || null}
                  playerName={addForm.name || "?"}
                  accentColor={color}
                  onUploaded={(url) => setAddForm((f) => ({ ...f, photo_url: url }))}
                  size={72}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Player Photo</p>
                  <p className="text-[11px] text-white/30 leading-snug">
                    {addForm.photo_url
                      ? "Photo selected — will be saved with the player"
                      : "Click the box to upload a photo (optional)"}
                  </p>
                </div>
              </div>

              {/* User-editable text fields (photo_url handled above) */}
              {[
                { key: "name",          placeholder: "Full name *" },
                { key: "position",      placeholder: "Position (e.g. Point Guard)" },
                { key: "jersey_number", placeholder: "Jersey # (optional)" },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/60 outline-none"
                  placeholder={placeholder}
                  value={(addForm as any)[key]}
                  onChange={(e) => setAddForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              ))}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setAddForm({ name: "", position: "", jersey_number: "", photo_url: "" });
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white transition-all"
              >Cancel</button>
              <button
                onClick={handleAddPlayer}
                disabled={!addForm.name.trim() || isSaving}
                className="flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-30"
                style={{ background: color, color: TEXT_ON_COLOR[org] ?? "#fff" }}
              >{isSaving ? "Saving…" : "Save Player"}</button>
            </div>
          </div>
        </div>
      )}

      {showCSV && (
        <PlayerCSVModal
          college={college}
          onClose={() => setShowCSV(false)}
          onImport={handleImportPlayers}
        />
      )}

      {/* ── Cinematic Hero ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 560,
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Full-bleed sport photo */}
        {photo && (
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "grayscale(0.45) contrast(1.1) brightness(0.45)",
            }}
          />
        )}

        {/* Gradient overlays on top of the photo */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, rgba(5,5,5,0.75) 75%, #050505 100%),
            linear-gradient(90deg, rgba(5,5,5,0.9) 0%, transparent 55%, rgba(5,5,5,0.5) 100%),
            radial-gradient(ellipse 65% 70% at 25% 55%, ${color}1a 0%, transparent 70%),
            radial-gradient(ellipse 100% 80% at 80% 30%, ${color}0c 0%, transparent 60%)
          `,
        }} />

        {/* Brand vertical bar */}
        <div style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0,
          width: 5,
          background: color,
          boxShadow: `4px 0 32px ${color}55`,
          zIndex: 2,
        }} />

        {/* Giant mascot watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -20,
            top: "47%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "clamp(180px, 28vw, 380px)",
            lineHeight: 0.8,
            color: `${color}0b`,
            fontStyle: "italic",
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          {mascot}
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 76,
            left: 48,
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px",
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.6)",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
        >
          ← All Colleges
        </button>

        {/* Hero content */}
        <div style={{
          position: "absolute",
          left: 64,
          bottom: 48,
          right: 64,
          zIndex: 5,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 32,
        }}>
          <div>
            {/* Status pill */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              background: `${color}18`,
              border: `1px solid ${color}44`,
              borderRadius: 999,
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: color, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                {org} · {college.status} · Est. {college.established}
              </span>
            </div>

            {/* College code label */}
            <p style={{
              margin: "0 0 8px",
              fontSize: 10,
              fontWeight: 800,
              color: color,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
            }}>
              {college.name}
            </p>

            {/* Giant mascot name */}
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: "clamp(72px, 11vw, 160px)",
              lineHeight: 0.85,
              letterSpacing: "0.01em",
              color: "#ffffff",
              fontStyle: "italic",
              textShadow: `0 0 60px ${color}22`,
            }}>
              {mascot}
            </h1>

            {tagline && (
              <p style={{
                margin: "16px 0 0",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontWeight: 700,
                maxWidth: 520,
              }}>
                "{tagline}"
              </p>
            )}
          </div>

          {/* Circular logo / monogram */}
          <div style={{
            width: 160,
            height: 160,
            borderRadius: 999,
            background: college.logoUrl ? "#fff" : `${color}20`,
            overflow: "hidden",
            border: `4px solid ${color}`,
            boxShadow: `0 0 60px ${color}55, 0 20px 48px rgba(0,0,0,0.7)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {/* Prefer DB logo_url, fall back to public/colleges asset, then initials */}
            {college.logoUrl || logo ? (
              <img src={college.logoUrl ?? logo} alt={college.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize: 48,
                color: color,
                letterSpacing: "0.04em",
              }}>
                {org || college.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Magazine stats strip ───────────────────────────────────────────── */}
      {/* Stats strip — 3 columns now (Active Teams removed; it was always 0 and
          redundant since teams.id ≡ college.id 1:1). Active Players is the
          meaningful headline metric. */}
      <div style={{
        padding: "32px 64px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0,
        background: "#0a0a0a",
      }}>
        {[
          { label: "Active Players", value: totalPlayers || "—", accent: color },
          { label: "Sports",         value: sports.length, accent: color },
          { label: "Status",         value: college.status },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "0 28px",
              borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: 56,
              lineHeight: 0.9,
              color: s.accent ?? "#ffffff",
              letterSpacing: "0.02em",
              fontStyle: "italic",
            }}>
              {s.value}
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sport dropdown + action buttons ───────────────────────────────── */}
      <div style={{
        padding: "16px 64px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: "rgba(0,0,0,0.3)",
      }}>
        {/* Sport selector dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={activeSportTab?.id ?? ""}
            onChange={(e) => {
              const next = sports.find((s) => s.id === e.target.value);
              if (next) setActiveSportTab(next);
            }}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              background: "#0a0a0a",
              border: `1px solid ${color}44`,
              borderRadius: 6,
              padding: "9px 36px 9px 14px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: color,
              cursor: "pointer",
              outline: "none",
              minWidth: 220,
            }}
          >
            {sports.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#0a0a0a", color: "#f0f0f0" }}>
                {s.name}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <svg
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: color,
            }}
            width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {isAdmin && (
            <button
              onClick={() => setShowCSV(true)}
              style={{
                padding: "9px 16px",
                background: "transparent",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ↑ Import CSV
            </button>
          )}
          {isAdmin && activeSportTab && (
            <button
              onClick={() => setShowAddPlayer(true)}
              style={{
                padding: "9px 16px",
                background: color,
                color: textOnColor,
                border: "none",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              + Add Player
            </button>
          )}
        </div>
      </div>

      {/* ── Roster — Bold photo-card grid (per teams-college-bold.jsx) ───────── */}
      {activeSportTab && (
        <div style={{ padding: "36px 64px 56px" }}>
          {/* Section label — matches the Bold design's TSectionLabel */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 22,
            color: "#C5A059",
          }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}>
              {activeSportTab?.name} Roster · {isLoadingPlayers ? "…" : `${players.length} ${players.length === 1 ? "PLAYER" : "PLAYERS"}`}
            </span>
          </div>

          {/* Loading skeletons in card grid layout */}
          {isLoadingPlayers ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: "4 / 5",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : players.length === 0 ? (
            /* Empty roster state */
            <div style={{
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "56px 24px",
              textAlign: "center",
              background: "#0a0a0a",
            }}>
              <div style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize: 52,
                color: `${color}22`,
                fontStyle: "italic",
                letterSpacing: "0.05em",
                marginBottom: 12,
              }}>
                NO ROSTER YET
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, marginBottom: 16, letterSpacing: "0.1em" }}>
                No players registered for {activeSportTab?.name} for {college.name}.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddPlayer(true)}
                  style={{
                    padding: "10px 18px",
                    background: color,
                    color: textOnColor,
                    border: "none",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  + Add the first player
                </button>
              )}
            </div>
          ) : (
            /* Bold-style photo card grid */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 18,
            }}>
              {players.map((p, idx) => {
                const fallback = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div
                    key={p.id}
                    className="group transition-transform hover:-translate-y-0.5"
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${p.name}'s profile`}
                    onClick={() => setViewingPlayer(p)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setViewingPlayer(p);
                      }
                    }}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      background: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12,
                      aspectRatio: "4 / 5",
                      cursor: "pointer",
                    }}
                  >
                    {/* Full-bleed photo — falls back to brand-color gradient + initials */}
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt={p.name}
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          filter: "grayscale(0.3) contrast(1.05) brightness(0.85)",
                        }}
                      />
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(135deg, ${color}33 0%, ${fallback.bg} 60%, #050505 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-bebas), sans-serif",
                          fontSize: 92,
                          color: `${color}55`,
                          fontStyle: "italic",
                          letterSpacing: "0.04em",
                        }}>
                          {getInitials(p.name)}
                        </span>
                      </div>
                    )}

                    {/* Bottom gradient — makes name readable on photo */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(5,5,5,0.95) 75%, #0a0a0a 100%)",
                    }} />

                    {/* Brand-color side bar w/ glow */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, bottom: 0,
                      width: 3,
                      background: color,
                      boxShadow: `0 0 16px ${color}99`,
                    }} />

                    {/* Jersey badge — top right */}
                    {p.jersey_number != null && (
                      <div style={{
                        position: "absolute", top: 14, right: 14,
                        padding: "5px 11px",
                        background: color,
                        color: textOnColor,
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 13,
                        fontWeight: 900,
                        borderRadius: 4,
                        letterSpacing: "0.05em",
                      }}>
                        #{p.jersey_number.toString().padStart(2, "0")}
                      </div>
                    )}

                    {/* Delete — admin only, top-left, hover-reveal.
                        stopPropagation prevents the click from bubbling up to
                        the card's onClick and opening the player profile. */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlayer(p.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          position: "absolute", top: 14, left: 22,
                          width: 28, height: 28, borderRadius: 6,
                          background: "rgba(0,0,0,0.7)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        aria-label={`Remove ${p.name}`}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}

                    {/* Content stack — bottom left */}
                    <div style={{
                      position: "absolute", left: 22, right: 22, bottom: 18,
                    }}>
                      <div style={{
                        fontSize: 9,
                        color: color,
                        fontWeight: 900,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}>
                        {activeSportTab?.name}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-bebas), sans-serif",
                        fontSize: 30,
                        lineHeight: 0.95,
                        color: "#ffffff",
                        fontStyle: "italic",
                        letterSpacing: "0.02em",
                      }}>
                        {p.name}
                      </div>
                      {p.position && (
                        <div style={{
                          marginTop: 6,
                          fontSize: 10,
                          color: "rgba(255,255,255,0.55)",
                          fontWeight: 700,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                        }}>
                          {p.position}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
