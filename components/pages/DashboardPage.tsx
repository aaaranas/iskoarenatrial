//dashboardpage

"use client";

import React from "react";
import { 
  Trophy, 
  Zap, 
  Users, 
  User, 
  Calendar, 
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

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

export interface Match { id: string; sport: string; teamA: string; teamB: string; date: string; time: string; venue?: string; }
export interface Result { matchId: string; scoreA: number; scoreB: number; winnerId: string; }
export interface Player { id: string; name: string; teamId: string; }
export interface Team { id: string; name: string; org: string; }

interface DashboardPageProps {
  matches: Match[];
  results: Result[];
  players: Player[];
  teams: Team[];
}

export default function DashboardPage({ matches, results, players, teams }: DashboardPageProps) {
  const now = new Date();

  const ongoingMatches = matches.filter((match) => {
    const matchDateTime = new Date(`${match.date}T${match.time}`);
    const timeDiff = now.getTime() - matchDateTime.getTime();
    const hasResult = results.some((r) => r.matchId === match.id);
    return timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000 && !hasResult;
  });

  const recentMatches = [...matches].slice(-5).reverse();

  // Upcoming matches: future date/time, no result yet, not live
  const upcomingMatches = matches
    .filter((match) => {
      const matchDateTime = new Date(`${match.date}T${match.time}`);
      const hasResult = results.some((r) => r.matchId === match.id);
      const isLive = ongoingMatches.some((m) => m.id === match.id);
      return matchDateTime > now && !hasResult && !isLive;
    })
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 6);

  // Group upcoming by date
  const groupedUpcoming = upcomingMatches.reduce<Record<string, Match[]>>((acc, match) => {
    if (!acc[match.date]) acc[match.date] = [];
    acc[match.date].push(match);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

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

      {/* Upcoming Matches Summary */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">Upcoming Matches</CardTitle>
            <CardDescription className="text-xs">
              Next {upcomingMatches.length} scheduled fixtures across all sports.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
            Full Schedule <ChevronRight className="ml-1 size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Calendar className="size-8 mb-3 opacity-30" />
              <p className="text-sm font-medium">No upcoming matches scheduled</p>
              <p className="text-xs mt-1 opacity-60">Check back later for new fixtures.</p>
            </div>
          ) : (
            Object.entries(groupedUpcoming).map(([date, dayMatches], groupIdx) => (
              <div key={date}>
                {/* Date group header */}
                <div className="flex items-center gap-3 px-6 py-2.5 bg-muted/20 border-b border-border/50">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {formatDate(date)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    — {new Date(date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5 font-semibold rounded-sm border-border/50">
                    {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
                  </Badge>
                </div>

                {/* Matches under this date */}
                {dayMatches.map((match, idx) => (
                  <div
                    key={match.id}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 hover:bg-muted/10 transition-colors",
                      idx < dayMatches.length - 1 && "border-b border-border/40"
                    )}
                  >
                    {/* Sport badge */}
                    <div className="w-24 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-wider px-2 h-5 border-border/50 text-muted-foreground w-full justify-center truncate"
                      >
                        {match.sport}
                      </Badge>
                    </div>

                    {/* Matchup */}
                    <div className="flex flex-1 items-center justify-center gap-3 min-w-0">
                      <span className="text-sm font-semibold text-right flex-1 truncate">{match.teamA}</span>
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none">vs</span>
                      </div>
                      <span className="text-sm font-semibold text-left flex-1 truncate">{match.teamB}</span>
                    </div>

                    {/* Time & Venue */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                        <Clock className="size-3 text-muted-foreground" />
                        {formatTime(match.time)}
                      </div>
                      {match.venue && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="size-2.5" />
                          {match.venue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Spacer between groups except last */}
                {groupIdx < Object.keys(groupedUpcoming).length - 1 && (
                  <div className="h-px bg-border" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Matches Table */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Matches</CardTitle>
            <CardDescription className="text-xs">Real-time status updates from the field.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
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
              {recentMatches.map((match) => {
                const hasResult = results.some((r) => r.matchId === match.id);
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
              })}
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