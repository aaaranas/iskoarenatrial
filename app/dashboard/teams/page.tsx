//app/dashboard/teams/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { College } from "@/features/teams/components/CollegeTable";
import { CollegeCard } from "@/features/teams/components/CollegeCard";
import { CollegeProfilePage } from "@/features/teams/components/CollegeProfilePage";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/providers/RoleProvider";

const FIXED_COLLEGES = ["COS", "CSS", "SOM", "CCAD"];

function Dropdown({
  label, options, selected, onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = selected.size;
  const isActive = count > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all min-w-[120px] justify-between ${
          isActive
            ? "bg-primary/8 border-primary/30 text-white"
            : "bg-card/80 border-border text-muted-foreground/80 hover:border-border/50 hover:text-muted-foreground/90"
        }`}
      >
        {isActive ? `${label} (${count})` : label}
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 bg-card/80 border border-border rounded-xl overflow-hidden z-50 shadow-2xl"
          style={{ width: options.length > 6 ? "520px" : "180px" }}
        >
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border">
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</p>
            {selected.size > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); [...selected].forEach((o) => onToggle(o)); }}
                className="text-[8px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {options.length === 0 && <p className="px-3 py-3 text-[11px] text-muted-foreground/60">No options available</p>}
          <div className={options.length > 6 ? "grid grid-cols-3 gap-px p-2" : "flex flex-col"}>
            {options.map((opt) => {
              const isSelected = selected.has(opt);
              return (
                <div
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`flex items-center gap-2 px-2.5 py-2 text-[11px] font-semibold cursor-pointer transition-colors rounded-lg ${
                    isSelected ? "text-primary bg-primary/5" : "text-muted-foreground/80 hover:bg-card/90 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-border/50"
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profileCollege, setProfileCollege] = useState<College | null>(null);
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());
  const [selectedColleges, setSelectedColleges] = useState<Set<string>>(new Set());

  const { isAdmin } = useRole();

  useEffect(() => {
    async function loadColleges() {
      const { data, error } = await (supabase as any)
        .from("teams")
        .select("*")
        .in("org", FIXED_COLLEGES)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching:", error);
      } else {
        setColleges(
          data.map((t: any) => ({
            id: t.id,
            name: t.college,
            established: t.established ?? "N/A",
            activeTeams: t.active_teams ?? 0,
            sports: t.sports ?? [],
            status: t.status ?? "Active",
          }))
        );
      }
      setIsLoading(false);
    }
    loadColleges();
  }, []);

  const allCollegeNames = colleges.map((c) => c.name);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) => { const next = new Set(prev); next.has(sport) ? next.delete(sport) : next.add(sport); return next; });
  };

  const toggleCollege = (name: string) => {
    setSelectedColleges((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  };

  const removeFilter = (type: "sport" | "college", val: string) => {
    if (type === "sport") setSelectedSports((prev) => { const n = new Set(prev); n.delete(val); return n; });
    else setSelectedColleges((prev) => { const n = new Set(prev); n.delete(val); return n; });
  };

  const clearAll = () => { setSelectedSports(new Set()); setSelectedColleges(new Set()); };
  const hasFilters = selectedSports.size > 0 || selectedColleges.size > 0;

  const filtered = colleges.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSport = selectedSports.size === 0 || c.sports.some((s) => selectedSports.has(s));
    const matchCollege = selectedColleges.size === 0 || selectedColleges.has(c.name);
    return matchSearch && matchSport && matchCollege;
  });

  const activePills: { type: "sport" | "college"; val: string }[] = [
    ...[...selectedSports].map((s) => ({ type: "sport" as const, val: s })),
    ...[...selectedColleges].map((c) => ({ type: "college" as const, val: c })),
  ];

  if (profileCollege) {
    return (
      <div className="min-h-screen bg-background">
        <CollegeProfilePage college={profileCollege} onBack={() => setProfileCollege(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="px-10 pt-14 pb-12 text-center border-b border-border/40">
        <h1 className="text-white text-6xl uppercase leading-none tracking-wide mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Participating <span className="text-primary">Colleges</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-9 leading-relaxed">
          Discover the colleges and universities competing in this season's league.
        </p>
        <div className="max-w-md mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools by name or sport..."
            className="w-full bg-card/80 border border-border rounded-full py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-all"
          />
        </div>
      </div>


      {/* Toolbar */}
      <div className="px-10 py-4 border-b border-border/40 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Filter by</span>
          <Dropdown label={selectedSports.size > 0 ? `Sport · ${selectedSports.size}` : "Sport"} options={[...new Set(colleges.flatMap((c) => c.sports))].sort()} selected={selectedSports} onToggle={toggleSport} />
          <Dropdown label={selectedColleges.size > 0 ? `College · ${selectedColleges.size}` : "College"} options={allCollegeNames} selected={selectedColleges} onToggle={toggleCollege} />
          {activePills.map(({ type, val }) => (
            <div key={`${type}-${val}`} className="flex items-center gap-1.5 bg-primary/10 border border-primary/25 rounded-full px-2.5 py-1">
              <span className="text-[9px] text-primary/60 font-bold uppercase tracking-wider">{type === "sport" ? "Sport" : "College"}:</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{val}</span>
              <button onClick={() => removeFilter(type, val)} className="text-primary/50 hover:text-primary text-sm leading-none transition-colors ml-0.5">×</button>
            </div>
          ))}
          {hasFilters && (
            <button onClick={clearAll} className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground/80 uppercase tracking-widest font-bold underline transition-colors">Clear all</button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isLoading && (
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="px-10 py-8">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-6">
          {isLoading ? "Loading..." : `${filtered.length} College${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-card" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-card rounded-full w-3/4 mx-auto" />
                  <div className="h-2 bg-card rounded-full w-1/2 mx-auto" />
                  <div className="h-8 bg-card rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white text-sm font-semibold mb-1">No colleges found</p>
            <p className="text-muted-foreground text-xs mb-4 max-w-xs leading-relaxed">
              {search ? `No results for "${search}".` : "No colleges match your current filters."} Try adjusting or clearing your filters.
            </p>
            <button
              onClick={() => { setSearch(""); clearAll(); }}
              className="text-[9px] font-bold text-primary border border-primary/30 hover:border-primary/60 px-4 py-2 rounded-lg uppercase tracking-widest transition-all"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((college, index) => (
              <CollegeCard key={college.id ?? `${college.name}-${index}`} college={college} onViewProfile={setProfileCollege} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}