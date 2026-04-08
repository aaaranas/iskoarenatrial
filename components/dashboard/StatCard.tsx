// src/components/dashboard/StatCard.tsx
import React from "react";

export const StatCard = ({ label, value, icon, variant = "default" }: any) => {
  const styles = {
    live: {
      container: "bg-primary/30 text-red-500 shadow-primary/20",
      iconFill: "'FILL' 1",
    },
    secondary: {
      container: "bg-secondary/20 text-secondary shadow-secondary/10",
      iconFill: "'FILL' 0",
    },
    default: {
      container: "bg-white/10 text-on-surface-variant shadow-none",
      iconFill: "'FILL' 0",
    }
  };

  const currentStyle = styles[variant as keyof typeof styles] || styles.default;

  return (
    <div className="bg-black/30 glass-panel p-6 rounded-xl flex items-center gap-5 group transition-all duration-300 hover:bg-black/50 hover:translate-y-[-4px]">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${currentStyle.container}`}>
        <span 
          className="material-symbols-outlined" 
          style={{ fontVariationSettings: currentStyle.iconFill }}
        >
          {icon}
        </span>
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
};