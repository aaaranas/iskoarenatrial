"use client";
import React from "react";
import { 
  ArchiveHeader, 
  ArchiveFilterSidebar, 
  ArchiveCard, 
} from "@/components/archives/ArchiveComponents";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function ArchivesPage() {
  const categories = [
    { name: "Cinematic Highlights", active: true },
    { name: "Tactical Analysis", active: false },
    { name: "Athlete Spotlight", active: false },
    { name: "Live Sessions", active: false },
  ];

  const dummyData = [
    {
      id: 1,
      title: "Championship Finals 2024: The Opener",
      tag: "FEATURED",
      date: "12 OCT 2024",
      views: "42.5K",
      type: "video",
      duration: "12:04",
      img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800"
    },
    {
      id: 2,
      title: "The Physics of the Perfect Penalty",
      tag: "TACTICAL",
      date: "11 OCT 2024",
      views: "18.2K",
      type: "video",
      duration: "08:42",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800"
    },
    {
        id: 3,
        title: "Behind the Lens: Season Emotion",
        tag: "EDITORIAL",
        date: "10 OCT 2024",
        views: "12.8K",
        type: "image",
        img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=800"
    },

    {
        id: 4,
        title: "Behind the Lens: Season Emotion",
        tag: "EDITORIAL",
        date: "10 OCT 2024",
        views: "12.8K",
        type: "image",
        img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=800"
    },

    {
        id: 5,
        title: "Behind the Lens: Season Emotion",
        tag: "EDITORIAL",
        date: "10 OCT 2024",
        views: "12.8K",
        type: "image",
        img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=800"
    },

    {
        id: 6,
        title: "Behind the Lens: Season Emotion",
        tag: "EDITORIAL",
        date: "10 OCT 2024",
        views: "12.8K",
        type: "image",
        img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=800"
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white flex flex-col lg:flex-row p-6 lg:p-12 font-sans selection:bg-[#A91D3A] selection:text-white">
      
      {/* 1. Left Sidebar */}
      <ArchiveFilterSidebar categories={categories} />

      {/* 2. Main Content Container */}
      <main className="flex-1 lg:pl-12">
        <ArchiveHeader />

        <section className="relative">
          {/* Section Divider */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Results Library</h3>
               <div className="h-px w-24 bg-white/10"></div>
            </div>
            <div className="flex gap-4">
                <button className="text-gray-600 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                <button className="text-[#A91D3A] hover:text-white transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
            {dummyData.map(item => (
              <ArchiveCard key={item.id} item={item} />
            ))}
          </div>

          {/* Premium Pagination */}
          <div className="mt-24 pt-10 border-t border-white/5 flex justify-between items-center">
             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Showing 1-12 of 148 items</p>
             <div className="flex gap-2">
                {[1, 2, 3, "..." , 12].map((n, i) => (
                    <button key={i} className={`w-8 h-8 text-[10px] font-black rounded-lg transition-all ${n === 1 ? 'bg-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                        {n}
                    </button>
                ))}
             </div>
          </div>
        </section>
      </main>

      {/* 3. Right Alpha Strip (Ultra-minimal) */}
      <aside className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-center opacity-30 hover:opacity-100 transition-opacity hidden 2xl:flex">
         {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
             <span key={l} className="text-[8px] font-black cursor-pointer hover:text-[#A91D3A] transition-colors">{l}</span>
         ))}
      </aside>
    </div>
  );
}
