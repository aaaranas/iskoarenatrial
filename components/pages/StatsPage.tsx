"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Podium } from "../leaderboards/Podium";
import { LeaderboardTable } from "../leaderboards/LeaderboardTable";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, ArrowRight, Layers, Activity, Users, Shield } from "lucide-react";

// --- TYPES ---
interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number;
}

interface Player {
  rank: number;
  name: string;
  username: string;
  points: string;
}

interface Team {
  rank: number;
  name: string;
  username: string;
  points: string;
}

// --- MOCK DATA ---
const performers: Performer[] = [
  { id: "2", name: "Scions", points: "2,000 pts", prize: "100,000", rank: 1, value: 50000 },
  { id: "1", name: "Pheonix", points: "2,000 pts", prize: "50,000", rank: 2, value: 10000 },
  { id: "3", name: "Tycoons", points: "2,000 pts", prize: "20,000", rank: 3, value: 9000 },
];

const mock_players: Player[] = [
  { rank: 1, name: "Henrietta O'Connell", username: "@henrietta", points: "2,114,424" },
  { rank: 2, name: "Darrel Bins", username: "@darrel", points: "2,010,200" },
  { rank: 3, name: "Sally Kovacek", username: "@sally", points: "1,980,122" },
];

const mock_teams: Team[] = [
  { rank: 1, name: "Alpha Squad", username: "@alpha", points: "9,120,400" },
  { rank: 2, name: "Nova Guild", username: "@nova", points: "8,001,210" },
  { rank: 3, name: "Orion League", username: "@orion", points: "7,880,000" },
];

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");
  const [timeframe, setTimeframe] = useState<string>("Weekly");
  
  const { scrollY } = useScroll();
  
  // Editorial Parallax Effects
  const athleteOneY = useTransform(scrollY, [0, 1000], [0, -180]);
  const athleteTwoY = useTransform(scrollY, [0, 1000], [0, -320]);
  const ghostTextX = useTransform(scrollY, [0, 1000], [0, 120]);

  return (
    <div className="relative bg-[#050505] min-h-screen text-zinc-100 w-full overflow-x-hidden font-sans selection:bg-[#A91D3A]">
      
      {/* 1. CINEMATIC OVERLAYS */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Film Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Moving Scanline Animation */}
      </div>

      {/* 2. BACKGROUND MASK */}
      <div className="fixed top-0 right-0 w-[50%] h-screen z-0 opacity-25 grayscale brightness-[0.3]">
        <div className="absolute inset-0 bg-[url('/iskolarosocer.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 lg:px-20 pt-24">
        
        {/* 3. HERO EDITORIAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-56">
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex items-center gap-4 mb-10"
            >
              <span className="w-12 h-[1px] bg-[#A91D3A]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#A91D3A]">
                Official Standings
              </span>
            </motion.div>
            
            <h1 className="text-8xl lg:text-[11.5rem] font-black leading-[0.72] tracking-tighter uppercase italic mb-14">
              Beyond <br /> 
              <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>Limits</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
               <div className="space-y-8">
                 <p className="text-xl font-medium italic text-zinc-400 border-l-2 border-[#C5A059] pl-8 leading-relaxed">
                   "The arena only recognizes performance as its universal currency."
                 </p>
                 <p className="text-[12px]  text-zinc-500 tracking-[0.25em]">
                   Quantifying campus dominance across every bracket. 
                   An archive of collegiate legacy and individual brilliance.
                 </p>
               </div>
               
               <div className="flex flex-col justify-end">
               </div>
            </div>
          </div>

          {/* 4. DUAL ATHLETE COLLAGE */}
          <div className="lg:col-span-5 relative h-[600px] lg:h-auto">
            {/* Front Image - MVP (Gold Badge) */}
            <motion.div 
              style={{ y: athleteOneY }}
              initial={{ opacity: 0, x: 60, rotate: 0 }}
              animate={{ opacity: 1, x: 30, rotate: 8 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 right-0 w-72 lg:w-80 aspect-[3/4] bg-zinc-900 border border-white/10 p-2 shadow-2xl z-20"
            >
              <img 
                src="/iskolarofrisbee2.jpg" 
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000" 
              />
              <div className="absolute -bottom-6 -left-8 bg-[#C5A059] text-black px-5 py-3 text-[10px] font-black uppercase italic tracking-widest shadow-2xl">
		FEATURED ATHLETES / ISKOLARO 2026
              </div>
            </motion.div>

            {/* Background Image - Rising Star (Maroon Badge) - Tilted more to left */}
            <motion.div 
              style={{ y: athleteTwoY }}
              initial={{ opacity: 0, x: 120, rotate: 0 }}
              animate={{ opacity: 1, x: -100, rotate: -10 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="absolute top-48 right-44 w-56 lg:w-64 aspect-[3/4] bg-zinc-950 border border-white/5 p-2 shadow-2xl z-10"
            >
              <img 
                src="iskolarovolley.jpg" 
                className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-1000" 
              />
              <div className="absolute -top-6 -right-8 bg-[#A91D3A] text-white px-5 py-3 text-[10px] font-black uppercase italic tracking-widest shadow-2xl">
                CHALLENGER / VOL 03
              </div>
            </motion.div>
          </div>
        </div>

        {/* 5. EDITORIAL TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-12 border-y border-white/5 mb-40 sticky top-0 bg-[#050505]/95 backdrop-blur-2xl z-30">
           <div className="flex items-center gap-16">
              <div className="group cursor-pointer">
                 <span className="text-xs font-black text-[#C5A059] tracking-[0.5em] uppercase block mb-1">01. Podium</span>
                 <div className="h-[1px] w-full bg-[#C5A059]/30 group-hover:bg-[#A91D3A] transition-all duration-500" />
              </div>
              <div className="group cursor-pointer">
                 <span className="text-xs font-black text-zinc-700 tracking-[0.5em] uppercase block mb-1 group-hover:text-zinc-500 transition-colors">02. Registry</span>
                 <div className="h-[1px] w-full bg-zinc-900 group-hover:bg-zinc-700 transition-all duration-500" />
              </div>
           </div>

           <div className="flex items-center gap-12">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white outline-none transition-all">
                  <Layers className="w-4 h-4 text-[#A91D3A]" /> TIMEFRAME: {timeframe}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black border border-white/10 text-white rounded-none p-0">
                  {["Weekly", "Monthly", "Season"].map(t => (
                    <DropdownMenuItem key={t} onClick={() => setTimeframe(t)} className="p-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#A91D3A] cursor-pointer">
                      {t}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative group">
                 <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800 group-hover:text-[#C5A059] transition-all" />
                 <input 
                    type="text" 
                    placeholder="QUERY LEDGER..." 
                    className="bg-transparent border-none pl-10 text-xs font-black tracking-widest uppercase focus:outline-none w-48 focus:w-72 border-b border-transparent focus:border-[#A91D3A] transition-all duration-700" 
                 />
              </div>
           </div>
        </div>

        {/* 6. DATA SECTIONS */}
        <div className="space-y-72 pb-72">
          
          {/* SECTION 01: PODIUM (Top Performers) */}
          <section className="relative">
            <motion.div style={{ x: ghostTextX }} className="absolute -top-32 left-0 text-[18rem] font-black text-white/[0.012] select-none pointer-events-none uppercase italic">
               Summit
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end">
               <div className="lg:col-span-3 pb-16">
                  <h3 className="text-7xl font-black uppercase italic tracking-tighter leading-[0.85] mb-10">Elite <br /> Tier</h3>
                  <div className="space-y-6">
                     <p className="text-[12px]  tracking-[0.25em] text-zinc-600 ">
                        Historical quantification of peak performance within the current seasonal cycle.
                     </p>
                     <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] group">
                       Methodology <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-500" />
                     </button>
                  </div>
               </div>
               
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, amount: 0.3 }}
                 variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                 }}
                 className="lg:col-span-9 bg-[#080808] border border-white/5 p-12 relative shadow-2xl"
               >
                  <Podium performers={performers} />
               </motion.div>
            </div>
          </section>

          {/* SECTION 02: REGISTRY (Toggle Table) */}
          <section>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
               <div className="flex gap-12">
                  <h3 className="text-9xl font-black uppercase italic tracking-tighter">Registry</h3>
               </div>

               <div className="flex bg-[#0A0A0A] p-1.5 border border-white/5 shadow-inner">
                  <button 
                    onClick={() => setViewMode("players")} 
                    className={`px-14 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === "players" ? "bg-[#A91D3A] text-white" : "text-zinc-600 hover:text-white"}`}
                  >
                    Players
                  </button>
                  <button 
                    onClick={() => setViewMode("teams")} 
                    className={`px-14 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === "teams" ? "bg-[#A91D3A] text-white" : "text-zinc-600 hover:text-white"}`}
                  >
                    Teams
                  </button>
               </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={viewMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl overflow-hidden"
              >
                <LeaderboardTable 
                  players={viewMode === "players" ? mock_players : []} 
                  teams={viewMode === "teams" ? mock_teams : []} 
                />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
