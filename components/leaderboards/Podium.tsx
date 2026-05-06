"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";

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
  sport?: string;
  category?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// ✅ Fixed options
const SPORT_OPTIONS = ["all", "basketball", "volleyball", "football"];
const CATEGORY_OPTIONS = ["all", "men's", "women's", "singles", "doubles"];

const PodiumBlock = ({
  height,
  targetValue,
}: {
  height: string;
  targetValue: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, targetValue, {
        duration: 2,
        ease: EASE,
        delay: 0.2,
      });
      return () => controls.stop();
    }
  }, [isInView, targetValue, count]);

  return (
    <motion.div
      ref={ref}
      initial={{ height: 0, opacity: 0 }}
      whileInView={{ height, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2, ease: EASE, delay: 0.2 }}
      className="relative w-[180px] lg:w-[240px] mt-[50px]
      text-white text-center font-semibold
      bg-gradient-to-b from-[#17191d] to-[#0a0a0a]
      border border-white/5 p-5 overflow-visible flex flex-col items-center justify-start"
    >
      <motion.div className="text-3xl font-black italic text-[#C5A059] mt-2 tracking-tighter">
        <motion.span>{rounded}</motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute w-full h-[20px] left-0 -top-[20px]
        bg-[#1f242d] border-t border-white/10"
        style={{
          transform: "perspective(100px) rotateX(25deg)",
          transformOrigin: "bottom center",
        }}
      />
    </motion.div>
  );
};

export const Podium = ({ performers }: { performers: Performer[] }) => {
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // ✅ Normalize data (prevents undefined crashes)
  const normalizedPerformers = useMemo(() => {
    return performers.map((p) => ({
      ...p,
      sport: p.sport?.toLowerCase() || "unknown",
      category: p.category?.toLowerCase() || "unknown",
    }));
  }, [performers]);

  const placeholder = (rank: number): Performer => ({
    id: `empty-${rank}`,
    name: "AWAITING...",
    prize: "---",
    rank,
    value: 0,
    sport: "unknown",
    category: "unknown",
  });

  // ✅ Filtering
  const filteredPerformers = useMemo(() => {
    return normalizedPerformers.filter((p) => {
      const sportMatch =
        selectedSport === "all" || p.sport === selectedSport;

      const categoryMatch =
        selectedCategory === "all" || p.category === selectedCategory;

      return sportMatch && categoryMatch;
    });
  }, [normalizedPerformers, selectedSport, selectedCategory]);

  // ✅ Sort by rank
  const sorted = [...filteredPerformers].sort((a, b) => a.rank - b.rank);

  const center = sorted.find((p) => p.rank === 1) || placeholder(1);
  const left = sorted.find((p) => p.rank === 2) || placeholder(2);
  const right = sorted.find((p) => p.rank === 3) || placeholder(3);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 🔥 Filters */}
      <div className="flex gap-4">
        {/* Sport */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Sport</span>
          <Select
            value={selectedSport}
            onValueChange={(value) => {
              setSelectedSport(value);
              setSelectedCategory("all"); // reset category
            }}
          >
            <SelectTrigger className="w-[180px] bg-[#0a0a0a] text-white border-white/10">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Category</span>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px] bg-[#0a0a0a] text-white border-white/10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🏆 Podium */}
      <div className="flex items-end justify-center gap-4 lg:gap-10">
        {/* Rank 2 */}
        <div className="flex flex-col items-center flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
          >
            <LeaderboardSideUserCardSection
              name={left.name}
              prize={left.prize}
            />
          </motion.div>
          <PodiumBlock height="150px" targetValue={left.value} />
        </div>

        {/* Rank 1 */}
        <div className="flex flex-col items-center flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            viewport={{ once: true }}
          >
            <LeaderboardToggleSection
              name={center.name}
              prize={center.prize}
            />
          </motion.div>
          <PodiumBlock height="220px" targetValue={center.value} />
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            viewport={{ once: true }}
          >
            <LeaderboardSideUserCardSection
              name={right.name}
              prize={right.prize}
            />
          </motion.div>
          <PodiumBlock height="110px" targetValue={right.value} />
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
