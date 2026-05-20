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
//   week. The toolbar shows "All Days" or a specific game-day filter; days are
//   detected dynamically from match rawDate values so no hardcoded dates needed.
//
// PLACEMENT MODEL
//   For each event (sport + category), completed matches determine the W-L
//   record per college. Colleges are ranked by win-pct descending:
//     rank 0 → 1st → 20 pts
//     rank 1 → 2nd → 15 pts
//     rank 2 → 3rd → 10 pts
//     rank 3 → 4th →  5 pts
// ─────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { isToday } from "@/components/dashboard/dashboard-data";

// Brand palette — design's gold (#C5A059) is distinct from ia-gold (#D4AF37).
const GOLD   = "#C5A059";
const SILVER = "#d8d8d8";
const BRONZE = "#a87b3f";
const RED    = "#A91D3A";

const POINTS = [20, 15, 10, 5] as const;

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

const SPORT_ICON: Record<string, string> = {
  "Basketball · M": "◐",
  "Basketball · W": "◑",
  "Volleyball · M": "◇",
  "Volleyball · W": "◈",
};

// The 4 events that constitute the IskoLaro standings. Each maps to
// completed matches with the matching sport (m.league) and category.
const SPORT_EVENTS = [
  { key: "Basketball · M", sport: "Basketball", category: "Men"   },
  { key: "Basketball · W", sport: "Basketball", category: "Women" },
  { key: "Volleyball · M", sport: "Volleyball", category: "Men"   },
  { key: "Volleyball · W", sport: "Volleyball", category: "Women" },
] as const;

const SPORT_LIST = ["All", ...SPORT_EVENTS.map(e => e.key)];

