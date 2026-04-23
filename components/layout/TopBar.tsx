"use client";
import React, { useState } from "react";
import type { PageName } from "@/types";
import {
  Search, Settings, LayoutDashboard, Trophy,
  BarChart2, Users, Film, ChevronDown, User, Briefcase, LogOut,
} from "lucide-react";

interface TopBarProps {
  currentPage: PageName;
  adminName: string;
  adminEmail?: string;
}

const titleMap: Record<string, string> = {
  dashboard: "Dashboard Overview",
  matches:   "Match Management",
  stats:     "Analytics & Statistics",
  results:   "Record Results",
  media:     "Media Library",
  teams:     "Teams & Players",
};

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "matches",   label: "Matches",   icon: Trophy           },
  { key: "stats",     label: "Analytics", icon: BarChart2         },
  { key: "teams",     label: "Teams",     icon: Users             },
  { key: "media",     label: "Media",     icon: Film              },
];

export default function TopBar({ currentPage, adminName, adminEmail = "admin@iskolaro.edu.ph" }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/60 px-7 h-16 flex items-center justify-between font-sans">
      {/* LEFT — Page title */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[#800000] text-[15px] font-semibold tracking-tight leading-none">
          {titleMap[currentPage] ?? "Iskolaro Portal"}
        </h1>
        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.18em] font-mono">
          Iskolaro Portal
        </p>
      </div>

      {/* CENTER — Nav pills */}
      <nav className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 rounded-full px-1.5 py-1">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
              currentPage === key
                ? "bg-[#800000] text-white shadow-sm"
                : "text-slate-500 hover:bg-white hover:text-slate-800"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </nav>

      {/* RIGHT — Actions + Profile */}
      <div className="flex items-center gap-2">
        {/* Icon buttons */}
        {[
          { icon: Search,   title: "Search"   },
          { icon: Settings, title: "Settings" },
        ].map(({ icon: Icon, title }) => (
          <button
            key={title}
            title={title}
            className="relative w-9 h-9 rounded-full border border-slate-200/60 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
          >
            <Icon size={15} />
          </button>
        ))}

        <div className="w-px h-7 bg-slate-200 mx-1" />

        {/* Profile chip */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200/60 hover:bg-slate-100 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#f8d7da] flex items-center justify-center text-[11px] font-bold text-[#800000] tracking-wide">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left gap-px">
              <span className="text-[13px] font-semibold text-slate-900 leading-none">{adminName}</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider font-mono">Admin Officer</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-[14px] font-semibold text-slate-900">{adminName}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{adminEmail}</p>
              </div>
              {[
                { icon: User,     label: "My Profile"        },
                { icon: Briefcase, label: "Account Settings" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-1" />
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-700 hover:bg-red-50 transition-colors">
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}