import React, { useState } from "react";
import { Award, UserCheck, Flame, Star, ChevronRight } from "lucide-react";
import { ExecutiveTopMember } from "@/types/executiveDashboard";

interface TopMembersSectionProps {
  members: ExecutiveTopMember[];
  loading: boolean;
  onSortChange: (sortBy: "overall" | "score" | "attendance" | "activity") => void;
  currentSort: string;
}

export const TopMembersSection: React.FC<TopMembersSectionProps> = ({
  members,
  loading,
  onSortChange,
  currentSort,
}) => {
  const tabs = [
    { key: "overall", label: "Tổng hợp Official", icon: Star },
    { key: "score", label: "Điểm số Đánh giá", icon: Award },
    { key: "attendance", label: "Chuyên cần", icon: UserCheck },
    { key: "activity", label: "Hoạt động", icon: Flame },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">🏆 Top 10 Đoàn sinh Xuất sắc</h2>
            <p className="text-xs text-slate-500">Bảng vinh danh thành tích theo công thức tính điểm chính thức</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSort === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSortChange(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Chưa có dữ liệu đoàn sinh trong khoảng thời gian này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-center">Thứ hạng</th>
                <th scope="col" className="px-4 py-3">Họ và tên Đoàn sinh</th>
                <th scope="col" className="px-4 py-3">Ngành</th>
                <th scope="col" className="px-4 py-3 text-center">Chuyên cần</th>
                <th scope="col" className="px-4 py-3 text-center">Điểm số</th>
                <th scope="col" className="px-4 py-3 text-center">Hoạt động</th>
                <th scope="col" className="px-4 py-3 text-right">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-center font-bold text-base">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-black">
                      {m.medal}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.parish}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {m.branch}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-emerald-600">
                    {m.attendanceRate}%
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-indigo-600">
                    {m.score}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-purple-600">
                    {m.activityRate}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900 text-base">
                    {m.overallScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
