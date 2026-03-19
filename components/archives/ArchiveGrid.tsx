import { motion } from "framer-motion";

export const ArchiveGrid = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="grid grid-cols-3 gap-6"
  >
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="group bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-[#C5A059] transition-all">
        <div className="h-48 bg-gray-800" /> {/* Placeholder Image */}
        <div className="p-4">
          <p className="text-[10px] text-[#A91D3A] font-bold uppercase tracking-widest">Highlights</p>
          <h4 className="font-semibold mt-1">Championship Finals 2024</h4>
          <p className="text-xs text-gray-500 mt-2">12 OCT 2024</p>
        </div>
      </div>
    ))}
  </motion.div>
);
