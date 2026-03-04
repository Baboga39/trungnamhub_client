import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: React.ElementType;
  color: string;   // ex: "from-[#60A5FA] to-[#3B82F6]"
  bgColor: string; // ex: "from-blue-50 to-blue-100/50"
  index?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
  index = 0,
}: StatCardProps) {
  const ChangeIcon = changeType === "increase" ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5 border border-slate-100",
        "bg-gradient-to-br shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group",
        bgColor
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Background blur circle */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <div className={clsx("w-full h-full rounded-full blur-2xl", "bg-gradient-to-br", color)} />
      </div>

      <div className="relative space-y-3">
        {/* Icon + Change */}
        <div className="flex items-start justify-between">
          <div
            className={clsx(
              "w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
              "bg-gradient-to-br",
              color
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          {change && changeType && (
            <div
              className={clsx(
                "flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold",
                changeType === "increase"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              <ChangeIcon className="h-3 w-3" />
              {change}
            </div>
          )}
        </div>

        {/* Title + Value */}
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );
}
