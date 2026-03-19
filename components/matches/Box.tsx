"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";

interface BoxProps {
  matches: Match[];
}

export const Box = ({ matches }: BoxProps) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1, // Faster stagger for a snappy feel
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-zinc-950 min-h-screen text-zinc-100 p-8"
    >
      {/* STICKY PREMIUM HEADER */}
      <motion.header 
        variants={itemVariants}
        className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 bg-zinc-950/80 backdrop-blur-xl px-8 py-6 "
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-5xl italic font-black flex items-center gap-6 tracking-tight text-white">
            <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" /> 
            LIVE & SCHEDULED GAMES
          </h1>
          <div className="flex gap-4">
            <button className="px-3 py-2 rounded-full font-semibold bg-white/5 border border-white/10 text-xs  text-zinc-300 hover:bg-white/10 active:scale-95 transition-all">
              Schedule Match
            </button>
            <button className="px-3 py-2 rounded-full bg-gradient-to-r from-[#A91D3A] to-[#8B1528] hover:scale-105 active:scale-95 text-xs text-white shadow-lg shadow-[#A91D3A]/20 transition-all">
              + Quick Match
            </button>
          </div>
        </div>
      </motion.header>

      {/* MATCH GRID */}
      <motion.main 
        className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {matches.map((match) => (
          <motion.div key={match.id} variants={itemVariants}>
            <MatchCard match={match} />
          </motion.div>
        ))}
      </motion.main>

      {/* FOOTER */}
      <motion.footer 
        variants={itemVariants}
        className="mt-20 mb-8 flex justify-between items-center max-w-[1600px] mx-auto px-8"
      >
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          PAGE 1 OF 5
        </p>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 hover:bg-white/10 transition-all active:scale-95">
            Previous
          </button>
          
          <div className="flex gap-1 items-center px-1">
            {[1, 2, 3].map((num) => (
              <span 
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer
                  ${num === 1 ? 'bg-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
              >
                {num}
              </span>
            ))}
          </div>
          
          <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 hover:bg-white/10 transition-all active:scale-95">
            Next
          </button>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Box;
