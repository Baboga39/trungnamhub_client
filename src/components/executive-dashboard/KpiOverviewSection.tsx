import React from "react";
import { Users, UserCheck, Award, Flame, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { ExecutiveOverview } from "@/types/executiveDashboard";

interface KpiOverviewSectionProps {
  data: ExecutiveOverview | null;
  loading: boolean;
}

export const KpiOverviewSection: React.FC<KpiOverviewSectionProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm animate-pulse h-32 flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-300 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Tổng Đoàn sinh",
      value: data?.totalMembers?.value?.toString() || "0",
      unit: "em",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100 hover:border-blue-300",
      diff: data?.totalMembers?.diff || 0,
      invertTrend: false,
    },
    {
      title: "Tỷ lệ Chuyên cần",
      value: `${data?.attendanceRate?.value || 0}%`,
      unit: "trung bình",
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100 hover:border-emerald-300",
      diff: data?.attendanceRate?.diff || 0,
      invertTrend: false,
    },
    {
      title: "Điểm Đánh giá TB",
      value: (data?.averageScore?.value || 0).toFixed(1),
      unit: "/ 10 điểm",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100 hover:border-amber-300",
      diff: data?.averageScore?.diff || 0,
      invertTrend: false,
    },
    {
      title: "Tham gia Hoạt động",
      value: `${data?.activityParticipation?.value || 0}%`,
      unit: "phong trào",
      icon: Flame,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100 hover:border-purple-300",
      diff: data?.activityParticipation?.diff || 0,
      invertTrend: false,
    },
    {
      title: "Đoàn sinh Cảnh báo",
      value: data?.riskMembers?.value?.toString() || "0",
      unit: "cần chú ý",
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100 hover:border-rose-300",
      diff: data?.riskMembers?.diff || 0,
      invertTrend: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isPositive = kpi.invertTrend ? kpi.diff <= 0 : kpi.diff >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={idx}
            className={`bg-white p-5 rounded-3xl border ${kpi.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2.5 rounded-2xl ${kpi.bgColor} transition-transform group-hover:scale-105`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                {kpi.value}
                <span className="text-xs font-medium text-slate-400">{kpi.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <div
                className={`flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full ${
                  isPositive
                    ? "bg-emerald-100/80 text-emerald-800"
                    : "bg-rose-100/80 text-rose-800"
                }`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{kpi.diff > 0 ? `+${kpi.diff}` : `${kpi.diff}`}</span>
              </div>
              <span className="text-slate-400 font-medium">so với quý trước</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
