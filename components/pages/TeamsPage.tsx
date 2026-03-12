"use client";
import React, { useState, useMemo, useRef, useCallback } from "react";
import type { Player } from "@/types";
import { SPORTS, COLLEGES, POSITIONS_BY_SPORT, resizeImageFile, exportCSV, csvEscape } from "@/lib/dataManager";

interface TeamsPageProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, "id" | "createdAt">) => void;
  onDeletePlayer: (id: number) => void;
  onDeleteAllPlayers: () => void;
  onImportPlayers: (players: Omit<Player, "id" | "createdAt">[]) => void;
}

const emptyForm = { name: "", teamId: "", college: "", sport: "", position: "", jersey: "", photoDataUrl: "" };

export default function TeamsPage({ players, onAddPlayer, onDeletePlayer, onDeleteAllPlayers, onImportPlayers }: TeamsPageProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null; all: boolean }>({ open: false, id: null, all: false });
  const [dragging, setDragging] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const positions = useMemo(() => {
    if (!form.sport) return [];
    return POSITIONS_BY_SPORT[form.sport] || POSITIONS_BY_SPORT[form.sport.split(" ")[0]] || ["Player", "Other"];
  }, [form.sport]);

  const filteredSorted = useMemo(() => {
    const q = search.toLowerCase();
    return players
      .filter((p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!filterCollege || p.college === filterCollege) &&
        (!filterSport || p.sport === filterSport)
      )
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const getVal = (obj: Player): string | number => {
          switch (sortKey) {
            case "name": return obj.name;
            case "college": return obj.college;
            case "sport": return obj.sport;
            case "jersey": return obj.jersey;
            case "position": return obj.position;
            default: return "";
          }
        };
        const va = getVal(a);
        const vb = getVal(b);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
  }, [players, search, filterCollege, filterSport, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / perPage));
  const pageItems = filteredSorted.slice((page - 1) * perPage, page * perPage);

  const handlePhotoFile = useCallback((file: File) => {
    resizeImageFile(file, 600, (dataUrl) => {
      setPhotoPreview(dataUrl);
      setForm((f) => ({ ...f, photoDataUrl: dataUrl }));
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const jerseyNum = parseInt(form.jersey, 10);
    if (!form.name || !form.college || !form.sport || !form.position || form.jersey === "") {
      setFormError("All required fields must be filled."); return;
    }
    if (isNaN(jerseyNum) || jerseyNum < 0) { setFormError("Enter a valid jersey number."); return; }
    const dup = players.find((p) => p.college === form.college && p.sport === form.sport && p.jersey === jerseyNum);
    if (dup) { setFormError(`Jersey ${jerseyNum} is already taken by ${dup.name} (${dup.college} - ${dup.sport}).`); return; }
    onAddPlayer({ name: form.name, teamId: form.teamId, college: form.college, sport: form.sport, position: form.position, jersey: jerseyNum, photo: form.photoDataUrl || null });
    setForm({ ...emptyForm });
    setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = "";
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, defaultTeamId: string = '0') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target!.result as string;
      const rows = text.split(/\r?\n/).filter(Boolean);
      const headers = rows.shift()!.split(",");
      const imported = rows.map((r) => {
        const cols = r.split(",");
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h.trim()] = cols[i]?.replace(/^"|"$/g, "") || ""; });
        return { teamId: defaultTeamId, name: obj.name || "", college: obj.college || "", sport: obj.sport || "", position: obj.position || "", jersey: parseInt(obj.jersey) || 0, photo: obj.photo || null };
      }).filter((p) => p.name);
      onImportPlayers(imported);
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = "";
  };

  const handleExport = () => {
    const headers = ["id","name","college","sport","position","jersey","createdAt"];
    exportCSV(
      headers,
      players.map((p) => headers.map((h) => {
        const row: Record<string, unknown> = { id: p.id, name: p.name, college: p.college, sport: p.sport, position: p.position, jersey: p.jersey, createdAt: p.createdAt };
        return csvEscape(row[h]);
      })),
      "players.csv"
    );
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .teams-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .teams-hero-title span.accent { color: #A91D3A; }

        .hero-bar { display: inline-block; height: 6px; background: #A91D3A; width: 80px; margin-bottom: 12px; }

        .field-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-family: 'Barlow', sans-serif;
          font-size: 0.875rem;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.3); }
        .field-input:focus { border-color: #A91D3A; background: rgba(169,29,58,0.06); }
        .field-input option { background: #1a1a1a; color: #fff; }

        .field-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 7px;
        }

        .section-card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 32px; }

        .section-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 26px; }
        .section-divider h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem; font-weight: 800; font-style: italic;
          text-transform: uppercase; color: #fff; white-space: nowrap; letter-spacing: 0.02em;
        }
        .section-divider .line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .section-divider .dot { width: 8px; height: 8px; background: #A91D3A; border-radius: 50%; flex-shrink: 0; }

        .btn-primary {
          padding: 11px 28px; background: #A91D3A; color: #fff; border: none; border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #c4223f; transform: translateY(-2px); }

        .btn-secondary {
          padding: 10px 20px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .btn-danger {
          padding: 10px 20px; background: rgba(239,68,68,0.12); color: #f87171;
          border: 1px solid rgba(239,68,68,0.25); border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
        }
        .btn-danger:hover { background: rgba(239,68,68,0.25); }

        .btn-ghost {
          padding: 11px 20px; background: transparent; color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

        .photo-drop-zone {
          border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: rgba(255,255,255,0.03);
        }
        .photo-drop-zone:hover, .photo-drop-zone.dragging {
          border-color: #A91D3A;
          background: rgba(169,29,58,0.06);
        }

        .error-banner {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          color: #f87171;
        }

        /* Players table */
        .players-table { width: 100%; border-collapse: collapse; }
        .players-table thead tr { background: rgba(169,29,58,0.15); border-bottom: 2px solid rgba(169,29,58,0.4); }
        .players-table th {
          padding: 11px 14px; text-align: left;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: #A91D3A;
          cursor: pointer; user-select: none; white-space: nowrap; transition: color 0.15s;
        }
        .players-table th:hover { color: #e03560; }
        .players-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
        .players-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .players-table td { padding: 12px 14px; font-family: 'Barlow', sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.75); }

        .jersey-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 6px;
          background: rgba(169,29,58,0.2); border: 1px solid rgba(169,29,58,0.35);
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 900;
          color: #f87171; letter-spacing: 0.02em;
        }

        .sport-badge {
          display: inline-block; padding: 2px 9px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);
        }

        .pos-badge {
          display: inline-block; padding: 2px 9px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2);
        }

        .action-btn-delete {
          padding: 4px 14px; background: rgba(239,68,68,0.1); color: #f87171;
          border: 1px solid rgba(239,68,68,0.25); border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.15s;
        }
        .action-btn-delete:hover { background: rgba(239,68,68,0.25); }

        .pagination-btn {
          padding: 6px 16px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.15s;
        }
        .pagination-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
        .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px);
        }
        .modal-box {
          background: #161616; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 32px; max-width: 400px; width: 90%;
        }
        .modal-box h4 {
          font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 800;
          font-style: italic; color: #fff; text-transform: uppercase; margin-bottom: 10px;
        }
        .modal-box p { font-family: 'Barlow', sans-serif; color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-bottom: 24px; }

        .player-avatar {
          width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(169,29,58,0.4); flex-shrink: 0;
        }
        .player-avatar-placeholder {
          width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.07);
          border: 2px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 700;
          color: rgba(255,255,255,0.3); flex-shrink: 0;
        }

        .import-label {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
        }
        .import-label:hover { background: rgba(255,255,255,0.12); color: #fff; }
      `}</style>

      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0508 50%, #0f0f0f 100%)',
        borderBottom: '1px solid rgba(169,29,58,0.2)',
        padding: '40px 36px 36px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-bar" />
          <h1 className="teams-hero-title">TEAMS & <span className="accent">ORGS</span></h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            REGISTER · MANAGE · ORGANIZE
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Add Player Form */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Add New Player</h3>
            <div className="line" />
          </div>

          {formError && <div className="error-banner">⚠ {formError}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label className="field-label">Player Name *</label>
                <input type="text" className="field-input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">College *</label>
                <select className="field-input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} required>
                  <option value="">Select College</option>
                  {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Sport *</label>
                <select className="field-input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value, position: "" })} required>
                  <option value="">Select Sport</option>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
              <div>
                <label className="field-label">Position *</label>
                <select className="field-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required>
                  <option value="">Select Position</option>
                  {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Jersey Number *</label>
                <input type="number" min="0" className="field-input" placeholder="e.g. 7" value={form.jersey} onChange={(e) => setForm({ ...form, jersey: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Player Photo (optional)</label>
                <div
                  className={`photo-drop-zone ${dragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handlePhotoFile(f); }}
                  onClick={() => photoRef.current?.click()}
                >
                  <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); }} />
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #A91D3A' }} />
                      <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#4ade80', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>✓ PHOTO READY</p>
                        <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '2px' }}>Click to change</p>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                      DROP PHOTO OR <span style={{ color: '#A91D3A' }}>BROWSE</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary">+ Add Player</button>
          </form>
        </div>

        {/* Search & Filter */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Search & Filter</h3>
            <div className="line" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label className="field-label">Search by name</label>
              <input type="text" className="field-input" placeholder="Player name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div>
              <label className="field-label">College</label>
              <select className="field-input" value={filterCollege} onChange={(e) => { setFilterCollege(e.target.value); setPage(1); }}>
                <option value="">All Colleges</option>
                {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Sport</label>
              <select className="field-input" value={filterSport} onChange={(e) => { setFilterSport(e.target.value); setPage(1); }}>
                <option value="">All Sports</option>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => setDeleteModal({ open: true, id: null, all: true })} className="btn-danger">
              Remove All
            </button>
          </div>
        </div>

        {/* Players Table */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Teams & Players</h3>
            <div className="line" />
            {filteredSorted.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {filteredSorted.length} PLAYER{filteredSorted.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={handleExport} className="btn-secondary">↓ Export CSV</button>
            <label className="import-label">
              ↑ Import CSV
              <input ref={importRef} type="file" accept="text/csv" style={{ display: 'none' }} onChange={handleImport} />
            </label>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>Rows per page</label>
              <select className="field-input" style={{ width: 'auto', padding: '6px 10px' }} value={perPage} onChange={(e) => { setPerPage(parseInt(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="players-table">
              <thead>
                <tr>
                  {[["name","Player"],["college","College"],["sport","Sport"],["jersey","#"],["position","Position"]].map(([k, l]) => (
                    <th key={k} onClick={() => handleSort(k)} style={{ opacity: sortKey === k ? 1 : 0.6 }}>
                      {l} {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  ))}
                  <th style={{ cursor: 'default' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '14px' }}>👥</div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          No players found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {p.photo
                            ? <img src={p.photo} alt={p.name} className="player-avatar" />
                            : <div className="player-avatar-placeholder">{p.name.charAt(0).toUpperCase()}</div>
                          }
                          <span style={{ color: '#fff', fontWeight: 500 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.55)' }}>{p.college || "Unassigned"}</td>
                      <td><span className="sport-badge">{p.sport}</span></td>
                      <td><span className="jersey-badge">#{p.jersey}</span></td>
                      <td><span className="pos-badge">{p.position}</span></td>
                      <td>
                        <button onClick={() => setDeleteModal({ open: true, id: p.id, all: false })} className="action-btn-delete">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              PAGE {page} OF {totalPages}
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="pagination-btn">← Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="pagination-btn">Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null, all: false })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>⚠ {deleteModal.all ? "Remove All Players?" : "Delete Player?"}</h4>
            <p>{deleteModal.all
              ? "This will permanently remove every player from the roster. This cannot be undone."
              : "This player will be permanently removed from the roster."
            }</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ background: '#dc2626' }}
                onClick={() => {
                  if (deleteModal.all) onDeleteAllPlayers();
                  else if (deleteModal.id) onDeletePlayer(Number(deleteModal.id));
                  setDeleteModal({ open: false, id: null, all: false });
                }}
              >
                {deleteModal.all ? "Remove All" : "Delete"}
              </button>
              <button className="btn-ghost" onClick={() => setDeleteModal({ open: false, id: null, all: false })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}