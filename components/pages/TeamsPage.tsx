"use client";
import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import type { Player } from "@/types";
import { SPORTS, COLLEGES, POSITIONS_BY_SPORT, resizeImageFile, exportCSV, csvEscape } from "@/lib/dataManager";

interface TeamsPageProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, "id" | "createdAt">) => void;
  onDeletePlayer: (id: number) => void;
  onDeleteAllPlayers: () => void;
  onImportPlayers: (players: Omit<Player, "id" | "createdAt">[]) => void;
  onUpdatePlayerStatus: (id: number, status: EligibilityStatus) => void;
}

const emptyForm = { name: "", teamId: "", college: "", sport: "", position: "", jersey: "", photoDataUrl: "" };

const COLLEGE_META: Record<string, { emoji: string; meta: string; color: string; bg: string }> = {
  "COS Scions":    { emoji: "🎯", meta: "College of Science",                      color: "#1d4ed8", bg: "#eff6ff" },
  "SOM Tycoons":   { emoji: "💼", meta: "School of Management",                    color: "#047857", bg: "#f0fdf4" },
  "CSS Stallions": { emoji: "🐴", meta: "College of Social Sciences",              color: "#7c3aed", bg: "#f5f3ff" },
  "CCAD Phoenix":  { emoji: "🔥", meta: "College of Communication, Arts & Design", color: "#b45309", bg: "#fffbeb" },
};

// ── Eligibility ──────────────────────────────────────────────────────────────
export type EligibilityStatus = "in_review" | "eligible" | "ineligible";

