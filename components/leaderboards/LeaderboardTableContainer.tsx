"use client";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardTable } from "./LeaderboardTable";

export function LeaderboardTableContainer({ 
  viewMode, 
  players, 
  teams, 
  onViewChange, 
  title 
}: any) {
  return (
    <section className="flex flex-col items-center">
      {/* HEADER: This part is static and will NEVER re-render during view switch */}
      <div className="w-full max-w-5xl flex items-end justify-between mb-8">
        <h3 className="text-4xl font-black uppercase italic tracking-tighter">{title}</h3>
      </div>

      {/* GRID: Only this part animates when viewMode changes */}
      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl"
          >
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
