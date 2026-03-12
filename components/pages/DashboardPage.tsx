"use client";

import React from "react";
import { 
  Trophy, 
  Zap, 
  Users, 
  User, 
  Calendar, 
  ChevronRight,
} from "lucide-react";

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Import from central types (removed local interface definitions) ──
import type { Match, Result, Player, Team, PageName } from "@/types";

interface DashboardPageProps {
  matches: Match[];
  results: Result[];
  players: Player[];
  teams: Team[];
  onNavigate?: (page: PageName) => void;
}

export default function DashboardPage({ matches, results, players, teams, onNavigate }: DashboardPageProps) {
  const now = new Date();

  // Logic: Matches happening within a 2-hour window
  const ongoingMatches = matches.filter((match) => {
    const matchDateTime = new Date(`${match.date}T${match.time}`);
    const timeDiff = now.getTime() - matchDateTime.getTime();
    const hasResult = results.some((r) => r.matchId === String(match.id));
    return timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000 && !hasResult;
  });

  const recentMatches = [...matches].slice(-5).reverse();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Stat Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Matches", value: matches.length, icon: Trophy, trend: "All sports" },
          { label: "Live Now", value: ongoingMatches.length, icon: Zap, isLive: true, trend: "In Play" },
          { label: "Total Teams", value: teams.length, icon: Users, trend: "Orgs" },
          { label: "Total Players", value: players.length, icon: User, trend: "Iskos" },
        ].map((card) => (
          <Card key={card.label} className="shadow-sm border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tighter">{card.value}</p>
                </div>
                <div className={cn(
                  "p-2 rounded-md border border-border bg-muted/20",
                  card.isLive && "bg-red-50 border-red-100 text-red-600"
                )}>
                  <card.icon className="size-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[11px] font-medium text-muted-foreground">
                {card.isLive ? (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" /> 
                    LIVE REPORTING
                  </span>
                ) : card.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Matches</CardTitle>
            <CardDescription className="text-xs">Real-time status updates from the field.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => onNavigate?.("matches")}
          >
            View Schedule <ChevronRight className="ml-1 size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                <TableHead className="pl-6 h-10 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Sport</TableHead>
                <TableHead className="h-10 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Matchup</TableHead>
                <TableHead className="h-10 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Schedule</TableHead>
                <TableHead className="text-right pr-6 h-10 font-medium text-muted-foreground text-[10px] uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground italic text-sm py-10">
                    No matches scheduled yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentMatches.map((match) => {
                  const hasResult = results.some((r) => r.matchId === String(match.id));
                  const isLive = ongoingMatches.some((m) => m.id === match.id);
                  return (
                    <TableRow key={match.id} className="group cursor-default border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6 font-semibold text-xs tracking-tight">{match.sport}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{match.teamA}</span>
                          <span className="text-[10px] text-muted-foreground italic">vs</span>
                          <span className="text-sm font-medium">{match.teamB}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{match.date}</span>
                          <span className="text-[10px] text-muted-foreground">{match.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant={isLive ? "default" : hasResult ? "secondary" : "outline"} className="rounded-md font-semibold text-[9px] px-2 py-0 h-5 uppercase tracking-widest border-border/50">
                          {isLive ? "Live" : hasResult ? "Finished" : "Upcoming"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call to Action Banner */}
      <Card className="bg-zinc-950 text-white border-none shadow-xl overflow-hidden relative group mt-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-transparent pointer-events-none" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
           <div className="flex items-center gap-6">
              <div className="size-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Calendar className="size-6 text-zinc-400" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-lg font-semibold tracking-tight">Next Tournament Briefing</h3>
                 <p className="text-sm text-zinc-500 font-medium">Tomorrow at 10:00 AM • Conference Hall B</p>
              </div>
           </div>
           <Button className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 h-10 px-8 font-semibold rounded-md shadow-lg shadow-white/5 active:scale-95 transition-all">
              Join Session
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}