const ELIGIBILITY_META: Record<EligibilityStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  in_review:  { label: "In Review",  color: "#92400e", bg: "#fffbeb", border: "#fcd34d", dot: "#f59e0b" },
  eligible:   { label: "Eligible",   color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981" },
  ineligible: { label: "Ineligible", color: "#991b1b", bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444" },
};

function EligibilityBadge({ status, size = "sm" }: { status: EligibilityStatus; size?: "sm" | "md" }) {
  const m = ELIGIBILITY_META[status];
  return (
    <span style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"}`}>
      <span style={{ background: m.dot }} className="w-1.5 h-1.5 rounded-full shrink-0" />
      {m.label}
    </span>
  );
}

function getInitialsColor(name: string) {
  const colors = ["#A91D3A","#1d4ed8","#047857","#7c3aed","#b45309","#0e7490","#be185d","#15803d"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Image Crop Modal ───────────────────────────────────────────────────────
interface CropModalProps {
  src: string;
  onDone: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

function CropModal({ src, onDone, onCancel }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // crop box state (in display px, relative to image render area)
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [dragging, setDragging] = useState<{ type: "move" | "resize"; startX: number; startY: number; origCrop: typeof crop } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Once image loads, initialise crop to centre square
  const handleImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const { offsetWidth: w, offsetHeight: h } = img;
    const size = Math.round(Math.min(w, h) * 0.75);
    setCrop({ x: Math.round((w - size) / 2), y: Math.round((h - size) / 2), size });
    setImgLoaded(true);
  }, []);

  // Mouse / touch helpers
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const onMouseDown = (e: React.MouseEvent, type: "move" | "resize") => {
    e.preventDefault();
    setDragging({ type, startX: e.clientX, startY: e.clientY, origCrop: { ...crop } });
  };

  useEffect(() => {
    if (!dragging) return;
    const img = imgRef.current;
    if (!img) return;
    const { offsetWidth: imgW, offsetHeight: imgH } = img;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      const { origCrop } = dragging;
      if (dragging.type === "move") {
        setCrop({
          ...origCrop,
          x: clamp(origCrop.x + dx, 0, imgW - origCrop.size),
          y: clamp(origCrop.y + dy, 0, imgH - origCrop.size),
        });
      } else {
        // resize: drag bottom-right handle, keep square
        const delta = (dx + dy) / 2;
        const newSize = clamp(origCrop.size + delta, 40, Math.min(imgW - origCrop.x, imgH - origCrop.y));
        setCrop({ ...origCrop, size: Math.round(newSize) });
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  // Commit: draw crop to canvas and export as JPEG dataURL
  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    // Scale factor: natural vs rendered
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    const canvas = document.createElement("canvas");
    const OUTPUT = 600;
    canvas.width = OUTPUT; canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY,
      crop.size * scaleX, crop.size * scaleY,
      0, 0, OUTPUT, OUTPUT
    );
    onDone(canvas.toDataURL("image/jpeg", 0.88));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#A91D3A] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-base">Crop Photo</h3>
            <p className="text-white/70 text-xs mt-0.5">Drag to reposition · drag ◢ to resize · 1:1 ratio enforced</p>
          </div>
          <button onClick={onCancel} className="w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-sm transition-all">✕</button>
        </div>

        {/* Canvas area */}
        <div className="p-4 bg-gray-50 flex items-center justify-center min-h-[280px]">
          <div ref={containerRef} className="relative inline-block select-none overflow-hidden rounded-lg shadow-inner" style={{ maxWidth: "100%", maxHeight: 380 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="crop"
              onLoad={handleImgLoad}
              className="block max-w-full"
              style={{ maxHeight: 380, userSelect: "none", pointerEvents: "none" }}
              draggable={false}
            />
            {imgLoaded && (
              <>
                {/* Dark overlay outside crop */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: imgRef.current?.offsetWidth, height: imgRef.current?.offsetHeight }}>
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <rect x={crop.x} y={crop.y} width={crop.size} height={crop.size} fill="black" rx="4" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
                </svg>

                {/* Crop box */}
                <div
                  className="absolute border-2 border-white rounded cursor-move"
                  style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size, boxShadow: "0 0 0 1px rgba(0,0,0,0.4)" }}
                  onMouseDown={e => onMouseDown(e, "move")}
                >
                  {/* Rule-of-thirds guides */}
                  <div className="absolute inset-0 pointer-events-none" style={{ borderRight: "1px solid rgba(255,255,255,0.35)", borderLeft: "1px solid rgba(255,255,255,0.35)", borderTop: "none", borderBottom: "none", left: "33.3%", right: "33.3%" }} />
                  <div className="absolute inset-0 pointer-events-none" style={{ borderBottom: "1px solid rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.35)", borderLeft: "none", borderRight: "none", top: "33.3%", bottom: "33.3%" }} />

                  {/* Corner handles */}
                  {[["top-0 left-0 -translate-x-1/2 -translate-y-1/2","cursor-nw-resize"],
                    ["top-0 right-0 translate-x-1/2 -translate-y-1/2","cursor-ne-resize"],
                    ["bottom-0 left-0 -translate-x-1/2 translate-y-1/2","cursor-sw-resize"]].map(([pos], i) => (
                    <div key={i} className={`absolute w-3 h-3 bg-white border-2 border-[#A91D3A] rounded-sm ${pos}`} style={{ pointerEvents: "none" }} />
                  ))}

                  {/* Resize handle (bottom-right) */}
                  <div
                    className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-5 h-5 bg-[#A91D3A] rounded-full flex items-center justify-center cursor-se-resize text-white text-[10px] font-black shadow-lg z-10"
                    onMouseDown={e => { e.stopPropagation(); onMouseDown(e, "resize"); }}
                  >◢</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview + actions */}
        <div className="px-6 py-4 flex items-center gap-4 border-t border-gray-100">
          {/* Live 1:1 preview */}
          <div className="shrink-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 text-center">Preview</p>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 relative">
              {imgLoaded && imgRef.current && (
                <img
                  src={src}
                  alt="preview"
                  style={{
                    position: "absolute",
                    width: `${(imgRef.current.offsetWidth / crop.size) * 56}px`,
                    height: `${(imgRef.current.offsetHeight / crop.size) * 56}px`,
                    left: `${-(crop.x / crop.size) * 56}px`,
                    top: `${-(crop.y / crop.size) * 56}px`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex-1 flex gap-2 justify-end">
            <button onClick={onCancel} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all">Cancel</button>
            <button onClick={handleCrop} className="px-5 py-2.5 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-lg text-sm font-semibold transition-all shadow-sm">Apply Crop</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Parse rows helper ────────────────────────────────────────────────────────
function parseRows(rows: Record<string, string>[]): Omit<Player, "id" | "createdAt">[] {
  return rows.map(obj => ({
    teamId: "0",
    name: obj.name || obj.Name || obj.NAME || "",
    college: obj.college || obj.College || obj.COLLEGE || "",
    sport: obj.sport || obj.Sport || obj.SPORT || "",
    position: obj.position || obj.Position || obj.POSITION || "",
    jersey: parseInt(obj.jersey || obj.Jersey || obj.JERSEY || "0") || 0,
    photo: null,
  })).filter(p => p.name.trim() !== "");
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function TeamsPage({ players, onAddPlayer, onDeletePlayer, onDeleteAllPlayers, onImportPlayers, onUpdatePlayerStatus }: TeamsPageProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);       // raw src waiting to be cropped
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; all: boolean }>({ open: false, id: null, all: false });
  const [formDragging, setFormDragging] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importDragging, setImportDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<Omit<Player, "id" | "createdAt">[] | null>(null);
  const [importError, setImportError] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const [exportModal, setExportModal] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [galleryCollege, setGalleryCollege] = useState<string | null>(null);
  const [gallerySport, setGallerySport] = useState<string | null>(null);
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white text-black";
  const labelCls = "block text-sm font-medium text-black mb-2";

  const positions = useMemo(() => {
    if (!form.sport) return [];
    return POSITIONS_BY_SPORT[form.sport] || POSITIONS_BY_SPORT[form.sport.split(" ")[0]] || ["Player", "Other"];
  }, [form.sport]);

  const filteredSorted = useMemo(() => {
    const q = search.toLowerCase();
    return players
      .filter(p => (!q || p.name.toLowerCase().includes(q)) && (!filterCollege || p.college === filterCollege) && (!filterSport || p.sport === filterSport))
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const getVal = (obj: Player): string | number => {
          switch (sortKey) {
            case "name": return obj.name; case "college": return obj.college;
            case "sport": return obj.sport; case "jersey": return obj.jersey;
            case "position": return obj.position;
            case "eligibilityStatus": return (obj as any).eligibilityStatus ?? "in_review";
            default: return "";
          }
        };
        const va = getVal(a), vb = getVal(b);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
  }, [players, search, filterCollege, filterSport, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / perPage));
  const pageItems = filteredSorted.slice((page - 1) * perPage, page * perPage);

  const sportsForCollege = useMemo(() => {
    if (!galleryCollege) return [];
    return [...new Set(players.filter(p => p.college === galleryCollege).map(p => p.sport))].filter(Boolean).sort();
  }, [players, galleryCollege]);

  const galleryPlayers = useMemo(() => {
    if (!galleryCollege || !gallerySport) return [];
    return players.filter(p => p.college === galleryCollege && p.sport === gallerySport);
  }, [players, galleryCollege, gallerySport]);

  const sportCount = useCallback((college: string, sport: string) =>
    players.filter(p => p.college === college && p.sport === sport).length, [players]);

  // Read file -> open crop modal
  const openCropForFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target!.result as string);
    reader.readAsDataURL(file);
  }, []);

  // After crop confirmed
  const handleCropDone = useCallback((dataUrl: string) => {
    setCropSrc(null);
    setPhotoPreview(dataUrl);
    setForm(f => ({ ...f, photoDataUrl: dataUrl }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    const jerseyNum = parseInt(form.jersey, 10);
    if (!form.name || !form.college || !form.sport || !form.position || form.jersey === "") { setFormError("All required fields must be filled."); return; }
    if (isNaN(jerseyNum) || jerseyNum < 0) { setFormError("Enter a valid jersey number."); return; }
    const dup = players.find(p => p.college === form.college && p.sport === form.sport && p.jersey === jerseyNum);
    if (dup) { setFormError(`Jersey ${jerseyNum} is already taken by ${dup.name}.`); return; }
    onAddPlayer({ name: form.name, teamId: form.teamId, college: form.college, sport: form.sport, position: form.position, jersey: jerseyNum, photo: form.photoDataUrl || null });
    setForm({ ...emptyForm }); setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = "";
  };

  // ── Import ──
  const processImportFile = (file: File) => {
    setImportError(""); setImportPreview(null); setImportFileName(file.name);
    const isXlsx = /\.(xlsx|xls)$/i.test(file.name);
    const isCsv = /\.csv$/i.test(file.name);
    if (!isXlsx && !isCsv) { setImportError("Please upload a .csv, .xlsx, or .xls file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let rows: Record<string, string>[] = [];
        if (isXlsx) {
          const data = new Uint8Array(ev.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        } else {
          const text = ev.target!.result as string;
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = lines.shift()!.split(",").map(h => h.trim().replace(/^"|"$/g, ""));
          rows = lines.map(line => {
            const cols = line.split(","); const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = cols[i]?.replace(/^"|"$/g, "").trim() || ""; });
            return obj;
          });
        }
        const parsed = parseRows(rows);
        if (parsed.length === 0) { setImportError("No valid rows found. Make sure columns are: name, college, sport, position, jersey."); return; }
        setImportPreview(parsed);
      } catch { setImportError("Could not parse file. Please use the template format."); }
    };
    if (isXlsx) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importPreview) return;
    onImportPlayers(importPreview);
    setImportModal(false); setImportPreview(null); setImportFileName(""); setImportError("");
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const downloadTemplate = (format: "csv" | "xlsx") => {
    const headers = ["name", "college", "sport", "position", "jersey"];
    const example = [["Juan dela Cruz", "COS Scions", "Basketball Men", "Point Guard", "7"]];
    if (format === "csv") {
      const blob = new Blob([[headers.join(","), ...example.map(r => r.join(","))].join("\n")], { type: "text/csv" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "players_template.csv"; a.click();
    } else {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Players");
      XLSX.writeFile(wb, "players_template.xlsx");
    }
  };

  // ── Export ──
  const handleExportCSV = () => {
    const headers = ["id","name","college","sport","position","jersey","createdAt"];
    exportCSV(headers, players.map(p => headers.map(h => { const row: Record<string, unknown> = { id: p.id, name: p.name, college: p.college, sport: p.sport, position: p.position, jersey: p.jersey, createdAt: p.createdAt }; return csvEscape(row[h]); })), "players.csv");
    setExportModal(false);
  };

  const handleExportXLSX = () => {
    const data = players.map(p => ({ ID: p.id, Name: p.name, College: p.college, Sport: p.sport, Position: p.position, Jersey: p.jersey, "Created At": p.createdAt }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Players");
    XLSX.writeFile(wb, "players.xlsx");
    setExportModal(false);
  };

  const handleSort = (key: string) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } setPage(1); };

  const PlayerAvatar = ({ player, size = "lg" }: { player: Player; size?: "sm" | "lg" }) => {
    const bg = getInitialsColor(player.name);
    if (player.photo) return <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />;
    return (
      <div className="w-full h-full flex items-center justify-center font-bold text-white" style={{ background: bg, fontSize: size === "lg" ? "2rem" : "0.8rem" }}>
        {getInitials(player.name)}
      </div>
    );
  };

  return (
    <div>
      {/* ── Crop Modal (renders on top of everything) ── */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onDone={handleCropDone}
          onCancel={() => { setCropSrc(null); if (photoRef.current) photoRef.current.value = ""; }}
        />
      )}

      {/* ── Add Player Form ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Add New Player</h3>
        {formError && <div className="mb-4 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-md border border-red-100">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className={labelCls}>Player Name *</label><input type="text" className={inputCls} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className={labelCls}>College *</label><select className={inputCls} value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} required><option value="">Select College</option>{COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className={labelCls}>Sport *</label><select className={inputCls} value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value, position: "" })} required><option value="">Select Sport</option>{SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div><label className={labelCls}>Position *</label><select className={inputCls} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required><option value="">Select Position</option>{positions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className={labelCls}>Jersey Number *</label><input type="number" min="0" className={inputCls} placeholder="e.g., 7" value={form.jersey} onChange={e => setForm({ ...form, jersey: e.target.value })} required /></div>
            <div>
              <label className={labelCls}>Player Photo <span className="text-gray-400 font-normal">(optional · 1:1 crop)</span></label>
              {!photoPreview ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors text-center ${formDragging ? "border-[#A91D3A] bg-[#A91D3A]/5" : "border-gray-200 hover:border-[#A91D3A] hover:bg-gray-50"}`}
                  onDragOver={e => { e.preventDefault(); setFormDragging(true); }}
                  onDragLeave={() => setFormDragging(false)}
                  onDrop={e => { e.preventDefault(); setFormDragging(false); const f = e.dataTransfer.files[0]; if (f) openCropForFile(f); }}
                  onClick={() => photoRef.current?.click()}
                >
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) openCropForFile(f); }} />
                  <div className="text-2xl mb-1">🖼</div>
                  <p className="text-xs text-gray-400">Drag & drop or <span className="text-[#A91D3A] font-semibold">click to select</span></p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Will open crop tool · saved as 1:1</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={() => photoRef.current?.click()}
                      className="px-3 py-1.5 bg-[#A91D3A]/10 hover:bg-[#A91D3A]/20 text-[#A91D3A] rounded-lg text-xs font-semibold transition-all">
                      ✂ Re-crop
                    </button>
                    <button type="button" onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photoDataUrl: "" })); if (photoRef.current) photoRef.current.value = ""; }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold transition-all">
                      Remove
                    </button>
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) openCropForFile(f); }} />
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="px-5 py-2 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-md text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-sm">Add Player</button>
        </form>
      </div>

      {/* ── Player Gallery ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[#A91D3A] text-lg font-semibold">Player Gallery</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{players.length} total players</span>
        </div>
        <p className="text-sm text-gray-400 mb-5">Select a college, then a sport to view the roster.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {COLLEGES.map(key => {
            const info = COLLEGE_META[key] ?? { emoji: "🏫", meta: key, color: "#A91D3A", bg: "#fff" };
            const count = players.filter(p => p.college === key).length;
            const active = galleryCollege === key;
            return (
              <button key={key} onClick={() => { setGalleryCollege(key === galleryCollege ? null : key); setGallerySport(null); setModalPlayer(null); }}
                className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none ${active ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/25" : "bg-white border-gray-200 hover:border-[#A91D3A] hover:shadow-md"}`}>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</span>
                <div className="text-2xl mb-2">{info.emoji}</div>
                <div className={`font-bold text-sm leading-tight mb-0.5 ${active ? "text-white" : "text-gray-800"}`}>{key}</div>
                <div className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>{info.meta}</div>
              </button>
            );
          })}
        </div>
        {galleryCollege && (
          <div className="mb-5">
            <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Select Sport</div>
            {sportsForCollege.length === 0
              ? <p className="text-sm text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">No players registered for {galleryCollege} yet.</p>
              : <div className="flex flex-wrap gap-2">
                  {sportsForCollege.map(s => {
                    const cnt = sportCount(galleryCollege, s);
                    const active = gallerySport === s;
                    return (
                      <button key={s} onClick={() => { setGallerySport(s === gallerySport ? null : s); setModalPlayer(null); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${active ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-md shadow-[#A91D3A]/20" : "bg-white border-gray-200 text-gray-600 hover:border-[#A91D3A] hover:text-[#A91D3A]"}`}>
                        {s}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>{cnt}</span>
                      </button>
                    );
                  })}
                </div>
            }
          </div>
        )}
        {!galleryCollege && <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400"><div className="text-4xl mb-2">👥</div><p className="text-sm">Select a college above to browse its player roster.</p></div>}
        {galleryCollege && !gallerySport && sportsForCollege.length > 0 && <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400"><div className="text-4xl mb-2">🏅</div><p className="text-sm">Pick a sport to see the <strong className="text-gray-600">{galleryCollege}</strong> roster.</p></div>}
        {galleryCollege && gallerySport && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{COLLEGE_META[galleryCollege]?.emoji}</span>
                <span className="font-bold text-gray-800 text-sm">{galleryCollege}</span>
                <span className="text-gray-300">—</span>
                <span className="font-semibold text-[#A91D3A] text-sm">{gallerySport}</span>
              </div>
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{galleryPlayers.length} player{galleryPlayers.length !== 1 ? "s" : ""}</span>
            </div>
            {galleryPlayers.length === 0
              ? <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">🏋️</div><p className="text-sm">No players registered for this sport yet.</p></div>
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {galleryPlayers.map((player, i) => (
                    <button key={player.id} onClick={() => setModalPlayer(player)} style={{ animationDelay: `${i * 35}ms` }}
                      className="group relative text-left rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#A91D3A] hover:shadow-lg hover:shadow-[#A91D3A]/10 focus:outline-none bg-white">
                      {/* 1:1 square image area */}
                      <div className="aspect-square overflow-hidden relative">
                        <PlayerAvatar player={player} size="lg" />
                        <div className="absolute top-2 right-2 bg-[#F5C518] text-[#7a1228] text-xs font-black px-2 py-0.5 rounded-md shadow-sm transition-all group-hover:bg-[#A91D3A] group-hover:text-white">#{player.jersey ?? "—"}</div>
                      </div>
                      <div className="p-2.5 bg-white">
                        <div className="font-semibold text-xs text-gray-800 truncate leading-tight">{player.name}</div>
                        <div className="flex items-center gap-1 mt-0.5"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A91D3A] shrink-0" /><span className="text-xs text-gray-400 truncate">{player.position || "—"}</span></div>
                      </div>
                    </button>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-4">Search Players</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" className={inputCls} placeholder="Search by name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <div><label className={labelCls}>College</label><select className={inputCls} value={filterCollege} onChange={e => { setFilterCollege(e.target.value); setPage(1); }}><option value="">All Colleges</option>{COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelCls}>Sport</label><select className={inputCls} value={filterSport} onChange={e => { setFilterSport(e.target.value); setPage(1); }}><option value="">All Sports</option>{SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="flex flex-col justify-end">
            <button onClick={() => setDeleteModal({ open: true, id: null, all: true })} className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500 border border-gray-200 rounded-md text-sm font-semibold transition-all">Remove All Players</button>
          </div>
        </div>
      </div>

      {/* ── Players Table ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-4">All Players</h3>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => { setImportModal(true); setImportPreview(null); setImportError(""); setImportFileName(""); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#A91D3A] hover:text-white text-[#A91D3A] border-2 border-[#A91D3A] rounded-md text-xs font-semibold transition-all">
              ⬆ Import CSV / Excel
            </button>
            <button onClick={() => setExportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs font-semibold transition-all border border-gray-200">
              ⬇ Export
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Rows:</label>
            <select className="px-2 py-1 border border-gray-200 rounded text-sm bg-white text-black" value={perPage} onChange={e => { setPerPage(parseInt(e.target.value)); setPage(1); }}>
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fdf2f4] border-b border-[#f0d0d6]">
                {[["name","Player"],["college","Team"],["sport","Sport"],["jersey","Jersey"],["position","Position"],["eligibilityStatus","Eligibility"]].map(([k,l]) => (
                  <th key={k} onClick={() => handleSort(k)} className="px-3 py-3 text-left text-[#A91D3A] font-semibold text-xs uppercase tracking-wide cursor-pointer select-none hover:bg-[#f5e0e4] transition-colors">
                    {l} {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : <span className="opacity-20">▲</span>}
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-[#A91D3A] font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0
                ? <tr><td colSpan={7} className="text-center text-gray-400 italic py-10 text-sm">No players found.</td></tr>
                : pageItems.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200"><PlayerAvatar player={p} size="sm" /></div>
                          <span className="font-medium text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{p.college || "Unassigned"}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{p.sport || ""}</td>
                      <td className="px-3 py-3 text-sm font-mono font-semibold text-gray-700">#{p.jersey ?? ""}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{p.position}</td>
                      <td className="px-3 py-3">
                        <EligibilityBadge status={(p.eligibilityStatus as EligibilityStatus) ?? "in_review"} />
                      </td>
                      <td className="px-3 py-3 flex gap-1.5 items-center">
                        <button onClick={() => setModalPlayer(p)} className="px-3 py-1 bg-gray-50 hover:bg-[#A91D3A] text-gray-600 hover:text-white border border-gray-200 hover:border-[#A91D3A] rounded text-xs font-semibold transition-all">View</button>
                        <button onClick={() => setDeleteModal({ open: true, id: p.id, all: false })} className="px-3 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded text-xs font-semibold transition-all">Delete</button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {totalPages} · {filteredSorted.length} players</span>
          {totalPages > 1 && <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded text-xs font-medium">← Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded text-xs font-medium">Next →</button>
          </div>}
        </div>
      </div>

      {/* ── Import Modal ── */}
      {importModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setImportModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#A91D3A] px-6 py-4 flex items-center justify-between">
              <div><h3 className="text-white font-bold text-base">Import Players</h3><p className="text-white/70 text-xs mt-0.5">Upload a CSV or Excel file to bulk-add players</p></div>
              <button onClick={() => setImportModal(false)} className="w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-sm transition-all">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">📋 Required columns: <code className="bg-blue-100 px-1 rounded">name, college, sport, position, jersey</code></p>
                <p className="text-xs text-blue-600 mb-3">Download a blank template to fill in and upload:</p>
                <div className="flex gap-2">
                  <button onClick={() => downloadTemplate("csv")} className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-all">⬇ CSV Template</button>
                  <button onClick={() => downloadTemplate("xlsx")} className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-all">⬇ Excel Template</button>
                </div>
              </div>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${importDragging ? "border-[#A91D3A] bg-[#A91D3A]/5" : "border-gray-200 hover:border-[#A91D3A] hover:bg-gray-50"}`}
                onDragOver={e => { e.preventDefault(); setImportDragging(true); }} onDragLeave={() => setImportDragging(false)}
                onDrop={e => { e.preventDefault(); setImportDragging(false); const f = e.dataTransfer.files[0]; if (f) processImportFile(f); }}
                onClick={() => importFileRef.current?.click()}>
                <input ref={importFileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processImportFile(f); }} />
                <div className="text-3xl mb-2">📂</div>
                <p className="text-sm font-medium text-gray-600">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">Supports .csv, .xlsx, .xls</p>
                {importFileName && <p className="mt-2 text-xs font-semibold text-[#A91D3A]">📄 {importFileName}</p>}
              </div>
              {importError && <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">⚠ {importError}</div>}
              {importPreview && importPreview.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Preview — {importPreview.length} players found</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Ready to import</span>
                  </div>
                  <div className="overflow-auto max-h-48 rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0"><tr>{["Name","College","Sport","Position","Jersey"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                      <tbody>
                        {importPreview.slice(0, 10).map((p, i) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-800">{p.name}</td>
                            <td className="px-3 py-2 text-gray-600">{p.college || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-gray-600">{p.sport || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-gray-600">{p.position || <span className="text-orange-400 italic">blank</span>}</td>
                            <td className="px-3 py-2 font-mono text-gray-700">#{p.jersey}</td>
                          </tr>
                        ))}
                        {importPreview.length > 10 && <tr><td colSpan={5} className="px-3 py-2 text-center text-gray-400 italic">... and {importPreview.length - 10} more</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setImportModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all">Cancel</button>
                <button onClick={confirmImport} disabled={!importPreview || importPreview.length === 0} className="flex-1 px-4 py-2.5 bg-[#A91D3A] hover:bg-[#8B1528] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
                  Import {importPreview ? `${importPreview.length} Players` : "Players"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Modal ── */}
      {exportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setExportModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#A91D3A] px-6 py-4 flex items-center justify-between">
              <div><h3 className="text-white font-bold text-base">Export Players</h3><p className="text-white/70 text-xs mt-0.5">{players.length} players will be exported</p></div>
              <button onClick={() => setExportModal(false)} className="w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-sm transition-all">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Choose your preferred export format:</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleExportCSV} className="flex items-center gap-4 px-4 py-4 border-2 border-gray-200 hover:border-[#A91D3A] hover:bg-[#A91D3A]/5 rounded-xl transition-all group text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg shrink-0">📄</div>
                  <div><div className="font-bold text-gray-800 text-sm group-hover:text-[#A91D3A] transition-colors">CSV (.csv)</div><div className="text-xs text-gray-400">Plain text, works in any spreadsheet app</div></div>
                </button>
                <button onClick={handleExportXLSX} className="flex items-center gap-4 px-4 py-4 border-2 border-gray-200 hover:border-[#A91D3A] hover:bg-[#A91D3A]/5 rounded-xl transition-all group text-left">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg shrink-0">📊</div>
                  <div><div className="font-bold text-gray-800 text-sm group-hover:text-[#A91D3A] transition-colors">Excel (.xlsx)</div><div className="text-xs text-gray-400">Formatted spreadsheet for Microsoft Excel / Google Sheets</div></div>
                </button>
              </div>
              <button onClick={() => setExportModal(false)} className="mt-4 w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Player Detail Modal ── */}
      {modalPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setModalPlayer(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative overflow-hidden" style={{ paddingTop: "100%" }}>
              <div className="absolute inset-0"><PlayerAvatar player={modalPlayer} size="lg" /></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 bg-[#F5C518] text-[#7a1228] font-black text-sm px-3 py-1 rounded-lg shadow-md">#{modalPlayer.jersey ?? "—"}</div>
              <button onClick={() => setModalPlayer(null)} className="absolute top-3 left-3 w-7 h-7 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center text-sm transition-all">✕</button>
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-white font-bold text-lg leading-tight">{modalPlayer.name}</div>
                <div className="text-white/70 text-xs mt-0.5">{modalPlayer.college} · {modalPlayer.sport}</div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ label: "Position", value: modalPlayer.position || "—" }, { label: "Jersey", value: `#${modalPlayer.jersey ?? "—"}` }, { label: "Team", value: modalPlayer.college }].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</div>
                    <div className="font-bold text-gray-800 text-xs leading-tight">{value}</div>
                  </div>
                ))}
              </div>

              {/* ── Eligibility Status ── */}
              <div className="mb-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Eligibility Status</div>
                    <EligibilityBadge status={(modalPlayer.eligibilityStatus as EligibilityStatus) ?? "in_review"} size="md" />
                  </div>
                  <span className="text-[10px] text-gray-400 italic">Admin only</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(ELIGIBILITY_META) as EligibilityStatus[]).map(s => {
                    const m = ELIGIBILITY_META[s];
                    const current = ((modalPlayer.eligibilityStatus as EligibilityStatus) ?? "in_review") === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          onUpdatePlayerStatus(modalPlayer.id, s);
                          setModalPlayer(prev => prev ? { ...prev, eligibilityStatus: s } : null);
                        }}
                        style={current ? { background: m.bg, color: m.color, borderColor: m.border } : {}}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          current
                            ? "border-current shadow-sm"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {current && <span className="mr-1">✓</span>}{m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setDeleteModal({ open: true, id: modalPlayer.id, all: false }); setModalPlayer(null); }} className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg text-sm font-semibold transition-all">Delete Player</button>
                <button onClick={() => setModalPlayer(null)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
            <h3 className="text-base font-bold text-gray-900 mb-2 text-center">{deleteModal.all ? "Remove All Players?" : "Delete Player?"}</h3>
            <p className="text-sm text-gray-500 mb-5 text-center">{deleteModal.all ? "This will permanently remove all players and cannot be undone." : "This player will be permanently deleted."}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, id: null, all: false })} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all">Cancel</button>
              <button onClick={() => { if (deleteModal.all) onDeleteAllPlayers(); else if (deleteModal.id !== null) onDeletePlayer(deleteModal.id); setDeleteModal({ open: false, id: null, all: false }); }} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}