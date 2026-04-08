import React from "react";
import { cn } from "@/lib/utils";
import { MatIcon } from "@/components/ui/MatIcon";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  iconFill?: boolean;
  iconClass?: string;
  bgClass?: string;
}

/**
 * A glassmorphic stat card for the dashboard overview grid.
 *
 * Usage:
 *   <StatCard
 *     label="Live Matches"
 *     value="04"
 *     icon="sensors"
 *     iconFill
 *     iconClass="text-red-500"
 *     bgClass="bg-primary/30 shadow-primary/20"
 *   />
 */
export function StatCard({
  label,
  value,
  icon,
  iconFill = false,
  iconClass = "text-on-surface-variant",
  bgClass = "bg-white/10",
}: StatCardProps) {
  return (
    <div className="bg-black/30 glass-panel p-6 rounded-xl flex items-center gap-5 group transition-all duration-300 hover:bg-black/50 hover:-translate-y-1">
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg flex-shrink-0",
          bgClass
        )}
      >
        <MatIcon
          icon={icon}
          fill={iconFill}
          className={cn("text-2xl", iconClass)}
        />
      </div>
      <div>
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label">
          {label}
        </p>
        <p className="text-3xl font-bold text-white uppercase font-headline">
          {value}
        </p>
      </div>
    </div>
  );
}