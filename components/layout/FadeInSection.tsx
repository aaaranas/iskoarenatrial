// components/fade-in-section.tsx
"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export default function FadeInSection({ children, delay = 0 }: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // once: true = animates once | amount: 0.1 = trigger when 10% is visible
  // margin fires only when scrolling INTO view from below
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
      animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
      transition={{
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
