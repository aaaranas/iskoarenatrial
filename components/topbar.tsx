"use client";
import Image from "next/image";
import { User, Bell, LogOut, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface TopBarProps {
  onLogout: () => void;
}

const allNavItems = [
  { label: "Dashboard",    url: "/dashboard" },
  { label: "Matches",      url: "/dashboard/matches" },
  { label: "Leaderboards", url: "/dashboard/leaderboards" },
  { label: "Media",        url: "/dashboard/media" },
  { label: "Teams",        url: "/dashboard/teams" },
];

export function TopBar({ onLogout }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-5 md:px-7 border-b transition-colors duration-300"
      style={{
        backgroundColor: "hsl(var(--topbar-bg))",
        borderColor: "hsl(var(--topbar-border))",
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-4 pr-4 md:pr-6 shrink-0">
        <div
          className="p-1.5 rounded-full shadow-sm border"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--border-ghost)",
          }}
        >
          <Image
            src="/logo.png"
            width={32}
            height={32}
            alt="IskoArena Logo"
            className="rounded-full"
          />
        </div>
        <h1
          className="hidden md:block text-xl font-bold tracking-wide font-heading"
          style={{ color: "var(--text)" }}
        >
          IskoArena
        </h1>
      </div>

      {/* ── Desktop + Tablet nav (md+) ── */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 px-4">
        {allNavItems.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.label}
              href={item.url}
              className="transition-colors text-xs font-semibold uppercase tracking-wider py-1.5 whitespace-nowrap"
              style={{
                color: active
                  ? "var(--topbar-active)"
                  : "hsl(var(--topbar-text))",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Right: Desktop + Tablet (md+) ── */}
      <div
        className="hidden md:flex items-center gap-4 lg:gap-6 pl-4 h-8 shrink-0 border-l"
        style={{ borderColor: "hsl(var(--topbar-border))" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-0 hover:bg-transparent"
          style={{ color: "hsl(var(--topbar-text))" }}
        >
          <Bell className="size-4" />
        </Button>

        <div
          className="flex size-8 items-center justify-center rounded-full border shadow-inner"
          style={{
            backgroundColor: "var(--surface-sunken)",
            borderColor: "var(--border-strong)",
          }}
        >
          <User className="size-4" style={{ color: "var(--text)" }} />
        </div>

        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-xs font-semibold uppercase tracking-wider h-auto p-0 hover:bg-transparent"
          style={{ color: "hsl(var(--topbar-text))" }}
        >
          Log out
        </Button>
      </div>

      {/* ── Right: Mobile only ── */}
      <div className="flex md:hidden flex-1 justify-end items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-0 hover:bg-transparent"
          style={{ color: "hsl(var(--topbar-text))" }}
        >
          <Bell className="size-4" />
        </Button>

        <div
          className="flex size-8 items-center justify-center rounded-full border shadow-inner"
          style={{
            backgroundColor: "var(--surface-sunken)",
            borderColor: "var(--border-strong)",
          }}
        >
          <User className="size-4" style={{ color: "var(--text)" }} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          title="Log out"
          className="h-auto w-auto p-0 hover:bg-transparent"
          style={{ color: "hsl(var(--topbar-text))" }}
        >
          <LogOut className="size-4" />
        </Button>

        {/* Mobile menu — shadcn Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle navigation"
              className="h-auto w-auto p-0 hover:bg-transparent"
              style={{ color: "hsl(var(--topbar-text))" }}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="top"
            className="mt-16 border-b shadow-2xl p-0"
            style={{
              backgroundColor: "hsl(var(--topbar-bg))",
              borderColor: "hsl(var(--topbar-border))",
            }}
          >
            <nav className="flex flex-col py-2">
              {allNavItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center justify-between px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors border-l-2",
                        active ? "border-l-2" : "border-transparent"
                      )}
                      style={{
                        color: active
                          ? "var(--topbar-active)"
                          : "hsl(var(--topbar-text))",
                        borderLeftColor: active
                          ? "var(--topbar-active)"
                          : "transparent",
                        backgroundColor: active
                          ? "var(--border-ghost)"
                          : "transparent",
                      }}
                    >
                      {item.label}
                      <ChevronRight
                        className="size-3.5"
                        style={{
                          color: active
                            ? "var(--topbar-active)"
                            : "var(--text)",
                        }}
                      />
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}