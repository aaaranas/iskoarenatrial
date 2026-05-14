"use client";

import React, { useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";
import { Plus, Search, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/providers/RoleProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { AddMatchModal } from "./AddMatchModal";
import { FinalizeMatchModal } from "./FinalizeMatchModal";
import { DeleteMatchModal } from "./DeleteMatchModal";
import { EditMatchModal } from "./EditMatchModal";

const FILTER_OPTIONS = {
  category: ["Men's", "Women's", "Men's Singles", "Men's Doubles", "Women's Singles", "Women's Doubles", "Mixed Singles", "Mixed Doubles"],
  location: ["UP High School Gymnasium", "AS Hall", "Admin Field", "SOM Court", "PAH"],
  college: ["CCAD Phoenix", "SOM Tycoons", "COS Scions", "CSS Stallions"],
  sport: ["Badminton", "Basketball", "Volleyball", "Table Tennis", "Larong Pinoy", "Pickleball", "Petanque", "Mobile Legends (ESPORTS)", "DOTA 2 (ESPORTS)", "Valorant (ESPORTS)", "Football"],
  status: ["Live", "Upcoming", "Completed"]
};

const ITEMS_PER_PAGE = 8;

export const Box = ({ onSelectMatch }: { onSelectMatch: (m: Match) => void }) => {
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery();
  const matches = (matchesData as Match[]) || [];
  const [matchToFinalize, setMatchToFinalize] = useState<Match | null>(null);
  const { isAdmin } = useRole();

  const { data: auth } = trpc.auth.getSession.useQuery();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "Category",
    location: "Location",
    college: "College",
    sport: "Sport",
    status: "Status"
  });

  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  const STATUS_ORDER: Record<string, number> = { live: 0, upcoming: 1, completed: 2 };

  const filteredMatches = useMemo(() => {
    const filtered = matches.filter((m) => {
      const searchStr = search.toLowerCase();
      const matchesSearch =
        (m.league ?? '').toLowerCase().includes(searchStr) ||
        (m.homeTeam ?? '').toLowerCase().includes(searchStr) ||
        (m.awayTeam ?? '').toLowerCase().includes(searchStr);
      const matchesSport = filters.sport === "Sport" || m.league === filters.sport;
      const matchesStatus = filters.status === "Status" || m.statusType === filters.status.toLowerCase();
      const matchesCollege = filters.college === "College" || m.homeTeam === filters.college || m.awayTeam === filters.college;
      return matchesSearch && matchesSport && matchesStatus && matchesCollege;
    });

    return filtered.sort((a, b) => {
      // Primary sort: Live → Upcoming → Completed
      const statusDiff = (STATUS_ORDER[a.statusType] ?? 3) - (STATUS_ORDER[b.statusType] ?? 3);
      if (statusDiff !== 0) return statusDiff;

      // Secondary sort: within each group sort by date.
      // Upcoming: ascending (soonest first).
      // Live / Completed: descending (most recent first).
      const aTime = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const bTime = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return a.statusType === "upcoming" ? aTime - bTime : bTime - aTime;
    });
  }, [matches, search, filters]);

  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMatches = filteredMatches.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useMemo(() => { setCurrentPage(1); }, [search, filters]);

  const myMatches = useMemo(() => matches.filter((m) => m.isOwner), [matches]);

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-lg font-black tracking-[0.2em] text-[#C5A059] animate-pulse">
          Initializing Compendium...
        </div>
      </div>
    );
  }

  const FilterDropdown = ({
    label, options, value, onSelect, isSecondary = false
  }: {
    label: string; options: string[]; value: string; onSelect: (val: string) => void; isSecondary?: boolean;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`group flex items-center gap-2 outline-none transition-colors ${isSecondary ? "text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white" : "text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200"}`}>
          <span>{value}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 min-w-[160px] rounded-sm shadow-2xl z-[110]">
        <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-zinc-600 px-2 py-1.5 font-black">Select {label}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onSelect(option)}
            className="text-[10px] uppercase tracking-widest font-bold focus:bg-[#C5A059]/10 focus:text-[#C5A059] cursor-pointer py-2"
          >
            {option}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem onClick={() => onSelect(label)} className="text-[9px] uppercase tracking-widest text-zinc-500">Reset Filter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="relative bg-[#050505] min-h-screen text-zinc-100 w-full overflow-x-hidden">

      <motion.div style={{ opacity: bgOpacity }} className="absolute top-0 left-0 w-full h-[70vh] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/iskolarobadminton.jpg')] bg-cover bg-center grayscale-[0.4] brightness-[0.6]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
      </motion.div>

      <div className="relative z-10 pt-[25vh] sm:pt-[30vh] lg:pt-[35vh]">

        {/* FILTER & ACTION BAR */}
        <motion.div className="max-w-[1600px] mx-auto mb-12 px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
              <FilterDropdown label="Category" value={filters.category} options={FILTER_OPTIONS.category} onSelect={(val) => setFilters(prev => ({ ...prev, category: val }))} />
              <FilterDropdown label="Location" value={filters.location} options={FILTER_OPTIONS.location} onSelect={(val) => setFilters(prev => ({ ...prev, location: val }))} />
              <FilterDropdown label="College" value={filters.college} options={FILTER_OPTIONS.college} onSelect={(val) => setFilters(prev => ({ ...prev, college: val }))} />
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <FilterDropdown label="Sport" value={filters.sport} options={FILTER_OPTIONS.sport} onSelect={(val) => setFilters(prev => ({ ...prev, sport: val }))} isSecondary />
              <FilterDropdown label="Status" value={filters.status} options={FILTER_OPTIONS.status} onSelect={(val) => setFilters(prev => ({ ...prev, status: val }))} isSecondary />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 w-full sm:w-auto">
            {/* Add Match — admin only */}
            {isAdmin && (
              <AddMatchModal>
                <button className="flex items-center gap-2 px-5 h-9 bg-[#C5A059]/5 border border-[#C5A059]/20 hover:border-[#C5A059]/60 hover:bg-[#C5A059]/10 rounded-md transition-all group w-full sm:w-auto justify-center">
                  <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">Add Match</span>
                </button>
              </AddMatchModal>
            )}
            <div className="hidden sm:block h-4 w-px bg-white/10 mx-1" />
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text" placeholder="SEARCH REPOSITORY..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 bg-zinc-900/40 border border-white/5 rounded-md pl-10 pr-4 text-[10px] font-bold tracking-[0.15em] focus:outline-none focus:border-[#C5A059]/50 transition-all uppercase placeholder:text-zinc-700 text-zinc-200"
              />
            </div>
          </div>
        </motion.div>

        {/* TITLE */}
        <section className="max-w-[1600px] mx-auto px-6 mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-4">The Match Compendium</h1>
          <p className="text-zinc-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
            A live-updated catalog of the intramural landscape. Featuring every active entry and future showdown across all campus divisions.
          </p>
        </section>

        {/* MANAGED MATCHES — admin only */}
        {isAdmin && myMatches.length > 0 && (
          <section className="mb-16 sm:mb-24 max-w-[1600px] mx-auto px-6">
            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[#C5A059] whitespace-nowrap">Initialized Entries</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-4 sm:-ml-6">
                {myMatches.map((match) => (
                  <CarouselItem key={match.id} className="pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <MatchCard
                      key={match.id}
                      match={match}
                      onOpenDetails={() => onSelectMatch(match)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )}

        {/* GLOBAL GRID */}
        <section className="max-w-[1600px] mx-auto px-6 pb-16 sm:pb-20">
          <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-zinc-500 whitespace-nowrap">Global Repository</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {paginatedMatches.map((match) => (
              <div key={match.id} onClick={() => onSelectMatch(match)} className="cursor-pointer">
                <MatchCard
                  match={match}
                  onOpenDetails={() => onSelectMatch(match)}
                  onEdit={isAdmin ? () => setMatchToEdit(match) : undefined}
                  onFinalize={isAdmin ? () => setMatchToFinalize(match) : undefined}
                  onDelete={isAdmin ? () => setMatchToDelete(match) : undefined}
                />
              </div>
            ))}
          </div>

          {/* Admin-owned modals — lifted out of the card loop so they're
              mounted once, not once per card. Conditionally rendered so the
              required `match` prop is always defined when open. */}
          {matchToEdit && (
            <EditMatchModal
              match={matchToEdit}
              open={!!matchToEdit}
              onOpenChange={(open) => { if (!open) setMatchToEdit(null); }}
            />
          )}
          {matchToDelete && (
            <DeleteMatchModal
              match={matchToDelete}
              open={!!matchToDelete}
              onOpenChange={(open) => { if (!open) setMatchToDelete(null); }}
            />
          )}
          {matchToFinalize && (
            <FinalizeMatchModal
              match={matchToFinalize}
              isOpen={!!matchToFinalize}
              onClose={() => setMatchToFinalize(null)}
            />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-12 pt-8 border-t border-white/5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded hover:border-[#C5A059] hover:text-[#C5A059] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 text-xs font-bold rounded transition-all ${
                      currentPage === page ? "bg-[#C5A059] text-black" : "border border-zinc-800 text-zinc-500 hover:border-[#C5A059] hover:text-[#C5A059]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded hover:border-[#C5A059] hover:text-[#C5A059] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                Next →
              </button>
            </div>
          )}

          {paginatedMatches.length === 0 && filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm">No matches found. Try adjusting your filters.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Box;