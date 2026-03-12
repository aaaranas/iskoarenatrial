"use client";

import React, { useMemo, useState } from "react";
import type { Match } from "@/types";
import { SPORTS, TEAMS } from "@/lib/dataManager";
import {
  ArrowDownAZ,
  CalendarDays,
  Clock3,
  MapPin,
  PencilLine,
  Search,
  ShieldAlert,
  Trophy,
  X,
} from "lucide-react";

type SortKey = "teamA" | "teamB" | "sport" | "date" | "time" | "venue" | "status";
type SortDirection = "asc" | "desc";

interface MatchesPageProps {
  matches: Match[];
  onAddMatch: (match: Omit<Match, "id" | "createdAt">) => void;
  onDeleteMatch: (id: string) => void;
  onUpdateMatch: (id: string, patch: Partial<Match>) => void;
}

const emptyForm = { sport: "", teamA: "", teamB: "", date: "", time: "", venue: "" };
const defaultStatus = "upcoming";

export default function MatchesPage({ matches, onAddMatch, onDeleteMatch, onUpdateMatch }: MatchesPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.teamA === form.teamB) {
      alert("Team A and Team B cannot be the same");
      return;
    }
    onAddMatch({ ...form, status: defaultStatus });
    setForm(emptyForm);
  };

  const now = new Date();
  const normalized = query.trim().toLowerCase();

  const filteredMatches = useMemo(() => {
    const base = matches
      .filter((match) => sportFilter === "all" || match.sport === sportFilter)
      .filter((match) => {
        if (!normalized) return true;
        return [match.teamA, match.teamB, match.venue, match.date, match.time, match.sport, match.status]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      });

    return [...base].sort((a, b) => {
      let left = "";
      let right = "";

      if (sortBy === "date") {
        const leftDate = new Date(`${a.date}T${a.time}`).getTime();
        const rightDate = new Date(`${b.date}T${b.time}`).getTime();
        return sortDirection === "asc" ? leftDate - rightDate : rightDate - leftDate;
      }

      if (sortBy === "time") {
        left = a.time;
        right = b.time;
      } else {
        left = String(a[sortBy] ?? "");
        right = String(b[sortBy] ?? "");
      }

      const compare = left.localeCompare(right);
      return sortDirection === "asc" ? compare : -compare;
    });
  }, [matches, sportFilter, normalized, sortBy, sortDirection]);

  const selectedMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) ?? null : null;

  const upcomingCount = matches.filter((match) => new Date(`${match.date}T${match.time}`) > now).length;
  const completedCount = matches.length - upcomingCount;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = matches.filter((match) => match.date === today).length;

  const handleDelete = (id: string) => {
    if (confirm("Delete this match schedule? This action cannot be undone.")) {
      onDeleteMatch(id);
      if (selectedMatchId === id) setSelectedMatchId(null);
    }
  };

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDirection("asc");
  };

  const statusTone = (status: string) => {
    if (status === "completed") return "bg-green-100 text-emerald-700";
    if (status === "live") return "bg-blue-100 text-blue-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const thButtonCls = "flex items-center gap-1 text-[#A91D3A] font-semibold text-xs uppercase tracking-wide";
  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white text-black";
  const labelCls = "block text-sm font-medium text-black mb-2";

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-[#A91D3A]/20 bg-gradient-to-r from-[#A91D3A] via-[#8a1630] to-[#741029] p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70 mb-2">Admin Control Center</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Match Scheduling Hub</h2>
        <p className="text-white/80 mt-2 text-sm md:text-base max-w-3xl">
          Plan fixtures, monitor game timelines, and keep every sport calendar organized in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Matches", value: matches.length, icon: Trophy },
          { label: "Upcoming", value: upcomingCount, icon: CalendarDays },
          { label: "Completed", value: completedCount, icon: ShieldAlert },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
              <div className="rounded-md bg-[#A91D3A]/10 p-2 text-[#A91D3A]">
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Add New Match</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className={labelCls}>Sport *</label>
              <select className={inputCls} value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required>
                <option value="">Select Sport</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Team A *</label>
              <select className={inputCls} value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} required>
                <option value="">Select Team A</option>
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Team B *</label>
              <select className={inputCls} value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} required>
                <option value="">Select Team B</option>
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Time *</label>
              <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Venue *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Location"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-md text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            Add Match
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h3 className="text-[#A91D3A] text-lg font-semibold">All Matches</h3>
            <p className="text-sm text-gray-500">{todayCount} match(es) scheduled for today. Click a row to edit details in the match tile.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team, venue, or date..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <option value="all">All Sports</option>
              {SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setSortBy("date");
                setSortDirection("desc");
              }}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600 hover:text-[#A91D3A] hover:border-[#A91D3A]/40 transition-colors inline-flex items-center gap-2"
            >
              <ArrowDownAZ className="h-4 w-4" /> Reset Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E8CDD1]">
                {[
                  { key: "teamA", label: "Player" },
                  { key: "teamB", label: "Team" },
                  { key: "sport", label: "Sport" },
                  { key: "date", label: "Date" },
                  { key: "time", label: "Time" },
                  { key: "venue", label: "Venue" },
                  { key: "status", label: "Status" },
                ].map((h) => (
                  <th key={h.key} className="px-3 py-3 text-left">
                    <button className={thButtonCls} onClick={() => handleSort(h.key as SortKey)}>
                      {h.label}
                      <span className={`${sortBy === h.key ? "text-[#A91D3A]" : "text-[#A91D3A]/40"}`}>
                        {sortBy === h.key && sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-[#A91D3A] font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 italic py-10">
                    No matches yet.
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match) => {
                  const matchDT = new Date(`${match.date}T${match.time}`);
                  const inferredUpcoming = matchDT > now;
                  const isSelected = selectedMatchId === match.id;
                  const displayStatus = match.status || (inferredUpcoming ? "upcoming" : "completed");
                  return (
                    <tr
                      key={match.id}
                      onClick={() => setSelectedMatchId(match.id)}
                      className={`border-b border-gray-100 transition-colors cursor-pointer ${
                        isSelected ? "bg-[#A91D3A]/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-3 text-sm font-medium">{match.teamA}</td>
                      <td className="px-3 py-3 text-sm">{match.teamB}</td>
                      <td className="px-3 py-3 text-sm">{match.sport}</td>
                      <td className="px-3 py-3 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          {match.date}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                          {match.time}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {match.venue}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusTone(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(match.id);
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-all"
                        >
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

        {selectedMatch && (
          <div className="mt-5 rounded-xl border border-[#A91D3A]/20 bg-gradient-to-br from-white to-[#A91D3A]/[0.03] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A91D3A]/70">Match Tile</p>
                <h4 className="text-lg font-semibold text-[#A91D3A] inline-flex items-center gap-2">
                  <PencilLine className="h-4 w-4" />
                  {selectedMatch.teamA} vs {selectedMatch.teamB}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMatchId(null)}
                className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:text-gray-800 hover:border-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Sport</label>
                <select
                  className={inputCls}
                  value={selectedMatch.sport}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { sport: e.target.value })}
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Team A</label>
                <select
                  className={inputCls}
                  value={selectedMatch.teamA}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { teamA: e.target.value })}
                >
                  {TEAMS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Team B</label>
                <select
                  className={inputCls}
                  value={selectedMatch.teamB}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { teamB: e.target.value })}
                >
                  {TEAMS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={selectedMatch.date}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { date: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Time</label>
                <input
                  type="time"
                  className={inputCls}
                  value={selectedMatch.time}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { time: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Venue</label>
                <input
                  type="text"
                  className={inputCls}
                  value={selectedMatch.venue}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { venue: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={selectedMatch.status || defaultStatus}
                  onChange={(e) => onUpdateMatch(selectedMatch.id, { status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
