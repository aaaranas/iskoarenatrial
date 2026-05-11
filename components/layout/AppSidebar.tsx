"use client"
import * as React from "react"
import Image from 'next/image';
import {
  LayoutDashboard, BarChart3, Image as ImageIcon,
  Users, Sword, User, Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  onLogout: () => void;
  adminName: string;
}

const allNavItems = [
  { label: "Dashboard",    icon: LayoutDashboard, url: "/dashboard" },
  { label: "Matches",      icon: Sword,           url: "/dashboard/matches" },
  { label: "Leaderboards", icon: BarChart3,       url: "/dashboard/leaderboards" },
  { label: "Media",        icon: ImageIcon,       url: "/dashboard/media" },
  { label: "Teams",        icon: Users,           url: "/dashboard/teams" },
];

const manageItems = [
  { label: "Media",    icon: ImageIcon, url: "/dashboard/media"    },
  { label: "Teams",    icon: Users,     url: "/dashboard/teams"    },
];

// const allNavItems = [...navMain, ...manageItems];

export function AppSidebar({ onLogout, adminName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-[#121212] z-50 flex items-center px-7">
      {/* Logo Area */}
      <div className="flex items-center gap-4 pr-6">
        {/* Added border and background to logo for better visibility */}
        <div className="p-1.5 rounded-full border border-white/10 bg-white/5 shadow-sm">
          <Image src="/logo.png" width={32} height={32} alt="Logo" className="rounded-full" />
        </div>
        <h1 className="text-xl font-bold tracking-wide text-white">IskoArena</h1>
      </div>

      {/* Navigation - Flex Row */}
      <nav className="flex-1 flex items-center justify-center gap-8 px-4">
        {allNavItems.map((item) => (
          <Link 
            key={item.label}
            href={item.url}
            className={cn(
              "transition-colors text-xs font-semibold uppercase tracking-wider py-1.5",
              pathname === item.url 
                ? "text-[#FF3300]" 
                : "text-zinc-400 hover:text-white" 
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Area (Right Section) */}
      <div className="flex items-center gap-6 pl-4 border-l border-zinc-800/50 h-8">
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Bell className="size-4.5" />
        </button>
        <div className="flex size-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-600 shadow-inner">
          <User className="size-4 text-zinc-300" />
        </div>
        <button 
          onClick={onLogout} 
          className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          Log out
        </button>
      </div>
    </header>
  )
}