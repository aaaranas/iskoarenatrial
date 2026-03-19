import { Search } from "lucide-react";

export const ArchiveSidebar = () => (
  <aside className="w-64 space-y-8">
    <div className="relative">
      <input 
        placeholder="Search Archives..." 
        className="w-full bg-[#1A1A1A] p-3 rounded-lg border border-gray-800 text-white outline-none focus:border-[#C5A059]" 
      />
      <Search className="absolute right-3 top-3 text-gray-500 w-5 h-5" />
    </div>
    
    <div>
      <h3 className="text-[#C5A059] font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Categories</h3>
      {['Video', 'Photo', 'Stats', 'Highlights'].map(filter => (
        <label key={filter} className="flex items-center gap-2 mb-2 cursor-pointer hover:text-[#C5A059] transition-colors">
          <input type="radio" name="filter" className="accent-[#A91D3A]" /> 
          <span className="text-sm">{filter}</span>
        </label>
      ))}
    </div>
  </aside>
);
