import React from "react";
import { Trophy, Award, Activity, AlertCircle, ChevronRight } from "lucide-react";
import { BranchPerformance } from "@/types/executiveDashboard";

interface BranchPerformanceSectionProps {
  branches: BranchPerformance[];
  loading: boolean;
  onSelectBranch?: (branchName: string) => void;
}

export const BranchPerformanceSection: React.FC<BranchPerformanceSectionProps> = ({
  branches,
  loading,
  onSelectBranch,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">🏆 Xếp hạng & Hiệu quả giữa các Ngành</h2>
            <p className="text-xs text-slate-500">So sánh chỉ số tổng hợp Chuyên cần, Điểm số & Health Score giữa các Ngành</p>
          </div>
        </div>
      </div>

      {/* Top Branch Medal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {branches.map((b) => (
          <div
            key={b.branchName}
            onClick={() => onSelectBranch && onSelectBranch(b.branchName)}
            className="group relative bg-gradient-to-br from-slate-50 to-slate-100/80 hover:from-white hover:to-blue-50/50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{b.medal}</span>
                <div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {b.branchName}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">Level {b.level} • {b.totalMembers} đoàn sinh</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Health Score</div>
                <div className={`text-xl font-black ${b.healthScore >= 85 ? 'text-emerald-600' : b.healthScore >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {b.healthScore} <span className="text-xs font-normal">/ 100</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-200/60 text-center my-3">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Chuyên cần</span>
                <span className="text-sm font-bold text-slate-800">{b.attendanceRate}%</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Điểm số TB</span>
                <span className="text-sm font-bold text-slate-800">{b.averageScore}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Hoạt động</span>
                <span className="text-sm font-bold text-slate-800">{b.activityRate}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>{b.riskCount} đoàn sinh cần chú ý</span>
              </span>
              <span className="text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                Chi tiết <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs uppercase bg-slate-100/80 text-slate-700 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 rounded-l-xl">Hạng</th>
              <th scope="col" className="px-4 py-3">Tên Ngành</th>
              <th scope="col" className="px-4 py-3 text-center">Đoàn sinh</th>
              <th scope="col" className="px-4 py-3 text-center">Chuyên cần</th>
              <th scope="col" className="px-4 py-3 text-center">Điểm số TB</th>
              <th scope="col" className="px-4 py-3 text-center">Hoạt động</th>
              <th scope="col" className="px-4 py-3 text-center">Cảnh báo</th>
              <th scope="col" className="px-4 py-3 text-right rounded-r-xl">Health Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {branches.map((b) => (
              <tr key={b.branchName} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-bold text-slate-900">{b.medal} #{b.rank}</td>
                <td className="px-4 py-3.5 font-extrabold text-slate-900">{b.branchName}</td>
                <td className="px-4 py-3.5 text-center font-medium">{b.totalMembers} em</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.attendanceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : b.attendanceRate >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                    {b.attendanceRate}%
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center font-bold text-slate-800">{b.averageScore}</td>
                <td className="px-4 py-3.5 text-center font-medium text-slate-700">{b.activityRate}%</td>
                <td className="px-4 py-3.5 text-center font-bold text-rose-600">{b.riskCount}</td>
                <td className="px-4 py-3.5 text-right font-black text-slate-900 text-base">{b.healthScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
