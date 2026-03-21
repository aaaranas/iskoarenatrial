"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";
import { Plus, Calendar, Zap, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Box = ({ matches }: { matches: Match[] }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Scroll Animation Logic
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const contentY = useTransform(scrollY, [0, 400], [0, -50]); // Slight parallax

  const myMatches = matches.filter((m) => m.isOwner);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="relative bg-[#050505] min-h-screen text-zinc-100 w-full overflow-x-hidden">
      
      {/* 1. LETTERBOXD STYLE BACKDROP */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute top-0 left-0 w-full h-[70vh] z-0 pointer-events-none"
      >
        {/* The Hero Image - Desaturated for that classic film look */}
        <div 
          className="absolute inset-0 bg-[url('/iskolarobadminton.jpg')] 
          bg-cover bg-center grayscale-[0.4] brightness-[0.6]"
        />
        
        {/* THE VIGNETTE (Edges Darkening) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-80" />
        
        {/* THE BOTTOM FADE (Blending into page) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
      </motion.div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="relative z-10 pt-[35vh]"> {/* Pushes content down to show hero image */}
        
	{/* 3. FILTER, ADMIN ACTION & SEARCH BAR */}
<motion.div 
  variants={itemVariants} 
  className="max-w-[1600px] mx-auto mb-12 px-6 flex items-center justify-between gap-10"
>
  {/* LEFT SIDE: Navigation Filters (Gray/Simple Theme) */}
  <div className="flex items-center gap-8">
    
    {/* PRIMARY DROPDOWNS (Division, Phase, Venue) */}
    <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
      <div className="group flex items-center gap-2 cursor-pointer hover:text-zinc-200 transition-colors">
        <span>Category</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <div className="group flex items-center gap-2 cursor-pointer hover:text-zinc-200 transition-colors">
        <span>Location</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <div className="group flex items-center gap-2 cursor-pointer hover:text-zinc-200 transition-colors">
        <span>College</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </div>

    {/* SUBTLE DIVIDER */}
    <div className="h-4 w-px bg-white/10" />

    {/* SECONDARY FILTERS (Sport & Department) */}
    <div className="flex items-center gap-6">
      {["Sport", "Status"].map((label) => (
        <button 
          key={label} 
          className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white transition-all"
        >
          {label}
        </button>
      ))}
    </div>
  </div>

  {/* RIGHT SIDE: Admin Action + Search */}
  <div className="flex items-center gap-4 shrink-0">
    
    {/* ADMIN "ADD MATCH" BUTTON - Forced to one line */}
    <button className="flex items-center gap-2 px-5 h-9 bg-[#C5A059]/5 border border-[#C5A059]/20 hover:border-[#C5A059]/60 hover:bg-[#C5A059]/10 rounded-md transition-all group whitespace-nowrap">
      <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">
        Add Match
      </span>
    </button>

    {/* VERTICAL DIVIDER */}
    <div className="h-4 w-px bg-white/10 mx-1" />

    {/* SEARCH BAR */}
    <div className="relative w-[280px]">
      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
      <input
        type="text"
        placeholder="SEARCH REPOSITORY..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-9 bg-zinc-900/40 border border-white/5 rounded-md pl-10 pr-4 text-[10px] font-bold tracking-[0.15em] focus:outline-none focus:border-[#A91D3A]/50 transition-all uppercase placeholder:text-zinc-700"
      />
    </div>
  </div>
</motion.div>




        {/* 4. TITLE SECTION */}
        <section className="max-w-[1600px] mx-auto px-6 mb-16">
           <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-4xl font-black tracking-tight text-white mb-4"
           >
             The Match Compendium
           </motion.h1>
           <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
	   A live-updated catalog of the intramural landscape. Featuring every active entry and future showdown across all campus divisions. This list records every match from the opening whistle to the final buzzer. See the <span className="text-zinc-200 underline underline-offset-4 decoration-zinc-700 hover:text-[#C5A059] cursor-pointer transition-all">standings</span> for a bird’s-eye view of the season.
           </p>
        </section>

        {/* 5. MATCH SECTIONS (Standardized alignment) */}
        <section className="mb-24 max-w-[1600px] mx-auto px-6">
          <div className="flex items-center gap-6 mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#C5A059]">Managed Matches</h2>
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

        {/* 6. GLOBAL GRID */}
        <section className="max-w-[1600px] mx-auto px-6 pb-20">
          <div className="flex items-center gap-6 mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">All Matches</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>

      {/* FLOATING ACTION BUTTON - (Same as before) */}
    </div>
  );
};

export default Box;
