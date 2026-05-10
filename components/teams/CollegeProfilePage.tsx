"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { College } from "./CollegeRow";
import { supabase } from "@/lib/supabase/client";

interface DBPlayer {
  id: string;
  name: string;
  college: string;
  sport: string;
  position: string;
  jersey_number: string;
  photo_url: string;
}

const LEGACY_PLAYERS: Record<string, { name: string; sport: string; position: string; year: string; color: string }[]> = {
  "College of Engineering": [
    { name: "Marco Reyes", sport: "Basketball", position: "PG", year: "3rd Year", color: "#A91D3A" },
    { name: "Luis Santos", sport: "Basketball", position: "SF", year: "2nd Year", color: "#C5A059" },
    { name: "Dana Cruz", sport: "Esports", position: "Mid", year: "4th Year", color: "#3b82f6" },
    { name: "Raf Dizon", sport: "Esports", position: "ADC", year: "1st Year", color: "#3b82f6" },
    { name: "Mia Lim", sport: "Basketball", position: "PF", year: "3rd Year", color: "#A91D3A" },
  ],
  "Arts & Sciences": [
    { name: "Cara Mendoza", sport: "Volleyball", position: "Setter", year: "2nd Year", color: "#8b5cf6" },
    { name: "Jana Torres", sport: "Volleyball", position: "Libero", year: "3rd Year", color: "#8b5cf6" },
    { name: "Leo Bautista", sport: "Debate", position: "1st Speaker", year: "4th Year", color: "#C5A059" },
    { name: "Sam Flores", sport: "Debate", position: "2nd Speaker", year: "2nd Year", color: "#C5A059" },
    { name: "Pia Garcia", sport: "Volleyball", position: "OH", year: "1st Year", color: "#8b5cf6" },
  ],
  "Business School": [
    { name: "Rico Tan", sport: "Basketball", position: "SG", year: "3rd Year", color: "#A91D3A" },
    { name: "Bea Ong", sport: "Football", position: "FW", year: "2nd Year", color: "#10b981" },
    { name: "Nino Ramos", sport: "Football", position: "MF", year: "3rd Year", color: "#10b981" },
    { name: "Tia Villanueva", sport: "Basketball", position: "C", year: "1st Year", color: "#A91D3A" },
  ],
  "College of Medicine": [
    { name: "Doc Rivera", sport: "Badminton", position: "Singles", year: "5th Year", color: "#f59e0b" },
    { name: "Ana Soriano", sport: "Tennis", position: "Doubles", year: "4th Year", color: "#3b82f6" },
    { name: "Josh Dela Cruz", sport: "Badminton", position: "Doubles", year: "3rd Year", color: "#f59e0b" },
  ],
};

