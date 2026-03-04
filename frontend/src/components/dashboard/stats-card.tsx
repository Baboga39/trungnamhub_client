"use client";
import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  iconColor?: string;
  iconBgColor?: string;
  bgGradient?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  bgGradient = "gradient-blue",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-8 card-glow card-hover border border-border/50",
        "overflow-hidden relative",
      )}
    >
      <div className="absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-3 flex items-center gap-1.5">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    trend.isPositive ? "text-green-500" : "text-red-500",
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label || "so với tháng trước"}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "rounded-2xl p-4",
              iconBgColor,
              "shadow-lg shadow-current/10",
            )}
          >
            <Icon className={cn("h-7 w-7", iconColor)} />
          </div>
        </div>
      </div>
    </div>
  );
}
