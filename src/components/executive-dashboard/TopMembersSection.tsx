import React from "react";
import { Award, UserCheck, Flame, Star } from "lucide-react";
import { ExecutiveTopMember } from "@/types/executiveDashboard";

interface TopMembersSectionProps {
  members: ExecutiveTopMember[];
  loading: boolean;
  onSortChange: (sortBy: "overall" | "score" | "attendance" | "activity") => void;
  currentSort: string;
}

// 3 Ngành theo màu vàng, xanh, đỏ: Đồng (Vàng) -> Thiếu (Xanh) -> Thanh (Đỏ)
const getBranchBadge = (branchName: string) => {
  if (branchName.includes("Đồng")) {
    return {
      className: "bg-amber-100/90 text-amber-900 border-amber-200",
      label: "🟡 Ngành Đồng",
    };
  }
  if (branchName.includes("Thiếu")) {
    return {
      className: "bg-blue-100/90 text-blue-900 border-blue-200",
      label: "🔵 Ngành Thiếu",
    };
  }
  if (branchName.includes("Thanh")) {
    return {
      className: "bg-rose-100/90 text-rose-900 border-rose-200",
      label: "🔴 Ngành Thanh",
    };
  }
  return {
    className: "bg-slate-100 text-slate-700 border-slate-200",
    label: branchName,
  };
};

export const TopMembersSection: React.FC<TopMembersSectionProps> = ({
  members,
  loading,
  onSortChange,
  currentSort,
}) => {
  const tabs = [
    { key: "overall", label: "Tổng điểm Bảng Vàng", icon: Star },
    { key: "score", label: "Điểm Thi đua", icon: Award },
    { key: "attendance", label: "Chuyên cần", icon: UserCheck },
    { key: "activity", label: "Hoạt động", icon: Flame },
  ];

  const maxOverallScore = Math.max(...members.map((m) => m.overallScore || 0), 100);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100/80 rounded-2xl text-amber-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">🏆 Bảng Vàng Đoàn Sinh Xuất Sắc</h2>
            <p className="text-xs text-slate-500 font-medium">Bảng xếp hạng thành tích tích lũy theo quý</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSort === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSortChange(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm font-medium">
          Chưa có dữ liệu đoàn sinh trong khoảng thời gian này.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-center">Hạng</th>
                <th scope="col" className="px-4 py-3.5">Họ và tên Đoàn sinh</th>
                <th scope="col" className="px-4 py-3.5">Ngành</th>
                <th scope="col" className="px-4 py-3.5 text-center">Chuyên cần</th>
                <th scope="col" className="px-4 py-3.5 text-center">Điểm số</th>
                <th scope="col" className="px-4 py-3.5 text-center">Hoạt động</th>
                <th scope="col" className="px-4 py-3.5 text-right">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m, idx) => {
                const branchBadge = getBranchBadge(m.branch);
                const rankNum = idx + 1;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;

                let rowBg = "hover:bg-slate-50/80";
                if (isTop1) rowBg = "bg-amber-50/60 hover:bg-amber-50 border-l-4 border-l-amber-500";
                else if (isTop2) rowBg = "bg-slate-50/90 hover:bg-slate-100/90 border-l-4 border-l-slate-400";
                else if (isTop3) rowBg = "bg-orange-50/40 hover:bg-orange-50/60 border-l-4 border-l-amber-700";

                const scorePercent = Math.min(100, Math.round((m.overallScore / maxOverallScore) * 100));

                return (
                  <tr key={m.id} className={`${rowBg} transition-colors`}>
                    <td className="px-4 py-3.5 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-2xs ${
                          isTop1
                            ? "bg-amber-400 text-amber-950"
                            : isTop2
                            ? "bg-slate-300 text-slate-900"
                            : isTop3
                            ? "bg-amber-800 text-amber-100"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.medal || `#${rankNum}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.parish || "Xứ đoàn Trung Nam"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${branchBadge.className}`}
                      >
                        {branchBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                      {m.attendanceRate}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-indigo-600">
                      {m.score}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-purple-600">
                      {m.activityRate}%
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-black text-slate-900 text-base">
                        {m.overallScore}
                      </div>
                      {/* Mini Progress Bar */}
                      <div className="w-20 ml-auto bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                          style={{ width: `${scorePercent}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
