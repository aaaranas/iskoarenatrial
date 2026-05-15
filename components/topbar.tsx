"use client";
import Image from "next/image";
import { User, Bell, LogOut, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

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

// ── Avatar bubble — shown in place of the static User icon ───────────────────
// Fetches the current user's avatar_url and full_name from the profile router.
// Falls back to initials when no avatar is set, and to the <User> icon while
// the query is still loading. Re-renders automatically when the profile page
// calls utils.profile.getProfile.invalidate() after a successful avatar save.
function AvatarBubble() {
  const { data: profile, isLoading } = trpc.profile.getProfile.useQuery(
    undefined,
    {
      // Don't block the TopBar render — show the icon fallback while fetching
      staleTime: 30_000,
    }
  );

  const name      = profile?.full_name ?? "";
  const avatarUrl = profile?.avatar_url ?? null;
  const monogram  = name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || null;

  return (
    <Link
      href="/dashboard/profile"
      title="My Profile"
      className="relative flex size-8 items-center justify-center rounded-full border shadow-inner transition-colors overflow-hidden hover:border-[var(--accent-maroon)]"
      style={{
        backgroundColor: "var(--surface-sunken)",
        borderColor: "var(--border-strong)",
      }}
    >
      {isLoading ? (
        // Neutral icon while loading — avoids layout shift
        <User className="size-4" style={{ color: "var(--text)" }} />
      ) : avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name || "Profile"}
          fill
          className="object-cover"
          // sizes keeps Next.js from generating oversized srcsets for a 32px bubble
          sizes="32px"
        />
      ) : monogram ? (
        <span className="text-[10px] font-bold select-none" style={{ color: "var(--text)" }}>
          {monogram}
        </span>
      ) : (
        <User className="size-4" style={{ color: "var(--text)" }} />
      )}
    </Link>
  );
}

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

        {/* Avatar bubble — shows profile photo or initials */}
        <AvatarBubble />

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

        {/* Avatar bubble — mobile */}
        <AvatarBubble />

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