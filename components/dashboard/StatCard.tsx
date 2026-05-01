interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLive?: boolean;
}

export const StatCard = ({ title, value, subtitle, isLive = false }: StatCardProps) => {
  return (
    <div className="relative p-6 pt-7 rounded-xl bg-[#222222] border border-white/5 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:bg-[#282828]">
      <div className="flex items-center gap-2 mb-5">
        {isLive && <span className="w-2 h-2 rounded-full bg-[#FF3300]"></span>}
        <span className={`text-xs font-normal tracking-wider uppercase ${isLive ? 'text-[#FF3300]' : 'text-zinc-400'}`}>
          {title}
        </span>
      </div>
      
      <div>
        <p className="text-5xl font-normal text-white mb-2.5 tracking-tight leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] font-normal text-zinc-500 uppercase tracking-wider leading-tight mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {isLive && (
        <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-[#FF3300]"></div>
      )}
    </div>
  );
};