"use client";
import Image from "next/image";
import { User, LogOut, Menu, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Bell with unread badge + dropdown panel, fed by NotificationProvider in layout.tsx
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onLogout: () => void;
  avatarUrl?: string | null;
  displayName?: string;
}

type NavChild = { label: string; url: string };
type NavItem =
  | { label: string; url: string; children?: undefined }
  | { label: string; url?: undefined; children: NavChild[] };

const allNavItems: NavItem[] = [
  { label: "Dashboard",    url: "/dashboard" },
  { label: "Matches",      url: "/dashboard/matches" },
  { label: "Leaderboards", url: "/dashboard/leaderboards" },
  { label: "Media",        url: "/dashboard/media" },
  {
    label: "Teams",
    children: [
      { label: "Colleges", url: "/dashboard/teams" },
      { label: "Players",  url: "/dashboard/players" },
    ],
  },
];

function AvatarBubble({ avatarUrl, displayName }: { avatarUrl?: string | null; displayName?: string }) {
  const initials = (displayName ?? "")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href="/dashboard/profile"
      className="flex size-8 items-center justify-center rounded-full border overflow-hidden shadow-inner hover:ring-2 hover:ring-[var(--topbar-active)]/40 transition-all"
      style={{ backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-strong)" }}
      title="My Profile"
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={displayName ?? "Profile"} className="w-full h-full object-cover" />
      ) : initials ? (
        <span className="text-[10px] font-bold" style={{ color: "var(--text)" }}>{initials}</span>
      ) : (
        <User className="size-4" style={{ color: "var(--text)" }} />
      )}
    </Link>
  );
}

export function TopBar({ onLogout, avatarUrl, displayName }: TopBarProps) {
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
          if (item.children) {
            const active = item.children.some((c) => pathname === c.url);
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 transition-colors text-xs font-semibold uppercase tracking-wider py-1.5 whitespace-nowrap outline-none"
                  style={{
                    color: active
                      ? "var(--topbar-active)"
                      : "hsl(var(--topbar-text))",
                  }}
                >
                  {item.label}
                  <ChevronDown className="size-3 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.label} asChild>
                      <Link href={child.url}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

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
        {/* Live notification bell — shares state with mobile bell via NotificationProvider */}
        <NotificationBell />

        <AvatarBubble avatarUrl={avatarUrl} displayName={displayName} />

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
        {/* Same bell component as desktop — both read from the shared provider */}
        <NotificationBell />

        <AvatarBubble avatarUrl={avatarUrl} displayName={displayName} />

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
            {/* Top spacer + label — pushes nav items below the auto-positioned
                SheetClose X button (absolute right-4 top-4) so it stops
                overlapping the first nav item's ChevronRight. */}
            <div
              className="flex items-center px-6 py-3 border-b"
              style={{ borderColor: "hsl(var(--topbar-border))" }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "hsl(var(--topbar-text))" }}
              >
                Menu
              </span>
            </div>
            <nav className="flex flex-col py-2">
              {allNavItems.map((item) => {
                if (item.children) {
                  const active = item.children.some((c) => pathname === c.url);
                  return (
                    <div key={item.label}>
                      {/* Section header — not a link */}
                      <div
                        className="flex items-center px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border-l-2"
                        style={{
                          color: active
                            ? "var(--topbar-active)"
                            : "hsl(var(--topbar-text))",
                          borderLeftColor: active
                            ? "var(--topbar-active)"
                            : "transparent",
                          opacity: active ? 1 : 0.5,
                        }}
                      >
                        {item.label}
                      </div>
                      {/* Sub-items */}
                      {item.children.map((child) => {
                        const childActive = pathname === child.url;
                        return (
                          <SheetClose asChild key={child.label}>
                            <Link
                              href={child.url}
                              className={cn(
                                "flex items-center justify-between pl-10 pr-6 py-3 text-sm font-semibold uppercase tracking-widest transition-colors border-l-2",
                                childActive ? "border-l-2" : "border-transparent"
                              )}
                              style={{
                                color: childActive
                                  ? "var(--topbar-active)"
                                  : "hsl(var(--topbar-text))",
                                borderLeftColor: childActive
                                  ? "var(--topbar-active)"
                                  : "transparent",
                                backgroundColor: childActive
                                  ? "var(--border-ghost)"
                                  : "transparent",
                              }}
                            >
                              {child.label}
                              <ChevronRight
                                className="size-3.5"
                                style={{
                                  color: childActive
                                    ? "var(--topbar-active)"
                                    : "var(--text)",
                                }}
                              />
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  );
                }

                const active = pathname === item.url;
                return (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center justify-between px-6 py-3.5 text-sm font-semibold uppercase tracking-widest transition-colors border-l-2",
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