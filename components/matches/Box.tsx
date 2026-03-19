"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";
import { Plus, Calendar, Zap, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// Shadcn Carousel Imports
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

  const globalMatches = matches.filter((m) => m.statusType !== "live");
  const myMatches = matches.filter((m) => m.isOwner);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-zinc-950 min-h-screen text-zinc-100 p-8 w-full overflow-x-hidden"
    >
      {/* 1. CONSISTENT ATHLETIC MESH BACKGROUND (Fixed & No Gradient) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* 2. STICKY PREMIUM HEADER */}
        <motion.header variants={itemVariants} className="sticky top-0 z-50 -mx-8 -mt-16 mb-20 bg-zinc-950/80 backdrop-blur-xl px-8">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center py-1">
            <h1 className="text-5xl font-black flex items-center gap-6 italic tracking-tight text-white">
              <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" />
              LIVE & SCHEDULED GAMES
            </h1>
          </div>
        </motion.header>

        {/* 3. FILTER & SEARCH BAR */}
        <motion.div variants={itemVariants} className="max-w-[1600px] mx-auto mb-10 flex gap-3">
          <div className="relative flex-[1]">
            <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by team, league, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#111] border border-white/5 rounded-full pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-[#A91D3A] transition-all"
            />
          </div>
          {["Sport", "Status"].map((placeholder) => (
            <button key={placeholder} className="flex items-center justify-between w-[120px] h-10 bg-[#111] border border-white/5 rounded-full px-5 text-xs font-bold text-zinc-400 hover:border-[#A91D3A] transition-all">
              {placeholder}
              <ChevronDown className="w-3 h-3" />
            </button>
          ))}
        </motion.div>

		{/* 4. YOUR MANAGED MATCHES (Shadcn Carousel) */}
<section className="mb-24 mt-8 max-w-[1600px] mx-auto px-4">
  {myMatches.length > 0 ? (
    <Carousel
      opts={{ align: "start", loop: false }}
      className="w-full"
    >
      {/* HEADER CONTAINER: Title + Gold Line + Buttons aligned */}
      <motion.div 
        variants={itemVariants} 
        className="flex items-center gap-6 mb-10 px-1.5"
      >
        <h2 className="text-2xl font-black uppercase tracking-widest text-[#C5A059] whitespace-nowrap">
          Your Matches
        </h2>
        
        {/* The Gold Line: flex-1 fills the middle space */}
        <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/40 via-[#C5A059]/10 to-transparent" />

        {/* Carousel Buttons: Placed at the end of the flex line */}
        <div className="flex gap-2 items-center">
          <CarouselPrevious 
            className="static translate-y-0 h-10 w-10 border-white/10 bg-[#111] text-zinc-400 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all" 
          />
          <CarouselNext 
            className="static translate-y-0 h-10 w-10 border-white/10 bg-[#111] text-zinc-400 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all" 
          />
        </div>
      </motion.div>

      <CarouselContent className="-ml-6">
        {myMatches.map((match) => (
          <CarouselItem key={match.id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <motion.div variants={itemVariants}>
              <MatchCard match={match} />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ) : (
    <div className="bg-[#111] border border-dashed border-white/10 rounded-3xl p-12 text-center text-zinc-500">
      <p className="text-sm font-bold uppercase tracking-widest">No matches managed yet</p>
    </div>
  )}
</section>

        {/* 5. GLOBAL MATCHES (Original Grid) */}
        <section className="max-w-[1600px] mx-auto px-4">
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#C5A059]">
              Global Matches
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent" />
          </motion.div>

          <motion.main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((match) => (
              <motion.div key={match.id} variants={itemVariants}>
                <MatchCard match={match} />
              </motion.div>
            ))}
          </motion.main>
        </section>

        {/* 6. FOOTER */}
        <motion.footer variants={itemVariants} className="mt-20 mb-8 flex justify-between items-center max-w-[1600px] mx-auto px-8">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">PAGE 1 OF 5</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400">Previous</button>
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400">Next</button>
          </div>
        </motion.footer>
      </div>

      {/* 7. FLOATING ACTION BUTTON */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <Popover onOpenChange={(open) => setIsOpen(open)}>
          <PopoverTrigger asChild>
            <button className="relative group w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center transition-all hover:scale-110 active:scale-95">
              <div className="absolute inset-0 rounded-full bg-[#C5A059] p-[1.5px] transition-all group-hover:blur-sm">
                <div className="h-full w-full rounded-full bg-[#0A0A0A]" />
              </div>
              <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
                <Plus className="w-6 h-6 text-white relative z-10" />
              </motion.div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="end" className="w-56 bg-[#111] border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
             <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-xs text-zinc-300">
                  <Calendar className="w-4 h-4 text-[#C5A059]" /> Schedule Match
                </button>
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-xs text-zinc-300">
                  <Zap className="w-4 h-4 text-[#A91D3A]" /> Quick Match
                </button>
             </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
};

export default Box;
