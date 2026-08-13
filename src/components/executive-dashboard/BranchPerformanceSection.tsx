import React from "react";
import { Trophy, AlertCircle, ChevronRight, Activity } from "lucide-react";
import { BranchPerformance } from "@/types/executiveDashboard";

interface BranchPerformanceSectionProps {
  branches: BranchPerformance[];
  loading: boolean;
  onSelectBranch?: (branchName: string) => void;
}

// Order & Colors for 3 Ngành: Đồng (Vàng) -> Thiếu (Xanh) -> Thanh (Đỏ)
const branchThemeMap: Record<
  string,
  { bg: string; border: string; text: string; badge: string; icon: string }
> = {
  "Ngành Đồng": {
    bg: "bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white",
    border: "border-amber-200 hover:border-amber-400",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    icon: "🟡",
  },
  "Ngành Thiếu": {
    bg: "bg-gradient-to-br from-blue-500/10 via-blue-50/50 to-white",
    border: "border-blue-200 hover:border-blue-400",
    text: "text-blue-900",
    badge: "bg-blue-100 text-blue-900 border-blue-300",
    icon: "🔵",
  },
  "Ngành Thanh": {
    bg: "bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white",
    border: "border-rose-200 hover:border-rose-400",
    text: "text-rose-900",
    badge: "bg-rose-100 text-rose-900 border-rose-300",
    icon: "🔴",
  },
};

export const BranchPerformanceSection: React.FC<BranchPerformanceSectionProps> = ({
  branches,
  loading,
  onSelectBranch,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Sort branches to ensure order: Ngành Đồng (Vàng) -> Ngành Thiếu (Xanh) -> Ngành Thanh (Đỏ)
  const orderedBranches = [...branches].sort((a, b) => {
    const order = ["Ngành Đồng", "Ngành Thiếu", "Ngành Thanh"];
    const idxA = order.findIndex((o) => a.branchName.includes(o.replace("Ngành ", "")));
    const idxB = order.findIndex((o) => b.branchName.includes(o.replace("Ngành ", "")));
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100/80 rounded-2xl text-amber-700">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">🏆 Hiệu Quả Hoạt Động Theo Ngành</h2>
            <p className="text-xs text-slate-500 font-medium">So sánh Chuyên cần, Điểm số & Health Score giữa 3 Ngành</p>
          </div>
        </div>
      </div>

      {/* 3 Ngành Cards (Vàng -> Xanh -> Đỏ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {orderedBranches.map((b) => {
          const theme =
            branchThemeMap[b.branchName] ||
            (b.branchName.includes("Đồng")
              ? branchThemeMap["Ngành Đồng"]
              : b.branchName.includes("Thiếu")
              ? branchThemeMap["Ngành Thiếu"]
              : branchThemeMap["Ngành Thanh"]);

          return (
            <div
              key={b.branchName}
              onClick={() => onSelectBranch && onSelectBranch(b.branchName)}
              className={`group relative ${theme.bg} p-5 rounded-3xl border ${theme.border} transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{theme.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {b.branchName}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Level {b.level} • {b.totalMembers} em
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400">Health Score</div>
                  <div
                    className={`text-xl font-black ${
                      b.healthScore >= 85
                        ? "text-emerald-600"
                        : b.healthScore >= 70
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {b.healthScore} <span className="text-xs font-medium text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-200/80 text-center my-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Chuyên cần</span>
                  <span className="text-sm font-black text-slate-800">{b.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Điểm TB</span>
                  <span className="text-sm font-black text-slate-800">{b.averageScore}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Hoạt động</span>
                  <span className="text-sm font-black text-slate-800">{b.activityRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{b.riskCount} em cần chú ý</span>
                </span>
                <span className="text-blue-600 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                  Chi tiết <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3.5">Hạng</th>
              <th scope="col" className="px-4 py-3.5">Tên Ngành</th>
              <th scope="col" className="px-4 py-3.5 text-center">Đoàn sinh</th>
              <th scope="col" className="px-4 py-3.5 text-center">Chuyên cần</th>
              <th scope="col" className="px-4 py-3.5 text-center">Điểm số TB</th>
              <th scope="col" className="px-4 py-3.5 text-center">Hoạt động</th>
              <th scope="col" className="px-4 py-3.5 text-center">Cảnh báo</th>
              <th scope="col" className="px-4 py-3.5 text-right">Health Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderedBranches.map((b) => {
              const theme =
                branchThemeMap[b.branchName] ||
                (b.branchName.includes("Đồng")
                  ? branchThemeMap["Ngành Đồng"]
                  : b.branchName.includes("Thiếu")
                  ? branchThemeMap["Ngành Thiếu"]
                  : branchThemeMap["Ngành Thanh"]);

              return (
                <tr key={b.branchName} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-black text-slate-900">{b.medal} #{b.rank}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{theme.icon}</span>
                    <span>{b.branchName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{b.totalMembers} em</td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.attendanceRate >= 90
                          ? "bg-emerald-100 text-emerald-800"
                          : b.attendanceRate >= 80
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">{b.averageScore}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{b.activityRate}%</td>
                  <td className="px-4 py-3.5 text-center font-bold text-rose-600">{b.riskCount}</td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900 text-base">{b.healthScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
