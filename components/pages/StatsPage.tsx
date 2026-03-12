"use client";
import React, { useState, useMemo } from "react";
import type { Stat, Player } from "@/types";
import { SPORTS, COLLEGES, DataManager, csvEscape, exportCSV } from "@/lib/dataManager";

interface StatsPageProps {
  stats: Stat[];
  players: Player[];
  onAddStat: (stat: Omit<Stat, "id" | "createdAt">) => void;
  onUpdateStat: (id: string, stat: Partial<Stat>) => void;
  onDeleteStat: (id: string) => void;
  onLoadDemoStats: () => void;
}

const statSports = [
  "Badminton","Basketball Men","Basketball Women","Cheerdance","Chess","Dancesports",
  "Esports - Mobile Legends: Bang Bang","Esports - DOTA 2","Esports - Valorant",
  "Frisbee","Soccer","Softball","Table Tennis","Volleyball Men","Volleyball Women","Petanque",
];

const emptyForm = { type: "" as "Player" | "Team" | "", sport: "", college: "", playerId: "", statName: "", statValue: "" };

export default function StatsPage({ stats, players, onAddStat, onUpdateStat, onDeleteStat, onLoadDemoStats }: StatsPageProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredPlayers = useMemo(() =>
    players.filter((p) => (!form.college || p.college === form.college) && (!form.sport || p.sport === form.sport)),
    [players, form.college, form.sport]
  );

  const filteredStats = useMemo(() => {
    const q = search.toLowerCase();
    return stats
      .filter((s) => {
        const player = s.playerId != null ? players.find((p) => p.id === String(s.playerId)) : null;
        return (
          (!q || s.statName.toLowerCase().includes(q) || (player?.name.toLowerCase().includes(q) ?? false) || s.college.toLowerCase().includes(q)) &&
          (!filterCollege || s.college === filterCollege) &&
          (!filterSport || s.sport === filterSport)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const getVal = (obj: Stat): string | number => {
          switch (sortKey) {
            case "type": return obj.type;
            case "sport": return obj.sport;
            case "college": return obj.college;
            case "statName": return obj.statName;
            case "statValue": return String(obj.statValue);
            case "createdAt": return obj.createdAt;
            default: return "";
          }
        };
        const va = getVal(a);
        const vb = getVal(b);
        if (sortKey === "createdAt") return (new Date(String(va)).getTime() - new Date(String(vb)).getTime()) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
  }, [stats, players, search, filterCollege, filterSport, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.sport || !form.college || !form.statName || !form.statValue) {
      alert("Please fill in all required stat fields"); return;
    }
    const stat = {
      type: form.type as "Player" | "Team",
      sport: form.sport,
      college: form.college,
      playerId: form.type === "Player" && form.playerId ? parseInt(form.playerId) : null,
      statName: form.statName,
      statValue: form.statValue,
    };
    if (editingId) { onUpdateStat(editingId, stat); setEditingId(null); }
    else onAddStat(stat);
    setForm({ ...emptyForm });
  };

  const handleEdit = (s: Stat) => {
    setEditingId(s.id);
    setForm({ type: s.type, sport: s.sport, college: s.college, playerId: s.playerId ? String(s.playerId) : "", statName: s.statName, statValue: String(s.statValue) });
  };

  const handleExport = () => {
    const headers = ["id","type","sport","college","playerId","statName","statValue","createdAt"];
    exportCSV(
      headers,
      stats.map((s) =>
        headers.map((h) => {
          const row: Record<string, unknown> = {
            id: s.id, type: s.type, sport: s.sport, college: s.college,
            playerId: s.playerId, statName: s.statName, statValue: s.statValue, createdAt: s.createdAt,
          };
          return csvEscape(row[h]);
        })
      ),
      "stats.csv"
    );
  };

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .stats-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .stats-hero-title span.accent { color: #A91D3A; }

        .hero-bar {
          display: inline-block;
          height: 6px;
          background: #A91D3A;
          width: 80px;
          margin-bottom: 12px;
        }

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
        .field-input:focus {
          border-color: #A91D3A;
          background: rgba(169, 29, 58, 0.06);
        }
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

        .btn-primary {
          padding: 11px 28px;
          background: #A91D3A;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #c4223f; transform: translateY(-2px); }

        .btn-secondary {
          padding: 11px 24px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.13); color: #fff; }

        .btn-ghost {
          padding: 11px 20px;
          background: transparent;
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

        .section-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 32px;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
        }
        .section-divider h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          font-style: italic;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .section-divider .line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .section-divider .dot { width: 8px; height: 8px; background: #A91D3A; border-radius: 50%; flex-shrink: 0; }

        /* Table */
        .stats-table { width: 100%; border-collapse: collapse; }
        .stats-table thead tr {
          background: rgba(169,29,58,0.15);
          border-bottom: 2px solid rgba(169,29,58,0.4);
        }
        .stats-table th {
          padding: 11px 14px;
          text-align: left;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #A91D3A;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .stats-table th:hover { color: #e03560; }
        .stats-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .stats-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .stats-table td {
          padding: 11px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.75);
        }

        .type-badge {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .badge-player { background: rgba(59,130,246,0.18); color: #60a5fa; }
        .badge-team { background: rgba(169,29,58,0.22); color: #f87171; }

        .action-btn-edit {
          padding: 4px 12px;
          background: rgba(169,29,58,0.2);
          color: #f87171;
          border: 1px solid rgba(169,29,58,0.3);
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
        }
        .action-btn-edit:hover { background: rgba(169,29,58,0.4); }

        .action-btn-delete {
          padding: 4px 12px;
          background: rgba(239,68,68,0.1);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
        }
        .action-btn-delete:hover { background: rgba(239,68,68,0.25); }

        .stat-value-cell {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .editing-banner {
          background: rgba(169,29,58,0.12);
          border: 1px solid rgba(169,29,58,0.3);
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #f87171;
        }

        .search-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          align-items: center;
        }
        .search-row .field-input { max-width: 220px; }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-state .icon { font-size: 2.5rem; opacity: 0.15; margin-bottom: 14px; }
        .empty-state p {
          font-family: 'Barlow Condensed', sans-serif;
          color: rgba(255,255,255,0.2);
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Delete Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-box {
          background: #161616;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
        }
        .modal-box h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          font-style: italic;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .modal-box p {
          font-family: 'Barlow', sans-serif;
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          margin-bottom: 24px;
        }
      `}</style>

      {/* Page Hero Header */}
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
          <h1 className="stats-hero-title">
            PLAYER <span className="accent">STATS</span>
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            TRACK · ANALYZE · COMPARE
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Add / Edit Form */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>{editingId ? "Edit Stat" : "Add Stat"}</h3>
            <div className="line" />
          </div>

          {editingId && (
            <div className="editing-banner">✏ Editing existing stat — make changes and click Update</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label className="field-label">Type *</label>
                <select className="field-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "Player" | "Team" | "" })} required>
                  <option value="">Select Type</option>
                  <option value="Player">Player</option>
                  <option value="Team">Team</option>
                </select>
              </div>
              <div>
                <label className="field-label">Sport *</label>
                <select className="field-input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required>
                  <option value="">Select Sport</option>
                  {statSports.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">College / Team *</label>
                <select className="field-input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} required>
                  <option value="">Select College</option>
                  {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
              {form.type === "Player" && (
                <div>
                  <label className="field-label">Player</label>
                  <select className="field-input" value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })}>
                    <option value="">Select Player</option>
                    {filteredPlayers.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.jersey})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="field-label">Stat Name *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Points, Assists, Rebounds"
                  value={form.statName}
                  onChange={(e) => setForm({ ...form, statName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">Value *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. 24"
                  value={form.statValue}
                  onChange={(e) => setForm({ ...form, statValue: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn-primary">
                {editingId ? "✓ Update Stat" : "+ Add Stat"}
              </button>
              <button type="button" onClick={onLoadDemoStats} className="btn-secondary">
                Load Demo Stats
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }} className="btn-ghost">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Stats Table */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>All Stats</h3>
            <div className="line" />
            {filteredStats.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {filteredStats.length} RECORD{filteredStats.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="search-row">
            <input
              type="text"
              placeholder="Search stats..."
              className="field-input"
              style={{ maxWidth: '220px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="field-input" style={{ maxWidth: '180px' }} value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)}>
              <option value="">All Colleges</option>
              {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="field-input" style={{ maxWidth: '180px' }} value={filterSport} onChange={(e) => setFilterSport(e.target.value)}>
              <option value="">All Sports</option>
              {statSports.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleExport} className="btn-secondary" style={{ marginLeft: 'auto', padding: '10px 20px', fontSize: '0.8rem' }}>
              ↓ Export CSV
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="stats-table">
              <thead>
                <tr>
                  {[
                    ["type", "Type"], ["sport", "Sport"], ["college", "Team"],
                    ["player", "Player"], ["statName", "Stat"], ["statValue", "Value"], ["createdAt", "Date"]
                  ].map(([k, l]) => (
                    <th key={k} onClick={() => handleSort(k)} style={{ opacity: sortKey === k ? 1 : 0.6 }}>
                      {l} {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  ))}
                  <th style={{ cursor: 'default' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <div className="icon">📊</div>
                        <p>No stats match the filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((s) => {
                    const player = s.playerId != null ? players.find((p) => String(p.id) === String(s.playerId)) : null;
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className={`type-badge ${s.type === 'Player' ? 'badge-player' : 'badge-team'}`}>{s.type}</span>
                        </td>
                        <td>{s.sport}</td>
                        <td style={{ color: 'rgba(255,255,255,0.55)' }}>{s.college}</td>
                        <td>{player?.name || <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>—</span>}</td>
                        <td style={{ color: '#fff', fontWeight: 500 }}>{s.statName}</td>
                        <td><span className="stat-value-cell">{s.statValue}</span></td>
                        <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleEdit(s)} className="action-btn-edit">Edit</button>
                            <button onClick={() => setDeleteModal({ open: true, id: s.id })} className="action-btn-delete">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>⚠ Delete Stat?</h4>
            <p>This action cannot be undone. The stat record will be permanently removed.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ background: '#dc2626' }}
                onClick={() => {
                  if (deleteModal.id) onDeleteStat(deleteModal.id);
                  setDeleteModal({ open: false, id: null });
                }}
              >
                Delete
              </button>
              <button className="btn-ghost" onClick={() => setDeleteModal({ open: false, id: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}