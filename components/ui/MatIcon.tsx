import React from "react";
import { cn } from "@/lib/utils";

interface MatIconProps {
  icon: string;
  className?: string;
  fill?: boolean;
}

/**
 * Renders a Material Symbols Outlined icon.
 * Requires the Material Symbols font to be loaded globally.
 *
 * Usage:
 *   <MatIcon icon="dashboard" />
 *   <MatIcon icon="sensors" fill className="text-red-500 text-2xl" />
 */
export function MatIcon({ icon, className, fill = false }: MatIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {icon}
    </span>
  );
}