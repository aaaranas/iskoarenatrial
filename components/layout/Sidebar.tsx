"use client";

import React from "react";
import type { PageName } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Trophy,
  FileText,
  BarChart3,
  Image,
  Users,
  Archive,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  onLogout: () => void;
  adminName: string;
}

const navItems: { page: PageName; icon: React.ElementType; label: string }[] = [
  { page: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { page: "matches", icon: Trophy, label: "Manage Matches" },
  { page: "results", icon: FileText, label: "Record Results" },
  { page: "stats", icon: BarChart3, label: "Stats" },
  { page: "media", icon: Image, label: "Media Upload" },
  { page: "teams", icon: Users, label: "Teams & Players" },
];

export default function Sidebar({ currentPage, onNavigate, onLogout, adminName }: SidebarProps) {
  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col h-screen sticky top-0 shrink-0 select-none">
      
      {/* Vercel Style Header */}
      <div className="h-14 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
            <span className="text-[10px] font-bold text-background uppercase">IA</span>
          </div>
          <h2 className="text-sm font-semibold tracking-tight">
            IskoArena <span className="text-muted-foreground font-normal ml-1">Admin</span>
          </h2>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        <div>
          <p className="px-3 mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Overview
          </p>
          <nav className="space-y-1">
            {navItems.map(({ page, icon: Icon, label }) => {
              const isActive = currentPage === page;
              return (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(page)}
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2 text-xs font-medium transition-all group",
                    isActive
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{label}</span>
                  {isActive && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User & Footer Section */}
      <div className="mt-auto p-4 border-t border-border/50">
        <div className="flex flex-col gap-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/50 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
               <span className="text-xs font-medium uppercase">{adminName.charAt(0)}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {adminName}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active Session</span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50 my-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-muted-foreground hover:bg-red-50 hover:text-red-600 group h-8"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">Log out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
