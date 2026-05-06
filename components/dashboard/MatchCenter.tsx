"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface MatchUI {
  id: string;
  sport: string;
  matchup: string;
  schedule: Date;
  status: "LIVE NOW" | "UPCOMING" | "FINISHED";
  currentScore: string;
}

interface MatchCenterProps {
  matches?: MatchUI[];
  title?: string;
}

const SPORTS = [
  "Basketball", "Volleyball", "E-Sports", "Badminton",
  "Swimming", "Football", "Tennis", "Athletics",
];

const SPORT_ICONS: Record<string, string> = {
  Basketball: "🏀", Volleyball: "🏐", "E-Sports": "🎮", Badminton: "🏸",
  Swimming: "🏊", Football: "⚽", Tennis: "🎾", Athletics: "🏃",
};

function getSportIcon(sport: string): string {
  const key = Object.keys(SPORT_ICONS).find(
    (k) => k.toLowerCase() === sport.toLowerCase()
  );
  return key ? SPORT_ICONS[key] : "🏅";
}

function formatSchedule(date: Date): string {
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  return `${dateStr} · ${timeStr}`;
}

function StatusBadge({ status }: { status: MatchUI["status"] }) {
  if (status === "LIVE NOW") {
    return (
      <Badge
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-base uppercase tracking-wider border whitespace-nowrap font-heading"
        style={{
          backgroundColor: "var(--accent-live-bg)",
          color: "var(--accent-live)",
          borderColor: "var(--accent-live-border)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
          style={{ backgroundColor: "var(--accent-live)" }}
        />
        LIVE<span className="hidden min-[1020px]:inline"> NOW</span>
      </Badge>
    );
  }
  if (status === "UPCOMING") {
    return (
      <Badge
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-base uppercase tracking-wider border whitespace-nowrap font-heading"
        style={{
          backgroundColor: "var(--upcoming-bg)",
          color: "var(--upcoming-text)",
          borderColor: "rgba(109, 204, 186, 0.80)",
        }}
      >
        Upcoming
      </Badge>
    );
  }
  return (
    <Badge
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-base uppercase tracking-wider border whitespace-nowrap font-heading"
      style={{
        backgroundColor: "var(--finished-bg)",
        color: "var(--finished-text)",
        borderColor: "var(--border-subtle)",
      }}
    >
      Finished
    </Badge>
  );
}

const PAGE_SIZE_OPTIONS = [5, 10, 15] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const MatchCenter = ({
  matches = [],
  title = "Match Center",
}: MatchCenterProps) => {
  const [search,       setSearch]       = useState("");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [filterSport,  setFilterSport]  = useState("");
  const [filterTeam,   setFilterTeam]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState<PageSize>(10);

  const activeFilterCount = [filterSport, filterTeam, filterStatus].filter(Boolean).length;
  const clearFilters = () => { setFilterSport(""); setFilterTeam(""); setFilterStatus(""); };

  useEffect(() => { setPage(1); }, [search, filterSport, filterTeam, filterStatus, pageSize]);

  const filtered = useMemo(() => matches.filter((m) => {
    const q = search.toLowerCase();
    return (
      (!q || m.sport.toLowerCase().includes(q) || m.matchup.toLowerCase().includes(q) || m.status.toLowerCase().includes(q)) &&
      (!filterSport  || m.sport.toLowerCase() === filterSport.toLowerCase()) &&
      (!filterTeam   || m.matchup.toLowerCase().includes(filterTeam.toLowerCase())) &&
      (!filterStatus || m.status === filterStatus)
    );
  }), [matches, search, filterSport, filterTeam, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * pageSize;
  const paginated  = filtered.slice(pageStart, pageStart + pageSize);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, null, totalPages];
    if (safePage >= totalPages - 2)
      return [1, null, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, null, safePage - 1, safePage, safePage + 1, null, totalPages];
  }, [safePage, totalPages]);

  const inputStyle = {
    backgroundColor: "var(--surface-overlay)",
    borderColor: "var(--border-default)",
    color: "var(--text)",
  };

  return (
    <section className="animate-in fade-in duration-700 delay-300 pt-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2
          className="text-lg tracking-[0.15em] uppercase pl-1 font-heading"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search — shadcn Input with prefix icon */}
          <div
            className="flex items-center gap-2 flex-1 sm:flex-none sm:w-56 rounded-md px-3 py-2 border transition-colors"
            style={inputStyle}
          >
            <Search size={13} style={{ color: "var(--text)" }} className="shrink-0" />
            <Input
              type="text"
              placeholder="Search matches…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-base outline-none w-full placeholder:opacity-80 border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              style={{ color: "var(--text)" }}
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="h-auto w-auto p-0 hover:bg-transparent"
                style={{ color: "var(--text)" }}
              >
                <X size={11} />
              </Button>
            )}
          </div>

          {/* Filter toggle — shadcn Button */}
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((v) => !v)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-md text-base uppercase tracking-wider transition-colors border font-heading h-auto"
            style={
              filtersOpen
                ? { backgroundColor: "var(--surface-raised)", borderColor: "var(--border-strong)", color: "var(--text)" }
                : { backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-default)", color: "var(--text)" }
            }
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[14px] flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-maroon)",
                  color: "var(--text-inverse)",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div
          className="mb-3 rounded-xl p-4 flex flex-wrap gap-4 items-end border animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: "var(--surface-overlay)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Sport filter — shadcn Select */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label
              className="text-[10px] uppercase tracking-widest font-heading"
              style={{ color: "var(--text)" }}
            >
              Sport
            </label>
            <Select
              value={filterSport || "all"}
              onValueChange={(v) => setFilterSport(v === "all" ? "" : v)}
            >
              <SelectTrigger
                className="rounded-md px-3 py-1.5 text-base border h-auto"
                style={inputStyle}
              >
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "var(--surface-overlay)", borderColor: "var(--border-default)" }}>
                <SelectItem value="all">All Sports</SelectItem>
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getSportIcon(s)} {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team filter — shadcn Input */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label
              className="text-[10px] uppercase tracking-widest font-heading"
              style={{ color: "var(--text)" }}
            >
              Team
            </label>
            <div
              className="flex items-center gap-2 rounded-md px-3 py-1.5 border"
              style={inputStyle}
            >
              <Search size={11} style={{ color: "var(--text-disabled)" }} className="shrink-0" />
              <Input
                type="text"
                placeholder="Search by team…"
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="bg-transparent text-base outline-none w-full placeholder:opacity-40 border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                style={{ color: "var(--text)" }}
              />
              {filterTeam && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFilterTeam("")}
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  style={{ color: "var(--text)" }}
                >
                  <X size={10} />
                </Button>
              )}
            </div>
          </div>

          {/* Status filter — shadcn Select */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label
              className="text-[10px] uppercase tracking-widest font-heading"
              style={{ color: "var(--text)" }}
            >
              Status
            </label>
            <Select
              value={filterStatus || "all"}
              onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger
                className="rounded-md px-3 py-1.5 text-base border h-auto"
                style={inputStyle}
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "var(--surface-overlay)", borderColor: "var(--border-default)" }}>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="LIVE NOW">Live Now</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="FINISHED">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest pb-0.5 transition-colors font-heading h-auto px-0 hover:bg-transparent"
              style={{ color: "var(--text)" }}
            >
              <X size={10} /> Clear all
            </Button>
          )}
        </div>
      )}

      {/* ── Table — shadcn Table ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: "var(--surface-card)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse min-w-[700px]">
            <TableHeader>
              <TableRow
                className="border-b hover:bg-transparent"
                style={{
                  backgroundColor: "var(--accent-maroon2)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                {["Sport", "Matchup", "Schedule", "Status", "Current Score"].map((col) => (
                  <TableHead
                    key={col}
                    className="py-4 px-6 text-base uppercase tracking-wider text-center font-heading"
                    style={{ color: "var(--text)" }}
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((match, idx) => (
                  <TableRow
                    key={match.id}
                    className="transition-colors"
                    style={{
                      backgroundColor: idx % 2 === 0
                        ? "var(--surface-card)"
                        : "var(--surface-card-alt)",
                      borderTop: "1px solid var(--border-ghost)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-sunken)"
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        idx % 2 === 0 ? "var(--surface-card)" : "var(--surface-card-alt)"
                    }
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-start">
                        <span className="text-base leading-none">{getSportIcon(match.sport)}</span>
                        <span
                          className="text-base uppercase tracking-widest font-heading"
                          style={{ color: "var(--text)" }}
                        >
                          {match.sport}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <p
                        className="text-base font-normal tracking-tight leading-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {match.matchup}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <p
                        className="text-base font-normal tracking-wide whitespace-nowrap"
                        style={{ color: "var(--text)" }}
                      >
                        {formatSchedule(match.schedule)}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex justify-center">
                        <StatusBadge status={match.status} />
                      </div>
                    </TableCell>
                    <TableCell
                      className="py-4 px-6 text-base font-normal text-center"
                      style={{ color: "var(--text)" }}
                    >
                      {match.currentScore}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 text-center">
                    <p
                      className="text-base font-normal tracking-wide"
                      style={{ color: "var(--text)" }}
                    >
                      {matches.length === 0
                        ? "No match data available at this time."
                        : "No matches found for your search or filters."}
                    </p>
                    {matches.length > 0 && (search || activeFilterCount > 0) && (
                      <Button
                        variant="link"
                        onClick={() => { setSearch(""); clearFilters(); }}
                        className="mt-3 text-base underline underline-offset-2 transition-colors h-auto p-0"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        Clear search &amp; filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination footer ── */}
      {matches.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pl-1">
          <div className="flex items-center gap-3">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-disabled)" }}
            >
              {filtered.length === 0
                ? "0 matches"
                : `${pageStart + 1}–${Math.min(pageStart + pageSize, filtered.length)} of ${filtered.length} match${filtered.length !== 1 ? "es" : ""}`}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-disabled)" }}
              >
                Rows
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v) as PageSize)}
              >
                <SelectTrigger
                  className="rounded-md px-2 py-1 text-[10px] border h-auto w-auto focus:ring-0"
                  style={inputStyle}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--surface-overlay)", borderColor: "var(--border-default)" }}>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-[10px]">
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center justify-center w-7 h-7 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text)",
                }}
              >
                <ChevronLeft size={12} />
              </Button>

              {pageNumbers.map((n, i) =>
                n === null ? (
                  <span
                    key={`e-${i}`}
                    className="w-7 text-center text-base"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={n}
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(n)}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-base transition-colors border font-heading"
                    style={
                      n === safePage
                        ? {
                            backgroundColor: "var(--accent-maroon)",
                            borderColor: "var(--accent-maroon)",
                            color: "var(--text-inverse)",
                          }
                        : {
                            backgroundColor: "var(--surface-card)",
                            borderColor: "var(--border-default)",
                            color: "var(--text)",
                          }
                    }
                  >
                    {n}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text)",
                }}
              >
                <ChevronRight size={12} />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};