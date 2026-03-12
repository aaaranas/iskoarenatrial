"use client";

import React, { useMemo, useState } from "react";
import type { Match } from "@/types";
import { SPORTS, TEAMS } from "@/lib/dataManager";
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Radio,
  Search,
  Swords,
  TimerReset,
  Trash2,
  X,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey   = "teamA" | "teamB" | "sport" | "date" | "time" | "venue" | "status";
type SortDir   = "asc" | "desc";
type TabFilter = "all" | "upcoming" | "live" | "completed" | "cancelled";

interface MatchesPageProps {
  matches:       Match[];
  onAddMatch:    (match: Omit<Match, "id" | "createdAt">) => void;
  onDeleteMatch: (id: number) => void;
  onUpdateMatch: (id: number, patch: Partial<Match>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VENUES_LIST = [
  "Main Gymnasium",
  "Court A",
  "Court B",
  "Covered Court",
  "Outdoor Field",
  "Swimming Pool",
  "Track & Field",
];

const STATUS_OPTIONS = ["upcoming", "live", "completed", "cancelled"] as const;

const EMPTY_FORM = {
  sport: "", teamA: "", teamB: "", date: "", time: "", venue: "", status: "upcoming",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtTime(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDisplayStatus(match: Match): string {
  if (match.status) return match.status;
  return new Date(`${match.date}T${match.time}`) > new Date() ? "upcoming" : "completed";
}

const STATUS_META: Record<string, { label: string; pill: string; icon: React.ReactNode }> = {
  upcoming:  { label: "Upcoming",  pill: "bg-amber-100 text-amber-700 border border-amber-200",          icon: <Clock3 className="h-3 w-3" />        },
  live:      { label: "Live",      pill: "bg-red-100 text-red-600 border border-red-200",                icon: <Radio className="h-3 w-3" />         },
  completed: { label: "Completed", pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",    icon: <CheckCircle2 className="h-3 w-3" />  },
  cancelled: { label: "Cancelled", pill: "bg-gray-100 text-gray-500 border border-gray-200",             icon: <XCircle className="h-3 w-3" />       },
};

const SPORT_EMOJI: Record<string, string> = {
  Basketball: "🏀", Volleyball: "🏐", Badminton: "🏸",
  Tennis: "🎾", Futsal: "⚽", Swimming: "🏊", Athletics: "🏃",
};

// ─── StatusPill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.upcoming;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${m.pill}`}>
      {status === "live" ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      ) : m.icon}
      {m.label}
    </span>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ match, onConfirm, onCancel }: {
  match: Match; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-red-100 p-2.5 shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Delete this match?</p>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-5">
          <p className="font-semibold text-gray-800 text-sm">{match.teamA} vs {match.teamB}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {match.sport} · {fmtDate(match.date)} · {fmtTime(match.time)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
          >
            Delete Match
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Match Panel (Add / Edit) ─────────────────────────────────────────────────

type FormState = typeof EMPTY_FORM;

function MatchPanel({
  mode, initial, onSave, onClose,
}: {
  mode: "add" | "edit";
  initial: FormState;
  onSave: (data: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm]     = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.sport) errs.sport = "Required";
    if (!form.teamA) errs.teamA = "Required";
    if (!form.teamB) errs.teamB = "Required";
    if (form.teamA && form.teamA === form.teamB) errs.teamB = "Must differ from Team A";
    if (!form.date)  errs.date  = "Required";
    if (!form.time)  errs.time  = "Required";
    if (!form.venue) errs.venue = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => { if (validate()) onSave(form); };

  const field = (k: keyof FormState) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#A91D3A]/20 focus:border-[#A91D3A] bg-white ${
      errors[k] ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"
    }`;

  const availA = TEAMS.filter(t => t.value !== form.teamB);
  const availB = TEAMS.filter(t => t.value !== form.teamA);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Panel header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-[#A91D3A] to-[#741029] flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-0.5">
              {mode === "add" ? "New Fixture" : "Edit Fixture"}
            </p>
            <h3 className="text-lg font-black text-white">
              {mode === "add" ? "Schedule a Match" : "Update Match Details"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Sport */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Sport *
            </label>
            <select className={field("sport")} value={form.sport} onChange={e => set("sport", e.target.value)}>
              <option value="">Select Sport</option>
              {SPORTS.map(s => (
                <option key={s} value={s}>{SPORT_EMOJI[s] ?? "🏅"} {s}</option>
              ))}
            </select>
            {errors.sport && <p className="text-xs text-red-500 mt-1">{errors.sport}</p>}
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Team A *</label>
              <select className={field("teamA")} value={form.teamA} onChange={e => set("teamA", e.target.value)}>
                <option value="">Select</option>
                {availA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.teamA && <p className="text-xs text-red-500 mt-1">{errors.teamA}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Team B *</label>
              <select className={field("teamB")} value={form.teamB} onChange={e => set("teamB", e.target.value)}>
                <option value="">Select</option>
                {availB.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.teamB && <p className="text-xs text-red-500 mt-1">{errors.teamB}</p>}
            </div>
          </div>

          {/* Matchup preview */}
          {form.teamA && form.teamB && (
            <div className="rounded-xl bg-gradient-to-r from-[#A91D3A]/5 via-white to-[#A91D3A]/5 border border-[#A91D3A]/15 px-5 py-3 flex items-center justify-center gap-3">
              <span className="font-black text-sm text-gray-800 text-right flex-1">{form.teamA}</span>
              <div className="shrink-0 h-8 w-8 rounded-full bg-[#A91D3A] flex items-center justify-center shadow-sm">
                <Swords className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-black text-sm text-gray-800 flex-1">{form.teamB}</span>
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date *</label>
              <input type="date" className={field("date")} value={form.date} onChange={e => set("date", e.target.value)} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Time *</label>
              <input type="time" className={field("time")} value={form.time} onChange={e => set("time", e.target.value)} />
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Venue *</label>
            <select className={field("venue")} value={form.venue} onChange={e => set("venue", e.target.value)}>
              <option value="">Select Venue</option>
              {VENUES_LIST.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
          </div>

          {/* Status (edit only) */}
          {mode === "edit" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold capitalize transition flex items-center gap-1.5 justify-center ${
                      form.status === s
                        ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:border-[#A91D3A]/40 hover:text-[#A91D3A]"
                    }`}
                  >
                    {STATUS_META[s]?.icon}
                    {STATUS_META[s]?.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel footer */}
        <div className="px-6 py-4 border-t bg-gray-50/80 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#8B1528] text-white text-sm font-bold transition shadow-sm"
          >
            {mode === "add" ? "Schedule Match" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MatchesPage({ matches, onAddMatch, onDeleteMatch, onUpdateMatch }: MatchesPageProps) {
  const [query,        setQuery]        = useState("");
  const [sportFilter,  setSportFilter]  = useState("all");
  const [tabFilter,    setTabFilter]    = useState<TabFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("date");
  const [sortDir,      setSortDir]      = useState<SortDir>("asc");
  const [panelMode,    setPanelMode]    = useState<"add" | "edit" | null>(null);
  const [editTarget,   setEditTarget]   = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  const today = todayISO();

  // ── Counts ──
  const counts = useMemo(() => ({
    total:     matches.length,
    live:      matches.filter(m => getDisplayStatus(m) === "live").length,
    upcoming:  matches.filter(m => getDisplayStatus(m) === "upcoming").length,
    completed: matches.filter(m => getDisplayStatus(m) === "completed").length,
    today:     matches.filter(m => m.date === today).length,
  }), [matches, today]);

  // ── Filtered + sorted ──
  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() => {
    return [...matches]
      .filter(m => sportFilter === "all" || m.sport === sportFilter)
      .filter(m => tabFilter  === "all"  || getDisplayStatus(m) === tabFilter)
      .filter(m => {
        if (!normalized) return true;
        return [m.teamA, m.teamB, m.venue, m.sport, m.date, m.status]
          .join(" ").toLowerCase().includes(normalized);
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          const da = new Date(`${a.date}T${a.time}`).getTime();
          const db = new Date(`${b.date}T${b.time}`).getTime();
          return sortDir === "asc" ? da - db : db - da;
        }
        const c = String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""));
        return sortDir === "asc" ? c : -c;
      });
  }, [matches, sportFilter, tabFilter, normalized, sortBy, sortDir]);

  // ── Handlers ──
  const handleSort = (col: SortKey) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const openAdd  = () => { setEditTarget(null); setPanelMode("add"); };
  const openEdit = (m: Match) => { setEditTarget(m); setPanelMode("edit"); };

  const handlePanelSave = (data: FormState) => {
    if (panelMode === "add") {
      onAddMatch(data as Omit<Match, "id" | "createdAt">);
    } else if (editTarget) {
      onUpdateMatch(editTarget.id, data as Partial<Match>);
    }
    setPanelMode(null);
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) { onDeleteMatch(deleteTarget.id); setDeleteTarget(null); }
  };

