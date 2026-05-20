"use client";

// ─────────────────────────────────────────────────────────────────────────
// Leaderboard — V1 "Competitive Arena"
// Source: design handoff `design_handoff_leaderboard_v1/v1.jsx`
// Hero · sticky toolbar · podium tier · per-sport match cards · insights · footer
//
// DATA SOURCES
//   Standings (placement + W-L): trpc.match.getStandings per event (4 calls in parallel)
//   Live ticker: trpc.match.getAll filtered to today's live + completed
//
// PLACEMENT MODEL
//   For each event (sport + category), getStandings returns colleges sorted by
//   win-pct descending. The sort order IS the placement:
//     position 0 → 1st → 20 pts
//     position 1 → 2nd → 15 pts
//     position 2 → 3rd → 10 pts
//     position 3 → 4th →  5 pts
//
// DELTA (weekly rank change): no historical snapshot table yet — kept as display-only
//   static placeholder until a standings_snapshots table is added.
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

// Points lookup by 0-based placement index.
const POINTS = [20, 15, 10, 5] as const;

// Per-college accent colours — match `college-*` tokens in tailwind.config.ts.
const COLLEGE_ACCENT: Record<string, string> = {
  COS:  "#3B82F6",
  CSS:  "#10B981",
  CCAD: "#A78BFA",
  SOM:  "#F59E0B",
};

// Mascot long-names — per CLAUDE.md canonical mapping.
const COLLEGE_LONG: Record<string, string> = {
  COS:  "Scions",
  CSS:  "Stallions",
  CCAD: "Phoenix",
  SOM:  "Tycoons",
};

// Weekly delta — static placeholder; replace once standings_snapshots table exists.
const DELTA_STATIC: Record<string, string> = { COS: "+1", CSS: "0", CCAD: "+2", SOM: "-3" };

// Glyph icons — preserved from the design reference; replaced with Lucide where
// Lucide has a sensible equivalent (Search, Loader2). ◆/● are purely decorative.
const SPORT_ICON: Record<string, string> = {
  "Basketball · M": "◐",
  "Basketball · W": "◑",
  "Volleyball · M": "◇",
  "Volleyball · W": "◈",
};

const SPORT_LIST = ["All", "Basketball · M", "Basketball · W", "Volleyball · M", "Volleyball · W"];

// Mapping from display-event key → getStandings input.
const EVENT_QUERIES: Record<string, { sportNames: string[]; category: string }> = {
  "Basketball · M": { sportNames: ["Basketball"], category: "Men"   },
  "Basketball · W": { sportNames: ["Basketball"], category: "Women" },
  "Volleyball · M": { sportNames: ["Volleyball"], category: "Men"   },
  "Volleyball · W": { sportNames: ["Volleyball"], category: "Women" },
};

type Standing = {
  code: string;
  long: string;
  accent: string;
  total: number;
  finishes: [number, number, number, number];
  rank: number;
};

