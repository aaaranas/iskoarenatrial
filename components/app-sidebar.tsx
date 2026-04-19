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
  Bell,
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
  SidebarGroupContent,
  useSidebar,
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
  { label: "Media",         icon: ImageIcon, url: "/dashboard/media"         },
  { label: "Teams",         icon: Users,     url: "/dashboard/teams"         },
  { label: "Notifications", icon: Bell,      url: "/dashboard/notifications" },
  { label: "Archives",      icon: Archive,   url: "/dashboard/archives"      },
];

// Separate component so it can call useSidebar()
function NavItem({
  item,
  isActive,
}: {
  item: { label: string; icon: React.ElementType; url: string };
  isActive: boolean;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      {isCollapsed ? (
        // Collapsed: plain centered icon button — no asChild/Slot complexity
        <SidebarMenuButton
          tooltip={item.label}
          isActive={isActive}
          className={cn(
            "flex items-center justify-center rounded-sm transition-colors w-full h-10",
            isActive
              ? "text-[#D4AF37] bg-[#800000]/20"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
          onClick={() => { window.location.href = item.url; }}
        >
          <item.icon className="!w-5 !h-5 flex-shrink-0" />
        </SidebarMenuButton>
      ) : (
        // Expanded: full link with label
        <SidebarMenuButton
          asChild
          tooltip={item.label}
          isActive={isActive}
          className={cn(
            "flex items-center gap-3 rounded-sm transition-colors h-10 px-3",
            isActive
              ? "border-l-4 border-[#800000] text-white bg-[#800000]/20 font-bold"
              : "border-l-4 border-transparent text-zinc-300 hover:text-white hover:bg-white/5"
          )}
        >
          <Link href={item.url}>
            <item.icon
              className={cn(
                "!w-5 !h-5 flex-shrink-0",
                isActive ? "text-[#D4AF37]" : "text-zinc-300"
              )}
            />
            <span className="text-sm font-bold tracking-tight uppercase">
              {item.label}
            </span>
          </Link>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}

function SidebarUserFooter({
  adminName,
  onLogout,
}: {
  adminName: string;
  onLogout: () => void;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarFooter className="border-t border-white/10 bg-transparent p-3">
      <SidebarMenu>
        <SidebarMenuItem>
          {isCollapsed ? (
            <div className="flex justify-center py-1">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-2 bg-white/5 rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white uppercase truncate leading-tight">
                    {adminName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase">ACTIVE</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0 rounded-md hover:bg-white/5"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

export function AppSidebar({ onLogout, adminName, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="bg-black/40 border-r border-white/8 backdrop-blur-md"
    >
      {/* Brand Header */}
      <SidebarHeader className={cn("py-4", isCollapsed ? "px-2" : "px-3")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "hover:bg-transparent cursor-default",
                isCollapsed ? "justify-center px-2" : "px-3"
              )}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-[#800000] rounded-sm flex items-center justify-center shadow-lg shadow-[#800000]/20">
                <Image
                  src="/logo-white.png"
                  width={28}
                  height={28}
                  priority
                  alt="IskoArena logo"
                />
              </div>
              {!isCollapsed && (
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-bold text-white text-base leading-tight tracking-tight uppercase font-headline">
                    IskoArena
                  </span>
                  <span className="text-[10px] tracking-widest text-[#D4AF37] font-bold uppercase">
                    ADMIN CONSOLE
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-transparent py-2 flex-grow">
        {/* Overview Group */}
        <SidebarGroup className={cn("mb-4", isCollapsed ? "px-1" : "px-3")}>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] px-1 mb-1">
              OVERVIEW
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <NavItem key={item.label} item={item} isActive={pathname === item.url} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Group */}
        <SidebarGroup className={cn(isCollapsed ? "px-1" : "px-3")}>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.08em] px-1 mb-1">
              MANAGEMENT
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <NavItem key={item.label} item={item} isActive={pathname === item.url} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter adminName={adminName} onLogout={onLogout} />

      <SidebarRail />
    </Sidebar>
  );
}