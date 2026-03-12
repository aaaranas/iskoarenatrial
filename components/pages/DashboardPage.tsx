"use client";

import React from "react";
import { Trophy, Zap, Users, User, Calendar } from "lucide-react";

export interface Match { id: string; sport: string; teamA: string; teamB: string; date: string; time: string; }
export interface Result { matchId: string; scoreA: number; scoreB: number; winnerId: string; }
export interface Player { id: string; name: string; teamId: string; }
export interface Team { id: string; name: string; org: string; }

interface DashboardPageProps {
  matches: Match[];
  results: Result[];
  players: Player[];
  teams: Team[];
}

export default function DashboardPage({ matches, results, players, teams }: DashboardPageProps) {
  const now = new Date();

  const ongoingMatches = matches.filter((match) => {
    const matchDateTime = new Date(`${match.date}T${match.time}`);
    const timeDiff = now.getTime() - matchDateTime.getTime();
    const hasResult = results.some((r) => r.matchId === match.id);
    return timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000 && !hasResult;
  });

  const recentMatches = [...matches].slice(-5).reverse();

  const statCards = [
    { label: "Total Matches", value: matches.length, icon: Trophy, sub: "All sports" },
    { label: "Live Now", value: ongoingMatches.length, icon: Zap, sub: "In Play", isLive: true },
    { label: "Total Teams", value: teams.length, icon: Users, sub: "Organizations" },
    { label: "Total Players", value: players.length, icon: User, sub: "Registered" },
  ];

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .dash-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        .dash-hero-title span.accent { color: #A91D3A; }
        .hero-bar { display: inline-block; height: 6px; background: #A91D3A; width: 80px; margin-bottom: 12px; }

        /* Stat Cards */
        .stat-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(169,29,58,0.35); transform: translateY(-2px); }
        .stat-card.live {
          border-color: rgba(169,29,58,0.4);
          background: linear-gradient(135deg, #111 60%, rgba(169,29,58,0.08) 100%);
        }
        .stat-card-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }
        .stat-card-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 3.5rem; font-weight: 900; font-style: italic;
          line-height: 1; color: #fff; letter-spacing: -0.02em;
        }
        .stat-card-value.live-val { color: #f87171; }
        .stat-card-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem; color: rgba(255,255,255,0.3);
          margin-top: 8px;
        }
        .stat-card-icon {
          position: absolute; top: 20px; right: 20px;
          opacity: 0.1; transform: rotate(-10deg);
        }
        .live-dot {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem;
          font-weight: 700; letter-spacing: 0.1em; color: #f87171; margin-top: 8px;
        }
        .live-dot span {
          width: 7px; height: 7px; background: #f87171; border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* Section card */
        .section-card { background: #111; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }

        .section-divider { display: flex; align-items: center; gap: 14px; padding: 24px 28px 0; margin-bottom: 20px; }
        .section-divider h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem; font-weight: 800; font-style: italic;
          text-transform: uppercase; color: #fff; white-space: nowrap; letter-spacing: 0.02em;
        }
        .section-divider .line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .section-divider .dot { width: 8px; height: 8px; background: #A91D3A; border-radius: 50%; flex-shrink: 0; }

        /* Table */
        .dash-table { width: 100%; border-collapse: collapse; }
        .dash-table thead tr { background: rgba(169,29,58,0.15); border-bottom: 2px solid rgba(169,29,58,0.35); }
        .dash-table th {
          padding: 11px 14px; text-align: left;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: #A91D3A; white-space: nowrap;
        }
        .dash-table th:first-child { padding-left: 28px; }
        .dash-table th:last-child { padding-right: 28px; text-align: right; }
        .dash-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
        .dash-table tbody tr:last-child { border-bottom: none; }
        .dash-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .dash-table td { padding: 14px; font-family: 'Barlow', sans-serif; font-size: 0.875rem; color: rgba(255,255,255,0.75); }
        .dash-table td:first-child { padding-left: 28px; }
        .dash-table td:last-child { padding-right: 28px; text-align: right; }

        .sport-badge {
          display: inline-block; padding: 2px 9px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);
        }

        .matchup-cell {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800; font-style: italic; font-size: 1rem; color: #fff;
          display: flex; align-items: center; gap: 8px;
        }
        .vs-tag {
          font-size: 0.62rem; font-weight: 800; color: #A91D3A;
          background: rgba(169,29,58,0.15); border: 1px solid rgba(169,29,58,0.3);
          border-radius: 3px; padding: 1px 5px; letter-spacing: 0.06em;
        }

        .status-live {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(169,29,58,0.2); color: #f87171; border: 1px solid rgba(169,29,58,0.4);
        }
        .status-finished {
          display: inline-block; padding: 3px 10px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2);
        }
        .status-upcoming {
          display: inline-block; padding: 3px 10px; border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(234,179,8,0.1); color: #fbbf24; border: 1px solid rgba(234,179,8,0.2);
        }

        /* CTA Banner */
        .cta-banner {
          background: linear-gradient(135deg, #111 0%, #1a0508 60%, #111 100%);
          border: 1px solid rgba(169,29,58,0.25);
          border-radius: 16px;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute; inset: 0; opacity: 0.03;
          background-image: repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px);
        }
        .cta-icon-box {
          width: 52px; height: 52px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cta-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.3rem; font-weight: 800; font-style: italic;
          color: #fff; text-transform: uppercase; letter-spacing: 0.02em;
        }
        .cta-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-top: 4px;
        }
        .cta-btn {
          padding: 12px 32px; background: #fff; color: #0a0a0a;
          border: none; border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, transform 0.15s; flex-shrink: 0;
        }
        .cta-btn:hover { background: #e5e5e5; transform: translateY(-2px); }
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
          <h1 className="dash-hero-title">ISKO <span className="accent">ARENA</span></h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            ADMIN CONSOLE · LIVE OPERATIONS
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Stat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {statCards.map((card) => (
            <div key={card.label} className={`stat-card ${card.isLive ? 'live' : ''}`}>
              <div className="stat-card-icon">
                <card.icon size={48} color="#fff" />
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className={`stat-card-value ${card.isLive ? 'live-val' : ''}`}>{card.value}</div>
              {card.isLive ? (
                <div className="live-dot"><span />{card.value > 0 ? 'LIVE NOW' : 'NO LIVE GAMES'}</div>
              ) : (
                <div className="stat-card-sub">{card.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Matches Table */}
        <div className="section-card">
          <div className="section-divider">
            <div className="dot" />
            <h3>Recent Matches</h3>
            <div className="line" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              LAST {recentMatches.length}
            </span>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>Sport</th>
                <th>Matchup</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                      <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '12px' }}>🏆</div>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        No matches scheduled yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentMatches.map((match) => {
                  const hasResult = results.some((r) => r.matchId === match.id);
                  const isLive = ongoingMatches.some((m) => m.id === match.id);
                  return (
                    <tr key={match.id}>
                      <td><span className="sport-badge">{match.sport}</span></td>
                      <td>
                        <div className="matchup-cell">
                          <span>{match.teamA}</span>
                          <span className="vs-tag">VS</span>
                          <span>{match.teamB}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem' }}>{match.date}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow', sans-serif", fontSize: '0.82rem' }}>{match.time}</td>
                      <td>
                        {isLive ? (
                          <span className="status-live"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />LIVE</span>
                        ) : hasResult ? (
                          <span className="status-finished">Finished</span>
                        ) : (
                          <span className="status-upcoming">Upcoming</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ height: '4px' }} />
        </div>

        {/* CTA Banner */}
        <div className="cta-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div className="cta-icon-box">
              <Calendar size={24} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <div className="cta-title">Next Tournament Briefing</div>
              <div className="cta-sub">Tomorrow at 10:00 AM · Conference Hall B</div>
            </div>
          </div>
          <button className="cta-btn" style={{ position: 'relative', zIndex: 1 }}>Join Session</button>
        </div>

      </div>
    </div>
  );
}