"use client"
import * as React from "react"
import Image from 'next/image';
import {
  LayoutDashboard,
  BarChart3,
  Image as ImageIcon,
  Users,
  Sword,
  Archive,
  LogOut,
  User,
} from "lucide-react"
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
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
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

export function AppSidebar({ onLogout, adminName, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="bg-background border-r border-border/50">
      {/* Brand Header */}
      <SidebarHeader className="h-14 bg-background flex items-center justify-center border-b border-border/50 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
              <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-[10px] uppercase shadow-sm transition-all group-data-[collapsible=icon]:size-8">
                <Image
                  src="/logo.png"
                  width={500}
                  height={500}
                  alt="IskoArena logo"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold tracking-tight">IskoArena</span>
                <span className="truncate text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">Admin Console</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-background">
        {/* Overview Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={pathname === item.url}
                    className={cn(
                      "transition-all hover:bg-zinc-900",
                      pathname === item.url && "bg-zinc-900 text-[#C5A059] font-bold"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className={cn(
                        "w-4 h-4",
                        pathname === item.url ? "text-[#C5A059]" : "text-zinc-500"
                      )} />
                      <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={pathname === item.url}
                    className={cn(
                      "transition-all hover:bg-zinc-900",
                      pathname === item.url && "bg-zinc-900 text-[#C5A059] font-bold"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className={cn(
                        "w-4 h-4",
                        pathname === item.url ? "text-[#C5A059]" : "text-zinc-500"
                      )} />
                      <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-border/50 p-2 bg-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-accent/50 group-data-[collapsible=icon]:justify-center px-2"
              onClick={onLogout}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted border border-border">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-xs tracking-tight">{adminName}</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active</span>
                </div>
              </div>
              <LogOut className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}