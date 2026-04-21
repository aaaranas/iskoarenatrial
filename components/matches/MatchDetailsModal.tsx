import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MatchDetailsModal = ({ match, open, onOpenChange }: any) => {
  // 1. Use state instead of defaultValue
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#050505] border-white/10 p-0 overflow-hidden text-white">
        
	        {/* Header - Cinematic Scoreboard */}
        <div className="relative p-8 bg-gradient-to-b from-[#111] to-[#050505] border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="text-center w-1/3">
              <h2 className="text-3xl font-black uppercase italic">{match.homeTeam}</h2>
              <p className="text-zinc-500 text-xs font-bold mt-1">HOME</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-black tracking-tighter tabular-nums text-white">
                {match.homeScore} : {match.awayScore}
              </div>
              <span className="bg-[#A91D3A] text-[10px] px-2 py-0.5 rounded-sm font-bold mt-2 uppercase">{match.status}</span>
            </div>
            <div className="text-center w-1/3">
              <h2 className="text-3xl font-black uppercase italic">{match.awayTeam}</h2>
              <p className="text-zinc-500 text-xs font-bold mt-1">AWAY</p>
            </div>
          </div>
        </div>

        {/* 2. Pass state to Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-white/10 p-0 px-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:text-[#C5A059] data-[state=active]:border-b-2 border-[#C5A059] rounded-none py-4 uppercase font-bold text-xs tracking-widest text-zinc-500"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:text-[#C5A059] data-[state=active]:border-b-2 border-[#C5A059] rounded-none py-4 uppercase font-bold text-xs tracking-widest text-zinc-500"
            >
              Stats
            </TabsTrigger>
          </TabsList>

          <div className="p-6 h-[400px] overflow-y-auto">
            <TabsContent value="overview">
               {/* Overview Content */}
            </TabsContent>
            <TabsContent value="stats">
               {/* Stats Content */}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
