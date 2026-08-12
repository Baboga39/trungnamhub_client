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
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-32 flex flex-col justify-between">
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
      title: "Tổng số Đoàn sinh",
      value: data?.totalMembers?.value?.toString() || "0",
      unit: "em",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      diff: data?.totalMembers?.diff || 0,
      trendPercent: data?.totalMembers?.trendPercent,
      invertTrend: false,
    },
    {
      title: "Tỷ lệ Chuyên cần",
      value: `${data?.attendanceRate?.value || 0}%`,
      unit: "trung bình",
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      diff: data?.attendanceRate?.diff || 0,
      trendPercent: data?.attendanceRate?.trendPercent,
      invertTrend: false,
    },
    {
      title: "Điểm Đánh giá TB",
      value: (data?.averageScore?.value || 0).toFixed(1),
      unit: "thang điểm 10",
      icon: Award,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      diff: data?.averageScore?.diff || 0,
      trendPercent: data?.averageScore?.trendPercent,
      invertTrend: false,
    },
    {
      title: "Tham gia Hoạt động",
      value: `${data?.activityParticipation?.value || 0}%`,
      unit: "phong trào",
      icon: Flame,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      diff: data?.activityParticipation?.diff || 0,
      trendPercent: data?.activityParticipation?.trendPercent,
      invertTrend: false,
    },
    {
      title: "Đoàn sinh Cảnh báo",
      value: data?.riskMembers?.value?.toString() || "0",
      unit: "cần chú ý",
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      diff: data?.riskMembers?.diff || 0,
      trendPercent: undefined,
      invertTrend: true, // For risk members, fewer is better
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
            className={`bg-white p-5 rounded-2xl border ${kpi.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl ${kpi.bgColor}`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                {kpi.value}
                <span className="text-xs font-normal text-slate-400">{kpi.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <div
                className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                  isPositive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>
                  {kpi.diff > 0 ? `+${kpi.diff}` : `${kpi.diff}`}
                </span>
              </div>
              <span className="text-slate-400">so với Quý trước</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
