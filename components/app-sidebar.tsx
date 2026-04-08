"use client"

import * as React from "react"
import Image from 'next/image'
import { LogOut, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MatIcon } from "@/components/ui/MatIcon"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onLogout: () => void;
  adminName: string;
}

const navMain = [
  { label: "Dashboard",    url: "/dashboard",              matIcon: "dashboard" },
  { label: "Matches",      url: "/dashboard/matches",      matIcon: "sports_esports" },
  { label: "Leaderboards", url: "/dashboard/leaderboards", matIcon: "leaderboard" },
]

const manageItems = [
  { label: "Media",         url: "/dashboard/media",         matIcon: "perm_media" },
  { label: "Teams",         url: "/dashboard/teams",         matIcon: "groups" },
  { label: "Notifications", url: "/dashboard/notifications", matIcon: "notifications" },
  { label: "Archives",      url: "/dashboard/archives",      matIcon: "archive" },
]

const groupLabelStyle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,0.35)",
  fontWeight: 700,
  textTransform: "uppercase",
}

const navLabelStyle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 700,
  letterSpacing: "0.025em",
  textTransform: "uppercase",
}

export function AppSidebar({ onLogout, adminName, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="border-r"
      style={{
        background: "rgba(0, 0, 0, 0.40)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* ── Brand Header ── */}
      <SidebarHeader
        className="flex items-center border-b"
        style={{
          height: "64px",
          padding: "0 1rem",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default gap-3">
              {/* White rounded-square logo */}
              <div
                className="flex shrink-0 items-center justify-center rounded-sm overflow-hidden"
                style={{
                  width: 36,
                  height: 36,
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(255,255,255,0.15)",
                }}
              >
                <Image src="/logo.png" width={32} height={32} alt="IskoArena logo" />
              </div>

              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span
                  className="truncate text-white"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                  }}
                >
                  IskoArena
                </span>
                <span
                  className="truncate text-secondary"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin Console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav Content ── */}
      <SidebarContent className="gap-0 py-6">

        {/* Overview */}
        <SidebarGroup className="px-3 mb-6">
          <SidebarGroupLabel
            className="mb-3 px-2 group-data-[collapsible=icon]:hidden"
            style={groupLabelStyle}
          >
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navMain.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={cn(
                        "rounded-lg transition-colors duration-150",
                        isActive
                          ? "text-white"
                          : "text-on-surface-variant hover:text-white hover:bg-white/5"
                      )}
                      style={{
                        padding: "10px 12px",
                        borderLeft: isActive ? "4px solid #800000" : "4px solid transparent",
                        background: isActive ? "rgba(128, 0, 0, 0.20)" : "transparent",
                      }}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <MatIcon
                          icon={item.matIcon}
                          className={cn("shrink-0", isActive ? "text-secondary" : "text-on-surface-variant")}
                        />
                        <span style={{ ...navLabelStyle, color: isActive ? "#ffffff" : "inherit" }}>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel
            className="mb-3 px-2 group-data-[collapsible=icon]:hidden"
            style={groupLabelStyle}
          >
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {manageItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={cn(
                        "rounded-lg transition-colors duration-150",
                        isActive
                          ? "text-white"
                          : "text-on-surface-variant hover:text-white hover:bg-white/5"
                      )}
                      style={{
                        padding: "10px 12px",
                        borderLeft: isActive ? "4px solid #800000" : "4px solid transparent",
                        background: isActive ? "rgba(128, 0, 0, 0.20)" : "transparent",
                      }}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <MatIcon
                          icon={item.matIcon}
                          className={cn("shrink-0 text-[20px]", isActive ? "text-secondary" : "text-on-surface-variant")}
                        />
                        <span style={{ ...navLabelStyle, color: isActive ? "#ffffff" : "inherit" }}>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter
        className="border-t"
        style={{
          borderColor: "rgba(255, 255, 255, 0.10)",
          padding: "12px 8px 8px",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-white/5 group-data-[collapsible=icon]:justify-center rounded-xl transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "8px",
              }}
              onClick={onLogout}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-xl border"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <User className="text-on-surface-variant" style={{ width: 18, height: 18 }} />
              </div>

              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span
                  className="truncate text-white"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.025em",
                  }}
                >
                  {adminName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="rounded-full bg-emerald-500 animate-pulse"
                    style={{ width: 8, height: 8, display: "inline-block" }}
                  />
                  <span
                    className="text-secondary"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>

              <LogOut
                className="ml-auto text-on-surface-variant hover:text-red-400 transition-colors group-data-[collapsible=icon]:hidden"
                style={{ width: 20, height: 20 }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}