// ─────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [activeSport, setActiveSport] = useState("All");
  const [activeTimeframe, setActiveTimeframe] = useState("Season");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Standings queries — 4 parallel calls, each aggregating one event ──
  const baskMen = trpc.match.getStandings.useQuery(
    { sportNames: ["Basketball"], category: "Men" as any },
    { staleTime: 60_000 }
  );
  const baskWom = trpc.match.getStandings.useQuery(
    { sportNames: ["Basketball"], category: "Women" as any },
    { staleTime: 60_000 }
  );
  const vollMen = trpc.match.getStandings.useQuery(
    { sportNames: ["Volleyball"], category: "Men" as any },
    { staleTime: 60_000 }
  );
  const vollWom = trpc.match.getStandings.useQuery(
    { sportNames: ["Volleyball"], category: "Women" as any },
    { staleTime: 60_000 }
  );

  // ── Match data for the live ticker ────────────────────────────────────
  const { data: matchesData } = trpc.match.getAll.useQuery(undefined, { staleTime: 30_000 });

  const isLoading = baskMen.isLoading || baskWom.isLoading || vollMen.isLoading || vollWom.isLoading;

  // ── Derive EVENTS map: event-key → [1st, 2nd, 3rd, 4th] college codes ─
  // getStandings returns rows sorted by win-pct desc — row 0 = 1st place.
  // Rows always contain all 4 colleges (even at 0-0); order is the placement.
  const { EVENTS, RECORDS } = useMemo(() => {
    const rawEvents: Record<string, (typeof baskMen.data)> = {
      "Basketball · M": baskMen.data,
      "Basketball · W": baskWom.data,
      "Volleyball · M": vollMen.data,
      "Volleyball · W": vollWom.data,
    };

    const EVENTS: Record<string, [string, string, string, string]> = {};
    const RECORDS: Record<string, Record<string, string>> = {};

    for (const [key, rows] of Object.entries(rawEvents)) {
      if (!rows || rows.length < 4) {
        // No data yet for this event — leave empty; card will render with TBD
        EVENTS[key] = ["?", "?", "?", "?"];
        RECORDS[key] = {};
        continue;
      }
      // rows[0] = 1st place, rows[1] = 2nd, etc. (sorted server-side by pct desc)
      EVENTS[key] = rows.slice(0, 4).map(r => r.code) as [string, string, string, string];
      const rec: Record<string, string> = {};
      for (const row of rows) {
        rec[row.code] = `${row.w}-${row.l}`;
      }
      RECORDS[key] = rec;
    }

    return { EVENTS, RECORDS };
  }, [baskMen.data, baskWom.data, vollMen.data, vollWom.data]);

  // ── Aggregate standings across all events ────────────────────────────
  const standings = useMemo((): Standing[] => {
    const codes = Object.keys(COLLEGE_ACCENT);
    const agg: Record<string, Standing> = Object.fromEntries(
      codes.map(c => [c, {
        code: c,
        long: COLLEGE_LONG[c] ?? c,
        accent: COLLEGE_ACCENT[c],
        total: 0,
        finishes: [0, 0, 0, 0] as [number, number, number, number],
        rank: 0,
      }])
    );

    // Sum points across all 4 events, or just the active sport when filtered.
    const eventsToCount = activeSport === "All"
      ? Object.values(EVENTS)
      : EVENTS[activeSport] ? [EVENTS[activeSport]] : [];

    for (const places of eventsToCount) {
      places.forEach((code, idx) => {
        if (idx < 4 && code !== "?" && agg[code]) {
          agg[code].total += POINTS[idx];
          (agg[code].finishes[idx] as number) += 1;
        }
      });
    }

    const sorted = Object.values(agg).sort(
      (a, b) => b.total - a.total || b.finishes[0] - a.finishes[0]
    );
    sorted.forEach((s, i) => (s.rank = i + 1));
    return sorted;
  }, [EVENTS, activeSport]);

  // Filter standings by query (college code or mascot).
  const filteredStandings = useMemo(() =>
    searchQuery
      ? standings.filter(s =>
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.long.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : standings,
    [standings, searchQuery]
  );

  // ── Insights — 3 computed from live data, 1 static placeholder ────────
  const insights = useMemo(() => {
    if (standings.length < 2) return [
      { label: "Top Margin",    value: "—",  sub: "No data yet"              },
      { label: "Most Golds",    value: "—",  sub: "No data yet"              },
      { label: "Sweep Watch",   value: "—",  sub: "No data yet"              },
      { label: "Biggest Upset", value: "—",  sub: "No historical data yet"   },
    ];

    // 1 · Top Margin: point gap between 1st and 2nd
    const topMargin = standings[0].total - standings[1].total;
    const topMarginSub = `${standings[0].code} over ${standings[1].code} · overall`;

    // 2 · Most Golds: college(s) with the highest 1st-place finish count
    const maxGolds = Math.max(...standings.map(s => s.finishes[0]));
    const goldLeaders = standings.filter(s => s.finishes[0] === maxGolds).map(s => s.code).join(", ");
    const goldSub = maxGolds === 0
      ? "No event winners yet"
      : `${goldLeaders} · ${maxGolds} gold${maxGolds > 1 ? "s" : ""}`;

    // 3 · Sweep Watch: first college with 0 losses in any event
    let sweepCode = "—";
    let sweepSub  = "No undefeated run yet";
    for (const [event, rec] of Object.entries(RECORDS)) {
      for (const [code, wl] of Object.entries(rec)) {
        const [, l] = wl.split("-").map(Number);
        const [w]   = wl.split("-").map(Number);
        if (l === 0 && w > 0) {
          sweepCode = code;
          sweepSub  = `undefeated · ${event}`;
          break;
        }
      }
      if (sweepCode !== "—") break;
    }

    // 4 · Biggest Upset — requires historical placement data; static for now.
    return [
      { label: "Top Margin",    value: topMargin > 0 ? `${topMargin} PTS` : "—", sub: topMarginSub },
      { label: "Most Golds",    value: maxGolds > 0 ? String(maxGolds) : "—",     sub: goldSub      },
      { label: "Sweep Watch",   value: sweepCode,                                   sub: sweepSub     },
      { label: "Biggest Upset", value: "—",                                         sub: "Needs historical data" },
    ];
  }, [standings, RECORDS]);

  // ── Live ticker items from today's matches ────────────────────────────
  const tickerItems = useMemo((): string[] => {
    if (!matchesData) return [];
    return matchesData
      .filter(m => isToday(m.rawDate) && (m.statusType === "live" || m.statusType === "completed"))
      .slice(0, 5)
      .map(m => {
        const sport    = m.league;
        const cat      = m.category ? ` ${m.category}` : "";
        const homeOrg  = m.homeTeamOrg || "?";
        const awayOrg  = m.awayTeamOrg || "?";
        if (m.statusType === "live") {
          return `${homeOrg} ${m.homeScore ?? 0} – ${m.awayScore ?? 0} ${awayOrg} · ${sport}${cat}`;
        }
        const winOrg = (m.homeScore ?? 0) > (m.awayScore ?? 0) ? homeOrg : awayOrg;
        const losOrg = winOrg === homeOrg ? awayOrg : homeOrg;
        return `${winOrg} def. ${losOrg} · ${sport}${cat}`;
      });
  }, [matchesData]);

  // ── Which events to show in the match cards grid ──────────────────────
  const visibleEvents = activeSport === "All"
    ? Object.entries(EVENTS)
    : Object.entries(EVENTS).filter(([key]) => key === activeSport);

  // ── Podium (visual order: 2nd | 1st | 3rd) ───────────────────────────
  const displayStandings = filteredStandings.length >= 4 ? filteredStandings : standings;
  const podium       = [displayStandings[1], displayStandings[0], displayStandings[2]];
  const podiumHeights = [220, 320, 170];
  const fourth        = displayStandings[3];

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GOLD }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          Syncing Ledger...
        </span>
      </div>
    );
  }

  return (
    // overflow-x-hidden prevents the ticker's negative-margin bleed from creating
    // a horizontal scrollbar on narrow screens.
    <div className="bg-[#050505] text-zinc-200 font-sans min-h-screen overflow-x-hidden selection:bg-[#A91D3A]">

      {/* ============ HERO ============ */}
      <Hero tickerItems={tickerItems} />

      {/* ============ STICKY TOOLBAR ============ */}
      {/* top-16 — sits flush below the fixed 64px TopBar (h-16) */}
      <Toolbar
        sportList={SPORT_LIST}
        activeSport={activeSport}
        setActiveSport={setActiveSport}
        activeTimeframe={activeTimeframe}
        setActiveTimeframe={setActiveTimeframe}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ============ 01 · PODIUM ============ */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader
          eyebrow="01 · Overall Dominance"
          title="THE PODIUM"
          subtitle="Aggregate points across every sport, every bracket."
        />

        <PodiumBoard podium={podium} heights={podiumHeights} />

        {/* 4th-place sidecar */}
        {fourth && (
          <div className="flex items-center gap-6 mt-12 px-6">
            <div
              className="font-mono text-[10px] font-bold uppercase text-zinc-500 w-[140px] flex-shrink-0"
              style={{ letterSpacing: "0.3em" }}
            >
              04 · OUTSIDER
            </div>
            <div className="flex-1 flex items-center gap-5 px-6 py-[18px] bg-white/[0.02] border border-white/[0.06]">
              <CollegeLogo code={fourth.code} accent={fourth.accent} size={48} />
              <div>
                <div className="font-bebas italic text-[28px] text-zinc-200 leading-none">{fourth.code}</div>
                <div
                  className="text-[10px] uppercase text-zinc-500 mt-0.5"
                  style={{ letterSpacing: "0.2em" }}
                >
                  {fourth.long}
                </div>
              </div>
              <div className="flex gap-3 font-mono text-[11px] text-zinc-400">
                <span className="bg-white/[0.04] px-2.5 py-1 border border-white/[0.06]">
                  ★ {fourth.finishes[0]}
                </span>
                <span className="bg-white/[0.04] px-2.5 py-1 border border-white/[0.06]">
                  ✦ {fourth.finishes[3]}
                </span>
              </div>
              <div className="flex-1" />
              <div className="font-bebas italic text-[28px]" style={{ color: GOLD }}>
                <span>{fourth.total}</span>{" "}
                <span className="text-[14px]">PTS</span>
              </div>
              {/* delta — static placeholder until standings_snapshots table exists */}
              <div
                className="font-mono text-[10px]"
                style={{ color: RED, letterSpacing: "0.2em" }}
              >
                {DELTA_STATIC[fourth.code] ?? "—"} this week
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============ 02 · MATCH CARDS ============ */}
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

      {/* ============ 03 · INSIGHTS ============ */}
      <section className="max-w-[1440px] mx-auto px-20 pt-20">
        <SectionHeader eyebrow="03 · Insights" title="ARENA NOTES" subtitle="Numbers worth shouting." />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {insights.map((item, idx) => (
            <div
              key={item.label}
              className="px-6 py-7 bg-[#0a0a0a] border border-white/[0.06] relative overflow-hidden"
            >
              <div
                className="font-mono text-[10px] font-bold uppercase text-zinc-500"
                style={{ letterSpacing: "0.25em" }}
              >
                {String(idx + 1).padStart(2, "0")} · {item.label}
              </div>
              <div className="font-bebas italic text-[64px] leading-none mt-3.5 text-[#f3f1ec]">
                {item.value}
              </div>
              <div className="text-xs text-zinc-500 mt-3 leading-snug">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="flex justify-between items-center px-20 py-12 mt-20 border-t border-white/[0.06]">
        <div className="flex flex-col">
          <div className="font-bebas italic text-[22px]" style={{ letterSpacing: "0.05em" }}>
            ISKO<span style={{ color: GOLD }}>·</span>ARENA
          </div>
          <div
            className="font-mono text-[10px] text-zinc-500 mt-1"
            style={{ letterSpacing: "0.2em" }}
          >
            Leaderboards · v2 · 2026
          </div>
        </div>
        <div
          className="flex gap-6 font-mono text-[10px] text-zinc-400"
          style={{ letterSpacing: "0.3em" }}
        >
          <span>EXPORT PDF</span>
          <span>SHARE</span>
          <span>EMBED</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  HERO — striped background, oversized italic Bebas wordmark, live ticker
// ─────────────────────────────────────────────────────────────────────────
function Hero({ tickerItems }: { tickerItems: string[] }) {
  // Fallback when no live/completed matches today.
  const items = tickerItems.length > 0
    ? tickerItems
    : ["No live matches right now — check back later"];

  return (
    <header className="relative overflow-hidden h-[560px] border-b border-white/[0.05]">
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(-30deg, #0a0a0a 0 24px, #0e0e0e 24px 48px)",
          opacity: 0.45,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(169,29,58,.22), transparent 55%), linear-gradient(180deg, transparent 60%, #050505 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-20 pt-[90px] pb-0 flex flex-col justify-between">
        <div>
          <div
            className="flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase"
            style={{ color: GOLD, letterSpacing: "0.3em" }}
          >
            <span style={{ color: RED, fontSize: 10 }}>●</span>
            <span>Season 2026 · Live Ledger</span>
          </div>
          <h1
            className="font-bebas italic mt-6 mb-0 text-[#f3f1ec]"
            style={{ fontSize: 240, lineHeight: 0.82, letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            LEADER<br />
            BOARD<span style={{ color: GOLD }}>.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-[540px] mt-4 leading-snug">
            Quantifying campus dominance across every bracket.
          </p>
          <p
            className="text-[10px] font-black uppercase text-zinc-600 mt-0 mb-6"
            style={{ letterSpacing: "0.4em" }}
          >
            TRACK COLLEGE PERFORMANCE · CELEBRATE EXCELLENCE
          </p>
        </div>

        {/* live ticker — bleeds edge-to-edge using negative horizontal margins */}
        <div
          className="relative flex items-center gap-5 font-mono text-[11px] text-zinc-300 -mx-20 px-6 py-3.5 border-y border-white/[0.06]"
          style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", letterSpacing: "0.08em" }}
        >
          <span className="font-black flex-shrink-0" style={{ color: RED, letterSpacing: "0.3em", fontSize: 10 }}>
            ● LIVE
          </span>
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
//  TOOLBAR — sticky below the 64px TopBar, three pill groups
// ─────────────────────────────────────────────────────────────────────────
function Toolbar(props: {
  sportList: string[];
  activeSport: string;
  setActiveSport: (s: string) => void;
  activeTimeframe: string;
  setActiveTimeframe: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  const TIMEFRAMES = ["Weekly", "Monthly", "Season"];
  return (
    // top-16 aligns flush below the fixed 64px TopBar — prevents overlap.
    <div className="sticky top-16 z-30 bg-[#080808] border-b border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-20 py-4 flex items-center gap-8 flex-wrap">
        <ToolbarGroup label="TIMEFRAME">
          {TIMEFRAMES.map(t => (
            <ToolbarPill key={t} active={t === props.activeTimeframe} onClick={() => props.setActiveTimeframe(t)}>
              {t}
            </ToolbarPill>
          ))}
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup label="SPORT">
          {props.sportList.map(s => (
            <ToolbarPill key={s} active={s === props.activeSport} onClick={() => props.setActiveSport(s)}>
              {s}
            </ToolbarPill>
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
      <span className="font-mono text-[9px] font-bold uppercase text-zinc-500" style={{ letterSpacing: "0.3em" }}>
        {label}
      </span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function ToolbarPill({ active, onClick, children }: { active: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-black uppercase px-3.5 py-2 transition-colors cursor-pointer"
      style={{
        letterSpacing: "0.18em",
        background: active ? RED : "transparent",
        color: active ? "#fff" : "#9a9a9a",
        border: active ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-white/[0.08]" />;
}

// ─────────────────────────────────────────────────────────────────────────
//  SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-12 relative">
      <div
        className="font-mono text-[11px] font-bold uppercase flex items-center gap-2.5 mb-3.5"
        style={{ color: GOLD, letterSpacing: "0.3em" }}
      >
        <span style={{ color: RED }}>◆</span>
        {eyebrow}
      </div>
      <h2
        className="font-bebas italic text-[#f3f1ec] m-0"
        style={{ fontSize: 96, lineHeight: 0.9, letterSpacing: "-0.01em", fontWeight: 400 }}
      >
        {title}
      </h2>
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
    <div
      className="rounded-full font-bebas text-white relative flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${accent} 0%, #0a0a0a 130%)`,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: ring ? `0 0 0 3px ${GOLD}, 0 0 0 5px #050505, 0 0 0 6px rgba(255,255,255,.06)` : "none",
        fontSize: size * 0.42,
        letterSpacing: "0.04em",
      }}
    >
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,.18) 6px 7px)",
          mixBlendMode: "overlay",
        }}
      />
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
      <div className="font-bebas text-[8px] font-black uppercase text-zinc-600 mt-1" style={{ letterSpacing: "0.2em" }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  PODIUM BOARD
// ─────────────────────────────────────────────────────────────────────────
function PodiumBoard({ podium, heights }: { podium: (Standing | undefined)[]; heights: number[] }) {
  return (
    <div
      className="relative px-5 pt-10 pb-14 border border-white/[0.05] overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0a, #050505)" }}
    >
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div
          className="absolute left-1/2 top-[60%] w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: "1px solid rgba(197,160,89,0.15)" }}
        />
        <div
          className="absolute left-0 right-0 top-[60%] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />
        <div
          className="absolute top-0 bottom-0 left-1/2 w-px"
          style={{ background: "linear-gradient(180deg, transparent, rgba(197,160,89,0.18), transparent)" }}
        />
      </div>

      <div className="relative flex items-end justify-center gap-6 pt-10">
        {podium.map((c, i) => {
          if (!c) return null;
          const rank = c.rank;
          const isWin = rank === 1;
          return (
            <div
              key={c.code}
              className="flex flex-col items-center transition-transform duration-300"
              style={{ flex: "0 1 320px", transform: `translateY(${isWin ? -20 : 0}px)` }}
            >
              <div
                className="w-full px-6 py-7 backdrop-blur-md flex flex-col items-center relative"
                style={{ background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="absolute -top-3.5 -right-3.5 w-11 h-11 rounded-full font-bebas italic font-black flex items-center justify-center"
                  style={{
                    background: rank === 1 ? GOLD : rank === 2 ? SILVER : BRONZE,
                    color: "#0a0a0a",
                    fontSize: 18,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    border: "2px solid #050505",
                  }}
                >
                  {rank === 1 ? "01" : rank === 2 ? "02" : "03"}
                </div>

                <CollegeLogo code={c.code} accent={c.accent} size={isWin ? 96 : 72} ring={isWin} />

                <div
                  className="font-bebas italic text-[#f3f1ec] mt-4 leading-none"
                  style={{ fontSize: 48, letterSpacing: "0.02em" }}
                >
                  {c.code}
                </div>
                <div className="text-[11px] font-bold uppercase text-zinc-500 mt-1.5" style={{ letterSpacing: "0.2em" }}>
                  {c.long}
                </div>

                <div className="flex items-baseline gap-1.5 mt-5 py-3 w-full justify-center border-y border-white/[0.06]">
                  <span className="font-bebas italic leading-none" style={{ fontSize: 64, color: GOLD, fontWeight: 400 }}>
                    {c.total}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-zinc-500" style={{ letterSpacing: "0.3em" }}>
                    PTS
                  </span>
                </div>

                <div className="flex gap-1.5 mt-4 w-full">
                  <FinishPill n={c.finishes[0]} label="1st" color={GOLD}   />
                  <FinishPill n={c.finishes[1]} label="2nd" color={SILVER} />
                  <FinishPill n={c.finishes[2]} label="3rd" color={BRONZE} />
                  <FinishPill n={c.finishes[3]} label="4th" color="#555"   />
                </div>
              </div>

              <div
                className="w-[90%] relative flex flex-col justify-center items-center overflow-hidden"
                style={{
                  height: heights[i],
                  background: "linear-gradient(180deg, #1a1c20 0%, #0a0a0a 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: "none",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                />
                <div
                  className="font-bebas italic absolute top-1/2 -translate-y-1/2 leading-none"
                  style={{ fontSize: 96, color: "rgba(255,255,255,0.04)" }}
                >
                  0{rank}
                </div>
                <div
                  className="font-mono text-[11px] font-bold uppercase text-zinc-500 relative z-10"
                  style={{ letterSpacing: "0.3em" }}
                >
                  {rank === 1 ? "CHAMPION TIER" : rank === 2 ? "CONTENDER" : "CHALLENGER"}
                </div>
                {isWin && (
                  <div className="text-sm mt-2 relative z-10" style={{ color: GOLD, letterSpacing: "0.4em", fontFamily: "serif" }}>
                    ★ ★ ★ ★ ★
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
//  MATCH CARD — header + champion spotlight + runners-up rows
// ─────────────────────────────────────────────────────────────────────────
function MatchCard({
  event,
  places,
  records,
}: {
  event: string;
  places: [string, string, string, string];
  records: Record<string, string>;
}) {
  const [name, division] = event.split("·").map(s => s.trim());
  const champCode   = places[0];
  const champAccent = COLLEGE_ACCENT[champCode] ?? "#444";
  // Show "FINAL" only when the champion slot is populated with real data.
  const hasData = champCode !== "?" && champCode !== "";

  return (
    <article
      aria-labelledby={`matchcard-${event.replace(/\s/g, "")}`}
      className="bg-[#0a0a0a] border border-white/[0.06] p-6 relative"
    >
      {/* header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.05]">
        <div className="text-3xl leading-none" style={{ color: GOLD, fontFamily: "serif" }} aria-hidden="true">
          {SPORT_ICON[event] ?? "◇"}
        </div>
        <div className="flex-1 min-w-0">
          <div
            id={`matchcard-${event.replace(/\s/g, "")}`}
            className="font-bebas italic text-2xl text-[#f3f1ec] leading-none"
          >
            {name}
          </div>
          <div className="text-[10px] font-black uppercase text-zinc-600 mt-1" style={{ letterSpacing: "0.3em" }}>
            {division} BRACKET
          </div>
        </div>
        {hasData && (
          <div
            className="text-[9px] font-black uppercase px-2 py-1"
            style={{ color: RED, background: "rgba(169,29,58,0.1)", border: "1px solid rgba(169,29,58,0.3)", letterSpacing: "0.3em" }}
          >
            FINAL
          </div>
        )}
        {!hasData && (
          <div
            className="text-[9px] font-black uppercase px-2 py-1"
            style={{ color: "#555", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.3em" }}
          >
            NO DATA
          </div>
        )}
      </div>

      {/* champion spotlight */}
      <div className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
        {hasData ? (
          <>
            <CollegeLogo code={champCode} accent={champAccent} size={56} ring />
            <div className="flex-1">
              <div className="text-[9px] font-black uppercase" style={{ color: GOLD, letterSpacing: "0.3em" }}>★ CHAMPION</div>
              <div className="font-bebas italic text-3xl text-[#f3f1ec] leading-none mt-1">{champCode}</div>
              <div className="font-mono text-[10px] text-zinc-500 mt-1.5" style={{ letterSpacing: "0.15em" }}>
                {records[champCode] ?? "—"} · UNDEFEATED RUN
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bebas italic leading-none" style={{ fontSize: 56, color: GOLD }}>{POINTS[0]}</span>
              <span className="font-mono text-[10px] text-zinc-500" style={{ letterSpacing: "0.3em" }}>PTS</span>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center py-4 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            No completed matches yet
          </div>
        )}
      </div>

      {/* runners-up rows */}
      <div className="flex flex-col mt-3">
        {places.slice(1).map((code, i) => {
          const rank   = i + 2;
          const accent = COLLEGE_ACCENT[code] ?? "#444";
          const isReal = code !== "?" && code !== "";
          return (
            <div key={`${code}-${i}`} className="flex items-center gap-3.5 py-3 border-b border-white/[0.04] last:border-b-0">
              <span className="font-mono text-[11px] text-zinc-500 w-6">0{rank}</span>
              <div
                className="w-7 h-7 rounded-full font-bebas font-black flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: isReal ? `linear-gradient(135deg, ${accent}, #0a0a0a 130%)` : "#1a1a1a",
                  fontSize: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {isReal ? code.slice(0, 3) : "—"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bebas italic text-xl text-zinc-300 leading-none">{isReal ? code : "TBD"}</div>
                <div className="font-mono text-[10px] text-zinc-600 mt-0.5" style={{ letterSpacing: "0.1em" }}>
                  {isReal ? (records[code] ?? "—") : "—"}
                </div>
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
