"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  UserX,
  Clock,
  FileCheck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  HelpCircle,
  Check,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "../components/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useSelector, useDispatch } from "react-redux";
import { getAllAttendanceThunk } from "../features/attendance/attendanceThunks";
import { getMembersActive } from "../features/members/memberThunks";
import type { AppDispatch, RootState } from "../store/store";

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "unexcused"
  | "unrecorded";

interface AttendanceRecord {
  status: AttendanceStatus;
  note?: string;
  markedBy?: {
    id: number;
    name: string;
  } | null;
  member?: {
    id: number;
    name: string;
    church?: string;
    branch?: string;
  } | null;
}

interface MemberAttendance {
  id: number;
  name: string;
  branch?: string;
  status: AttendanceStatus;
  note: string;
  markedBy: {
    id: number;
    name: string;
  } | null;
  isHistoricalMember?: boolean;
  unrecordedReason?: string;
  [key: string]: any;
}

const BRANCHES = [
  { id: "all", name: "Tất cả 3 ngành", short: "Tất cả", color: "from-blue-600 to-indigo-600" },
  { id: "Đồng", name: "Ngành Đồng (Ấu)", short: "Đồng", color: "from-amber-500 to-yellow-600" },
  { id: "Thiếu", name: "Ngành Thiếu", short: "Thiếu", color: "from-sky-500 to-blue-600" },
  { id: "Thanh", name: "Ngành Thanh", short: "Thanh", color: "from-emerald-500 to-teal-600" },
];

const ALL_BRANCH_KEYS = ["Đồng", "Thiếu", "Thanh"] as const;

