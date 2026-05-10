"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark]   = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full border transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
      style={{
        backgroundColor: "var(--surface-card)",
        borderColor: "var(--border-default)",
        color: "var(--text-secondary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={18}
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
            color: "var(--accent-gold)",
          }}
        />
        <Moon
          size={18}
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: !isDark ? 1 : 0,
            transform: !isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
            color: "var(--accent-maroon)",
          }}
        />
      </div>
    </Button>
  );
}