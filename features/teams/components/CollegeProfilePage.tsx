"use client";
import React, { useState, useEffect, useRef } from "react";
import { College } from "./CollegeRow";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/providers/RoleProvider";

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
const TEXT_ON_COLOR: Record<string, string> = {
  COS: "#0a0a0a",
  CCAD: "#0a0a0a",
};

// ─── DB player shape ─────────────────────────────────────────────────────────
interface DBPlayer {
  id: string;
  name: string;
  college: string;
  sport: string;
  position: string;
  jersey_number: string;
  photo_url: string;
}

const AVATAR_COLORS = [
  { bg: "#1a0a2e", fg: "#c4a9f5" }, { bg: "#0a1a2e", fg: "#a9c4f5" },
  { bg: "#0a2e1a", fg: "#a9f5c4" }, { bg: "#2e1a0a", fg: "#f5c4a9" },
  { bg: "#2e0a0a", fg: "#f5a9a9" }, { bg: "#0a2e2e", fg: "#a9f5f5" },
  { bg: "#2e0a1a", fg: "#f5a9c4" }, { bg: "#2e2e0a", fg: "#f5f5a9" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Sport Lineup Modal ───────────────────────────────────────────────────────
function SportLineupModal({
  college,
  sport,
  accentColor,
  onClose,
  onPlayerChange,
}: {
  college: College;
  sport: string;
  accentColor: string;
  onClose: () => void;
  onPlayerChange?: () => void;
}) {
  const [players, setPlayers] = useState<DBPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", position: "", jersey_number: "", photo_url: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchPlayers(); }, [college.name, sport]);

  async function fetchPlayers() {
    setIsLoading(true);
    const { data, error } = await (supabase as any)
      .from("players")
      .select("*")
      .eq("college", college.name)
      .eq("sport", sport);
    if (!error && data) setPlayers(data);
    setIsLoading(false);
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    setIsSaving(true);
    const { data, error } = await (supabase as any)
      .from("players")
      .insert([{ name: form.name.trim(), college: college.name, sport, position: form.position.trim(), jersey_number: form.jersey_number.trim(), photo_url: form.photo_url.trim() }])
      .select().single();
    if (!error && data) { setPlayers((p) => [...p, data]); setForm({ name: "", position: "", jersey_number: "", photo_url: "" }); setShowForm(false); onPlayerChange?.(); }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    await (supabase as any).from("players").delete().eq("id", id);
    setPlayers((p) => p.filter((x) => x.id !== id));
    onPlayerChange?.();
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/60 outline-none transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        {/* Modal header */}
        <div
          className="px-6 py-5 flex items-start justify-between rounded-t-2xl shrink-0"
          style={{ background: accentColor }}
        >
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1"
               style={{ color: TEXT_ON_COLOR[college.org ?? ""] ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}>
              {college.name}
            </p>
            <h2
              className="text-2xl font-black uppercase leading-none"
              style={{ fontFamily: "var(--font-bebas)", color: TEXT_ON_COLOR[college.org ?? ""] ?? "#fff" }}
            >
              {sport}
            </h2>
            <p className="text-[11px] mt-1"
               style={{ color: TEXT_ON_COLOR[college.org ?? ""] ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)" }}>
              {isLoading ? "Loading…" : `${players.length} ${players.length === 1 ? "player" : "players"} registered`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(0,0,0,0.15)", color: TEXT_ON_COLOR[college.org ?? ""] ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)" }}
            >
              + Add Player
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors"
              style={{ background: "rgba(0,0,0,0.15)", color: TEXT_ON_COLOR[college.org ?? ""] ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add player form */}
        {showForm && (
          <div className="px-6 py-4 border-b border-white/6 bg-[#0d0d0d] shrink-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-3">New Player</p>
            <div className="flex gap-2 flex-wrap">
              <input className={inp} style={{ flex: "2 1 160px" }} placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <input className={inp} style={{ flex: "1 1 100px" }} placeholder="Position" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
              <input className={inp} style={{ flex: "1 1 80px" }} placeholder="Jersey #" value={form.jersey_number} onChange={(e) => setForm((f) => ({ ...f, jersey_number: e.target.value }))} />
              <input className={inp} style={{ flex: "2 1 200px" }} placeholder="Photo URL (optional)" value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} />
              <button
                onClick={handleAdd}
                disabled={!form.name.trim() || isSaving}
                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: accentColor, color: TEXT_ON_COLOR[college.org ?? ""] ?? "#fff" }}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ name: "", position: "", jersey_number: "", photo_url: "" }); }}
                className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Lineup list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-4">
            Lineup <span style={{ color: accentColor }}>{players.length}</span>
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/4 border border-white/5 rounded-lg h-14 animate-pulse" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-2xl mb-3">🏅</p>
              <p className="text-white/40 text-sm">No players listed for {sport} yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm hover:underline" style={{ color: accentColor }}>+ Add the first player</button>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((p, idx) => {
                const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div key={p.id} className="bg-white/3 border border-white/6 hover:border-white/12 transition-colors rounded-lg px-4 py-3 flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 overflow-hidden" style={{ background: c.bg, color: c.fg }}>
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                        : getInitials(p.name)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-bold truncate">{p.name}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{sport}</p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest flex-shrink-0" style={{ color: accentColor }}>
                      {p.position || "—"}
                    </p>
                    {p.jersey_number && (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}>
                        <span className="text-[10px] font-black" style={{ color: accentColor }}>#{p.jersey_number}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 hover:bg-white/6"
                    >
                      <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/6 flex justify-end shrink-0">
          <button onClick={onClose} className="text-[10px] font-bold text-white/35 hover:text-white uppercase tracking-widest transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
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
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showCSV, setShowCSV] = useState(false);
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const [activeSportTab, setActiveSportTab] = useState<string | null>(null);

  const org = college.org ?? "";
  const identity = COLLEGE_IDENTITY[org] ?? { mascot: college.name.toUpperCase(), color: "#A91D3A", tagline: "", photo: "", logo: "" };
  const { mascot, color, tagline, photo, logo } = identity;
  const textOnColor = TEXT_ON_COLOR[org] ?? "#ffffff";

  const fetchCounts = async () => {
    const { data } = await (supabase as any)
      .from("players")
      .select("sport")
      .eq("college", college.name);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((r: { sport: string }) => {
        counts[r.sport] = (counts[r.sport] || 0) + 1;
      });
      setPlayerCounts(counts);
    }
  };

  useEffect(() => {
    fetchCounts();
    if (college.sports.length > 0) setActiveSportTab(college.sports[0]);
  }, [college.name]);

  const handleImportPlayers = async (rows: PlayerCSVRow[]) => {
    for (const row of rows) {
      await (supabase as any).from("players").insert([{
        name: row.name,
        college: college.name,
        sport: row.sport,
        position: row.position,
        jersey_number: row.jersey_number,
      }]);
    }
    fetchCounts();
  };

  const totalPlayers = Object.values(playerCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f0f0f0" }}>
      {/* Modals */}
      {selectedSport && (
        <SportLineupModal
          college={college}
          sport={selectedSport}
          accentColor={color}
          onClose={() => setSelectedSport(null)}
          onPlayerChange={fetchCounts}
        />
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
      <div style={{
        padding: "32px 64px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
        background: "#0a0a0a",
      }}>
        {[
          { label: "Active Players", value: totalPlayers || "—", accent: color },
          { label: "Active Teams",   value: college.activeTeams },
          { label: "Sports",         value: college.sports.length, accent: color },
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

      {/* ── Sport tabs + action buttons ────────────────────────────────────── */}
      <div style={{
        padding: "16px 64px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: "rgba(0,0,0,0.3)",
        overflowX: "auto",
      }}>
        <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
          {college.sports.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSportTab(s)}
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: activeSportTab === s ? color : "rgba(255,255,255,0.4)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: "none",
                border: "none",
                borderBottom: activeSportTab === s ? `2px solid ${color}` : "2px solid transparent",
                paddingBottom: 8,
                cursor: "pointer",
                transition: "color 0.15s",
                flexShrink: 0,
              }}
            >
              {s}
            </button>
          ))}
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
          {activeSportTab && (
            <button
              onClick={() => setSelectedSport(activeSportTab)}
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
              + View Lineup
            </button>
          )}
        </div>
      </div>

      {/* ── Sports grid ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "36px 64px 40px" }}>
        {/* Section label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
          color: "#C5A059",
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}>
            SPORTS & LINEUPS · {college.sports.length} SPORTS
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}>
          {college.sports.map((sport) => {
            const count = playerCounts[sport] ?? 0;
            const isActive = activeSportTab === sport;
            return (
              <button
                key={sport}
                onClick={() => { setActiveSportTab(sport); setSelectedSport(sport); }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: isActive ? `${color}14` : "#0a0a0a",
                  border: `1px solid ${isActive ? color + "44" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}33`;
                    (e.currentTarget as HTMLButtonElement).style.background = "#0d0d0d";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLButtonElement).style.background = "#0a0a0a";
                  }
                }}
              >
                {/* Color accent left edge */}
                <div style={{
                  position: "absolute",
                  top: 0, bottom: 0, left: 0,
                  width: 3,
                  background: isActive ? color : "transparent",
                  borderRadius: "10px 0 0 10px",
                  transition: "background 0.15s",
                }} />

                <div style={{ paddingLeft: 4 }}>
                  <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                    marginBottom: 4,
                  }}>
                    {sport}
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: isActive ? color : "rgba(255,255,255,0.3)",
                    fontWeight: 600,
                  }}>
                    {count} {count === 1 ? "player" : "players"}
                  </p>
                </div>

                <div style={{
                  alignSelf: "flex-start",
                  marginLeft: 4,
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: isActive ? color : "rgba(255,255,255,0.2)",
                }}>
                  View Lineup →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