const AVATAR_COLORS = [
  { bg: "#1a0a2e", fg: "#c4a9f5" }, { bg: "#0a1a2e", fg: "#a9c4f5" },
  { bg: "#0a2e1a", fg: "#a9f5c4" }, { bg: "#2e1a0a", fg: "#f5c4a9" },
  { bg: "#2e0a0a", fg: "#f5a9a9" }, { bg: "#0a2e2e", fg: "#a9f5f5" },
  { bg: "#2e0a1a", fg: "#f5a9c4" }, { bg: "#2e2e0a", fg: "#f5f5a9" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Sport Lineup Modal ──────────────────────────────────────────────────────
function SportLineupModal({
  college,
  sport,
  onClose,
  onPlayerChange,
}: {
  college: College;
  sport: string;
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
    const { data } = await supabase.auth.getSession();
    console.log(data.session);
    const { data: insertData, error } = await (supabase as any)
      .from("players")
      .insert([{ name: form.name.trim(), college: college.name, sport, position: form.position.trim(), jersey_number: form.jersey_number.trim(), photo_url: form.photo_url.trim() }])
      .select().single();
    if (!error && insertData) {
      setPlayers((p) => [...p, insertData]);
      setForm({ name: "", position: "", jersey_number: "", photo_url: "" });
      setShowForm(false);
      onPlayerChange?.();
      toast.success(`${form.name.trim()} added to ${sport}`);
    } else {
      toast.error("Failed to add player" + (error ? `: ${error.message}` : ""));
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    const player = players.find((p) => p.id === id);
    const { error } = await (supabase as any).from("players").delete().eq("id", id);
    if (!error) {
      setPlayers((p) => p.filter((x) => x.id !== id));
      onPlayerChange?.();
      toast.success(`${player?.name ?? "Player"} removed`);
    } else {
      toast.error("Failed to remove player: " + error.message);
    }
  }

  const inp = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        {/* Modal Header */}
        <div className="bg-primary px-6 py-5 flex items-start justify-between rounded-t-2xl shrink-0">
          <div>
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">{college.name}</p>
            <h2 className="text-2xl font-black text-white uppercase leading-none" style={{ fontFamily: 'var(--font-heading)' }}>{sport}</h2>
            <p className="text-[11px] text-white/40 mt-1">
              {isLoading ? "Loading..." : `${players.length} ${players.length === 1 ? "player" : "players"} registered`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="text-[9px] font-bold text-white/70 hover:text-white uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              + Add Player
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add Player Form */}
        {showForm && (
          <div className="px-6 py-4 border-b border-border/60 bg-card shrink-0">
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">New Player</p>
            <div className="flex gap-2 flex-wrap">
              <input className={inp} style={{ flex: "2 1 160px" }} placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <input className={inp} style={{ flex: "1 1 100px" }} placeholder="Position" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} />
              <input className={inp} style={{ flex: "1 1 80px" }} placeholder="Jersey #" value={form.jersey_number} onChange={(e) => setForm((f) => ({ ...f, jersey_number: e.target.value }))} />
              <input className={inp} style={{ flex: "2 1 200px" }} placeholder="Photo URL (optional)" value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} />
              <button onClick={handleAdd} disabled={!form.name.trim() || isSaving} className="bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex-shrink-0">
                {isSaving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ name: "", position: "", jersey_number: "", photo_url: "" }); }} className="border border-border hover:border-border/80 text-muted-foreground hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex-shrink-0">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Lineup */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">
            Lineup <span className="text-primary">{players.length}</span>
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-14 animate-pulse" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-2xl mb-3">🏅</p>
              <p className="text-muted-foreground/60 text-sm">No players listed for {sport} yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-primary text-xs hover:underline">+ Add the first player</button>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((p, idx) => {
                const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div key={p.id} className="bg-card border border-border hover:border-primary/30 transition-colors rounded-lg px-4 py-3 flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 overflow-hidden" style={{ background: c.bg, color: c.fg }}>
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                        : getInitials(p.name)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-bold truncate">{p.name}</p>
                      <p className="text-muted-foreground text-[10px] mt-0.5">{sport}</p>
                    </div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest flex-shrink-0">{p.position || "—"}</p>
                    {p.jersey_number && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-primary">#{p.jersey_number}</span>
                      </div>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 flex justify-end shrink-0">
          <button onClick={onClose} className="text-[10px] font-bold text-muted-foreground/60 hover:text-white uppercase tracking-widest transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Player CSV Import Modal ─────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border/60 shrink-0">
          <div>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-0.5">{college.name}</p>
            <h2 className="text-base font-bold text-white">Import Players via CSV</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Bulk add players to this college.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate} className="text-[9px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors border border-border hover:border-primary/30 px-3 py-1.5 rounded-lg">
              ↓ Template
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted-foreground hover:text-white text-sm">✕</button>
          </div>
        </div>

        {/* Drop Zone */}
        {rows.length === 0 && (
          <div className="px-6 py-6 shrink-0">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragging ? "border-primary/60 bg-primary/5" : "border-border hover:border-border/80 bg-card/80"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-lg">👤</div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Drop your CSV file here</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">or click to browse — .csv files only</p>
              </div>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Required columns: name, sport, position, jersey_number</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <>
            <div className="px-6 pt-4 pb-2 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{fileName}</span>
                <span className="text-[9px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">{validRows.length} valid</span>
                {errorRows.length > 0 && <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{errorRows.length} errors</span>}
              </div>
              <button onClick={() => { setRows([]); setFileName(""); }} className="text-[9px] text-muted-foreground/60 hover:text-white uppercase tracking-widest font-bold transition-colors">Change file</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 pb-2">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/60">
                    {["Name","Sport","Position","Jersey",""].map((h) => (
                      <th key={h} className="text-left py-2 pr-3 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-border/40 ${row.error ? "bg-primary/3" : ""}`}>
                      <td className="py-2 pr-3 font-semibold text-white">{row.name || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/90">{row.sport || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/80">{row.position || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/80">{row.jersey_number || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2">
                        {row.error
                          ? <span className="text-[9px] text-primary font-semibold">{row.error}</span>
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

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border/60 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:border-border/80 hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!validRows.length || isImporting}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {isImporting ? "Importing…" : `Import ${validRows.length} Player${validRows.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── College Profile Page ────────────────────────────────────────────────────
export function CollegeProfilePage({
  college,
  onBack,
}: {
  college: College;
  onBack: () => void;
}) {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showCSV, setShowCSV] = useState(false);
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});
  const [allSports, setAllSports] = useState<string[]>([]);

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

  useEffect(() => { fetchCounts(); }, [college.name]);

  useEffect(() => {
    async function fetchSports() {
      const { data, error } = await (supabase as any)
        .from("sports")
        .select("name")
        .order("name", { ascending: true });
      if (!error && data) setAllSports(data.map((s: { name: string }) => s.name));
    }
    fetchSports();
  }, []);

  const handleImportPlayers = async (rows: PlayerCSVRow[]) => {
    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      const { error } = await (supabase as any).from("players").insert([{
        name: row.name,
        college: college.name,
        sport: row.sport,
        position: row.position,
        jersey_number: row.jersey_number,
      }]);
      if (!error) imported++;
      else failed++;
    }
    fetchCounts();
    if (imported > 0) toast.success(`Imported ${imported} player${imported !== 1 ? "s" : ""} successfully`);
    if (failed > 0) toast.error(`${failed} player${failed !== 1 ? "s" : ""} failed to import`);
  };

  const sportGroups = allSports.map((sport) => ({
    name: sport,
    playerCount: playerCounts[sport] || 0,
  }));

  const totalPlayers = Object.values(playerCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Sport Lineup Modal */}
      {selectedSport && (
        <SportLineupModal
          college={college}
          sport={selectedSport}
          onClose={() => setSelectedSport(null)}
          onPlayerChange={fetchCounts}
        />
      )}
      {/* Player CSV Import Modal */}
      {showCSV && (
        <PlayerCSVModal
          college={college}
          onClose={() => setShowCSV(false)}
          onImport={handleImportPlayers}
        />
      )}

      {/* Maroon accent band */}
      <div className="h-1 bg-primary w-full flex-shrink-0" />

      {/* Hero */}
      <div className="bg-card border-b border-border/60 px-9 pt-8 pb-8 relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest">
          <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors">← Go back</button>
          <span className="text-muted-foreground/40">›</span>
          <span className="text-white">{college.name}</span>
        </div>

        <div className="flex items-center gap-7">
          <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center flex-shrink-0 text-3xl font-black text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            {college.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2 ${
              college.status === "Active" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/8"
              : college.status === "Pending" ? "text-yellow-400 border-yellow-400/25 bg-yellow-400/8"
              : "text-white/20 border-white/10 bg-white/3"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${college.status === "Active" ? "bg-emerald-400" : college.status === "Pending" ? "bg-yellow-400" : "bg-white/20"}`} />
              {college.status}
            </div>
            <h1 className="text-white text-4xl uppercase leading-none tracking-wide mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
              {college.name}
            </h1>
            <p className="text-muted-foreground text-xs tracking-wider">Est. {college.established} · Participating since Season 1</p>
          </div>

          <div className="flex border border-border/60 rounded-xl overflow-hidden flex-shrink-0">
            {[
              { val: totalPlayers, label: "Players" },
              { val: college.activeTeams, label: "Teams" },
              { val: allSports.length, label: "Sports", accent: true },
              { val: 3, label: "Wins" },
            ].map(({ val, label, accent }, i) => (
              <div key={label} className={`px-5 py-4 bg-card/80 text-center ${i < 3 ? "border-r border-border/60" : ""}`}>
                <div className={`text-2xl font-black ${accent ? "text-primary" : "text-white"}`} style={{ fontFamily: 'var(--font-heading)' }}>{val}</div>
                <div className="text-muted-foreground text-[9px] uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        <div className="flex-1 px-9 py-7 border-r border-border/60 min-w-0">
          <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-4">
            Sports <span className="text-primary">{allSports.length}</span>
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {sportGroups.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSport(s.name)}
                className="bg-card border border-border/60 hover:border-primary/40 hover:-translate-y-0.5 rounded-lg px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[12px] font-bold">{s.name}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    {s.playerCount} {s.playerCount === 1 ? "player" : "players"}
                  </p>
                </div>
                <svg className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="w-72 px-6 py-7 flex-shrink-0">
          <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mb-4">College Info</p>
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            {[
              { key: "Established", val: college.established },
              { key: "Active Teams", val: college.activeTeams },
              { key: "Sports", val: allSports.length },
            ].map(({ key, val }, i) => (
              <div key={key} className={`flex items-center justify-between px-4 py-3 ${i < 2 ? "border-b border-border/40" : ""}`}>
                <span className="text-[10px] text-muted-foreground font-semibold">{key}</span>
                <span className="text-[11px] text-white font-bold">{val}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground font-semibold">Status</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                college.status === "Active" ? "text-emerald-400 border-emerald-400/25 bg-emerald-400/8"
                : college.status === "Pending" ? "text-yellow-400 border-yellow-400/25 bg-yellow-400/8"
                : "text-white/20 border-white/10"
              }`}>{college.status}</span>
            </div>
          </div>
          <button
            onClick={() => setShowCSV(true)}
            className="mt-3 w-full bg-card hover:bg-card border border-border hover:border-border/80 text-muted-foreground hover:text-white rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            ↑ Import CSV
          </button>
        </div>
      </div>
    </div>
  );
}