  const quickStatus = (m: Match, status: string) => onUpdateMatch(m.id, { status });

  // Sort icon helper
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortBy !== col
      ? <ArrowUpDown className="h-3 w-3 opacity-25" />
      : sortDir === "asc"
        ? <ChevronUp className="h-3 w-3 text-[#A91D3A]" />
        : <ChevronDown className="h-3 w-3 text-[#A91D3A]" />;

  const panelInitial: FormState = editTarget
    ? { sport: editTarget.sport, teamA: editTarget.teamA, teamB: editTarget.teamB,
        date: editTarget.date, time: editTarget.time, venue: editTarget.venue,
        status: editTarget.status || "upcoming" }
    : { ...EMPTY_FORM };

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: counts.total     },
    { key: "upcoming",  label: "Upcoming",  count: counts.upcoming  },
    { key: "live",      label: "Live 🔴",   count: counts.live      },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  const COLUMNS: { key: SortKey; label: string }[] = [
    { key: "teamA",  label: "Match"   },
    { key: "sport",  label: "Sport"   },
    { key: "date",   label: "Date"    },
    { key: "time",   label: "Time"    },
    { key: "venue",  label: "Venue"   },
    { key: "status", label: "Status"  },
  ];

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl bg-gradient-to-r from-[#A91D3A] via-[#8a1630] to-[#741029] p-6 text-white shadow-lg relative overflow-hidden">
          {/* decorative glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-xl" />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/50 mb-1">Admin Control Center</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Match Scheduling Hub</h2>
              <p className="text-white/65 mt-1.5 text-sm max-w-lg">
                Schedule fixtures, update live statuses, and manage your full sports calendar.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#A91D3A] font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Match
            </button>
          </div>

          {/* Mini stats */}
          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Matches", value: counts.total,     emoji: "📋" },
              { label: "Live Now",      value: counts.live,      emoji: "🔴" },
              { label: "Today",         value: counts.today,     emoji: "📅" },
              { label: "Upcoming",      value: counts.upcoming,  emoji: "⏳" },
            ].map(c => (
              <div key={c.label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3">
                <p className="text-2xl font-black leading-none">{c.value}</p>
                <p className="text-xs text-white/65 mt-1">{c.emoji} {c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search teams, venue, sport…"
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sport filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white"
            >
              <option value="all">All Sports</option>
              {SPORTS.map(s => (
                <option key={s} value={s}>{SPORT_EMOJI[s] ?? "🏅"} {s}</option>
              ))}
            </select>
          </div>

          {/* Reset sort (only shows when non-default) */}
          {(sortBy !== "date" || sortDir !== "asc") && (
            <button
              onClick={() => { setSortBy("date"); setSortDir("asc"); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-[#A91D3A]/50 hover:text-[#A91D3A] transition bg-white"
            >
              <TimerReset className="h-3.5 w-3.5" /> Reset Sort
            </button>
          )}

          <p className="ml-auto text-xs text-gray-400 font-medium">
            {visible.length} result{visible.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Status Tab Pills ── */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTabFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                tabFilter === tab.key
                  ? "bg-[#A91D3A] text-white border-[#A91D3A] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#A91D3A]/40 hover:text-[#A91D3A]"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                tabFilter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {COLUMNS.map(col => (
                    <th key={col.key} className="px-4 py-3.5 text-left">
                      <button
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#A91D3A] transition"
                      >
                        {col.label}
                        <SortIcon col={col.key} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Swords className="h-10 w-10 opacity-20" />
                        <p className="font-semibold text-gray-500 text-base">No matches found</p>
                        <p className="text-sm text-gray-400">
                          {query || sportFilter !== "all" || tabFilter !== "all"
                            ? "Try adjusting your filters."
                            : "Get started by scheduling your first match."}
                        </p>
                        {!query && sportFilter === "all" && tabFilter === "all" && (
                          <button
                            onClick={openAdd}
                            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A91D3A] text-white text-xs font-bold hover:bg-[#8B1528] transition"
                          >
                            <Plus className="h-3.5 w-3.5" /> Schedule First Match
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map(match => {
                    const status = getDisplayStatus(match);
                    const isLive = status === "live";
                    const isToday = match.date === today;

                    return (
                      <tr
                        key={match.id}
                        className={`border-b border-gray-50 last:border-0 transition-colors group ${
                          isLive ? "bg-red-50/30" : "hover:bg-gray-50/70"
                        }`}
                      >
                        {/* Match – both teams */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 leading-snug">{match.teamA}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-bold text-[#A91D3A]">vs</span> {match.teamB}
                          </p>
                        </td>

                        {/* Sport */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span>{SPORT_EMOJI[match.sport] ?? "🏅"}</span>
                            <span className="text-gray-700">{match.sport}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className={isToday ? "font-semibold text-[#A91D3A]" : "text-gray-700"}>
                              {fmtDate(match.date)}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-black bg-[#A91D3A] text-white px-1.5 py-0.5 rounded-full tracking-wider">
                                TODAY
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            <Clock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {fmtTime(match.time)}
                          </span>
                        </td>

                        {/* Venue */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {match.venue || "—"}
                          </span>
                        </td>

                        {/* Status + quick-action buttons */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <StatusPill status={status} />
                            {status === "upcoming" && (
                              <button
                                title="Go Live"
                                onClick={() => quickStatus(match, "live")}
                                className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Radio className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {status === "live" && (
                              <button
                                title="Mark Completed"
                                onClick={() => quickStatus(match, "completed")}
                                className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(match)}
                              title="Edit match"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#A91D3A] hover:bg-[#A91D3A]/8 transition"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(match)}
                              title="Delete match"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {visible.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing <strong className="text-gray-600">{visible.length}</strong> of{" "}
                <strong className="text-gray-600">{matches.length}</strong> matches
              </span>
              <span className="hidden sm:block text-gray-300">
                Hover a row to edit or delete · Click status badge arrows to quick-update
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Slide Panel ── */}
      {panelMode && (
        <MatchPanel
          mode={panelMode}
          initial={panelInitial}
          onSave={handlePanelSave}
          onClose={() => { setPanelMode(null); setEditTarget(null); }}
        />
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          match={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}