"use client";
import React, { useState } from "react";
import type { Match } from "@/types";
import { SPORTS, TEAMS } from "@/lib/dataManager";

interface MatchesPageProps {
  matches: Match[];
  onAddMatch: (match: Omit<Match, "id" | "createdAt">) => void;
  onDeleteMatch: (id: number) => void;
}

const emptyForm = { sport: "", teamA: "", teamB: "", date: "", time: "", venue: "" };

export default function MatchesPage({ matches, onAddMatch, onDeleteMatch }: MatchesPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [modal, setModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.teamA === form.teamB) { alert("Team A and Team B cannot be the same"); return; }
    onAddMatch({ ...form, status: "upcoming" });
    setForm(emptyForm);
  };

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .matches-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .matches-hero-title span.accent { color: #A91D3A; }

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
          background: rgba(169,29,58,0.06);
        }
        .field-input option { background: #1a1a1a; color: #fff; }
        .field-input[type="date"]::-webkit-calendar-picker-indicator,
        .field-input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.4);
          cursor: pointer;
        }

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

        .matches-table { width: 100%; border-collapse: collapse; }
        .matches-table thead tr {
          background: rgba(169,29,58,0.15);
          border-bottom: 2px solid rgba(169,29,58,0.4);
        }
        .matches-table th {
          padding: 11px 14px;
          text-align: left;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #A91D3A;
          white-space: nowrap;
        }
        .matches-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .matches-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .matches-table td {
          padding: 13px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.75);
        }

        .vs-cell {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-style: italic;
          font-size: 1.1rem;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vs-cell .vs-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: #A91D3A;
          background: rgba(169,29,58,0.15);
          border: 1px solid rgba(169,29,58,0.3);
          border-radius: 4px;
          padding: 1px 6px;
          letter-spacing: 0.06em;
        }

        .status-upcoming {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(234,179,8,0.15);
          color: #fbbf24;
          border: 1px solid rgba(234,179,8,0.25);
        }
        .status-completed {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.2);
        }

        .action-btn-delete {
          padding: 4px 14px;
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

        .sport-badge {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }

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
          <h1 className="matches-hero-title">
            MATCH <span className="accent">SCHEDULE</span>
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            SCHEDULE · MANAGE · TRACK
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Add Match Form */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Add New Match</h3>
            <div className="line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label className="field-label">Sport *</label>
                <select className="field-input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required>
                  <option value="">Select Sport</option>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Team A *</label>
                <select className="field-input" value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} required>
                  <option value="">Select Team A</option>
                  {TEAMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Team B *</label>
                <select className="field-input" value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} required>
                  <option value="">Select Team B</option>
                  {TEAMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
              <div>
                <label className="field-label">Date *</label>
                <input type="date" className="field-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Time *</label>
                <input type="time" className="field-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Venue *</label>
                <input type="text" className="field-input" placeholder="e.g. Main Gymnasium" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required />
              </div>
            </div>

            <button type="submit" className="btn-primary">+ Add Match</button>
          </form>
        </div>

        {/* Matches Table */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>All Matches</h3>
            <div className="line" />
            {matches.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {matches.length} MATCH{matches.length !== 1 ? 'ES' : ''}
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="matches-table">
              <thead>
                <tr>
                  {["Sport", "Matchup", "Date", "Time", "Venue", "Status", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '14px' }}>🏆</div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          No matches scheduled yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => {
                    const upcoming = new Date(`${match.date}T${match.time}`) > new Date();
                    return (
                      <tr key={match.id}>
                        <td><span className="sport-badge">{match.sport}</span></td>
                        <td>
                          <div className="vs-cell">
                            <span>{match.teamA}</span>
                            <span className="vs-tag">VS</span>
                            <span>{match.teamB}</span>
                          </div>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.55)' }}>{match.date}</td>
                        <td style={{ color: 'rgba(255,255,255,0.55)' }}>{match.time}</td>
                        <td>{match.venue}</td>
                        <td>
                          <span className={upcoming ? "status-upcoming" : "status-completed"}>
                            {upcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => setModal({ open: true, id: match.id })} className="action-btn-delete">
                            Delete
                          </button>
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
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, id: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>⚠ Delete Match?</h4>
            <p>This match will be permanently removed and cannot be recovered.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ background: '#dc2626' }}
                onClick={() => {
                  if (modal.id) onDeleteMatch(Number(modal.id));
                  setModal({ open: false, id: null });
                }}
              >
                Delete
              </button>
              <button className="btn-ghost" onClick={() => setModal({ open: false, id: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}