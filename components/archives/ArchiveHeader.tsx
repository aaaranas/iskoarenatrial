"use client";

import { motion } from "framer-motion";

// Ensure itemVariants is defined or imported
const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const ArchiveHeader = () => {
  return (
    <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 px-8 py-6">
      {/* STICKY PREMIUM HEADER */}
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <h1 className="text-5xl font-black flex items-center gap-6 italic tracking-tight text-white">
          {/* Increased height to 12 (48px) and width to 2 (8px) */}
          <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" />
          ARCHIVES
        </h1>
      </div>
    </header>
  );
};
