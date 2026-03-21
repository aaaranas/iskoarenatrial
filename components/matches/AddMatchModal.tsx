"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon, MapPin, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const AddMatchModal = ({ children }: { children: React.ReactNode }) => {
  const [date, setDate] = React.useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#0A0A0A] border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        
        {/* MODAL HEADER WITH ACCENT STRIP */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50" />
        
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-[0.1em]">
                Initialize New Entry
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 font-medium tracking-wide text-xs uppercase">
              Enter the parameters for the upcoming showdown in the compendium.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-8">
            {/* SECTION 1: CORE DETAILS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sport Discipline</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT SPORT" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Category / Division</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:ring-[#C5A059]/20 text-xs font-bold tracking-widest uppercase">
                    <SelectValue placeholder="SELECT CATEGORY" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold">
                    <SelectItem value="mens_singles">Men's Singles</SelectItem>
                    <SelectItem value="womens_doubles">Women's Doubles</SelectItem>
                    <SelectItem value="mixed">Mixed Doubles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SECTION 2: PARTICIPANTS */}
            <div className="p-6 bg-zinc-900/30 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Contestants</span>
              </div>
              <div className="grid grid-cols-11 items-center gap-4">
                <div className="col-span-5 space-y-3">
                  <Input placeholder="TEAM A / PLAYER 1" className="bg-transparent border-b border-zinc-800 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C5A059] uppercase text-xs tracking-widest font-black placeholder:text-zinc-700" />
                  <div className="flex gap-2">
                    {["COE", "CBA", "CAS"].map(c => <span key={c} className="px-2 py-0.5 border border-zinc-800 text-[8px] font-bold text-zinc-600 rounded hover:text-[#C5A059] hover:border-[#C5A059]/50 cursor-pointer transition-all">{c}</span>)}
                  </div>
                </div>
                <div className="col-span-1 text-center text-zinc-700 font-black text-xs italic">VS</div>
                <div className="col-span-5 space-y-3">
                  <Input placeholder="TEAM B / PLAYER 2" className="bg-transparent border-b border-zinc-800 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-[#C5A059] text-right uppercase text-xs tracking-widest font-black placeholder:text-zinc-700" />
                  <div className="flex gap-2 justify-end">
                    {["CON", "CHE", "CCS"].map(c => <span key={c} className="px-2 py-0.5 border border-zinc-800 text-[8px] font-bold text-zinc-600 rounded hover:text-[#C5A059] hover:border-[#C5A059]/50 cursor-pointer transition-all">{c}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: LOGISTICS */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Match Schedule</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full flex items-center gap-3 px-4 h-10 bg-zinc-900/50 border border-zinc-800 rounded-md text-[10px] font-bold tracking-widest uppercase text-left transition-all hover:border-zinc-600",
                      !date && "text-zinc-600"
                    )}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-zinc-800" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-[#0A0A0A] text-zinc-300"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Venue / Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-600" />
                  <Input placeholder="E.G. MAIN GYM - COURT 1" className="bg-zinc-900/50 border-zinc-800 pl-10 h-10 text-[10px] font-bold tracking-widest uppercase focus-visible:ring-[#C5A059]/20" />
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
              <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Cancel
              </button>
              <button className="px-8 py-2 bg-[#C5A059] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4B475] transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                Confirm Entry
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
