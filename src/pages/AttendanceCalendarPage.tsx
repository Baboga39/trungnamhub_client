"use client";

import type React from "react";

import { useState, useMemo } from "react";
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
  FileX,
  CalendarDays,
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
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAllAttendanceThunk } from "../features/attendance/attendanceThunks";
import { getMembersActive } from "../features/members/memberThunks";
import type { AppDispatch, RootState } from "../store/store";

type AttendanceStatus = "present" | "absent" | "late" | "excused" | "unexcused";

interface DayAttendance {
  date: string;
  attendance: Record<string, AttendanceStatus>;
  notes: Record<string, string>;
}

export default function AttendanceCalendarPage() {
  const { membersActive = [], loading } = useSelector(
    (state: any) => state.members,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { list: attendanceList, loading: attendanceLoading } = useSelector(
    (state: RootState) => state.attendance,
  );

  useEffect(() => {
    dispatch(getAllAttendanceThunk());
    dispatch(getMembersActive());
  }, [dispatch]);

  

  const recordsByDate = useMemo(() => {
    const map: Record<
      string,
      Record<
        number,
        {
          status: AttendanceStatus;
          note?: string;
          markedBy?: { id: number; name: string };
        }
      >
    > = {};

    attendanceList?.forEach((r) => {
      let dateKey = "";

      if (r.date && r.date.includes("/")) {
        const [day, month, year] = r.date.split("/");
        dateKey = `${year}-${month}-${day}`;
      } else {
        dateKey = format(new Date(r.date), "yyyy-MM-dd");
      }

      if (!map[dateKey]) map[dateKey] = {};
      map[dateKey][r.memberId] = {
        status: r.status,
        note: r.note || "",
        markedBy: r.markedBy || null, // 🆕 lưu người điểm danh
      };
    });

    return map;
  }, [attendanceList]);

  const getAttendanceForDate = (
    date: Date,
  ): DayAttendance & { markedBy: Record<string, any> } => {
    const dateKey = format(date, "yyyy-MM-dd");
    const attendanceForDate = recordsByDate[dateKey] || {};
    const attendance: Record<string, AttendanceStatus> = {};
    const notes: Record<string, string> = {};
    const markedBy: Record<string, any> = {};

    Object.entries(attendanceForDate).forEach(([memberId, info]) => {
      attendance[String(memberId)] = info.status;
      notes[String(memberId)] = info.note || "";
      markedBy[String(memberId)] = info.markedBy || null;
    });

    return { date: dateKey, attendance, notes, markedBy };
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dayStats = useMemo(() => {
    const stats: Record<
      string,
      {
        absent: number;
        late: number;
        excused: number;
        unexcused: number;
        total: number;
      }
    > = {};

    daysInMonth.forEach((day) => {
      const { attendance } = getAttendanceForDate(day);
      const dateKey = format(day, "yyyy-MM-dd");

      stats[dateKey] = {
        absent: Object.values(attendance).filter((s) => s === "absent").length,
        late: Object.values(attendance).filter((s) => s === "late").length,
        excused: Object.values(attendance).filter((s) => s === "excused")
          .length,
        unexcused: Object.values(attendance).filter((s) => s === "unexcused")
          .length,
        total: Object.keys(attendance).length,
      };
    });

    return stats;
  }, [daysInMonth, recordsByDate]); // 🔥 Thêm recordsByDate vào đây

  const selectedDateStats = useMemo(() => {
    if (!selectedDate) return null;

    const { attendance, notes, markedBy } = getAttendanceForDate(selectedDate);

    const membersWithStatus = membersActive.map((member) => ({
      ...member,
      status: attendance[member.id] || "present",
      note: notes[member.id] || "",
      markedBy: markedBy[member.id] || null, // 🆕 thêm vào đây
    }));

    return {
      date: selectedDate,
      members: membersWithStatus,
      stats: {
        present: membersWithStatus.filter((m) => m.status === "present").length,
        absent: membersWithStatus.filter((m) => m.status === "absent").length,
        late: membersWithStatus.filter((m) => m.status === "late").length,
        excused: membersWithStatus.filter((m) => m.status === "excused").length,
        unexcused: membersWithStatus.filter((m) => m.status === "unexcused")
          .length,
        total: membersActive.length,
      },
    };
  }, [selectedDate, membersActive, recordsByDate]);

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextMonth();
    }
    if (isRightSwipe) {
      handlePrevMonth();
    }
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
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "absent":
        return "bg-red-100 text-red-700 border-red-200";
      case "late":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "excused":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "unexcused":
        return "bg-red-100 text-red-700 border-red-200";
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

      default:
        return "";
    }
  };

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Lịch Điểm Danh
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Xem lịch sử điểm danh theo tháng
            </p>
          </div>
          <Button
            onClick={handleJumpToToday}
            className="h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Hôm nay
          </Button>
        </div>

        <Card className="border-2 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {format(currentMonth, "MMMM yyyy", { locale: vi })}
                  </CardTitle>
                  <CardDescription>
                    Click vào ngày để xem chi tiết • Vuốt để chuyển tháng
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-9 w-9 rounded-xl border-2 hover:scale-105 transition-transform bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-9 w-9 rounded-xl border-2 hover:scale-105 transition-transform bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={`transition-opacity duration-150 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
            >
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {" "}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
                {paddingDays.map((_, index) => (
                  <div key={`padding-${index}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const stats = dayStats[dateKey];
                  const hasAttendance = stats.total > 0;
                  const isCurrentDay = isToday(day);
                  const hasIssues =
                    stats.absent > 0 ||
                    stats.late > 0 ||
                    stats.excused > 0 ||
                    stats.unexcused > 0;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square p-2 rounded-xl border-2 transition-all duration-300
                        hover:scale-105 hover:shadow-md relative
                        ${isCurrentDay ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"}
                        ${hasAttendance && !hasIssues ? "bg-emerald-50 border-emerald-200" : ""}
                        ${hasIssues ? "bg-red-50 border-red-200" : ""}
                        ${!hasAttendance ? "bg-gray-50" : ""}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={`text-sm font-semibold ${isCurrentDay ? "text-blue-600" : hasIssues ? "text-red-700" : "text-gray-700"}`}
                        >
                          {format(day, "d")}
                        </span>
                        {hasAttendance && (
                          <div className="hidden sm:flex flex-1 flex-col gap-0.5 mt-1">
                            {" "}
                            {stats.absent > 0 && (
                              <div className="text-[10px] bg-red-500 text-white rounded px-1 py-0.5 font-medium">
                                {stats.absent} vắng
                              </div>
                            )}
                            {stats.late > 0 && (
                              <div className="text-[10px] bg-orange-500 text-white rounded px-1 py-0.5 font-medium">
                                {stats.late} trễ
                              </div>
                            )}
                            {stats.excused > 0 && (
                              <div className="text-[10px] bg-blue-500 text-white rounded px-1 py-0.5 font-medium">
                                {stats.excused} có phép
                              </div>
                            )}
                          </div>
                        )}
                        {hasAttendance && (
                          <div className="flex sm:hidden gap-1 justify-center mt-auto mb-1">
                            {" "}
                            {stats.absent > 0 && (
                              <div className="h-1 w-1 rounded-full bg-red-500" />
                            )}
                            {stats.late > 0 && (
                              <div className="h-1 w-1 rounded-full bg-orange-500" />
                            )}
                            {stats.excused > 0 && (
                              <div className="h-1 w-1 rounded-full bg-blue-500" />
                            )}
                            {stats.unexcused > 0 && (
                              <div className="h-1 w-1 rounded-full bg-red-700" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
            {selectedDateStats && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Điểm danh ngày{" "}
                    {format(selectedDateStats.date, "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </DialogTitle>
                  <DialogDescription>
                    {format(selectedDateStats.date, "EEEE", { locale: vi })}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-gray-50 border-2 border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Users className="h-4 w-4" />
                      <span>Tổng số</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedDateStats.stats.total}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm mb-1">
                      <Users className="h-4 w-4" />
                      <span>Có mặt</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {selectedDateStats.stats.present}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200">
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                      <UserX className="h-4 w-4" />
                      <span>Vắng</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {selectedDateStats.stats.absent}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 border-2 border-orange-200">
                    <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Đi trễ</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {selectedDateStats.stats.late}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                      <FileCheck className="h-4 w-4" />
                      <span>Có phép</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {selectedDateStats.stats.excused}
                    </div>
                  </div>
               
                </div>
                <Separator />
                <Tabs defaultValue="all" className="mt-4">
                  <TabsList className="grid w-full grid-cols-5 rounded-xl bg-gray-100 p-1">
                    <TabsTrigger
                      value="all"
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      Tất cả
                    </TabsTrigger>
                    <TabsTrigger
                      value="absent"
                      className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white"
                    >
                      Vắng
                    </TabsTrigger>
                    <TabsTrigger
                      value="late"
                      className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      Đi trễ
                    </TabsTrigger>
                    <TabsTrigger
                      value="excused"
                      className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Có phép
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-3 mt-4">
                    {selectedDateStats.members
                      .filter((m) => m.status !== "present")
                      .map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    {selectedDateStats.members.filter(
                      (m) => m.status !== "present",
                    ).length === 0 && <EmptyState />}
                  </TabsContent>
                  <TabsContent value="absent" className="space-y-3 mt-4">
                    {selectedDateStats.members
                      .filter((m) => m.status === "absent")
                      .map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    {selectedDateStats.members.filter(
                      (m) => m.status === "absent",
                    ).length === 0 && <EmptyState message="Không có ai vắng" />}
                  </TabsContent>
                  <TabsContent value="late" className="space-y-3 mt-4">
                    {selectedDateStats.members
                      .filter((m) => m.status === "late")
                      .map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    {selectedDateStats.members.filter(
                      (m) => m.status === "late",
                    ).length === 0 && (
                      <EmptyState message="Không có ai đi trễ" />
                    )}
                  </TabsContent>
                  <TabsContent value="excused" className="space-y-3 mt-4">
                    {selectedDateStats.members
                      .filter((m) => m.status === "excused")
                      .map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    {selectedDateStats.members.filter(
                      (m) => m.status === "excused",
                    ).length === 0 && (
                      <EmptyState message="Không có ai vắng có phép" />
                    )}
                  </TabsContent>
                  <TabsContent value="unexcused" className="space-y-3 mt-4">
                    {selectedDateStats.members
                      .filter((m) => m.status === "unexcused")
                      .map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          getStatusColor={getStatusColor}
                          getStatusLabel={getStatusLabel}
                        />
                      ))}
                    {selectedDateStats.members.filter(
                      (m) => m.status === "unexcused",
                    ).length === 0 && (
                      <EmptyState message="Không có ai vắng không phép" />
                    )}
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

function MemberCard({ member, getStatusColor, getStatusLabel }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border-2 bg-white hover:shadow-md transition-all duration-300">
      <Avatar className="h-10 w-10 border-2">
        <AvatarFallback className="text-sm font-semibold">
          {member.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{member.name}</span>
          <Badge
            className={`${getStatusColor(member.status)} border-2 rounded-full text-xs`}
          >
            {getStatusLabel(member.status)}
          </Badge>
        </div>
        {member.markedBy && (
          <p className="text-xs text-gray-500">
            Người điểm danh:{" "}
            <span className="font-medium text-gray-700">
              {member.markedBy.name}
            </span>
          </p>
        )}
        {member.note && (
          <p className="text-sm text-gray-500 mt-1 italic">
            Ghi chú: {member.note}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  message = "Tất cả đoàn sinh đều có mặt!",
}: {
  message?: string;
}) {
  return (
    <div className="text-center py-8 text-gray-500">
      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
