import React, { useState } from "react";
import { AlertTriangle, ChevronRight, X, Info } from "lucide-react";
import { ExecutiveRiskMember } from "@/types/executiveDashboard";

interface RiskCenterSectionProps {
  riskMembers: ExecutiveRiskMember[];
  loading: boolean;
  onMemberClick?: (memberId: number) => void;
}

export const RiskCenterSection: React.FC<RiskCenterSectionProps> = ({
  riskMembers,
  loading,
  onMemberClick,
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const highRisks = riskMembers.filter((m) => m.riskLevel === "high");
  const mediumRisks = riskMembers.filter((m) => m.riskLevel === "medium");
  const lowRisks = riskMembers.filter((m) => m.riskLevel === "low");

  const filteredMembers =
    selectedRiskFilter === "all"
      ? riskMembers
      : riskMembers.filter((m) => m.riskLevel === selectedRiskFilter);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-rose-200/70 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-100/80 rounded-2xl text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">🚨 Trung Tâm Cảnh Báo Nguy Cơ</h2>
            <p className="text-xs text-slate-500 font-medium">
              Phát hiện tự động các Đoàn sinh vắng nhiều buổi hoặc có điểm số sụt giảm
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-4 py-2 rounded-2xl border border-rose-200 transition-colors shadow-2xs"
        >
          <span>Xem tất cả ({riskMembers.length} em)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Risk Badge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* High Risk Card */}
        <div
          onClick={() => {
            setSelectedRiskFilter("high");
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-br from-rose-50 to-red-50/80 p-4 rounded-2xl border border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              🔴 NGUY CƠ CAO (HIGH)
            </span>
            <span className="text-2xl font-black text-rose-900">{highRisks.length}</span>
          </div>
          <p className="text-[11px] text-rose-700/90 font-medium mt-1">Cần liên hệ gia đình gấp</p>
        </div>

        {/* Medium Risk Card */}
        <div
          onClick={() => {
            setSelectedRiskFilter("medium");
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 rounded-2xl border border-amber-200 hover:border-amber-400 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              🟠 NGUY CƠ TRUNG BÌNH
            </span>
            <span className="text-2xl font-black text-amber-900">{mediumRisks.length}</span>
          </div>
          <p className="text-[11px] text-amber-700/90 font-medium mt-1">Cần nhắc nhở và theo dõi thêm</p>
        </div>

        {/* Low Risk Card */}
        <div
          onClick={() => {
            setSelectedRiskFilter("low");
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-br from-yellow-50 to-amber-50/50 p-4 rounded-2xl border border-yellow-200 hover:border-yellow-400 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-yellow-900 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              🟡 NGUY CƠ THẤP (LOW)
            </span>
            <span className="text-2xl font-black text-yellow-900">{lowRisks.length}</span>
          </div>
          <p className="text-[11px] text-yellow-700/90 font-medium mt-1">Có dấu hiệu giảm sút nhẹ</p>
        </div>
      </div>

      {/* Top 3 Risk Snippet */}
      {riskMembers.length > 0 && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
          <div className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-slate-100/80 border-b border-slate-200 flex justify-between">
            <span>Danh sách Nguy cơ Cao nhất ({Math.min(3, riskMembers.length)} em)</span>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
              Bấm để xem tất cả
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {riskMembers.slice(0, 3).map((m) => (
              <div
                key={m.id}
                onClick={() => onMemberClick && onMemberClick(m.id)}
                className="p-3.5 hover:bg-white transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{m.fullName}</span>
                    <span className="text-xs text-slate-500 font-medium">({m.branch})</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        m.riskLevel === "high"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : m.riskLevel === "medium"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      {m.riskLevel}
                    </span>
                  </div>
                  <div className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>{m.reasons.join(" • ")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600">Risk Score: {m.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill-down Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-lg text-white">
                  Danh sách Chi tiết Đoàn sinh Cảnh báo Nguy cơ
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filter Tabs */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
              {[
                { key: "all", label: `Tất cả (${riskMembers.length})` },
                { key: "high", label: `🔴 High (${highRisks.length})` },
                { key: "medium", label: `🟠 Medium (${mediumRisks.length})` },
                { key: "low", label: `🟡 Low (${lowRisks.length})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedRiskFilter(t.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedRiskFilter === t.key
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-medium">
                  Không có đoàn sinh nào trong nhóm này.
                </div>
              ) : (
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs uppercase bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-4 py-3">Họ và tên</th>
                      <th scope="col" className="px-4 py-3">Ngành</th>
                      <th scope="col" className="px-4 py-3 text-center">Vắng/Trễ</th>
                      <th scope="col" className="px-4 py-3 text-center">Điểm TB</th>
                      <th scope="col" className="px-4 py-3">Lý do Cảnh báo</th>
                      <th scope="col" className="px-4 py-3 text-right">Mức nguy cơ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-slate-900">{m.fullName}</div>
                          <div className="text-xs text-slate-400 font-medium">{m.parish}</div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-700">{m.branch}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-rose-600">
                          {m.absentCount} buổi
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                          {m.averageGrade !== null ? m.averageGrade : "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <ul className="list-disc list-inside space-y-0.5 text-rose-700 font-medium">
                            {m.reasons.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3.5 text-right font-black">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              m.riskLevel === "high"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : m.riskLevel === "medium"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {m.riskLevel.toUpperCase()} ({m.riskScore})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