export default function AttendanceCalendarPage() {
  const currentUser = useSelector((state: any) => state.auth?.user);
  const { membersActive = [] } = useSelector((state: any) => state.members);
  const { list: attendanceList = [], loading: attendanceLoading } = useSelector(
    (state: RootState) => state.attendance,
  );

  const dispatch = useDispatch<AppDispatch>();

  // Determine user branch scope
  const userBranch = useMemo(() => {
    if (!currentUser) return null;
    const role = String(currentUser.role || "").toLowerCase();
    const branch = String(currentUser.branch || "").trim();
    if (role === "admin" || branch.toLowerCase() === "admin" || !branch) {
      return null;
    }
    return branch;
  }, [currentUser]);

  const isGlobalUser = !userBranch;

  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    return userBranch || "all";
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (userBranch) {
      setSelectedBranch(userBranch);
    }
  }, [userBranch]);

  useEffect(() => {
    dispatch(getAllAttendanceThunk());
    dispatch(getMembersActive());
  }, [dispatch]);

  /**
   * Helper to normalize branch names to Đồng, Thiếu, Thanh
   */
  const normalizeBranchName = (b?: string | null): "Đồng" | "Thiếu" | "Thanh" | "" => {
    if (!b) return "";
    const lower = b.trim().toLowerCase();
    if (lower.includes("đồng") || lower.includes("dong") || lower.includes("ấu") || lower.includes("au")) return "Đồng";
    if (lower.includes("thiếu") || lower.includes("thieu")) return "Thiếu";
    if (lower.includes("thanh")) return "Thanh";
    return "";
  };

  /**
   * Normalize date strings/objects to YYYY-MM-DD
   */
  const normalizeDate = (value: string | Date) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("/")) {
      const [day, month, year] = value.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return format(date, "yyyy-MM-dd");
  };

  /**
   * Active members grouped by branch
   */
  const membersByBranch = useMemo(() => {
    const dong: any[] = [];
    const thieu: any[] = [];
    const thanh: any[] = [];

    membersActive.forEach((m: any) => {
      const b = normalizeBranchName(m.branch);
      if (b === "Đồng") dong.push(m);
      else if (b === "Thiếu") thieu.push(m);
      else if (b === "Thanh") thanh.push(m);
    });

    return {
      Đồng: dong,
      Thiếu: thieu,
      Thanh: thanh,
      all: membersActive,
    };
  }, [membersActive]);

  /**
   * Group attendance records by Date + MemberId AND track recorded branches per date
   */
  const attendanceDataByDate = useMemo(() => {
    const recordsMap: Record<string, Record<number, AttendanceRecord>> = {};
    const branchesOnDateMap: Record<string, Set<string>> = {};

    attendanceList.forEach((record: any) => {
      const dateKey = normalizeDate(record.date);
      if (!dateKey || record.memberId == null) return;

      if (!recordsMap[dateKey]) {
        recordsMap[dateKey] = {};
        branchesOnDateMap[dateKey] = new Set<string>();
      }

      const rawBranch =
        record.branch ||
        record.member?.branch ||
        record.session?.branch;

      const normBranch = normalizeBranchName(rawBranch);
      if (normBranch) {
        branchesOnDateMap[dateKey].add(normBranch);
      }

      recordsMap[dateKey][Number(record.memberId)] = {
        status: record.status,
        note: record.note || "",
        member: record.member || null,
        markedBy: record.markedBy || null,
      };
    });

    return { recordsMap, branchesOnDateMap };
  }, [attendanceList]);

  /**
   * Map active members for fast lookup
   */
  const membersById = useMemo(() => {
    const map = new Map<number, any>();
    membersActive.forEach((member: any) => {
      map.set(Number(member.id), member);
    });
    return map;
  }, [membersActive]);

  /**
   * Days in current viewing month
   */
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  /**
   * Calculate day stats compared against Total Active Đoàn Sinh of branches that ACTUALLY took attendance
   */
  const dayStats = useMemo(() => {
    const stats: Record<
      string,
      {
        absent: number;
        late: number;
        excused: number;
        unexcused: number;
        present: number;
        totalActive: number;
        rate: number;
        hasRecords: boolean;
        recordedBranches: string[];
        unrecordedBranches: string[];
        branchStatus: {
          Đồng: { recorded: boolean; totalActive: number; present: number; absent: number; late: number; excused: number; unexcused: number };
          Thiếu: { recorded: boolean; totalActive: number; present: number; absent: number; late: number; excused: number; unexcused: number };
          Thanh: { recorded: boolean; totalActive: number; present: number; absent: number; late: number; excused: number; unexcused: number };
        };
      }
    > = {};

    daysInMonth.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const attendance = attendanceDataByDate.recordsMap[dateKey] || {};
      const branchesSet = attendanceDataByDate.branchesOnDateMap[dateKey] || new Set<string>();

      const recordedBranches = Array.from(branchesSet);
      const unrecordedBranches = ALL_BRANCH_KEYS.filter((b) => !branchesSet.has(b));

      // Calculate per branch breakdown for this date
      const branchStatus = {
        Đồng: { recorded: branchesSet.has("Đồng"), totalActive: membersByBranch["Đồng"].length, present: 0, absent: 0, late: 0, excused: 0, unexcused: 0 },
        Thiếu: { recorded: branchesSet.has("Thiếu"), totalActive: membersByBranch["Thiếu"].length, present: 0, absent: 0, late: 0, excused: 0, unexcused: 0 },
        Thanh: { recorded: branchesSet.has("Thanh"), totalActive: membersByBranch["Thanh"].length, present: 0, absent: 0, late: 0, excused: 0, unexcused: 0 },
      };

      Object.entries(attendance).forEach(([_, record]) => {
        const normB = normalizeBranchName(record.member?.branch);
        if (normB && branchStatus[normB]) {
          if (record.status === "absent") branchStatus[normB].absent++;
          else if (record.status === "late") branchStatus[normB].late++;
          else if (record.status === "excused") branchStatus[normB].excused++;
          else if (record.status === "unexcused") branchStatus[normB].unexcused++;
        }
      });

      ALL_BRANCH_KEYS.forEach((b) => {
        if (branchStatus[b].recorded) {
          branchStatus[b].present = Math.max(
            0,
            branchStatus[b].totalActive -
              branchStatus[b].absent -
              branchStatus[b].excused -
              branchStatus[b].unexcused,
          );
        }
      });

      // Overall calculations based on selectedBranch
      if (selectedBranch !== "all") {
        const normSelected = normalizeBranchName(selectedBranch) as "Đồng" | "Thiếu" | "Thanh";
        const bInfo = normSelected ? branchStatus[normSelected] : null;

        if (bInfo && bInfo.recorded) {
          const totalActive = bInfo.totalActive;
          const rate = totalActive > 0 ? Math.round((bInfo.present / totalActive) * 100) : 0;
          stats[dateKey] = {
            absent: bInfo.absent,
            late: bInfo.late,
            excused: bInfo.excused,
            unexcused: bInfo.unexcused,
            present: bInfo.present,
            totalActive,
            rate,
            hasRecords: true,
            recordedBranches: [normSelected],
            unrecordedBranches: [],
            branchStatus,
          };
        } else {
          stats[dateKey] = {
            absent: 0,
            late: 0,
            excused: 0,
            unexcused: 0,
            present: 0,
            totalActive: bInfo?.totalActive || 0,
            rate: 0,
            hasRecords: false,
            recordedBranches: [],
            unrecordedBranches: normSelected ? [normSelected] : [],
            branchStatus,
          };
        }
      } else {
        // "all" branches:
        const hasRecords = recordedBranches.length > 0;

        if (hasRecords) {
          // Total active ONLY for branches that took attendance!
          let totalActive = 0;
          let absent = 0;
          let late = 0;
          let excused = 0;
          let unexcused = 0;
          let present = 0;

          recordedBranches.forEach((b) => {
            const bNorm = b as "Đồng" | "Thiếu" | "Thanh";
            if (branchStatus[bNorm]) {
              totalActive += branchStatus[bNorm].totalActive;
              absent += branchStatus[bNorm].absent;
              late += branchStatus[bNorm].late;
              excused += branchStatus[bNorm].excused;
              unexcused += branchStatus[bNorm].unexcused;
              present += branchStatus[bNorm].present;
            }
          });

          const rate = totalActive > 0 ? Math.round((present / totalActive) * 100) : 0;

          stats[dateKey] = {
            absent,
            late,
            excused,
            unexcused,
            present,
            totalActive,
            rate,
            hasRecords: true,
            recordedBranches,
            unrecordedBranches,
            branchStatus,
          };
        } else {
          stats[dateKey] = {
            absent: 0,
            late: 0,
            excused: 0,
            unexcused: 0,
            present: 0,
            totalActive: membersActive.length,
            rate: 0,
            hasRecords: false,
            recordedBranches: [],
            unrecordedBranches: [...ALL_BRANCH_KEYS],
            branchStatus,
          };
        }
      }
    });

    return stats;
  }, [daysInMonth, attendanceDataByDate, membersByBranch, selectedBranch, membersActive]);

  /**
   * Selected date detail stats
   */
  const selectedDateStats = useMemo(() => {
    if (!selectedDate) return null;

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dStat = dayStats[dateKey];
    const attendanceForDate = attendanceDataByDate.recordsMap[dateKey] || {};
    const recordedBranches = dStat?.recordedBranches || [];
    const unrecordedBranches = dStat?.unrecordedBranches || [];

    // Target branches depending on selectedBranch filter
    const activeTargetBranches =
      selectedBranch === "all"
        ? ALL_BRANCH_KEYS
        : [normalizeBranchName(selectedBranch)].filter(Boolean);

    // List of active members in target scope
    const targetActiveMembers: any[] = [];
    activeTargetBranches.forEach((b) => {
      const bKey = b as "Đồng" | "Thiếu" | "Thanh";
      if (membersByBranch[bKey]) {
        targetActiveMembers.push(...membersByBranch[bKey]);
      }
    });

    // 1. Members with historical or explicit attendance record
    const attendanceMemberIds = new Set<number>();
    const attendanceMembers: MemberAttendance[] = [];

    Object.entries(attendanceForDate).forEach(([memberIdStr, attendance]) => {
      const id = Number(memberIdStr);
      attendanceMemberIds.add(id);

      const member = membersById.get(id);
      const memberBranch = normalizeBranchName(member?.branch || attendance.member?.branch);

      // Filter by selected branch
      if (selectedBranch !== "all" && memberBranch !== normalizeBranchName(selectedBranch)) {
        return;
      }

      if (member) {
        attendanceMembers.push({
          ...member,
          id,
          branch: member.branch || attendance.member?.branch,
          status: attendance.status,
          note: attendance.note || "",
          markedBy: attendance.markedBy || null,
        });
      } else {
        attendanceMembers.push({
          id,
          name: attendance.member?.name || "Đoàn sinh",
          branch: attendance.member?.branch || "",
          status: attendance.status,
          note: attendance.note || "",
          markedBy: attendance.markedBy || null,
          isHistoricalMember: true,
        });
      }
    });

    // 2. Active members without records:
    // If their branch TOOK attendance on this date -> status = "present"
    // If their branch DID NOT TAKE attendance -> status = "unrecorded"
    const remainingActiveMembers: MemberAttendance[] = [];

    targetActiveMembers.forEach((member: any) => {
      if (attendanceMemberIds.has(Number(member.id))) return;

      const mBranch = normalizeBranchName(member.branch);
      const branchTookAttendance = recordedBranches.includes(mBranch);

      if (branchTookAttendance) {
        remainingActiveMembers.push({
          ...member,
          id: Number(member.id),
          branch: member.branch,
          status: "present" as AttendanceStatus,
          note: "",
          markedBy: null,
        });
      } else {
        remainingActiveMembers.push({
          ...member,
          id: Number(member.id),
          branch: member.branch,
          status: "unrecorded" as AttendanceStatus,
          note: "Ngành chưa thực hiện điểm danh buổi này",
          markedBy: null,
          unrecordedReason: `Ngành ${mBranch} chưa ghi nhận điểm danh`,
        });
      }
    });

    const allMembersList = [...attendanceMembers, ...remainingActiveMembers];

    const presentList = allMembersList.filter((m) => m.status === "present");
    const absentList = allMembersList.filter((m) => m.status === "absent");
    const lateList = allMembersList.filter((m) => m.status === "late");
    const excusedList = allMembersList.filter((m) => m.status === "excused");
    const unexcusedList = allMembersList.filter((m) => m.status === "unexcused");
    const unrecordedList = allMembersList.filter((m) => m.status === "unrecorded");

    return {
      date: selectedDate,
      dateKey,
      dStat,
      members: allMembersList,
      counts: {
        present: presentList.length,
        absent: absentList.length,
        late: lateList.length,
        excused: excusedList.length,
        unexcused: unexcusedList.length,
        unrecorded: unrecordedList.length,
        totalActiveParticipating: dStat?.totalActive || 0,
        rate: dStat?.rate || 0,
      },
    };
  }, [
    selectedDate,
    dayStats,
    attendanceDataByDate,
    membersById,
    membersByBranch,
    selectedBranch,
  ]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextMonth();
    if (distance < -minSwipeDistance) handlePrevMonth();
  };

  const handlePrevMonth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
      );
      setIsTransitioning(false);
    }, 150);
  };

  const handleNextMonth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
      );
      setIsTransitioning(false);
    }, 150);
  };

  const handleJumpToToday = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(new Date());
      setIsTransitioning(false);
    }, 150);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDialog(true);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "absent":
        return "bg-red-100 text-red-700 border-red-300";
      case "late":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "excused":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "unexcused":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "unrecorded":
        return "bg-slate-100 text-slate-600 border-slate-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "Có mặt";
      case "absent":
        return "Vắng";
      case "late":
        return "Đi trễ";
      case "excused":
        return "Có phép";
      case "unexcused":
        return "Không phép";
      case "unrecorded":
        return "Chưa điểm danh";
      default:
        return "";
    }
  };

  const getBranchBadgeStyle = (branchName?: string) => {
    const b = normalizeBranchName(branchName);
    if (b === "Đồng") return "bg-amber-100 text-amber-800 border-amber-300";
    if (b === "Thiếu") return "bg-sky-100 text-sky-800 border-sky-300";
    if (b === "Thanh") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn pb-10">
        {/* =====================================================
            HEADER & BRANCH SELECTOR
        ===================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tổng Quan Điểm Danh
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  So sánh & theo dõi điểm danh theo tổng đoàn sinh active theo từng ngành
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleJumpToToday}
              className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Hôm nay
            </Button>
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 px-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Phạm vi ngành:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {BRANCHES.map((b) => {
              if (!isGlobalUser && userBranch && b.id !== "all" && b.id !== userBranch) {
                return null;
              }
              if (!isGlobalUser && userBranch && b.id === "all") {
                return null;
              }

              const isSelected = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border-2 ${
                    isSelected
                      ? `bg-gradient-to-r ${b.color} text-white border-transparent shadow-md scale-105`
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  {b.name}
                  {b.id === "all" && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/20 text-xs">
                      {membersActive.length}
                    </span>
                  )}
                  {b.id === "Đồng" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${isSelected ? "bg-white/20" : "bg-amber-100 text-amber-800"}`}>
                      {membersByBranch["Đồng"].length}
                    </span>
                  )}
                  {b.id === "Thiếu" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${isSelected ? "bg-white/20" : "bg-sky-100 text-sky-800"}`}>
                      {membersByBranch["Thiếu"].length}
                    </span>
                  )}
                  {b.id === "Thanh" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${isSelected ? "bg-white/20" : "bg-emerald-100 text-emerald-800"}`}>
                      {membersByBranch["Thanh"].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              Tổng active: <strong>{selectedBranch === "all" ? membersActive.length : (membersByBranch[selectedBranch as "Đồng" | "Thiếu" | "Thanh"]?.length || 0)}</strong> đoàn sinh
            </span>
          </div>
        </div>

        {/* =====================================================
            CALENDAR CARD
        ===================================================== */}
        <Card className="border-2 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: vi })}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Nhấp vào ngày để xem chi tiết • Phân biệt rõ ngành nào đã điểm danh và ngành nào chưa điểm danh
                  </CardDescription>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-9 w-9 rounded-xl border-2 hover:bg-gray-100 active:scale-95 transition-all bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-9 w-9 rounded-xl border-2 hover:bg-gray-100 active:scale-95 transition-all bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent
            className="p-3 sm:p-5"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={`transition-opacity duration-150 ${
                isTransitioning ? "opacity-50" : "opacity-100"
              }`}
            >
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-center text-xs sm:text-sm font-bold py-2 rounded-lg ${
                      idx === 0
                        ? "text-red-500 bg-red-50/50"
                        : "text-gray-600 bg-gray-50"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {paddingDays.map((_, index) => (
                  <div
                    key={`padding-${index}`}
                    className="aspect-[4/3] sm:aspect-square rounded-xl bg-gray-50/40 border border-transparent"
                  />
                ))}

                {daysInMonth.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const stats = dayStats[dateKey];
                  const hasAttendance = stats.hasRecords;
                  const isCurrentDay = isToday(day);

                  const hasIssues =
                    stats.absent > 0 ||
                    stats.late > 0 ||
                    stats.excused > 0 ||
                    stats.unexcused > 0;

                  const hasPartialBranches =
                    selectedBranch === "all" &&
                    hasAttendance &&
                    stats.unrecordedBranches.length > 0;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-[4/3] sm:aspect-square p-1.5 sm:p-2 rounded-xl border-2 transition-all duration-200 text-left
                        hover:scale-[1.02] hover:shadow-md relative flex flex-col justify-between
                        ${
                          isCurrentDay
                            ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-indigo-300"
                        }
                        ${
                          hasAttendance && !hasIssues && !hasPartialBranches
                            ? "bg-emerald-50/70 border-emerald-300"
                            : ""
                        }
                        ${
                          hasAttendance && (hasIssues || hasPartialBranches)
                            ? "bg-amber-50/50 border-amber-300"
                            : ""
                        }
                        ${!hasAttendance ? "bg-white hover:bg-slate-50" : ""}
                      `}
                    >
                      {/* Day number & presence indicator */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            isCurrentDay
                              ? "text-blue-600"
                              : hasAttendance
                                ? hasIssues || hasPartialBranches
                                  ? "text-amber-900"
                                  : "text-emerald-800"
                                : "text-gray-700"
                          }`}
                        >
                          {format(day, "d")}
                        </span>

                        {hasAttendance && (
                          <span
                            className={`text-[9px] sm:text-[11px] font-bold px-1 sm:px-1.5 py-0.2 rounded-md ${
                              stats.rate >= 90
                                ? "bg-emerald-500 text-white"
                                : stats.rate >= 75
                                  ? "bg-blue-500 text-white"
                                  : "bg-amber-500 text-white"
                            }`}
                          >
                            {stats.present}/{stats.totalActive}
                          </span>
                        )}
                      </div>

                      {/* Desktop tags */}
                      {hasAttendance && (
                        <div className="hidden sm:flex flex-col gap-0.5 mt-1 w-full">
                          {/* Branch tags when viewing all branches */}
                          {selectedBranch === "all" && (
                            <div className="flex flex-wrap gap-0.5">
                              {stats.recordedBranches.map((b) => (
                                <span
                                  key={b}
                                  className={`text-[9px] font-extrabold px-1 rounded border ${getBranchBadgeStyle(b)}`}
                                >
                                  {b}: ✓
                                </span>
                              ))}
                              {stats.unrecordedBranches.map((b) => (
                                <span
                                  key={b}
                                  className="text-[9px] font-semibold px-1 rounded bg-slate-100 text-slate-500 border border-slate-300 line-through"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          )}

                          {stats.absent > 0 && (
                            <div className="text-[10px] bg-red-500 text-white rounded px-1 py-0.5 font-semibold truncate">
                              {stats.absent} vắng
                            </div>
                          )}

                          {stats.late > 0 && (
                            <div className="text-[10px] bg-amber-500 text-white rounded px-1 py-0.5 font-semibold truncate">
                              {stats.late} trễ
                            </div>
                          )}

                          {stats.excused > 0 && (
                            <div className="text-[10px] bg-blue-500 text-white rounded px-1 py-0.5 font-semibold truncate">
                              {stats.excused} phép
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mobile indicators */}
                      {hasAttendance && (
                        <div className="flex sm:hidden gap-1 justify-center mt-auto">
                          {stats.absent > 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                          {stats.late > 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          )}
                          {stats.excused > 0 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          )}
                          {hasPartialBranches && (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          )}
                          {!hasIssues && !hasPartialBranches && (
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            DETAIL DIALOG
        ===================================================== */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
            {selectedDateStats && (
              <>
                <DialogHeader className="pb-3 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-indigo-600" />
                        Điểm danh ngày{" "}
                        {format(selectedDateStats.date, "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium text-gray-600 mt-1 capitalize">
                        {format(selectedDateStats.date, "EEEE", { locale: vi })} •{" "}
                        {selectedBranch === "all"
                          ? "Tất cả 3 ngành"
                          : `Ngành ${selectedBranch}`}
                      </DialogDescription>
                    </div>

                    <Badge
                      className={`text-sm px-3 py-1 font-bold rounded-full ${
                        selectedDateStats.counts.rate >= 90
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : selectedDateStats.counts.rate >= 75
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      Tỷ lệ có mặt: {selectedDateStats.counts.rate}%
                    </Badge>
                  </div>
                </DialogHeader>

                {/* =================================================
                    BRANCH PARTICIPATION STATUS BANNER
                ================================================= */}
                {selectedBranch === "all" && (
                  <div className="my-3">
                    <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                      Tình trạng điểm danh theo từng ngành:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {ALL_BRANCH_KEYS.map((b) => {
                        const bStat = selectedDateStats.dStat?.branchStatus[b];
                        const isRec = bStat?.recorded;

                        return (
                          <div
                            key={b}
                            className={`p-3 rounded-2xl border-2 transition-all ${
                              isRec
                                ? "bg-emerald-50/60 border-emerald-200"
                                : "bg-slate-50 border-slate-200 opacity-80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-gray-900">
                                Ngành {b}
                              </span>
                              {isRec ? (
                                <Badge className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5">
                                  <Check className="h-3 w-3 mr-1" /> Đã điểm danh
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-300 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                                  <XCircle className="h-3 w-3 mr-1" /> Chưa điểm danh
                                </Badge>
                              )}
                            </div>

                            <div className="mt-2 text-xs text-gray-600">
                              {isRec ? (
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="text-emerald-700 font-bold">
                                    Có mặt: {bStat?.present}/{bStat?.totalActive}
                                  </span>
                                  <span className="text-gray-500 text-[11px]">
                                    (Vắng: {bStat?.absent} • Trễ: {bStat?.late})
                                  </span>
                                </div>
                              ) : (
                                <p className="text-slate-500 italic text-[11px]">
                                  Không có dữ liệu điểm danh trong ngày này ({membersByBranch[b].length} đoàn sinh)
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* =================================================
                    KPI COMPARISON STATS
                ================================================= */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 my-3">
                  {/* Total Active Baseline */}
                  <div className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold mb-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>Tổng Active ĐD</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {selectedDateStats.counts.totalActiveParticipating}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Ngành có điểm danh
                    </div>
                  </div>

                  {/* Present */}
                  <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Có mặt</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-700">
                      {selectedDateStats.counts.present}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      {selectedDateStats.counts.rate}% active tham gia
                    </div>
                  </div>

                  {/* Absent */}
                  <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-200">
                    <div className="flex items-center gap-1.5 text-red-700 text-xs font-semibold mb-1">
                      <UserX className="h-3.5 w-3.5" />
                      <span>Vắng</span>
                    </div>
                    <div className="text-2xl font-black text-red-700">
                      {selectedDateStats.counts.absent}
                    </div>
                    <div className="text-[10px] text-red-500 font-medium">
                      Buổi vắng
                    </div>
                  </div>

                  {/* Late */}
                  <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-200">
                    <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Đi trễ</span>
                    </div>
                    <div className="text-2xl font-black text-amber-700">
                      {selectedDateStats.counts.late}
                    </div>
                    <div className="text-[10px] text-amber-600 font-medium">
                      Buổi trễ
                    </div>
                  </div>

                  {/* Excused */}
                  <div className="p-3 rounded-2xl bg-blue-50 border-2 border-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold mb-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Có phép</span>
                    </div>
                    <div className="text-2xl font-black text-blue-700">
                      {selectedDateStats.counts.excused}
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">
                      Vắng có phép
                    </div>
                  </div>

                  {/* Unrecorded / Not taken attendance */}
                  <div className="p-3 rounded-2xl bg-slate-100 border-2 border-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold mb-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Chưa điểm danh</span>
                    </div>
                    <div className="text-2xl font-black text-slate-700">
                      {selectedDateStats.counts.unrecorded}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Ngành chưa ĐD
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* =================================================
                    TABS FOR MEMBER LIST
                ================================================= */}
                <Tabs defaultValue="issues" className="mt-3">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-6 rounded-2xl bg-gray-100 p-1">
                    <TabsTrigger
                      value="issues"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                    >
                      Vắng/Trễ/Phép (
                      {selectedDateStats.counts.absent +
                        selectedDateStats.counts.late +
                        selectedDateStats.counts.excused +
                        selectedDateStats.counts.unexcused}
                      )
                    </TabsTrigger>
                    <TabsTrigger
                      value="present"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                    >
                      Có mặt ({selectedDateStats.counts.present})
                    </TabsTrigger>
                    <TabsTrigger
                      value="unrecorded"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                    >
                      Chưa ĐD ({selectedDateStats.counts.unrecorded})
                    </TabsTrigger>
                    <TabsTrigger
                      value="absent"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white"
                    >
                      Vắng ({selectedDateStats.counts.absent})
                    </TabsTrigger>
                    <TabsTrigger
                      value="late"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                    >
                      Đi trễ ({selectedDateStats.counts.late})
                    </TabsTrigger>
                    <TabsTrigger
                      value="all"
                      className="rounded-xl text-xs font-bold data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                    >
                      Tất cả ({selectedDateStats.members.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* ISSUES TAB */}
                  <TabsContent value="issues" className="space-y-2 mt-4">
                    <AttendanceMemberList
                      members={selectedDateStats.members.filter(
                        (m) => m.status !== "present" && m.status !== "unrecorded",
                      )}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Tất cả đoàn sinh của các ngành đã điểm danh đều có mặt đầy đủ!"
                    />
                  </TabsContent>

                  {/* PRESENT TAB */}
                  <TabsContent value="present" className="space-y-2 mt-4">
                    <AttendanceMemberList
                      members={selectedDateStats.members.filter(
                        (m) => m.status === "present",
                      )}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Không có đoàn sinh nào có mặt"
                    />
                  </TabsContent>

                  {/* UNRECORDED TAB */}
                  <TabsContent value="unrecorded" className="space-y-2 mt-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium mb-3">
                      💡 Các đoàn sinh này thuộc ngành <strong>chưa ghi nhận điểm danh</strong> trong ngày này, do đó không được tính là có mặt.
                    </div>
                    <AttendanceMemberList
                      members={selectedDateStats.members.filter(
                        (m) => m.status === "unrecorded",
                      )}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Tất cả các ngành đều đã ghi nhận điểm danh!"
                    />
                  </TabsContent>

                  {/* ABSENT TAB */}
                  <TabsContent value="absent" className="space-y-2 mt-4">
                    <AttendanceMemberList
                      members={selectedDateStats.members.filter(
                        (m) => m.status === "absent",
                      )}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Không có đoàn sinh nào vắng"
                    />
                  </TabsContent>

                  {/* LATE TAB */}
                  <TabsContent value="late" className="space-y-2 mt-4">
                    <AttendanceMemberList
                      members={selectedDateStats.members.filter(
                        (m) => m.status === "late",
                      )}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Không có đoàn sinh nào đi trễ"
                    />
                  </TabsContent>

                  {/* ALL MEMBERS TAB */}
                  <TabsContent value="all" className="space-y-2 mt-4">
                    <AttendanceMemberList
                      members={selectedDateStats.members}
                      getStatusColor={getStatusColor}
                      getStatusLabel={getStatusLabel}
                      getBranchBadgeStyle={getBranchBadgeStyle}
                      emptyMessage="Không có đoàn sinh nào"
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

/* ================================================================
   MEMBER LIST COMPONENT
================================================================ */
function AttendanceMemberList({
  members,
  getStatusColor,
  getStatusLabel,
  getBranchBadgeStyle,
  emptyMessage,
}: {
  members: MemberAttendance[];
  getStatusColor: (status: AttendanceStatus) => string;
  getStatusLabel: (status: AttendanceStatus) => string;
  getBranchBadgeStyle: (branch?: string) => string;
  emptyMessage: string;
}) {
  if (members.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getBranchBadgeStyle={getBranchBadgeStyle}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MEMBER CARD COMPONENT
================================================================ */
function MemberCard({
  member,
  getStatusColor,
  getStatusLabel,
  getBranchBadgeStyle,
}: {
  member: MemberAttendance;
  getStatusColor: (status: AttendanceStatus) => string;
  getStatusLabel: (status: AttendanceStatus) => string;
  getBranchBadgeStyle: (branch?: string) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border-2 border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 border-2 border-indigo-100 shadow-sm">
          <AvatarFallback className="text-xs font-bold bg-indigo-50 text-indigo-700">
            {member.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm truncate">
              {member.name}
            </span>
            {member.branch && (
              <Badge
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBranchBadgeStyle(
                  member.branch,
                )}`}
              >
                {member.branch}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
            {member.isHistoricalMember && (
              <span className="text-amber-600 font-semibold">
                (Đoàn sinh lịch sử)
              </span>
            )}
            {member.unrecordedReason && (
              <span className="text-slate-500 italic">
                {member.unrecordedReason}
              </span>
            )}
            {member.markedBy && (
              <span>Người ghi: {member.markedBy.name}</span>
            )}
            {member.note && !member.unrecordedReason && (
              <span className="italic text-gray-600">Ghi chú: {member.note}</span>
            )}
          </div>
        </div>
      </div>

      <Badge
        className={`${getStatusColor(
          member.status,
        )} border-2 rounded-xl text-xs font-bold px-2.5 py-1 shrink-0`}
      >
        {getStatusLabel(member.status)}
      </Badge>
    </div>
  );
}

/* ================================================================
   EMPTY STATE COMPONENT
================================================================ */
function EmptyState({
  message = "Tất cả đoàn sinh đều có mặt!",
}: {
  message?: string;
}) {
  return (
    <div className="text-center py-10 text-gray-400 bg-gray-50/70 rounded-2xl border-2 border-dashed border-gray-200">
      <Users className="h-10 w-10 mx-auto mb-2 opacity-40 text-gray-400" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}