"use client";

import React, { useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types"; // Ensure this points to your updated index.ts
import { Plus, Search, ChevronDown } from "lucide-react";
import { trpc } from '@/utils/trpc';

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

const FILTER_OPTIONS = {
  category: ["Men's", "Women's", "Men's Singles", "Men's Doubles", "Women's Singles", "Women's Doubles", "Mixed Singles", "Mixed Doubles"],
  location: ["UP High School Gymnasium", "AS Hall", "Admin Field", "SOM Court", "PAH"],
  college: [ "CCAD Phoenix", "SOM Tycoons", "COS Scions", "CSS Stallions"],
  sport: ["Badminton", "Basketball", "Volleyball", "Table Tennis", "Larong Pinoy", "Pickleball", "Petanque", "Mobile Legends (ESPORTS)", "DOTA 2 (ESPORTS)", "Valorant (ESPORTS)", "Football"],
  status: ["Live", "Upcoming", "Concluded", "Postponed"]
};

export const Box = () => {
  // 1. DATA FETCHING (tRPC)
  // We cast the data to Match[] to ensure the UI properties exist
  const { data: matchesData, isLoading } = trpc.match.getAll.useQuery();
  const matches = (matchesData as Match[]) || [];
  
  const { data: auth } = trpc.auth.getSession.useQuery();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "Category",
    location: "Location",
    college: "College",
    sport: "Sport",
    status: "Status"
  });

  // 2. PERMISSIONS
  const isAdmin = auth?.profile?.role === 'super_admin' || auth?.profile?.role === 'college_admin';

  // 3. FILTERING LOGIC (Aligned with your Match interface)
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const searchStr = search.toLowerCase();
      
      // Property Mapping: 
      // league = Sport Name
      // homeTeam/awayTeam = College Name
      const matchesSearch = 
        m.league.toLowerCase().includes(searchStr) || 
        m.homeTeam.toLowerCase().includes(searchStr) ||
        m.awayTeam.toLowerCase().includes(searchStr);
      
      const matchesSport = filters.sport === "Sport" || m.league === filters.sport;
      const matchesStatus = filters.status === "Status" || m.statusType === filters.status.toLowerCase();
      const matchesCollege = filters.college === "College" || m.homeTeam === filters.college || m.awayTeam === filters.college;

      // Note: If 'category' or 'location' aren't in your Match interface yet, 
      // you'll need to add them to your tRPC mapper and the Match interface in index.ts
      return matchesSearch && matchesSport && matchesStatus && matchesCollege;
    });
  }, [matches, search, filters]);

  // Use the 'isOwner' property we defined in the Match interface
  const myMatches = useMemo(() => {
    return matches.filter((m) => m.isOwner);
  }, [matches]);

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C5A059] animate-pulse">
          Initializing Compendium...
        </div>
      </div>
    );
  }

  // Reusable Dropdown Component
  const FilterDropdown = ({ 
    label, 
    options, 
    value, 
    onSelect, 
    isSecondary = false 
  }: { 
    label: string, 
    options: string[], 
    value: string, 
    onSelect: (val: string) => void, 
    isSecondary?: boolean 
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

      <div className="relative z-10 pt-[35vh]">
        
        {/* 2. FILTER & ACTION BAR */}
        <motion.div className="max-w-[1600px] mx-auto mb-12 px-6 flex items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <FilterDropdown label="Category" value={filters.category} options={FILTER_OPTIONS.category} onSelect={(val) => setFilters(prev => ({ ...prev, category: val }))} />
              <FilterDropdown label="Location" value={filters.location} options={FILTER_OPTIONS.location} onSelect={(val) => setFilters(prev => ({ ...prev, location: val }))} />
              <FilterDropdown label="College" value={filters.college} options={FILTER_OPTIONS.college} onSelect={(val) => setFilters(prev => ({ ...prev, college: val }))} />
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-6">
              <FilterDropdown label="Sport" value={filters.sport} options={FILTER_OPTIONS.sport} onSelect={(val) => setFilters(prev => ({ ...prev, sport: val }))} isSecondary />
              <FilterDropdown label="Status" value={filters.status} options={FILTER_OPTIONS.status} onSelect={(val) => setFilters(prev => ({ ...prev, status: val }))} isSecondary />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isAdmin && (
              <AddMatchModal>
                <button className="flex items-center gap-2 px-5 h-9 bg-[#C5A059]/5 border border-[#C5A059]/20 hover:border-[#C5A059]/60 hover:bg-[#C5A059]/10 rounded-md transition-all group">
                  <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">Add Match</span>
                </button>
              </AddMatchModal>
            )}
            <div className="h-4 w-px bg-white/10 mx-1" />
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
              <input
                type="text" placeholder="SEARCH REPOSITORY..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 bg-zinc-900/40 border border-white/5 rounded-md pl-10 pr-4 text-[10px] font-bold tracking-[0.15em] focus:outline-none focus:border-[#C5A059]/50 transition-all uppercase placeholder:text-zinc-700 text-zinc-200"
              />
            </div>
          </div>
        </motion.div>

        {/* 3. TITLE SECTION */}
        <section className="max-w-[1600px] mx-auto px-6 mb-16">
           <h1 className="text-4xl font-black tracking-tight text-white mb-4">The Match Compendium</h1>
           <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
             A live-updated catalog of the intramural landscape. Featuring every active entry and future showdown across all campus divisions. 
           </p>
        </section>

        {/* 4. MANAGED MATCHES */}
        {myMatches.length > 0 && (
          <section className="mb-24 max-w-[1600px] mx-auto px-6">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#C5A059]">Initialized Entries</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-6">
                {myMatches.map((match) => (
                  <CarouselItem key={match.id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                     <MatchCard match={match} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )}

        {/* 5. GLOBAL GRID */}
        <section className="max-w-[1600px] mx-auto px-6 pb-20">
          <div className="flex items-center gap-6 mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">Global Repository</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Box;
