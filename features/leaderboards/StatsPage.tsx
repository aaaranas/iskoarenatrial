"use client";

// ─────────────────────────────────────────────────────────────────────────
// Leaderboard — V1 "Competitive Arena"
// Source: design handoff `design_handoff_leaderboard_v1/v1.jsx`
// Hero · sticky toolbar · podium tier · per-sport match cards · insights · footer
//
// DATA SOURCE
//   Single trpc.match.getAll call. All standings, event placements, W-L records,
//   and the live ticker are derived client-side from this dataset.
//
// EVENT CONTEXT
//   IskoLaro is a 5-day event (Mon–Fri). All matches for the year happen in one
//   week. The Game Day filter was removed per Dominique's request — public
//   viewers see aggregate standings across all 5 days by default.
//
// PLACEMENT MODEL
//   For each event (sport + category), completed matches determine the W-L
//   record per college. Colleges are ranked by win-pct descending:
//     rank 0 → 1st → 20 pts
//     rank 1 → 2nd → 15 pts
//     rank 2 → 3rd → 10 pts
//     rank 3 → 4th →  5 pts
// ─────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { trpc } from "@/lib/trpc";
import { isToday } from "@/components/dashboard/dashboard-data";

// Brand palette — design's gold (#C5A059) is distinct from ia-gold (#D4AF37).
const GOLD   = "#C5A059";
const SILVER = "#d8d8d8";
const BRONZE = "#a87b3f";
const RED    = "#A91D3A";

const POINTS = [20, 15, 10, 5] as const;

// Real college logos — files live in /public/colleges/
const COLLEGE_LOGOS: Record<string, string> = {
  COS:  "/colleges/cos_logo.jpg",
  CSS:  "/colleges/css_logo.jpg",
  CCAD: "/colleges/ccad_logo.jpg",
  SOM:  "/colleges/som_logo.jpg",
};

const COLLEGE_ACCENT: Record<string, string> = {
  COS:  "#3B82F6",
  CSS:  "#10B981",
  CCAD: "#A78BFA",
  SOM:  "#F59E0B",
};

const COLLEGE_LONG: Record<string, string> = {
  COS:  "Scions",
  CSS:  "Stallions",
  CCAD: "Phoenix",
  SOM:  "Tycoons",
};

// Sport icons keyed by canonical DB sport name. Covers all 24 sports.
const SPORT_ICON_BY_SPORT: Record<string, string> = {
  Basketball:          "🏀",
  Volleyball:          "🏐",
  Badminton:           "🏸",
  "Table Tennis":      "🏓",
  Soccer:              "⚽",
  Softball:            "🥎",
  Pickleball:          "🎾",
  Petanque:            "⚙️",
  Frisbee:             "🥏",
  MLBB:                "⚔️",
  CODM:                "🎯",
  Valorant:            "◈",
  "Dota 2":            "🔮",
  Chess:               "♟️",
  Scrabble:            "🔤",
  Sudoku:              "#",
  Tetris:              "▦",
  "Rubiks Cube":       "⬛",
  "Block Blast":       "💥",
  Cosplay:             "🎭",
  Dancesports:         "💃",
  Cheerdance:          "📣",
  "Mr. & Ms. Fitness": "🏋",
  "Pinoy Games":       "🪅",
};

type Standing = {
  code: string;
  long: string;
  accent: string;
  total: number;
  finishes: [number, number, number, number];
  rank: number;
};

type SportEvent = { key: string; sport: string; category: string | null };

