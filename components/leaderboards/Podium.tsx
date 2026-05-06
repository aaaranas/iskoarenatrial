"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { LeaderboardSideUserCardSection } from "./LeaderboardSideUserCard";
import { LeaderboardToggleSection } from "./LeaderboardToggle";

// ✅ shadcn select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number;
  sport: string;
  category: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const PodiumBlock = ({ height, targetValue, performerId }: { height: string; targetValue: number; performerId: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      count.set(0);
      const controls = animate(count, targetValue, { duration: 1.5, ease: EASE });
      return () => controls.stop();
    }
  }, [isInView, targetValue, performerId]);

  return (
    <motion.div
      ref={ref}
      // Layout handles the smooth physical transition, key forces a remount for growth
      layout
      key={`${performerId}-${targetValue}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      transition={{ duration: 1.2, ease: EASE }}
      className="relative w-[180px] lg:w-[240px] mt-[50px] text-white text-center font-semibold bg-gradient-to-b from-[#17191d] to-[#0a0a0a] border border-white/5 p-5 flex flex-col items-center justify-start [overflow:visible]"
    >
      <motion.div className="text-3xl font-black italic text-[#C5A059] mt-2 tracking-tighter">
        <motion.span>{rounded}</motion.span>
      </motion.div>

      {/* 3D Top Cap */}
      <div 
        className="absolute w-full h-[20px] left-0 -top-[20px] bg-[#1f242d] border-t border-white/10"
        style={{
          transform: "perspective(100px) rotateX(25deg)",
          transformOrigin: "bottom center",
        }}
      />
    </motion.div>
  );
};

export const Podium = ({ performers }: { performers: Performer[] }) => {
  const [sport, setSport] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return performers.filter((p) => {
      const matchSport = sport === "all" || p.sport === sport;
      const matchCat = category === "all" || p.category === category;
      return matchSport && matchCat;
    });
  }, [performers, sport, category]);

  const placeholder = (rank: number): Performer => ({
    id: `empty-${rank}-${sport}-${category}`,
    name: "---",
    prize: "---",
    rank,
    value: 0,
    sport,
    category
  });

  const getPerformer = (rank: number) => filtered.find(p => p.rank === rank) || placeholder(rank);

  const left = getPerformer(2);
  const center = getPerformer(1);
  const right = getPerformer(3);

  return (
    <div className="w-full py-10">
      {/* Dropdowns */}
      <div className="flex justify-center gap-4 mb-12">
        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger className="w-[180px] bg-[#17191d] border-white/10 text-white"><SelectValue placeholder="All Sports" /></SelectTrigger>
          <SelectContent className="bg-[#17191d] border-white/10 text-white">
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
            <SelectItem value="volleyball">Volleyball</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] bg-[#17191d] border-white/10 text-white"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent className="bg-[#17191d] border-white/10 text-white">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="mens">Men's</SelectItem>
            <SelectItem value="womens">Women's</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Podium Grid */}
      <div className="flex items-end justify-center gap-2 lg:gap-10">
        <div className="flex flex-col items-center flex-1">
          <LeaderboardSideUserCardSection name={left.name} prize={left.prize} />
          <PodiumBlock performerId={left.id} height="150px" targetValue={left.value} />
        </div>
        <div className="flex flex-col items-center flex-1">
          <LeaderboardToggleSection name={center.name} prize={center.prize} />
          <PodiumBlock performerId={center.id} height="220px" targetValue={center.value} />
        </div>
        <div className="flex flex-col items-center flex-1">
          <LeaderboardSideUserCardSection name={right.name} prize={right.prize} />
          <PodiumBlock performerId={right.id} height="110px" targetValue={right.value} />
        </div>
      </div>

      {/* Empty state */}
      {filteredPerformers.length === 0 && (
        <div className="text-white/50 text-sm">
          No performers found for selected filters.
        </div>
      )}
    </div>
  );
};
