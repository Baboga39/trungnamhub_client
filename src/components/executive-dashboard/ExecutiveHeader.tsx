import React from "react";
import { Shield, Filter, Calendar, Layers } from "lucide-react";

interface ExecutiveHeaderProps {
  year: number;
  quarter: number;
  branch: string;
  userRole?: string;
  userBranch?: string;
  onYearChange: (y: number) => void;
  onQuarterChange: (q: number) => void;
  onBranchChange: (b: string) => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  year,
  quarter,
  branch,
  userRole,
  userBranch,
  onYearChange,
  onQuarterChange,
  onBranchChange,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];
  const quarterOptions = [
    { value: 1, label: "Quý I" },
    { value: 2, label: "Quý II" },
    { value: 3, label: "Quý III" },
    { value: 4, label: "Quý IV" },
  ];

  const branchOptions = [
    { value: "all", label: "Tất cả các ngành" },
    { value: "Ngành Thanh", label: "Ngành Thanh" },
    { value: "Ngành Thiếu", label: "Ngành Thiếu" },
    { value: "Ngành Đồng", label: "Ngành Đồng" },
  ];

  const isAdmin = userRole === "admin";

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl mb-6 border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Executive Cockpit
            </span>
            <span className="text-xs text-slate-300">Trung Nam</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Executive Dashboard — Quý Trưởng Đoàn
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Hệ thống giám sát điều hành toàn diện Chuyên cần, Điểm số, Hoạt động & Cảnh báo Nguy cơ
          </p>
        </div>

        {/* Global Filters */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Bộ lọc:</span>
          </div>

          {/* Year Select */}
          <div className="relative">
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-slate-800/90 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer pr-8 appearance-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Quarter Select */}
          <div className="relative">
            <select
              value={quarter}
              onChange={(e) => onQuarterChange(Number(e.target.value))}
              className="bg-slate-800/90 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer pr-8 appearance-none"
            >
              {quarterOptions.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Branch Select */}
          <div className="relative">
            <select
              value={isAdmin ? branch : userBranch || branch}
              disabled={!isAdmin}
              onChange={(e) => onBranchChange(e.target.value)}
              className="bg-slate-800/90 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer pr-8 appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {branchOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
