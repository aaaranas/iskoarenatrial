"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { LeaderboardSideUserCardSection } from "./LeaderboardSideUserCard";
import { LeaderboardToggleSection } from "./LeaderboardToggle";

interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number;
}

// 1. Bar Growth Variants
const blockVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: (height: string) => ({
    height: height,
    opacity: 1,
    transition: { 
      duration: 2, // Slow, cinematic growth
      ease: [0.16, 1, 0.3, 1], // Custom "Out-Expo" curve
      delay: 0.2 
    }
  })
};

const PodiumBlock = ({ height, targetValue }: { height: string; targetValue: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  // 2. Counter Animation Setup
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (isInView) {
      // Sync duration (2s) with the blockVariants duration
      const controls = animate(count, targetValue, { 
        duration: 2, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2 
      });
      return () => controls.stop();
    }
  }, [isInView, targetValue, count]);

  return (
    <motion.div
      ref={ref}
      custom={height}
      variants={blockVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative w-[180px] lg:w-[240px] mt-[50px]
      text-white text-center font-semibold
      bg-gradient-to-b from-[#17191d] to-[#0a0a0a]
      border border-white/5 p-5 overflow-visible flex flex-col items-center justify-start"
    >
      {/* THE NUMBER: Grows with the bar */}
      <motion.div className="text-3xl font-black italic text-[#C5A059] mt-2 tracking-tighter">
        <motion.span>{rounded}</motion.span>
      </motion.div>

      {/* 3D Top Trapezoid */}
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
  const sorted = [...performers].sort((a, b) => a.rank - b.rank);
  const left = sorted[1];
  const center = sorted[0];
  const right = sorted[2];

  return (
    <div className="flex items-end justify-center gap-4 lg:gap-10">
      {/* Rank 2 (Left) */}
      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
        >
           <LeaderboardSideUserCardSection name={left.name} prize={left.prize} />
        </motion.div>
        <PodiumBlock height="150px" targetValue={left.value} />
      </div>

      {/* Rank 1 (Center) */}
      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1 }}
          viewport={{ once: true }}
        >
           <LeaderboardToggleSection name={center.name} prize={center.prize} />
        </motion.div>
        <PodiumBlock height="220px" targetValue={center.value} />
      </div>

      {/* Rank 3 (Right) */}
      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1.2 }}
          viewport={{ once: true }}
        >
           <LeaderboardSideUserCardSection name={right.name} prize={right.prize} />
        </motion.div>
        <PodiumBlock height="110px" targetValue={right.value} />
      </div>
    </div>
  );
};
