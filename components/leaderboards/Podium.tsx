"use client";

import React, { useEffect} from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LeaderboardSideUserCardSection } from "./LeaderboardSideUserCard";
import { LeaderboardToggleSection } from "./LeaderboardToggle";

interface Performer {
  id: string;
  name: string;
  prize: string;
  rank: number;
  value: number; // Added for the counter animation
}

// Staggered entrance for the whole podium
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.3 } 
  }
};

// Growth animation for the blocks
const getBlockVariants = (height: string) => ({
  hidden: { height: "0px" },
  visible: { 
    height: height, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
  }
});

const PodiumBlock = ({ height, targetValue }: { height: string; targetValue: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, targetValue, { 
      duration: 1.2, 
      ease: [0.22, 1, 0.36, 1] 
    });
    return () => controls.stop();
  }, [targetValue, count]);

  return (
    <motion.div
      variants={getBlockVariants(height)}
      initial="hidden"
      animate="visible"
      className={`relative w-[200px] mt-[50px]
      text-white text-center font-semibold text-xs
      bg-gradient-to-b from-[#17191d] to-[#101115]
      border border-transparent
      [border-image:linear-gradient(#1f242d,#111216)_1]
      p-5 overflow-visible flex flex-col items-center justify-start`}
    >
      <motion.span className="text-2xl font-bold text-[#C5A059] mt-2">
        <motion.span>{rounded}</motion.span>
      </motion.span>

      {/* Visible Top trapezoid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute w-full h-[20px] left-0 -top-[21px]
        bg-gradient-to-t from-[#17191d] to-[#101115]
        border-t border-[#1f242d]"
        style={{
          transform: "perspective(30px) rotateX(20deg)",
          transformOrigin: "bottom center",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)"
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-end justify-center gap-10"
    >
      {/* Rank 2 */}
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex flex-col items-center">
        <LeaderboardSideUserCardSection name={left.name} prize={left.prize} />
        <PodiumBlock height="120px" targetValue={left.value} />
      </motion.div>

      {/* Rank 1 */}
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex flex-col items-center">
        <LeaderboardToggleSection name={center.name} prize={center.prize} />
        <PodiumBlock height="160px" targetValue={center.value} />
      </motion.div>

      {/* Rank 3 */}
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex flex-col items-center">
        <LeaderboardSideUserCardSection name={right.name} prize={right.prize} />
        <PodiumBlock height="90px" targetValue={right.value} />
      </motion.div>
    </motion.div>
  );
};
