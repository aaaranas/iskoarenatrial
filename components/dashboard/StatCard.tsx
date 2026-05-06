import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLive?: boolean;
}

export const StatCard = ({ title, value, subtitle, isLive = false }: StatCardProps) => {
  return (
    <Card
      className="relative pt-7 rounded-xl overflow-hidden transition-all duration-300 border-0"
      style={{ backgroundColor: "var(--surface-card)" }}
    >
      <CardContent className="flex flex-col justify-between p-6 pt-0">
        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          {isLive && (
            <span
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: "var(--accent-live)" }}
            />
          )}
          <span
            className="text-base tracking-wider uppercase font-heading"
            style={{ color: isLive ? "var(--accent-maroon)" : "var(--text)" }}
          >
            {title}
          </span>
        </div>

        {/* Value + subtitle */}
        <div className="flex flex-col items-center text-center">
          <p
            className="text-5xl font-normal mb-2.5 tracking-tight leading-none"
            style={{ color: "var(--text)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-[11px] font-normal uppercase tracking-wider leading-tight mt-1"
              style={{ color: "var(--text)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};