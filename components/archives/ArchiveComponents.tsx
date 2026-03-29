import React from "react";
import { Search, ChevronDown, Eye, Play, Filter, ArrowRight } from "lucide-react";

// --- 1. PREMIUM HEADER (With Watermark) ---
export const ArchiveHeader = () => (
  <header className="relative mb-16 pt-4">
    <span className="absolute -top-10 -left-6 text-[12rem] font-black text-white/[0.02] select-none pointer-events-none">
      2024
    </span>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-[2px] w-12 bg-[#A91D3A]"></div>
        <span className="text-[#A91D3A] text-[10px] font-black tracking-[0.5em] uppercase">
          IskoArena Digital Vault
        </span>
      </div>
      <h1 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.8]">
        The <span className="text-transparent stroke-white stroke-1" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Archives</span>
      </h1>
    </div>
  </header>
);

// --- 2. FLOATING SIDEBAR (Glassmorphism) ---
export const ArchiveFilterSidebar = ({ categories }) => (
  <aside className="w-72 hidden lg:block sticky top-10 h-fit space-y-10 pr-8">
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
      <div className="mb-8">
        <label className="text-[10px] uppercase tracking-[0.3em] text-[#A91D3A] font-black block mb-4">
          Quick Search
        </label>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#A91D3A] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search the vault..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-xs focus:outline-none focus:border-[#A91D3A]/50 transition-all text-white placeholder:text-gray-700"
          />
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black block">
          Classification
        </label>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between group cursor-pointer">
              <span className={`text-xs tracking-widest uppercase transition-all ${cat.active ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {cat.name}
              </span>
              <div className={`h-1 w-1 rounded-full transition-all duration-500 ${cat.active ? 'w-6 bg-[#A91D3A] shadow-[0_0_10px_#A91D3A]' : 'bg-gray-800'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Featured Match Miniature */}
    <div className="px-2">
       <div className="rounded-xl overflow-hidden relative group cursor-pointer border border-white/5">
          <img src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=400" className="w-full h-32 object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-3 left-3">
             <p className="text-[8px] text-[#A91D3A] font-black uppercase tracking-widest">Editor's Choice</p>
             <p className="text-xs font-bold text-white uppercase italic">Season Finals '23</p>
          </div>
       </div>
    </div>
  </aside>
);

// --- 3. PREMIUM CARD (Hover Effects) ---
export const ArchiveCard = ({ item }) => (
  <div className="group relative">
    <div className="relative aspect-[16/10] mb-5 overflow-hidden rounded-xl border border-white/5 bg-[#0A0A0A]">
      {/* Background Image with Zoom and Grayscale transition */}
      <img 
        src={item.img} 
        alt={item.title} 
        className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" 
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-[#A91D3A]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Tags */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 tracking-tighter uppercase rounded-sm self-start">
          {item.tag}
        </span>
      </div>

      {/* View Case Button - appears on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
            <Play fill="black" size={18} />
         </div>
      </div>

      {/* Bottom Duration Badge */}
      {item.type === 'video' && (
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-widest">
            {item.duration}
        </div>
      )}
    </div>

    <div className="space-y-2">
      <div className="flex justify-between items-start gap-4">
        <h4 className="text-lg font-bold leading-tight uppercase tracking-tighter text-white group-hover:text-[#A91D3A] transition-colors duration-300">
          {item.title}
        </h4>
        <ArrowRight size={16} className="text-white/0 group-hover:text-[#A91D3A] -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
      </div>
      
      <div className="flex items-center gap-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
        <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-[#A91D3A] rounded-full" /> {item.date}</span>
        <span className="flex items-center gap-1.5"><Eye size={12} /> {item.views} VIEWS</span>
      </div>
    </div>
  </div>
);
