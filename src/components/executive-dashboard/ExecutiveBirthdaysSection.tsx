import React, { useState, useMemo } from "react";
import {
  Cake,
  Gift,
  PartyPopper,
  Calendar,
  Sparkles,
  Search,
  UserCheck,
  Users,
  Shield,
  X,
} from "lucide-react";
import {
  ExecutiveBirthdaysData,
  ExecutiveBirthdayMember,
} from "@/types/executiveDashboard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ExecutiveBirthdaysSectionProps {
  data: ExecutiveBirthdaysData | null;
  loading: boolean;
  quarter: number;
  year: number;
  branch: string;
}

export const ExecutiveBirthdaysSection: React.FC<ExecutiveBirthdaysSectionProps> = ({
  data,
  loading,
  quarter,
  year,
  branch,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "LEADERS" | "MEMBERS">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allMembers: ExecutiveBirthdayMember[] = data?.members || [];
  const quarterMonths: number[] = data?.quarterMonths || [
    (quarter - 1) * 3 + 1,
    (quarter - 1) * 3 + 2,
    (quarter - 1) * 3 + 3,
  ];

  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      // Month filter
      if (selectedMonth !== "ALL" && m.birthMonth !== selectedMonth) {
        return false;
      }
      // Role filter
      if (roleFilter === "LEADERS" && !m.isLeader) {
        return false;
      }
      if (roleFilter === "MEMBERS" && m.isLeader) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = m.fullName.toLowerCase().includes(query);
        const matchParish = (m.parish || "").toLowerCase().includes(query);
        const matchChurch = (m.church || "").toLowerCase().includes(query);
        const matchGroup = (m.group || "").toLowerCase().includes(query);
        const matchBranch = (m.branch || "").toLowerCase().includes(query);
        if (!matchName && !matchParish && !matchChurch && !matchGroup && !matchBranch) {
          return false;
        }
      }
      return true;
    });
  }, [allMembers, selectedMonth, roleFilter, searchQuery]);

  const todayCount = data?.todayCount || allMembers.filter((m) => m.isToday).length;
  const leaderCount = data?.leaderCount ?? allMembers.filter((m) => m.isLeader).length;
  const memberCount = data?.memberCount ?? allMembers.filter((m) => !m.isLeader).length;

  const getBranchBadge = (bName?: string) => {
    const raw = (bName || "").toLowerCase();
    if (raw.includes("đồng")) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-semibold">
          🟡 Ngành Đồng
        </Badge>
      );
    }
    if (raw.includes("thiếu")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-semibold">
          🔵 Ngành Thiếu
        </Badge>
      );
    }
    if (raw.includes("thanh")) {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-semibold">
          🔴 Ngành Thanh
        </Badge>
      );
    }
    return (
      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-semibold">
        🛡️ Ban Quản Trị
      </Badge>
    );
  };

  const getBranchTitle = () => {
    if (!branch || branch === "all") return "Toàn Gia Đình Hưng Đạo";
    return `Ngành ${branch}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm animate-pulse mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl"></div>
            <div>
              <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-64"></div>
            </div>
          </div>
          <div className="h-8 bg-slate-100 rounded-full w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-pink-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
      {/* ──────────────── Header ──────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-pink-100/70">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white rounded-2xl shadow-md shadow-pink-200 flex-shrink-0">
            <Cake className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                🎂 Sinh Nhật Quý {quarter} / {year}
              </h2>
              <Badge className="bg-pink-100/90 text-pink-700 border-pink-200 text-xs font-bold">
                {getBranchTitle()}
              </Badge>
              {todayCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse shadow-xs">
                  <PartyPopper className="w-3.5 h-3.5" />
                  {todayCount} sinh nhật hôm nay!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Mừng tuổi mới quý Trưởng và các Đoàn sinh đang hoạt động tích cực
            </p>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <Badge
            variant="outline"
            className="bg-pink-50/70 border-pink-200 text-pink-800 font-bold px-3 py-1.5 rounded-xl text-xs gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>{allMembers.length} thành viên</span>
            <span className="text-pink-300">•</span>
            <span className="font-medium text-slate-600">{memberCount} đoàn sinh</span>
            <span className="text-pink-300">•</span>
            <span className="font-semibold text-indigo-600">{leaderCount} Trưởng</span>
          </Badge>
        </div>
      </div>

      {/* ──────────────── Filters & Controls ──────────────── */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
        {/* Month Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedMonth("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedMonth === "ALL"
                ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
            }`}
          >
            Tất cả Quý ({allMembers.length})
          </button>
          {quarterMonths.map((m) => {
            const count = allMembers.filter((item) => item.birthMonth === m).length;
            const isCurrentMonthNow = m === currentMonth;
            const isSelected = selectedMonth === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                    : isCurrentMonthNow
                    ? "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                <span>Tháng {m}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : isCurrentMonthNow
                      ? "bg-pink-200 text-pink-800"
                      : "bg-white text-slate-500 shadow-2xs"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role & Search Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                roleFilter === "ALL"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setRoleFilter("MEMBERS")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                roleFilter === "MEMBERS"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Đoàn sinh</span>
            </button>
            <button
              onClick={() => setRoleFilter("LEADERS")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                roleFilter === "LEADERS"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Quý Trưởng</span>
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[160px] sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────── Member Birthday Cards ──────────────── */}
      <div className="mt-5">
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMembers.map((member) => {
              const [dayStr, monthStr] = member.formattedDate.split("/");
              return (
                <div
                  key={member.id}
                  className={`relative p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between gap-3 ${
                    member.isToday
                      ? "border-rose-400 bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-white ring-2 ring-rose-400/30 shadow-sm"
                      : member.isLeader
                      ? "border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-white hover:border-indigo-300 shadow-2xs"
                      : member.isThisMonth
                      ? "border-pink-200/90 bg-white hover:border-pink-300 shadow-2xs"
                      : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Left: Date Avatar Badge */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 transition-transform ${
                        member.isToday
                          ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 animate-pulse"
                          : member.isLeader
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-100"
                          : member.isThisMonth
                          ? "bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {member.isToday ? (
                        <>
                          <PartyPopper className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] leading-none uppercase tracking-wider font-extrabold">Hôm nay</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base leading-none font-black">{dayStr}</span>
                          <span className={`text-[10px] font-bold leading-tight mt-0.5 ${
                            member.isLeader || member.isThisMonth ? "text-pink-100" : "text-slate-400"
                          }`}>
                            Th.{monthStr}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 truncate">
                          {member.fullName}
                        </span>
                        {member.isLeader && (
                          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] font-bold px-1.5 py-0">
                            {member.role || "Trưởng"}
                          </Badge>
                        )}
                        {member.isToday && (
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-2xs">
                            🎉 Sinh nhật
                          </span>
                        )}
                      </div>

                      {/* Sub-info: Branch, Parish, Group */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
                        {getBranchBadge(member.branch)}

                        {member.parish && !member.isLeader && (
                          <span className="text-slate-500 text-[11px] font-medium truncate">
                            {member.parish}
                          </span>
                        )}

                        {member.group && !member.isLeader && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 text-[11px] font-medium truncate">
                              {member.group}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Age Milestone */}
                  <div className="text-right shrink-0 pl-1">
                    {member.age !== null && member.age > 0 ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                          {member.age} tuổi
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Sinh năm {member.birthYear}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{member.formattedDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-slate-50/60 border border-dashed border-pink-200 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-pink-200 rounded-full blur-lg opacity-50" />
              <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-pink-100">
                <Gift className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {searchQuery
                ? `Không tìm thấy thành viên nào khớp với "${searchQuery}"`
                : selectedMonth !== "ALL"
                ? `Không có sinh nhật nào trong Tháng ${selectedMonth}`
                : `Không có sinh nhật nào trong Quý ${quarter}`}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm"
                : `Không có đoàn sinh hay Trưởng nào của ${getBranchTitle()} có ngày sinh trong khoảng thời gian này.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 transition-colors"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
