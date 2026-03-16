"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gem, Trophy, ChevronDown } from "lucide-react";

export function LeaderboardTable({ players = [], teams = [] }: any) {
  const [mode, setMode] = useState<"players" | "teams">("players");
  const data = mode === "players" ? players : teams;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Premium Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#0A0A0A] p-1 rounded-full border border-gray-800/50 inline-flex shadow-xl">
          {(["players", "teams"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-xs tracking-[0.2em] rounded-full transition-all duration-300 ${
                mode === m
                  ? "bg-[#A91D3A] text-white shadow-[0_4px_12px_rgba(169,29,58,0.3)]"
                  : "text-gray-600 hover:text-gray-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Borderless Premium Wrapper */}
      <div className="relative rounded-3xl bg-[#0E0E0E] shadow-2xl overflow-hidden">
        {/* Fade Effect Container */}
        <div className="p-6 relative [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[80px] text-gray-600 font-medium uppercase text-[10px] tracking-[0.2em] pl-2">Rank</TableHead>
                <TableHead className="text-gray-600 font-medium uppercase text-[10px] tracking-[0.2em]">Participant</TableHead>
                <TableHead className="text-gray-600 font-medium uppercase text-[10px] tracking-[0.2em]">Followers</TableHead>
                <TableHead className="text-gray-600 font-medium uppercase text-[10px] tracking-[0.2em]">Points</TableHead>
                <TableHead className="text-right text-gray-600 font-medium uppercase text-[10px] tracking-[0.2em] pr-2">Reward</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((user: any, index: number) => (
                <TableRow
                  key={user.rank}
                  className="border-none transition-all duration-300 hover:bg-[#1A1A1A]/40 group"
                >
                  <TableCell className="pl-2 font-bold text-lg text-white">
                    {index < 3 ? (
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : "text-amber-700"}`} />
                        <span className="opacity-80 font-mono">{user.rank}</span>
                      </div>
                    ) : (
                      <span className="text-gray-700 font-mono">{user.rank}</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-gray-800 ring-1 ring-white/5 group-hover:ring-[#A91D3A]/30 transition-all">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-[#1A1A1A] text-gray-500">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white tracking-wide">{user.name}</span>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">{user.username}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-gray-500 font-medium text-sm">{user.followers}</TableCell>
                  <TableCell className="text-[#C5A059] font-bold text-sm tracking-wide">{user.points}</TableCell>
                  
                  <TableCell className="text-right pr-2">
                    <div className="inline-flex items-center justify-end gap-1.5 bg-[#121212] px-3 py-1.5 rounded-full border border-[#1A1A1A] group-hover:border-[#A91D3A]/30 transition-colors">
                      <Gem className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="text-xs font-bold text-white tracking-tight">{user.reward}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* See More Button */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex justify-center bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E] to-transparent">
          <button className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
            See More <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
