"use client"
import * as React from "react"
import Image from 'next/image';
import {
  LayoutDashboard, BarChart3, Image as ImageIcon,
  Users, Sword, Archive, LogOut, User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  onLogout: () => void;
  adminName: string;
}

const navMain = [
  { label: "Dashboard",    icon: LayoutDashboard, url: "/dashboard"              },
  { label: "Matches",      icon: Sword,           url: "/dashboard/matches"      },
  { label: "Leaderboards", icon: BarChart3,        url: "/dashboard/leaderboards" },
];

const manageItems = [
  { label: "Media",    icon: ImageIcon, url: "/dashboard/media"    },
  { label: "Teams",    icon: Users,     url: "/dashboard/teams"    },
  { label: "Archives", icon: Archive,   url: "/dashboard/archives" },
];

const allNavItems = [...navMain, ...manageItems];

export function AppSidebar({ onLogout, adminName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-[#050505] z-50 flex items-center px-7">
      {/* Logo Area */}
      <div className="flex items-center gap-4 pr-6">
        <Image src="/logo.png" width={40} height={40} alt="Logo" />
        <h1 className=" text-2xl ">IskoArena</h1>
      </div>

      {/* Navigation - Flex Row */}
	    <nav className="flex-1 flex items-center justify-center gap-6 px-4">
  {allNavItems.map((item) => (
    <Link 
      key={item.label}
      href={item.url}
      className={cn(
        "transition-colors text-[10px] font-bold uppercase tracking-widest py-1.5",
        pathname === item.url 
          ? "text-[#C5A059]" // Active state color
          : "text-zinc-500 hover:text-zinc-300" // Default state
      )}
    >
      {item.label}
    </Link>
  ))}
</nav>

      {/* User Area */}
      <div className="flex items-center gap-4 pl-4">
        <button className="flex items-center gap-2 cursor-pointer" onClick={onLogout}>
          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
            <User className="size-3.5 text-zinc-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-white">{adminName}</span>
            <span className="text-[9px] text-emerald-500 uppercase">Active</span>
          </div>
          <LogOut className="ml-2 size-3 text-zinc-500" />
        </button>
      </div>
    </header>
  )
}
