import React from "react";
import { SlidersHorizontal, ChevronDown, BarChart3, ShieldCheck } from "lucide-react";

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

const FilterSelect = ({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  disabled?: boolean;
}) => (
  <div className="relative">
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="
        appearance-none bg-slate-50 text-slate-800 text-xs font-semibold
        rounded-xl pl-3.5 pr-8 py-2 border border-slate-200
        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
        hover:bg-slate-100/80 transition-colors duration-150
        disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm
      "
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-white text-slate-800">
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

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
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: y,
    label: `Năm ${y}`,
  }));
  const quarterOptions = [
    { value: 1, label: "Quý I" },
    { value: 2, label: "Quý II" },
    { value: 3, label: "Quý III" },
    { value: 4, label: "Quý IV" },
  ];

  // 3 Ngành theo màu vàng, xanh, đỏ: Đồng (Vàng) -> Thiếu (Xanh) -> Thanh (Đỏ)
  const branchOptions = [
    { value: "all", label: "Tất cả các ngành" },
    { value: "Ngành Đồng", label: "🟡 Ngành Đồng" },
    { value: "Ngành Thiếu", label: "🔵 Ngành Thiếu" },
    { value: "Ngành Thanh", label: "🔴 Ngành Thanh" },
  ];

  const isAdmin = userRole === "admin";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left header info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                EXECUTIVE DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-medium">• Trung Nam</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bảng Điều Hành Quý Trưởng Đoàn
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
              Giám sát toàn diện Chuyên cần, Điểm số, Hoạt động & Cảnh báo Nguy cơ
            </p>
          </div>
        </div>

        {/* Global Filter Toolbar */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Bộ lọc:</span>
          </div>

          <FilterSelect
            value={year}
            onChange={(v) => onYearChange(Number(v))}
            options={yearOptions}
          />
          <FilterSelect
            value={quarter}
            onChange={(v) => onQuarterChange(Number(v))}
            options={quarterOptions}
          />
          <FilterSelect
            value={isAdmin ? branch : userBranch || branch}
            onChange={onBranchChange}
            options={branchOptions}
            disabled={!isAdmin}
          />
        </div>
      </div>
    </div>
  );
};
