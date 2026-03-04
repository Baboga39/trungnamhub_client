"use client";

import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "../components/layouts/admin-layout";
import { Calendar } from "../components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CalendarIcon,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  FileCheck,
  FileX,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { cn } from "../lib/utils";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { useSelector, useDispatch } from "react-redux";
import { getMembersActive } from "@/features/members/memberThunks";

type AttendanceStatus = "absent" | "late" | "excused" | "unexcused" | null;

interface Member {
  id: string;
  name: string;
  avatar?: string;
  parish: string;
}

const STORAGE_KEY_ATTENDANCE = "attendance_draft";
const STORAGE_KEY_NOTES = "attendance_notes";

type FilterType = "all" | "marked" | "unmarked";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dispatch = useDispatch();
  const { members, membersActive, loading, error } = useSelector(
    (state) => state.members
  );

const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
  if (typeof window !== "undefined") {
    try {
      const savedAll = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || "{}");
      const todayKey = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      return savedAll[todayKey] || {};
    } catch {
      return {};
    }
  }
  return {};
});



  useEffect(() => {
    dispatch(getMembersActive());
  }, [dispatch]);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [compactMode, setCompactMode] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastTap, setLastTap] = useState<Record<string, number>>({});

useEffect(() => {
  if (typeof window === "undefined") return;
  const todayKey = new Date(selectedDate).toISOString().slice(0, 10);

  const savedAll = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || "{}");
  savedAll[todayKey] = attendance; // Ghi đè ngày hiện tại
  localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(savedAll));
}, [attendance, selectedDate]);
useEffect(() => {
  if (typeof window === "undefined") return;
  const savedAll = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || "{}");
  const dateKey = new Date(selectedDate).toISOString().slice(0, 10);
  setAttendance(savedAll[dateKey] || {});
}, [selectedDate]);



  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    }
  }, [notes]);

  const filteredMembers = useMemo(() => {
    let members = membersActive;

    if (searchQuery) {
      members = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.parish.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === "marked") {
      members = members.filter(
        (member) =>
          attendance[member.id] !== null && attendance[member.id] !== undefined
      );
    } else if (filter === "unmarked") {
      members = members.filter((member) => !attendance[member.id]);
    }

    return members;
  }, [searchQuery, filter, attendance, membersActive]);

  useEffect(() => {
  console.log("📋 Attendance state hiện tại:", attendance);
}, [attendance]);

  const stats = useMemo(() => {
    const total = membersActive.length;
    const absent = Object.values(attendance).filter(
      (s) => s === "absent"
    ).length;
    const late = Object.values(attendance).filter((s) => s === "late").length;
    const excused = Object.values(attendance).filter(
      (s) => s === "excused"
    ).length;
    const unexcused = Object.values(attendance).filter(
      (s) => s === "unexcused"
    ).length;
    const present = total - absent - late - excused - unexcused;
    const marked = Object.keys(attendance).filter(
      (id) => attendance[id] !== null
    ).length;

    return { total, present, absent, late, excused, unexcused, marked };
  }, [attendance]);

  const progressPercentage = (stats.marked / stats.total) * 100;

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    triggerHaptic();

    const now = Date.now();
    const lastTapTime = lastTap[memberId] || 0;

    if (attendance[memberId] === status && now - lastTapTime < 300) {
      setAttendance((prev) => ({
        ...prev,
        [memberId]: null,
      }));
      setLastTap((prev) => ({ ...prev, [memberId]: 0 }));
    } else {
      setAttendance((prev) => ({
        ...prev,
        [memberId]: prev[memberId] === status ? null : status,
      }));
      setLastTap((prev) => ({ ...prev, [memberId]: now }));
    }
  };

  const handleResetAll = () => {
    setAttendance({});
    setNotes({});
    setExpandedNotes({});
    toast.success("Đã reset tất cả về trạng thái có mặt");
  };

  const toggleNotes = (memberId: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const handleSubmitClick = () => {
    setShowConfirmDialog(true);
  };

const handleConfirmSubmit = async () => {
  setShowConfirmDialog(false);
  setIsSubmitting(true);

  try {
    // --- Lấy toàn bộ dữ liệu từ localStorage ---
    const allAttendance = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || "{}");
    const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES) || "{}");

    // --- Gom dữ liệu đã valid (lọc bỏ null / rỗng) ---
    const attendanceToSubmit = Object.entries(allAttendance).reduce((acc, [date, records]) => {
      const cleaned = Object.entries(records)
        .filter(([_, status]) => status !== null)
        .reduce((subAcc, [id, status]) => ({ ...subAcc, [id]: status }), {});
      if (Object.keys(cleaned).length > 0) acc[date] = cleaned;
      return acc;
    }, {});

    const notesToSubmit = Object.entries(allNotes).reduce((acc, [date, notes]) => {
      const cleaned = Object.entries(notes)
        .filter(([_, note]) => note.trim() !== "")
        .reduce((subAcc, [id, note]) => ({ ...subAcc, [id]: note }), {});
      if (Object.keys(cleaned).length > 0) acc[date] = cleaned;
      return acc;
    }, {});

    console.log("📦 Submitting all attendance drafts:", {
      attendanceToSubmit,
      notesToSubmit,
    });

    // --- Giả lập API call ---
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // --- (Tùy chọn) Xóa sau khi submit ---
    // Nếu bạn muốn giữ lại thì comment 2 dòng dưới đi
    localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
    localStorage.removeItem(STORAGE_KEY_NOTES);

    // --- Hiệu ứng và thông báo ---
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);

    toast.success("✅ Điểm danh đã được gửi thành công!", {
      description: `Đã gửi ${Object.keys(attendanceToSubmit).length} ngày điểm danh.`,
    });
  } catch (error) {
    toast.error("❌ Có lỗi xảy ra khi lưu điểm danh");
    console.error("[v2] Error submitting attendance:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  const getRowBackground = (status: AttendanceStatus) => {
    if (!status) return "bg-white";
    switch (status) {
      case "absent":
        return "bg-red-50/50";
      case "late":
        return "bg-orange-50/50";
      case "excused":
        return "bg-blue-50/50";
      case "unexcused":
        return "bg-red-100/50";
      default:
        return "bg-white";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn pb-24 md:pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Điểm Danh Đoàn Sinh
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý điểm danh hàng ngày
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompactMode(!compactMode)}
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                {compactMode ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal shadow-md hover:shadow-lg transition-all duration-300 h-14 md:h-12 md:w-[320px] rounded-2xl border-gray-200",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {selectedDate ? (
                  <span>
                    {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}
                  </span>
                ) : (
                  <span>Chọn ngày điểm danh</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl shadow-xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng số
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-gray-900">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Có mặt
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-emerald-700">
                {stats.present}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-red-700">
                Vắng
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-red-700">
                {stats.absent}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-amber-700">
                Đi trễ
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-amber-700">
                {stats.late}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-blue-700">
                Có phép
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-blue-700">
                {stats.excused}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-sm font-medium text-purple-700">
                Không phép
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileX className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-3xl font-bold text-purple-700">
                {stats.unexcused}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-sm border border-gray-100 w-full">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tiến độ điểm danh
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.marked}/{stats.total} người
                  </p>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-gray-200">
          <CardHeader className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-2xl">Danh Sách Đoàn Sinh</CardTitle>
                <CardDescription className="mt-1">
                  Đánh dấu trạng thái điểm danh
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    filter === "all" &&
                      "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  Tất cả ({stats.total})
                </Button>
                <Button
                  variant={filter === "marked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("marked")}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    filter === "marked" &&
                      "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  Đã đánh dấu ({stats.marked})
                </Button>
                <Button
                  variant={filter === "unmarked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unmarked")}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    filter === "unmarked" &&
                      "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  Chưa đánh dấu ({stats.total - stats.marked})
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm đoàn sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 md:h-12 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const status = attendance[member.id];
                const note = notes[member.id] || "";
                const isNotesExpanded = expandedNotes[member.id];

                return (
                  <div
                    key={member.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border border-gray-200 p-3 transition-all duration-300 hover:shadow-lg hover:border-gray-300",
                      getRowBackground(status)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {!compactMode && (
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-sm">
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          {status && (
                            <div
                              className={cn(
                                "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                                status === "absent" && "bg-red-500",
                                status === "late" && "bg-orange-500",
                                status === "excused" && "bg-blue-500",
                                status === "unexcused" && "bg-purple-500"
                              )}
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-900 truncate">
                          {member.name}
                        </p>
                        {!compactMode && (
                          <p className="text-xs text-gray-500 truncate">
                            {member.parish}
                          </p>
                        )}
                      </div>
                      {status && (
                        <Badge
                          className={cn(
                            "transition-all rounded-full px-2 py-0.5 font-medium shadow-sm text-xs",
                            status === "absent" &&
                              "bg-red-100 text-red-700 border-red-200",
                            status === "late" &&
                              "bg-amber-100 text-amber-700 border-amber-200",
                            status === "excused" &&
                              "bg-blue-100 text-blue-700 border-blue-200",
                            status === "unexcused" &&
                              "bg-purple-100 text-purple-700 border-purple-200"
                          )}
                        >
                          {status === "absent" && "Vắng"}
                          {status === "late" && "Trễ"}
                          {status === "excused" && "Có phép"}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(member.id, "absent")}
                        className={cn(
                          "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
                          status === "absent"
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg scale-105"
                            : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                        )}
                      >
                        <UserX className="mr-1.5 h-4 w-4" />
                        Vắng
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(member.id, "late")}
                        className={cn(
                          "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
                          status === "late"
                            ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-lg scale-105"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-300"
                        )}
                      >
                        <Clock className="mr-1.5 h-4 w-4" />
                        Đi trễ
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(member.id, "excused")}
                        className={cn(
                          "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
                          status === "excused"
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg scale-105"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                        )}
                      >
                        <FileCheck className="mr-1.5 h-4 w-4" />
                        Có phép
                      </Button>

                  
                    </div>

                    {status && (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNotes(member.id)}
                          className="w-full justify-between rounded-xl hover:bg-gray-50"
                        >
                          <span className="flex items-center gap-2 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            Ghi chú
                          </span>
                          {isNotesExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {isNotesExpanded && (
                          <Textarea
                            placeholder="Ghi chú lý do (ví dụ: Ốm, Đi công tác gia đình...)"
                            value={note}
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            className="rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-all resize-none"
                            rows={3}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="py-16 text-center">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    Không tìm thấy đoàn sinh
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Thử thay đổi từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận điểm danh</DialogTitle>
            <DialogDescription>
              Xác nhận điểm danh cho ngày{" "}
              {format(selectedDate, "dd/MM/yyyy", { locale: vi })}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng số:</span>
              <span className="font-semibold">{stats.total} người</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Có mặt:</span>
              <span className="font-semibold text-emerald-600">
                {stats.present} người
              </span>
            </div>
            {stats.absent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Vắng:</span>
                <span className="font-semibold text-red-600">
                  {stats.absent} người
                </span>
              </div>
            )}
            {stats.late > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">Đi trễ:</span>
                <span className="font-semibold text-amber-600">
                  {stats.late} người
                </span>
              </div>
            )}
            {stats.excused > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Có phép:</span>
                <span className="font-semibold text-blue-600">
                  {stats.excused} người
                </span>
              </div>
            )}
            {stats.unexcused > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-purple-600">Không phép:</span>
                <span className="font-semibold text-purple-600">
                  {stats.unexcused} người
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Thành công!
                </h3>
                <p className="text-gray-600 mt-1">Điểm danh đã được lưu</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-50">
        <Button
          size="lg"
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-xl transition-all duration-300 h-14 text-base font-semibold rounded-2xl"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Đang lưu..." : "Lưu Điểm Danh"}
        </Button>
      </div>

      <div className="hidden md:flex justify-end mt-6">
        <Button
          size="lg"
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl px-8"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Đang lưu..." : "Lưu Điểm Danh"}
        </Button>
      </div>
      <ScrollToTopButton />
    </AdminLayout>
  );
}
