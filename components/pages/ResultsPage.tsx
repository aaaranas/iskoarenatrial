"use client";
import React, { useState } from "react";
import type { Match, Result } from "@/types";

interface ResultsPageProps {
  matches: Match[];
  results: Result[];
  onRecordResult: (matchId: string, teamA: string, teamB: string, scoreA: number, scoreB: number, sport: string) => void;
}

export default function ResultsPage({ matches, results, onRecordResult }: ResultsPageProps) {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) { alert("Please select a match"); return; }
    const [matchId, teamA, teamB] = selectedMatch.split("|");
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b)) { alert("Please enter valid scores"); return; }
    const match = matches.find((m) => m.id === matchId);
    if (!match) { alert("Match not found"); return; }
    onRecordResult(matchId, teamA, teamB, a, b, match.sport);
    setSelectedMatch("");
    setScoreA("");
    setScoreB("");
  };

  const showScores = selectedMatch !== "";
  const selectedMatchData = showScores ? matches.find((m) => m.id === selectedMatch.split("|")[0]) : null;

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .results-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .results-hero-title span.accent { color: #A91D3A; }

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

        /* Score entry card */
        .scoreboard-entry {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 20px;
          align-items: center;
          margin-bottom: 24px;
        }
        .score-team-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          font-style: italic;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 10px;
          text-align: center;
        }
        .score-input {
          width: 100%;
          padding: 16px;
          background: rgba(255,255,255,0.06);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          text-align: center;
          outline: none;
          transition: border-color 0.2s;
        }
        .score-input:focus { border-color: #A91D3A; }
        .score-input::placeholder { color: rgba(255,255,255,0.15); }
        .vs-divider {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          font-style: italic;
          color: #A91D3A;
          text-align: center;
          letter-spacing: 0.05em;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-save:hover { background: #15803d; transform: translateY(-2px); }

        /* Results table */
        .results-table { width: 100%; border-collapse: collapse; }
        .results-table thead tr {
          background: rgba(169,29,58,0.15);
          border-bottom: 2px solid rgba(169,29,58,0.4);
        }
        .results-table th {
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
        .results-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .results-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .results-table td {
          padding: 13px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.75);
        }

        .scoreline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-style: italic;
        }
        .scoreline .team { font-size: 0.95rem; color: rgba(255,255,255,0.8); }
        .scoreline .score {
          font-size: 1.4rem;
          color: #fff;
          min-width: 28px;
          text-align: center;
        }
        .scoreline .score.winner-score { color: #4ade80; }
        .scoreline .hyphen { color: rgba(255,255,255,0.25); font-size: 1rem; }

        .winner-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .winner-badge.draw {
          background: rgba(234,179,8,0.15);
          color: #fbbf24;
          border: 1px solid rgba(234,179,8,0.25);
        }
        .winner-badge.win {
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.2);
        }

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
          <h1 className="results-hero-title">
            GAME <span className="accent">RESULTS</span>
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            RECORD · REVIEW · ARCHIVE
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Record Result Form */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Record Result</h3>
            <div className="line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Select Match *</label>
              <select className="field-input" value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} required>
                <option value="">Choose a match to record</option>
                {matches.map((m) => (
                  <option key={m.id} value={`${m.id}|${m.teamA}|${m.teamB}`}>
                    {m.sport} — {m.teamA} vs {m.teamB} ({m.date})
                  </option>
                ))}
              </select>
            </div>

            {showScores && selectedMatchData && (
              <>
                <div className="scoreboard-entry">
                  {/* Team A */}
                  <div>
                    <div className="score-team-label">{selectedMatchData.teamA}</div>
                    <input
                      type="number"
                      min="0"
                      className="score-input"
                      placeholder="0"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      required
                    />
                  </div>
                  {/* VS */}
                  <div className="vs-divider">VS</div>
                  {/* Team B */}
                  <div>
                    <div className="score-team-label">{selectedMatchData.teamB}</div>
                    <input
                      type="number"
                      min="0"
                      className="score-input"
                      placeholder="0"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save">✓ Save Result</button>
              </>
            )}
          </form>
        </div>

        {/* Results History */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Results History</h3>
            <div className="line" />
            {results.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {results.length} RESULT{results.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="results-table">
              <thead>
                <tr>
                  {["Sport", "Scoreline", "Date", "Winner"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '14px' }}>🏅</div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          No results recorded yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((r) => {
                    const aWon = r.scoreA > r.scoreB;
                    const bWon = r.scoreB > r.scoreA;
                    return (
                      <tr key={r.id}>
                        <td><span className="sport-badge">{r.sport}</span></td>
                        <td>
                          <div className="scoreline">
                            <span className="team" style={{ color: aWon ? '#fff' : 'rgba(255,255,255,0.45)' }}>{r.teamA}</span>
                            <span className={`score ${aWon ? 'winner-score' : ''}`}>{r.scoreA}</span>
                            <span className="hyphen">—</span>
                            <span className={`score ${bWon ? 'winner-score' : ''}`}>{r.scoreB}</span>
                            <span className="team" style={{ color: bWon ? '#fff' : 'rgba(255,255,255,0.45)' }}>{r.teamB}</span>
                          </div>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`winner-badge ${r.winner === 'Draw' ? 'draw' : 'win'}`}>
                            {r.winner === 'Draw' ? 'Draw' : `🏆 ${r.winner}`}
                          </span>
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
    </div>
  );
}