"use client";
import React, { useState, useMemo } from "react";
import type { Result, MediaItem } from "@/types";

interface ArchivesPageProps {
  results: Result[];
  media: MediaItem[];
}

const ARCHIVE_SPORTS = ["Basketball", "Volleyball", "Football", "Badminton", "Tennis", "Chess", "Esports"];

export default function ArchivesPage({ results, media }: ArchivesPageProps) {
  const [year, setYear] = useState("");
  const [sport, setSport] = useState("");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const mediaYear = new Date(m.createdAt).getFullYear().toString();
      return (!year || mediaYear === year) && (!sport || m.sport === sport);
    });
  }, [media, year, sport]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const rYear = new Date(r.createdAt).getFullYear().toString();
      return (!year || rYear === year) && (!sport || r.sport.toLowerCase().includes(sport.toLowerCase()));
    });
  }, [results, year, sport]);

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .archives-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .archives-hero-title span.accent { color: #A91D3A; }

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

        /* Filter pills */
        .active-filter {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px;
          background: rgba(169,29,58,0.2); border: 1px solid rgba(169,29,58,0.4);
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: #f87171;
        }

        /* Results table */
        .archive-table { width: 100%; border-collapse: collapse; }
        .archive-table thead tr { background: rgba(169,29,58,0.15); border-bottom: 2px solid rgba(169,29,58,0.4); }
        .archive-table th {
          padding: 11px 14px; text-align: left;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: #A91D3A; white-space: nowrap;
        }
        .archive-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
        .archive-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .archive-table td { padding: 13px 14px; font-family: 'Barlow', sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.75); }

        .scoreline {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-style: italic;
        }
        .scoreline .team { font-size: 0.9rem; }
        .scoreline .score { font-size: 1.3rem; color: #fff; min-width: 24px; text-align: center; }
        .scoreline .score.win { color: #4ade80; }
        .scoreline .sep { color: rgba(255,255,255,0.2); }

        .winner-badge {
          display: inline-block; padding: 3px 10px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .winner-badge.draw { background: rgba(234,179,8,0.15); color: #fbbf24; border: 1px solid rgba(234,179,8,0.25); }
        .winner-badge.win { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }

        .sport-badge {
          display: inline-block; padding: 2px 9px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);
        }

        /* Media grid */
        .media-card {
          background: #141414; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; overflow: hidden; cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .media-card:hover {
          transform: translateY(-4px);
          border-color: rgba(169,29,58,0.5);
          box-shadow: 0 12px 40px rgba(169,29,58,0.15);
        }
        .media-card:hover .card-overlay { opacity: 1; }
        .card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(169,29,58,0.7) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s ease; pointer-events: none;
        }

        .media-type-badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          position: absolute; top: 8px; right: 8px;
        }
        .badge-image { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .badge-video { background: rgba(169,29,58,0.25); color: #f87171; }

        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state .icon { font-size: 2.5rem; opacity: 0.15; margin-bottom: 14px; }
        .empty-state p {
          font-family: 'Barlow Condensed', sans-serif; color: rgba(255,255,255,0.2);
          font-size: 1.05rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lightbox-inner {
          position: relative; max-width: 90vw; max-height: 88vh;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .lightbox-img {
          max-width: 100%; max-height: 78vh; border-radius: 10px; object-fit: contain;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08);
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-size: 1.2rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; font-family: sans-serif;
        }
        .lightbox-close:hover { background: rgba(169,29,58,0.5); border-color: #A91D3A; }
        .lightbox-caption { text-align: center; }
        .lightbox-caption .title {
          font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 800;
          font-style: italic; color: #fff; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .lightbox-caption .meta { font-family: 'Barlow', sans-serif; font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .lightbox-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: #fff; font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: background 0.2s;
        }
        .lightbox-nav:hover { background: rgba(169,29,58,0.5); border-color: #A91D3A; }
        .lightbox-nav.prev { left: 16px; }
        .lightbox-nav.next { right: 16px; }
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
          <h1 className="archives-hero-title">GAME <span className="accent">ARCHIVES</span></h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            BROWSE · FILTER · REVISIT
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Filter Card */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Filter Archives</h3>
            <div className="line" />
            {(year || sport) && (
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {year && <span className="active-filter">📅 {year}</span>}
                {sport && <span className="active-filter">🏅 {sport}</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label className="field-label">Year</label>
              <select className="field-input" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div>
              <label className="field-label">Sport</label>
              <select className="field-input" value={sport} onChange={(e) => setSport(e.target.value)}>
                <option value="">All Sports</option>
                {ARCHIVE_SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Archived Results */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Archived Results</h3>
            <div className="line" />
            {filteredResults.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {filteredResults.length} RECORD{filteredResults.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="archive-table">
              <thead>
                <tr>
                  {["Sport", "Scoreline", "Winner", "Date"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="icon">🗂</div>
                        <p>No archived results found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => {
                    const aWon = r.scoreA > r.scoreB;
                    const bWon = r.scoreB > r.scoreA;
                    return (
                      <tr key={r.id}>
                        <td><span className="sport-badge">{r.sport}</span></td>
                        <td>
                          <div className="scoreline">
                            <span className="team" style={{ color: aWon ? '#fff' : 'rgba(255,255,255,0.4)' }}>{r.teamA}</span>
                            <span className={`score ${aWon ? 'win' : ''}`}>{r.scoreA}</span>
                            <span className="sep">—</span>
                            <span className={`score ${bWon ? 'win' : ''}`}>{r.scoreB}</span>
                            <span className="team" style={{ color: bWon ? '#fff' : 'rgba(255,255,255,0.4)' }}>{r.teamB}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`winner-badge ${r.winner === 'Draw' ? 'draw' : 'win'}`}>
                            {r.winner === 'Draw' ? 'Draw' : `🏆 ${r.winner}`}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Archived Media */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Archived Media</h3>
            <div className="line" />
            {filteredMedia.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {filteredMedia.length} ITEM{filteredMedia.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {filteredMedia.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🖼</div>
              <p>No archived media found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {filteredMedia.map((item) => (
                <div key={item.id} className="media-card" onClick={() => setLightbox(item)}>
                  <div style={{ width: '100%', height: '140px', background: '#1a1a1a', overflow: 'hidden', position: 'relative' }}>
                    {item.type === "image"
                      ? <img src={item.data} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)' }}>🎥</div>
                    }
                    <div className="card-overlay" />
                    <span className={`media-type-badge ${item.type === 'image' ? 'badge-image' : 'badge-video'}`}>{item.type}</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                      {item.title}
                    </p>
                    {item.sport && (
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.72rem', color: '#A91D3A', marginTop: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.sport}
                      </p>
                    )}
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Lightbox */}
      {lightbox && (() => {
        const idx = filteredMedia.findIndex(m => m.id === lightbox.id);
        const prev = idx > 0 ? filteredMedia[idx - 1] : null;
        const next = idx < filteredMedia.length - 1 ? filteredMedia[idx + 1] : null;
        return (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            {prev && (
              <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightbox(prev); }}>‹</button>
            )}
            {next && (
              <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightbox(next); }}>›</button>
            )}
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              {lightbox.type === "image" ? (
                <img src={lightbox.data} alt={lightbox.title} className="lightbox-img" />
              ) : (
                <div style={{ fontSize: '5rem', padding: '60px 80px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>🎥</div>
              )}
              <div className="lightbox-caption">
                <div className="title">{lightbox.title}</div>
                <div className="meta">
                  {lightbox.sport && <span style={{ color: '#A91D3A', marginRight: 8 }}>{lightbox.sport}</span>}
                  {lightbox.type}
                  {idx >= 0 && <span style={{ marginLeft: 8, opacity: 0.5 }}>{idx + 1} / {filteredMedia.length}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}