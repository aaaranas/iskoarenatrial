"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";
import { Plus, Calendar, Zap, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Box = ({ matches }: { matches: Match[] }) => {
  const [search, setSearch] = useState("");
    // Global matches (everyone can see)
  const globalMatches = matches.filter(m => m.statusType !== "live");
  
  // Your matches (Matches where isOwner is true)
  const myMatches = matches.filter(m => m.isOwner);
  const [isOpen, setIsOpen] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-zinc-950 min-h-screen text-zinc-100 p-8 w-full overflow-x-hidden"
    >
      {/* 1. STICKY PREMIUM HEADER */}
      <motion.header variants={itemVariants} className="sticky top-0 z-50 -mx-8 -mt-14 mb-24 bg-zinc-950/80 backdrop-blur-xl px-8">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-5xl font-black flex items-center gap-6 italic tracking-tight text-white">
      {/* Increased height to 12 (48px) and width to 2 (8px) */}
      <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" /> 
	LIVE & SCHEDULED GAMES
    </h1>
    </div>
    </motion.header>


      {/* 2. FILTER & SEARCH BAR */}
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
   
	    {/* 3. YOUR MANAGED MATCHES (Admin Only) */}
<section className="mb-20 mt-8">
  <motion.div variants={itemVariants} className="flex items-center gap-4 mb-12 px-1.5">
    <h2 className="text-2xl font-black uppercase tracking-widest text-[#C5A059]">
      Your Matches
    </h2>
    <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent" />
  </motion.div>

  {myMatches.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {myMatches.map((match) => (
        <motion.div key={match.id} variants={itemVariants}>
          <MatchCard match={match} />
        </motion.div>
      ))}
    </div>
  ) : (
    <div className="bg-[#111] border border-dashed border-white/10 rounded-3xl p-12 text-center text-zinc-500">
      <p className="text-sm font-bold uppercase tracking-widest">No matches managed yet</p>
      <p className="text-[10px] mt-2">Create a new match to get started.</p>
    </div>
  )}
</section>

  <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 px-1.5">
    <h2 className="text-2xl font-black uppercase tracking-widest text-[#C5A059]">
      Global Matches
    </h2>
    <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent" />
  </motion.div>

      {/* 3. MATCH GRID */}
      <motion.main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {matches.map((match) => (
          <motion.div key={match.id} variants={itemVariants}>
            <MatchCard match={match} />
          </motion.div>
        ))}
      </motion.main>

      {/* 4. FOOTER */}
      <motion.footer variants={itemVariants} className="mt-20 mb-8 flex justify-between items-center max-w-[1600px] mx-auto px-8">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">PAGE 1 OF 5</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 hover:bg-white/10 transition-all active:scale-95">Previous</button>
          <div className="flex gap-1 items-center px-1">
            {[1, 2, 3].map((num) => (
              <span key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${num === 1 ? 'bg-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}>{num}</span>
            ))}
          </div>
          <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 hover:bg-white/10 transition-all active:scale-95">Next</button>
        </div>
      </motion.footer>

      {/* 5. FLOATING ACTION BUTTON */}
      <div className="fixed bottom-10 right-10 z-[100]">
		<Popover onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger asChild>
          {/* Circular Button with Glow & Border */}
          <button className="relative group w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center transition-all hover:scale-110 active:scale-95">
            {/* The Border Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-[#C5A059] p-[1.5px] transition-all group-hover:blur-sm">
              <div className="h-full w-full rounded-full bg-[#0A0A0A]" />
            </div>
            
            {/* Rotating Plus Icon */}
            <motion.div 
              animate={{ rotate: isOpen ? 45 : 0 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Plus className="w-6 h-6 text-white relative z-10" />
            </motion.div>
          </button>
        </PopoverTrigger>

        {/* Popover Content (Displaying to the Left) */}
        <PopoverContent 
          side="left" 
          align="end" 
          sideOffset={20} 
          className="w-56 bg-[#111] border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-xl z-[101]"
        >
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-xs text-zinc-300">
              <Calendar className="w-4 h-4 text-[#C5A059]" /> Schedule Match
            </button>
            <div className="h-px bg-white/5 mx-2" />
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-xs text-zinc-300">
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