// ─────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [activeSport,  setActiveSport]  = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");

  // Single data source — all derived state is computed from this.
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery(undefined, {
    staleTime: 30_000,
  });

  // ── All sport+category combinations present in match data ─────────────
  const dynamicSportEvents = useMemo((): SportEvent[] => {
    if (!matchesData) return [];
    const seen = new Map<string, SportEvent>();
    for (const m of matchesData) {
      const key = m.category ? `${m.league} · ${m.category}` : m.league;
      if (!seen.has(key)) seen.set(key, { key, sport: m.league, category: m.category ?? null });
    }
    return Array.from(seen.values()).sort((a, b) => {
      const sc = a.sport.localeCompare(b.sport);
      if (sc !== 0) return sc;
      return (a.category ?? "").localeCompare(b.category ?? "");
    });
  }, [matchesData]);

  const sportList = useMemo(
    () => ["All", ...dynamicSportEvents.map(e => e.key)],
    [dynamicSportEvents]
  );

  // ── Event standings — tally W/L per college for every dynamic event ───
  const { EVENTS, RECORDS } = useMemo(() => {
    const EVENTS:  Record<string, [string, string, string, string]> = {};
    const RECORDS: Record<string, Record<string, string>>            = {};

    for (const { key, sport, category } of dynamicSportEvents) {
      const eventMatches = (matchesData ?? []).filter(m =>
        m.statusType === "completed" &&
        m.league === sport &&
        (category === null ? !m.category : m.category === category)
      );

      const tally: Record<string, { w: number; l: number }> = {
        COS: { w: 0, l: 0 }, CSS: { w: 0, l: 0 },
        CCAD: { w: 0, l: 0 }, SOM: { w: 0, l: 0 },
      };

      for (const m of eventMatches) {
        const home = m.homeTeamOrg?.toUpperCase();
        const away = m.awayTeamOrg?.toUpperCase();
        if (!home || !away || !tally[home] || !tally[away]) continue;
        const hs  = m.homeScore ?? 0;
        const as_ = m.awayScore ?? 0;
        if (hs === as_) continue;
        if (hs > as_) { tally[home].w++; tally[away].l++; }
        else           { tally[away].w++; tally[home].l++; }
      }

      const sorted = Object.entries(tally)
        .map(([code, { w, l }]) => ({ code, w, l, pct: (w + l) === 0 ? 0 : w / (w + l) }))
        .sort((a, b) => b.pct - a.pct || b.w - a.w);

      const hasAnyGame = sorted.some(s => s.w + s.l > 0);
      if (!hasAnyGame) {
        EVENTS[key]  = ["?", "?", "?", "?"];
        RECORDS[key] = {};
      } else {
        EVENTS[key]  = sorted.map(s => s.code) as [string, string, string, string];
        RECORDS[key] = Object.fromEntries(sorted.map(s => [s.code, `${s.w}-${s.l}`]));
      }
    }

    return { EVENTS, RECORDS };
  }, [matchesData, dynamicSportEvents]);

  // ── Aggregate standings ───────────────────────────────────────────────
  const standings = useMemo((): Standing[] => {
    const codes = Object.keys(COLLEGE_ACCENT);
    const agg: Record<string, Standing> = Object.fromEntries(
      codes.map(c => [c, {
        code: c, long: COLLEGE_LONG[c] ?? c, accent: COLLEGE_ACCENT[c],
        total: 0, finishes: [0, 0, 0, 0] as [number, number, number, number], rank: 0,
      }])
    );

    const eventsToCount = activeSport === "All"
      ? Object.values(EVENTS)
      : EVENTS[activeSport] ? [EVENTS[activeSport]] : [];

    for (const places of eventsToCount) {
      places.forEach((code, idx) => {
        if (idx < 4 && code !== "?" && agg[code]) {
          agg[code].total += POINTS[idx];
          (agg[code].finishes[idx] as number)++;
        }
      });
    }

    const sorted = Object.values(agg).sort((a, b) => b.total - a.total || b.finishes[0] - a.finishes[0]);
    sorted.forEach((s, i) => (s.rank = i + 1));
    return sorted;
  }, [EVENTS, activeSport]);

  const displayStandings = useMemo(() =>
    searchQuery
      ? standings.filter(s =>
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.long.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : standings,
    [standings, searchQuery]
  );

  // ── Insights ──────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    if (standings.length < 2 || standings.every(s => s.total === 0)) return [
      { label: "Top Margin",    value: "—", sub: "No completed events yet" },
      { label: "Most Golds",    value: "—", sub: "No event winners yet"     },
      { label: "Sweep Watch",   value: "—", sub: "No undefeated run yet"    },
      { label: "Biggest Upset", value: "—", sub: "No data available"        },
    ];

    const topMargin = standings[0].total - standings[1].total;
    const maxGolds  = Math.max(...standings.map(s => s.finishes[0]));
    const goldCodes = standings.filter(s => s.finishes[0] === maxGolds).map(s => s.code).join(", ");

    let sweepCode = "—";
    let sweepSub  = "No undefeated run yet";
    outer: for (const [event, rec] of Object.entries(RECORDS)) {
      for (const [code, wl] of Object.entries(rec)) {
        const [w, l] = wl.split("-").map(Number);
        if (l === 0 && w > 0) { sweepCode = code; sweepSub = `undefeated · ${event}`; break outer; }
      }
    }

    let upsetCode = "—";
    let upsetSub  = "No contrast yet";
    let maxGap    = 0;
    for (const code of Object.keys(COLLEGE_ACCENT)) {
      const eventWins = dynamicSportEvents.map(({ key }) => {
        const rec = RECORDS[key]?.[code];
        return rec ? Number(rec.split("-")[0]) : 0;
      });
      const gap = Math.max(...eventWins) - Math.min(...eventWins);
      if (gap > maxGap) { maxGap = gap; upsetCode = code; upsetSub = `${gap}-win swing across events`; }
    }

    return [
      { label: "Top Margin",    value: topMargin > 0 ? `${topMargin} PTS` : "—", sub: `${standings[0].code} over ${standings[1].code} · overall` },
      { label: "Most Golds",    value: maxGolds > 0 ? String(maxGolds) : "—",     sub: goldCodes ? `${goldCodes} · ${maxGolds} gold${maxGolds > 1 ? "s" : ""}` : "No golds yet" },
      { label: "Sweep Watch",   value: sweepCode,                                   sub: sweepSub },
      { label: "Biggest Upset", value: upsetCode !== "—" ? upsetCode : "—",         sub: upsetSub },
    ];
  }, [standings, RECORDS, dynamicSportEvents]);

  // ── Live ticker ───────────────────────────────────────────────────────
  const tickerItems = useMemo((): string[] => {
    if (!matchesData) return [];
    return matchesData
      .filter(m => isToday(m.rawDate) && (m.statusType === "live" || m.statusType === "completed"))
      .slice(0, 5)
      .map(m => {
        const cat     = m.category ? ` ${m.category}` : "";
        const homeOrg = m.homeTeamOrg || "?";
        const awayOrg = m.awayTeamOrg || "?";
        if (m.statusType === "live")
          return `${homeOrg} ${m.homeScore ?? 0} – ${m.awayScore ?? 0} ${awayOrg} · ${m.league}${cat}`;
        const win = (m.homeScore ?? 0) > (m.awayScore ?? 0) ? homeOrg : awayOrg;
        const los = win === homeOrg ? awayOrg : homeOrg;
        return `${win} def. ${los} · ${m.league}${cat}`;
      });
  }, [matchesData]);

  const base          = displayStandings.length >= 4 ? displayStandings : standings;
  const podium        = [base[1], base[0], base[2]];
  const podiumHeights = [220, 320, 170];
  const fourth        = base[3];

  const visibleEvents = activeSport === "All"
    ? Object.entries(EVENTS)
    : Object.entries(EVENTS).filter(([k]) => k === activeSport);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Syncing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-zinc-200 font-sans min-h-screen overflow-x-hidden selection:bg-[#A91D3A]">

      {/* ── HERO ── */}
      <Hero tickerItems={tickerItems} />

      {/* ── TOOLBAR — Sport pills + Query (no game-day filter) ── */}
      <Toolbar
        sportList={sportList}
        activeSport={activeSport}
        setActiveSport={setActiveSport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ── 01 · PODIUM ── */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader
          eyebrow="01 · Overall Dominance"
          title="THE PODIUM"
          subtitle="Aggregate points across every sport, every bracket."
        />
        <PodiumBoard podium={podium} heights={podiumHeights} />

        {fourth && (
          <div className="flex items-center gap-6 mt-12 px-6">
            <div className="font-mono text-[10px] font-bold uppercase text-zinc-500 w-[140px] flex-shrink-0" style={{ letterSpacing: "0.3em" }}>
              04 · OUTSIDER
            </div>
            <div className="flex-1 flex items-center gap-5 px-6 py-[18px] bg-white/[0.02] border border-white/[0.06]">
              <CollegeLogo code={fourth.code} accent={fourth.accent} size={48} />
              <div>
                <div className="font-bebas italic text-[28px] text-zinc-200 leading-none">{fourth.code}</div>
                <div className="text-[10px] uppercase text-zinc-500 mt-0.5" style={{ letterSpacing: "0.2em" }}>{fourth.long}</div>
              </div>
              <div className="flex gap-3 font-mono text-[11px] text-zinc-400">
                <span className="bg-white/[0.04] px-2.5 py-1 border border-white/[0.06]">★ {fourth.finishes[0]}</span>
                <span className="bg-white/[0.04] px-2.5 py-1 border border-white/[0.06]">✦ {fourth.finishes[3]}</span>
              </div>
              <div className="flex-1" />
              <div className="font-bebas italic text-[28px]" style={{ color: GOLD }}>
                <span>{fourth.total}</span> <span className="text-[14px]">PTS</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 02 · MATCH CARDS — horizontal draggable carousel ── */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader
          eyebrow="02 · By the Sport"
          title="MATCH CARDS"
          subtitle="Every discipline tracked. Drag the deck or use the arrows to browse all events."
        />
        <MatchCardsCarousel visibleEvents={visibleEvents} records={RECORDS} />
      </section>

      {/* ── 03 · INSIGHTS ── */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader eyebrow="03 · Insights" title="ARENA NOTES" subtitle="Numbers worth shouting." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {insights.map((item, idx) => (
            <div key={item.label} className="px-6 py-7 bg-[#0a0a0a] border border-white/[0.06] relative overflow-hidden">
              <div className="font-mono text-[10px] font-bold uppercase text-zinc-500" style={{ letterSpacing: "0.25em" }}>
                {String(idx + 1).padStart(2, "0")} · {item.label}
              </div>
              <div className="font-bebas italic text-[64px] leading-none mt-3.5 text-[#f3f1ec]">{item.value}</div>
              <div className="text-xs text-zinc-500 mt-3 leading-snug">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex justify-between items-center px-20 py-12 mt-20 border-t border-white/[0.06]">
        <div className="flex flex-col">
          <div className="font-bebas italic text-[22px]" style={{ letterSpacing: "0.05em" }}>
            ISKO<span style={{ color: GOLD }}>·</span>ARENA
          </div>
          <div className="font-mono text-[10px] text-zinc-500 mt-1" style={{ letterSpacing: "0.2em" }}>
            Leaderboards · v2 · 2026
          </div>
        </div>
        <div className="flex gap-6 font-mono text-[10px] text-zinc-400" style={{ letterSpacing: "0.3em" }}>
          <span>EXPORT PDF</span>
          <span>SHARE</span>
          <span>EMBED</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  HERO
// ─────────────────────────────────────────────────────────────────────────
function Hero({ tickerItems }: { tickerItems: string[] }) {
  const items = tickerItems.length > 0 ? tickerItems : ["No live matches right now · check back soon"];
  return (
    <header className="relative overflow-hidden h-[560px] border-b border-white/[0.05]">
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(-30deg, #0a0a0a 0 24px, #0e0e0e 24px 48px)", opacity: 0.45 }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(169,29,58,.22), transparent 55%), linear-gradient(180deg, transparent 60%, #050505 100%)" }} />
      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-20 pt-[90px] pb-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase" style={{ color: GOLD, letterSpacing: "0.3em" }}>
            <span style={{ color: RED, fontSize: 10 }}>●</span>
            <span>IskoLaro 2026 · Live Ledger</span>
          </div>
          <h1 className="font-bebas italic mt-6 mb-0 text-[#f3f1ec]" style={{ fontSize: 240, lineHeight: 0.82, letterSpacing: "-0.02em", fontWeight: 400 }}>
            LEADER<br />BOARD<span style={{ color: GOLD }}>.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-[540px] mt-4 leading-snug">
            Quantifying campus dominance across every bracket.
          </p>
          <p className="text-[10px] font-black uppercase text-zinc-600 mt-0 mb-6" style={{ letterSpacing: "0.4em" }}>
            TRACK COLLEGE PERFORMANCE · CELEBRATE EXCELLENCE
          </p>
        </div>
        <div className="relative flex items-center gap-5 font-mono text-[11px] text-zinc-300 -mx-20 px-6 py-3.5 border-y border-white/[0.06]" style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", letterSpacing: "0.08em" }}>
          <span className="font-black flex-shrink-0" style={{ color: RED, letterSpacing: "0.3em", fontSize: 10 }}>● LIVE</span>
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-5">
              {i > 0 && <span className="text-zinc-700">|</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  TOOLBAR — sport pills + query (game-day filter removed)
// ─────────────────────────────────────────────────────────────────────────
function Toolbar(props: {
  sportList: string[];
  activeSport: string;
  setActiveSport: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  return (
    <div className="sticky top-16 z-30 bg-[#080808] border-b border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-20 py-4 flex items-center gap-8 flex-wrap">
        <ToolbarGroup label="SPORT">
          {props.sportList.map(s => (
            <ToolbarPill key={s} active={s === props.activeSport} onClick={() => props.setActiveSport(s)}>{s}</ToolbarPill>
          ))}
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup label="QUERY">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#0e0e0e] border border-white/[0.06] min-w-[200px]">
            <Search className="w-3 h-3 text-zinc-600" />
            <input
              value={props.searchQuery}
              onChange={e => props.setSearchQuery(e.target.value)}
              placeholder="college name..."
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-zinc-200 placeholder:text-zinc-600 w-full"
              style={{ letterSpacing: "0.2em" }}
            />
          </div>
        </ToolbarGroup>
      </div>
    </div>
  );
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="font-mono text-[9px] font-bold uppercase text-zinc-500" style={{ letterSpacing: "0.3em" }}>{label}</span>
      <div className="flex gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function ToolbarPill({ active, onClick, children }: { active: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-[10px] font-black uppercase px-3.5 py-2 transition-colors cursor-pointer" style={{ letterSpacing: "0.18em", background: active ? RED : "transparent", color: active ? "#fff" : "#9a9a9a", border: active ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </button>
  );
}

function ToolbarDivider() { return <div className="w-px h-6 bg-white/[0.08]" />; }

// ─────────────────────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-12 relative">
      <div className="font-mono text-[11px] font-bold uppercase flex items-center gap-2.5 mb-3.5" style={{ color: GOLD, letterSpacing: "0.3em" }}>
        <span style={{ color: RED }}>◆</span>{eyebrow}
      </div>
      <h2 className="font-bebas italic text-[#f3f1ec] m-0" style={{ fontSize: 96, lineHeight: 0.9, letterSpacing: "-0.01em", fontWeight: 400 }}>{title}</h2>
      <p className="text-base text-zinc-500 mt-3 max-w-[540px]">{subtitle}</p>
      <div className="h-px mt-6" style={{ background: "linear-gradient(90deg, rgba(197,160,89,.5), transparent)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  COLLEGE LOGO — uses real /colleges/*.jpg; falls back to gradient disc
// ─────────────────────────────────────────────────────────────────────────
function CollegeLogo({ code, accent, size = 64, ring = false }: { code: string; accent: string; size?: number; ring?: boolean }) {
  const logoSrc = COLLEGE_LOGOS[code];
  return (
    <div
      className="rounded-full flex-shrink-0 overflow-hidden"
      style={{
        width:  size,
        height: size,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: ring
          ? `0 0 0 3px ${GOLD}, 0 0 0 5px #050505, 0 0 0 6px rgba(255,255,255,.06)`
          : "none",
        background: `linear-gradient(135deg, ${accent} 0%, #0a0a0a 130%)`,
      }}
    >
      {logoSrc ? (
        <img src={logoSrc} alt={code} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div className="w-full h-full relative flex items-center justify-center font-bebas text-white" style={{ fontSize: size * 0.42, letterSpacing: "0.04em" }}>
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.18) 6px 7px)", mixBlendMode: "overlay" }} />
          <span className="relative z-10">{code}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  FINISH PILL
// ─────────────────────────────────────────────────────────────────────────
function FinishPill({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center px-1 py-2 bg-white/[0.02] border border-white/[0.06]">
      <div className="font-bebas italic font-black leading-none" style={{ color, fontSize: 18 }}>{n}</div>
      <div className="font-bebas text-[8px] font-black uppercase text-zinc-600 mt-1" style={{ letterSpacing: "0.2em" }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  PODIUM BOARD
// ─────────────────────────────────────────────────────────────────────────
function PodiumBoard({ podium, heights }: { podium: (Standing | undefined)[]; heights: number[] }) {
  return (
    <div className="relative px-5 pt-10 pb-14 border border-white/[0.05] overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0a0a, #050505)" }}>
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute left-1/2 top-[60%] w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ border: "1px solid rgba(197,160,89,0.15)" }} />
        <div className="absolute left-0 right-0 top-[60%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "linear-gradient(180deg, transparent, rgba(197,160,89,0.18), transparent)" }} />
      </div>
      <div className="relative flex items-end justify-center gap-6 pt-10">
        {podium.map((c, i) => {
          if (!c) return null;
          const rank  = c.rank;
          const isWin = rank === 1;
          return (
            <div key={c.code} className="flex flex-col items-center transition-transform duration-300" style={{ flex: "0 1 320px", transform: `translateY(${isWin ? -20 : 0}px)` }}>
              <div className="w-full px-6 py-7 backdrop-blur-md flex flex-col items-center relative" style={{ background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="absolute -top-3.5 -right-3.5 w-11 h-11 rounded-full font-bebas italic font-black flex items-center justify-center" style={{ background: rank === 1 ? GOLD : rank === 2 ? SILVER : BRONZE, color: "#0a0a0a", fontSize: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", border: "2px solid #050505" }}>
                  {rank === 1 ? "01" : rank === 2 ? "02" : "03"}
                </div>
                <CollegeLogo code={c.code} accent={c.accent} size={isWin ? 96 : 72} ring={isWin} />
                <div className="font-bebas italic text-[#f3f1ec] mt-4 leading-none" style={{ fontSize: 48, letterSpacing: "0.02em" }}>{c.code}</div>
                <div className="text-[11px] font-bold uppercase text-zinc-500 mt-1.5" style={{ letterSpacing: "0.2em" }}>{c.long}</div>
                <div className="flex items-baseline gap-1.5 mt-5 py-3 w-full justify-center border-y border-white/[0.06]">
                  <span className="font-bebas italic leading-none" style={{ fontSize: 64, color: GOLD, fontWeight: 400 }}>{c.total}</span>
                  <span className="font-mono text-[11px] font-bold text-zinc-500" style={{ letterSpacing: "0.3em" }}>PTS</span>
                </div>
                <div className="flex gap-1.5 mt-4 w-full">
                  <FinishPill n={c.finishes[0]} label="1st" color={GOLD}   />
                  <FinishPill n={c.finishes[1]} label="2nd" color={SILVER} />
                  <FinishPill n={c.finishes[2]} label="3rd" color={BRONZE} />
                  <FinishPill n={c.finishes[3]} label="4th" color="#555"   />
                </div>
              </div>
              <div className="w-[90%] relative flex flex-col justify-center items-center overflow-hidden" style={{ height: heights[i], background: "linear-gradient(180deg, #1a1c20 0%, #0a0a0a 100%)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none" }}>
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
                <div className="font-bebas italic absolute top-1/2 -translate-y-1/2 leading-none" style={{ fontSize: 96, color: "rgba(255,255,255,0.04)" }}>0{rank}</div>
                <div className="font-mono text-[11px] font-bold uppercase text-zinc-500 relative z-10" style={{ letterSpacing: "0.3em" }}>
                  {rank === 1 ? "CHAMPION TIER" : rank === 2 ? "CONTENDER" : "CHALLENGER"}
                </div>
                {isWin && <div className="text-sm mt-2 relative z-10" style={{ color: GOLD, letterSpacing: "0.4em", fontFamily: "serif" }}>★ ★ ★ ★ ★</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  MATCH CARDS CAROUSEL — Embla-powered horizontal slider
//  Drag, swipe (touch), or use the prev/next nav buttons to browse cards.
//  Layout: 1 card per slide on mobile, 2 cards per slide on md+ screens.
// ─────────────────────────────────────────────────────────────────────────
function MatchCardsCarousel({
  visibleEvents,
  records,
}: {
  visibleEvents: Array<[string, [string, string, string, string]]>;
  records: Record<string, Record<string, string>>;
}) {
  // Embla setup — drag is enabled by default. align:start anchors slides to the
  // left edge; skipSnaps:false ensures every card is reachable via arrows.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop:       false,
    align:      "start",
    skipSnaps:  false,
    dragFree:   false, // snap to nearest card after drag
  });

  // Track whether the carousel can scroll in either direction so we can grey
  // out the nav buttons when there's nothing further to scroll to.
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  // Re-init Embla when the data changes (sport filter toggle, new matches).
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, visibleEvents.length]);

  if (visibleEvents.length === 0) {
    return (
      <div className="text-center py-20 font-mono text-[11px] text-zinc-600 uppercase tracking-widest">
        No matches found for this sport
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top-right nav row — sits above the carousel, broadcast-bar style.
          Shows current card index out of total + prev/next buttons. */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] font-bold uppercase text-zinc-500" style={{ letterSpacing: "0.3em" }}>
          {visibleEvents.length} {visibleEvents.length === 1 ? "EVENT" : "EVENTS"}
        </div>
        <div className="flex items-center gap-2">
          <CarouselNavButton onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} dir="prev" />
          <CarouselNavButton onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} dir="next" />
        </div>
      </div>

      {/* Embla viewport — overflow-hidden clips the slides; ref drives the slider.
          cursor-grab/active:cursor-grabbing communicates draggability to mouse users. */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        {/* Slide container — flex row with gap; each slide is a fixed-width child. */}
        <div className="flex gap-6">
          {visibleEvents.map(([event, places]) => (
            // flex-[0_0_100%] = full viewport width on mobile (one card visible)
            // md:flex-[0_0_calc(50%-12px)] = 50% minus half the 24px gap on desktop (two cards)
            <div
              key={event}
              className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] min-w-0"
            >
              <MatchCard event={event} places={places} records={records[event] ?? {}} />
            </div>
          ))}
        </div>
      </div>

      {/* Drag hint — subtle below-the-carousel cue.
          Hidden when there's nothing to scroll (1 or 2 cards on desktop). */}
      {(canScrollPrev || canScrollNext) && (
        <div className="mt-5 text-center font-mono text-[9px] uppercase text-zinc-700" style={{ letterSpacing: "0.3em" }}>
          ← Drag or use arrows to browse all events →
        </div>
      )}
    </div>
  );
}

// Carousel prev/next button — square, sharp corners, gold-on-hover broadcast feel.
function CarouselNavButton({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous match cards" : "Next match cards"}
      className="w-9 h-9 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-[#A91D3A]/15 enabled:hover:border-[#A91D3A]/40 enabled:hover:text-[#C5A059]"
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.08)",
        color: disabled ? "#3a3a3a" : "#9a9a9a",
      }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  MATCH CARD — one per sport event
// ─────────────────────────────────────────────────────────────────────────
function MatchCard({ event, places, records }: {
  event:   string;
  places:  [string, string, string, string];
  records: Record<string, string>;
}) {
  const parts    = event.split("·").map(s => s.trim());
  const name     = parts[0];
  const division = parts[1] ?? null;

  const champCode   = places[0];
  const champAccent = COLLEGE_ACCENT[champCode] ?? "#444";
  const hasData     = champCode !== "?" && champCode !== "";
  const sportIcon   = SPORT_ICON_BY_SPORT[name] ?? "◇";

  return (
    <article aria-labelledby={`matchcard-${event.replace(/[\s·]/g, "")}`} className="bg-[#0a0a0a] border border-white/[0.06] p-6 relative h-full">
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.05]">
        <div className="text-3xl leading-none" style={{ color: GOLD, fontFamily: "serif" }} aria-hidden="true">{sportIcon}</div>
        <div className="flex-1 min-w-0">
          <div id={`matchcard-${event.replace(/[\s·]/g, "")}`} className="font-bebas italic text-2xl text-[#f3f1ec] leading-none">{name}</div>
          {division && (
            <div className="text-[10px] font-black uppercase text-zinc-600 mt-1" style={{ letterSpacing: "0.3em" }}>{division} BRACKET</div>
          )}
        </div>
        <div className="text-[9px] font-black uppercase px-2 py-1" style={{ color: hasData ? RED : "#555", background: hasData ? "rgba(169,29,58,0.1)" : "rgba(255,255,255,0.03)", border: hasData ? "1px solid rgba(169,29,58,0.3)" : "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.3em" }}>
          {hasData ? "FINAL" : "NO DATA"}
        </div>
      </div>

      <div className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
        {hasData ? (
          <>
            <CollegeLogo code={champCode} accent={champAccent} size={56} ring />
            <div className="flex-1">
              <div className="text-[9px] font-black uppercase" style={{ color: GOLD, letterSpacing: "0.3em" }}>★ CHAMPION</div>
              <div className="font-bebas italic text-3xl text-[#f3f1ec] leading-none mt-1">{champCode}</div>
              <div className="font-mono text-[10px] text-zinc-500 mt-1.5" style={{ letterSpacing: "0.15em" }}>{records[champCode] ?? "—"} · UNDEFEATED RUN</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bebas italic leading-none" style={{ fontSize: 56, color: GOLD }}>{POINTS[0]}</span>
              <span className="font-mono text-[10px] text-zinc-500" style={{ letterSpacing: "0.3em" }}>PTS</span>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center py-4 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">No completed matches yet</div>
        )}
      </div>

      <div className="flex flex-col mt-3">
        {places.slice(1).map((code, i) => {
          const rank    = i + 2;
          const accent  = COLLEGE_ACCENT[code] ?? "#444";
          const isReal  = code !== "?" && code !== "";
          const logoSrc = isReal ? COLLEGE_LOGOS[code] : null;
          return (
            <div key={`${code}-${i}`} className="flex items-center gap-3.5 py-3 border-b border-white/[0.04] last:border-b-0">
              <span className="font-mono text-[11px] text-zinc-500 w-6">0{rank}</span>
              <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden" style={{ background: isReal ? `linear-gradient(135deg, ${accent}, #0a0a0a 130%)` : "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}>
                {logoSrc ? (
                  <img src={logoSrc} alt={code} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span className="flex items-center justify-center w-full h-full font-bebas font-black text-white" style={{ fontSize: 10 }}>
                    {isReal ? code.slice(0, 3) : "—"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bebas italic text-xl text-zinc-300 leading-none">{isReal ? code : "TBD"}</div>
                <div className="font-mono text-[10px] text-zinc-600 mt-0.5" style={{ letterSpacing: "0.1em" }}>{isReal ? (records[code] ?? "—") : "—"}</div>
              </div>
              <div className="font-mono text-xs font-bold text-zinc-400" style={{ letterSpacing: "0.15em" }}>
                {isReal ? `${POINTS[rank - 1]} PTS` : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
