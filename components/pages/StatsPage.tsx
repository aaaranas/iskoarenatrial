"use client";
import React, { useState } from "react";
import { Podium } from "../leaderboards/Podium";
import { LeaderboardTable } from "../leaderboards/LeaderboardTable";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Calendar } from "lucide-react";

const performers = [
  { id: "2", name: "Scions", points: "2,000 pts", prize: "100,000", rank: 1, value: 50000 },
  { id: "1", name: "Pheonix", points: "2,000 pts", prize: "50,000", rank: 2, value: 10000 },
  { id: "3", name: "Tycoons", points: "2,000 pts", prize: "20,000", rank: 3, value: 9000 },
];

const mock_players = [
  { rank: 4, name: "Henrietta O'Connell", username: "@henrietta", avatar: "", followers: "12,241", points: "2,114,424", reward: 1000 },
  { rank: 5, name: "Darrel Bins", username: "@darrel", avatar: "", followers: "11,800", points: "2,010,200", reward: 900 },
  { rank: 6, name: "Sally Kovacek", username: "@sally", avatar: "", followers: "10,001", points: "1,980,122", reward: 800 },
  { rank: 7, name: "Henrietta O'Connell", username: "@henrietta", avatar: "", followers: "12,241", points: "2,114,424", reward: 1000 },
  { rank: 8, name: "Darrel Bins", username: "@darrel", avatar: "", followers: "11,800", points: "2,010,200", reward: 900 },
  { rank: 9, name: "Sally Kovacek", username: "@sally", avatar: "", followers: "10,001", points: "1,980,122", reward: 800 },
  { rank: 10, name: "Henrietta O'Connell", username: "@henrietta", avatar: "", followers: "12,241", points: "2,114,424", reward: 1000 },
  { rank: 11, name: "Darrel Bins", username: "@darrel", avatar: "", followers: "11,800", points: "2,010,200", reward: 900 },
  { rank: 12, name: "Sally Kovacek", username: "@sally", avatar: "", followers: "10,001", points: "1,980,122", reward: 800 },
  { rank: 13, name: "Henrietta O'Connell", username: "@henrietta", avatar: "", followers: "12,241", points: "2,114,424", reward: 1000 },
  { rank: 14, name: "Darrel Bins", username: "@darrel", avatar: "", followers: "11,800", points: "2,010,200", reward: 900 },
  { rank: 15, name: "Sally Kovacek", username: "@sally", avatar: "", followers: "10,001", points: "1,980,122", reward: 800 },
  { rank: 16, name: "Henrietta O'Connell", username: "@henrietta", avatar: "", followers: "12,241", points: "2,114,424", reward: 1000 },
  { rank: 17, name: "Darrel Bins", username: "@darrel", avatar: "", followers: "11,800", points: "2,010,200", reward: 900 },
  { rank: 18, name: "Sally Kovacek", username: "@sally", avatar: "", followers: "10,001", points: "1,980,122", reward: 800 },
];

const mock_teams = [
  { rank: 1, name: "Alpha Squad", username: "@alpha", avatar: "", followers: "82,000", points: "9,120,400", reward: 5000 },
  { rank: 2, name: "Nova Guild", username: "@nova", avatar: "", followers: "75,110", points: "8,001,210", reward: 4000 },
  { rank: 3, name: "Orion League", username: "@orion", avatar: "", followers: "70,221", points: "7,880,000", reward: 3000 },

  { rank: 4, name: "Alpha Squad", username: "@alpha", avatar: "", followers: "82,000", points: "9,120,400", reward: 5000 },
  { rank: 5, name: "Nova Guild", username: "@nova", avatar: "", followers: "75,110", points: "8,001,210", reward: 4000 },
  { rank: 6, name: "Orion League", username: "@orion", avatar: "", followers: "70,221", points: "7,880,000", reward: 3000 },
  { rank: 7, name: "Alpha Squad", username: "@alpha", avatar: "", followers: "82,000", points: "9,120,400", reward: 5000 },
  { rank: 8, name: "Nova Guild", username: "@nova", avatar: "", followers: "75,110", points: "8,001,210", reward: 4000 },
  { rank: 9, name: "Orion League", username: "@orion", avatar: "", followers: "70,221", points: "7,880,000", reward: 3000 },
  { rank: 10, name: "Alpha Squad", username: "@alpha", avatar: "", followers: "82,000", points: "9,120,400", reward: 5000 },
  { rank: 11, name: "Nova Guild", username: "@nova", avatar: "", followers: "75,110", points: "8,001,210", reward: 4000 },
  { rank: 12, name: "Orion League", username: "@orion", avatar: "", followers: "70,221", points: "7,880,000", reward: 3000 },
];


export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("Weekly");
  return (
    <div className="bg-[#0A0A0A] p-8 text-white min-h-screen">
	 
	
      {/* STICKY PREMIUM HEADER */}
      <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 bg-zinc-950/80 backdrop-blur-xl px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-black flex items-center gap-6 tracking-tight text-white">
      {/* Increased height to 12 (48px) and width to 2 (8px) */}
      <div className="w-2 h-12 bg-[#A91D3A] rounded-full shadow-[0_0_25px_rgba(169,29,58,0.7)]" /> 
      LEADERBOARDS
    </h1>
		    {/* Compact Pill Dropdown */}
<DropdownMenu>
  <DropdownMenuTrigger className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-gray-800 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#A91D3A]">
    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
    {timeframe}
    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
  </DropdownMenuTrigger>
  
  <DropdownMenuContent 
    className="bg-[#1A1A1A] border border-gray-800 text-white w-32 rounded-xl shadow-xl p-1"
    align="end"
  >
    <DropdownMenuItem 
      onClick={() => setTimeframe("Weekly")} 
      className="cursor-pointer text-xs rounded-lg hover:bg-[#A91D3A] focus:bg-[#A91D3A] transition-colors"
    >
      Weekly
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={() => setTimeframe("Monthly")} 
      className="cursor-pointer text-xs rounded-lg hover:bg-[#A91D3A] focus:bg-[#A91D3A] transition-colors"
    >
      Monthly
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        </div>
      </header>
    
      {/* 1. Podium Section */}
      <Podium performers={performers} /> 
      <LeaderboardTable players={mock_players} teams={mock_teams}/>

    </div>
  );
}