// Returns a canonical day key (YYYY-MM-DD string in local time) from an ISO rawDate.
function toDayKey(rawDate: string): string {
  const d = new Date(rawDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Standing = {
  code: string;
  long: string;
  accent: string;
  total: number;
  finishes: [number, number, number, number];
  rank: number;
};

type GameDay = { key: string; label: string; shortLabel: string };

// ─────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [activeSport,   setActiveSport]   = useState("All");
  const [activeDay,     setActiveDay]     = useState("all"); // "all" or a YYYY-MM-DD key
  const [searchQuery,   setSearchQuery]   = useState("");

  // Single data source — all derived state is computed from this.
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery(undefined, {
    staleTime: 30_000,
  });

  // ── Game days — derived from unique calendar days with matches ─────────
  const gameDays = useMemo((): GameDay[] => {
    if (!matchesData) return [];
    const seen = new Map<string, Date>(); // key → Date (for display)
    for (const m of matchesData) {
      if (!m.rawDate) continue;
      const key = toDayKey(m.rawDate);
      if (!seen.has(key)) seen.set(key, new Date(m.rawDate));
    }
    return Array.from(seen.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, date], i) => ({
        key,
        label: `Day ${i + 1} · ${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
        shortLabel: `Day ${i + 1}`,
      }));
  }, [matchesData]);

  // ── Matches filtered to the active game day ───────────────────────────
  const dayMatches = useMemo(() => {
    if (!matchesData) return [];
    if (activeDay === "all") return matchesData;
    return matchesData.filter(m => m.rawDate && toDayKey(m.rawDate) === activeDay);
  }, [matchesData, activeDay]);

  // ── Event standings derived from completed matches in scope ───────────
  // For each event, tally W/L per college from completed matches, then rank
  // by win-pct descending to determine placement.
  const { EVENTS, RECORDS } = useMemo(() => {
    const EVENTS: Record<string, [string, string, string, string]> = {};
    const RECORDS: Record<string, Record<string, string>> = {};

    for (const { key, sport, category } of SPORT_EVENTS) {
      const eventMatches = dayMatches.filter(
        m => m.statusType === "completed" && m.league === sport && m.category === category
      );

      // Seed tallies for all 4 colleges so the table always has 4 rows.
      const tally: Record<string, { w: number; l: number }> = {
        COS: { w: 0, l: 0 }, CSS: { w: 0, l: 0 },
        CCAD: { w: 0, l: 0 }, SOM: { w: 0, l: 0 },
      };

      for (const m of eventMatches) {
        const home = m.homeTeamOrg?.toUpperCase();
        const away = m.awayTeamOrg?.toUpperCase();
        if (!home || !away || !tally[home] || !tally[away]) continue;
        const hs = m.homeScore ?? 0;
        const as_ = m.awayScore ?? 0;
        if (hs === as_) continue; // ties skipped (shouldn't happen in intramurals)
        if (hs > as_) { tally[home].w++; tally[away].l++; }
        else           { tally[away].w++; tally[home].l++; }
      }

      // Sort by win-pct desc; on tie, more wins wins.
      const sorted = Object.entries(tally)
        .map(([code, { w, l }]) => ({ code, w, l, pct: (w + l) === 0 ? 0 : w / (w + l) }))
        .sort((a, b) => b.pct - a.pct || b.w - a.w);

      const hasAnyGame = sorted.some(s => s.w + s.l > 0);

      if (!hasAnyGame) {
        EVENTS[key] = ["?", "?", "?", "?"];
        RECORDS[key] = {};
      } else {
        EVENTS[key] = sorted.map(s => s.code) as [string, string, string, string];
        RECORDS[key] = Object.fromEntries(sorted.map(s => [s.code, `${s.w}-${s.l}`]));
      }
    }

    return { EVENTS, RECORDS };
  }, [dayMatches]);

  // ── Aggregate standings ───────────────────────────────────────────────
  const standings = useMemo((): Standing[] => {
    const codes = Object.keys(COLLEGE_ACCENT);
    const agg: Record<string, Standing> = Object.fromEntries(
      codes.map(c => [c, { code: c, long: COLLEGE_LONG[c] ?? c, accent: COLLEGE_ACCENT[c], total: 0, finishes: [0, 0, 0, 0] as [number, number, number, number], rank: 0 }])
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

  // Search filter on the podium (code or mascot).
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
      { label: "Top Margin",    value: "—", sub: "No completed events yet"  },
      { label: "Most Golds",    value: "—", sub: "No event winners yet"      },
      { label: "Sweep Watch",   value: "—", sub: "No undefeated run yet"     },
      { label: "Biggest Upset", value: "—", sub: "No data available"         },
    ];

    const topMargin = standings[0].total - standings[1].total;
    const maxGolds  = Math.max(...standings.map(s => s.finishes[0]));
    const goldCodes = standings.filter(s => s.finishes[0] === maxGolds).map(s => s.code).join(", ");

    // Sweep Watch: first college with 0 losses in any event with games played
    let sweepCode = "—";
    let sweepSub  = "No undefeated run yet";
    outer: for (const [event, rec] of Object.entries(RECORDS)) {
      for (const [code, wl] of Object.entries(rec)) {
        const [w, l] = wl.split("-").map(Number);
        if (l === 0 && w > 0) { sweepCode = code; sweepSub = `undefeated · ${event}`; break outer; }
      }
    }

    // Biggest Upset: college with the largest gap between best and worst event scores
    // (most wins in one event vs fewest in another — meaningful for a 5-day sprint)
    let upsetCode = "—";
    let upsetSub  = "No contrast yet";
    const CODES = Object.keys(COLLEGE_ACCENT);
    let maxGap = 0;
    for (const code of CODES) {
      const eventWins = SPORT_EVENTS.map(({ key }) => {
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
  }, [standings, RECORDS]);

  // ── Live ticker ───────────────────────────────────────────────────────
  const tickerItems = useMemo((): string[] => {
    if (!matchesData) return [];
    return matchesData
      .filter(m => isToday(m.rawDate) && (m.statusType === "live" || m.statusType === "completed"))
      .slice(0, 5)
      .map(m => {
        const cat    = m.category ? ` ${m.category}` : "";
        const homeOrg = m.homeTeamOrg || "?";
        const awayOrg = m.awayTeamOrg || "?";
        if (m.statusType === "live")
          return `${homeOrg} ${m.homeScore ?? 0} – ${m.awayScore ?? 0} ${awayOrg} · ${m.league}${cat}`;
        const win = (m.homeScore ?? 0) > (m.awayScore ?? 0) ? homeOrg : awayOrg;
        const los = win === homeOrg ? awayOrg : homeOrg;
        return `${win} def. ${los} · ${m.league}${cat}`;
      });
  }, [matchesData]);

  // ── Podium setup ──────────────────────────────────────────────────────
  const base           = displayStandings.length >= 4 ? displayStandings : standings;
  const podium         = [base[1], base[0], base[2]];
  const podiumHeights  = [220, 320, 170];
  const fourth         = base[3];

  // Which match cards to show (filtered by activeSport)
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

      {/* ── TOOLBAR — top-16 sits flush below the 64px TopBar ── */}
      <Toolbar
        sportList={SPORT_LIST}
        activeSport={activeSport}
        setActiveSport={setActiveSport}
        gameDays={gameDays}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
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

        {/* 4th place sidecar — delta removed (5-day event, no weekly comparison) */}
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

      {/* ── 02 · MATCH CARDS ── */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader
          eyebrow="02 · By the Sport"
          title="MATCH CARDS"
          subtitle="Each bracket, ranked. Four colleges, four placements, twenty points to the victor."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleEvents.map(([event, places]) => (
            <MatchCard key={event} event={event} places={places} records={RECORDS[event] ?? {}} />
          ))}
        </div>
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
          {/* updated kicker — "IskoLaro 2026" instead of generic "Season 2026" */}
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

        <div
          className="relative flex items-center gap-5 font-mono text-[11px] text-zinc-300 -mx-20 px-6 py-3.5 border-y border-white/[0.06]"
          style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", letterSpacing: "0.08em" }}
        >
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
//  TOOLBAR — game-day filter instead of Weekly/Monthly/Season
// ─────────────────────────────────────────────────────────────────────────
function Toolbar(props: {
  sportList: string[];
  activeSport: string;
  setActiveSport: (s: string) => void;
  gameDays: GameDay[];
  activeDay: string;
  setActiveDay: (d: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  return (
    // top-16 — flush below the fixed 64px TopBar, no overlap.
    <div className="sticky top-16 z-30 bg-[#080808] border-b border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-20 py-4 flex items-center gap-8 flex-wrap">

        {/* GAME DAY — only visible when the DB has matches with dates */}
        {props.gameDays.length > 0 && (
          <>
            <ToolbarGroup label="GAME DAY">
              {/* "All Days" default pill */}
              <ToolbarPill active={props.activeDay === "all"} onClick={() => props.setActiveDay("all")}>
                All Days
              </ToolbarPill>
              {props.gameDays.map(d => (
                <ToolbarPill key={d.key} active={props.activeDay === d.key} onClick={() => props.setActiveDay(d.key)}>
                  {d.shortLabel}
                </ToolbarPill>
              ))}
            </ToolbarGroup>
            <ToolbarDivider />
          </>
        )}

        {/* SPORT */}
        <ToolbarGroup label="SPORT">
          {props.sportList.map(s => (
            <ToolbarPill key={s} active={s === props.activeSport} onClick={() => props.setActiveSport(s)}>
              {s}
            </ToolbarPill>
          ))}
        </ToolbarGroup>
        <ToolbarDivider />

        {/* QUERY */}
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
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function ToolbarPill({ active, onClick, children }: { active: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-black uppercase px-3.5 py-2 transition-colors cursor-pointer"
      style={{ letterSpacing: "0.18em", background: active ? RED : "transparent", color: active ? "#fff" : "#9a9a9a", border: active ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)" }}
    >
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
//  COLLEGE LOGO
// ─────────────────────────────────────────────────────────────────────────
function CollegeLogo({ code, accent, size = 64, ring = false }: { code: string; accent: string; size?: number; ring?: boolean }) {
  return (
    <div className="rounded-full font-bebas text-white relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: `linear-gradient(135deg, ${accent} 0%, #0a0a0a 130%)`, border: "1px solid rgba(255,255,255,0.12)", boxShadow: ring ? `0 0 0 3px ${GOLD}, 0 0 0 5px #050505, 0 0 0 6px rgba(255,255,255,.06)` : "none", fontSize: size * 0.42, letterSpacing: "0.04em" }}>
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.18) 6px 7px)", mixBlendMode: "overlay" }} />
      <span className="relative z-10">{code}</span>
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
          const rank = c.rank;
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
//  MATCH CARD
// ─────────────────────────────────────────────────────────────────────────
function MatchCard({ event, places, records }: { event: string; places: [string, string, string, string]; records: Record<string, string> }) {
  const [name, division] = event.split("·").map(s => s.trim());
  const champCode   = places[0];
  const champAccent = COLLEGE_ACCENT[champCode] ?? "#444";
  const hasData     = champCode !== "?" && champCode !== "";

  return (
    <article aria-labelledby={`matchcard-${event.replace(/\s/g, "")}`} className="bg-[#0a0a0a] border border-white/[0.06] p-6 relative">
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.05]">
        <div className="text-3xl leading-none" style={{ color: GOLD, fontFamily: "serif" }} aria-hidden="true">{SPORT_ICON[event] ?? "◇"}</div>
        <div className="flex-1 min-w-0">
          <div id={`matchcard-${event.replace(/\s/g, "")}`} className="font-bebas italic text-2xl text-[#f3f1ec] leading-none">{name}</div>
          <div className="text-[10px] font-black uppercase text-zinc-600 mt-1" style={{ letterSpacing: "0.3em" }}>{division} BRACKET</div>
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
          const rank   = i + 2;
          const accent = COLLEGE_ACCENT[code] ?? "#444";
          const isReal = code !== "?" && code !== "";
          return (
            <div key={`${code}-${i}`} className="flex items-center gap-3.5 py-3 border-b border-white/[0.04] last:border-b-0">
              <span className="font-mono text-[11px] text-zinc-500 w-6">0{rank}</span>
              <div className="w-7 h-7 rounded-full font-bebas font-black flex items-center justify-center text-white flex-shrink-0" style={{ background: isReal ? `linear-gradient(135deg, ${accent}, #0a0a0a 130%)` : "#1a1a1a", fontSize: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                {isReal ? code.slice(0, 3) : "—"}
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
