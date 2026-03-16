"use client";

import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "../components/layouts/admin-layout";
import { AttendanceHeader } from "../components/attendance/AttendanceHeader";
import { AttendanceDatePicker } from "../components/attendance/AttendanceDatePicker";
import { AttendanceStats } from "../components/attendance/AttendanceStats";
import { AttendanceProgress } from "../components/attendance/AttendanceProgress";
import { AttendanceFilters } from "../components/attendance/AttendanceFilters";
import { AttendanceMemberCard } from "../components/attendance/AttendanceMemberCard";
import { AttendanceConfirmDialog } from "../components/dialogs/AttendanceConfirmDialog";
import { AttendanceSuccessAnimation } from "../components/attendance/AttendanceSuccessAnimation";
import { AttendanceSubmitButton } from "../components/attendance/AttendanceSubmitButton";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Users, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getMembersActive } from "@/features/members/memberThunks";
import { markAttendanceThunk } from "@/features/attendance/attendanceThunks";

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "unexcused"
  | null;

interface Member {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
}

const STORAGE_KEY_ATTENDANCE = "attendance_draft_v2";
const STORAGE_KEY_NOTES = "attendance_notes_v2";

type FilterType = "all" | "marked" | "unmarked";

const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { membersActive = [], loading } = useSelector(
    (state: any) => state.members,
  );

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceAll, setAttendanceAll] = useState<
    Record<string, Record<string, { status: AttendanceStatus; note: string }>>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [notesAll, setNotesAll] = useState<
    Record<string, Record<string, string>>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [compactMode, setCompactMode] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false); // ✅ Toggle xem toàn bộ dữ liệu

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  const attendance = useMemo(
    () => ({ ...(attendanceAll[dateKey] || {}) }),
    [attendanceAll, dateKey],
  );
  const notes = useMemo(
    () => ({ ...(notesAll[dateKey] || {}) }),
    [notesAll, dateKey],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY_ATTENDANCE,
        JSON.stringify(attendanceAll),
      );
    }
  }, [attendanceAll]);

  useEffect(() => {
    dispatch(getMembersActive());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredMembers = useMemo(() => {
    let list = membersActive;
    if (searchQuery) {
      list = list.filter(
        (m: Member) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())       );
    }
    if (filter === "marked") {
      list = list.filter((m: Member) => attendance[m.id]);
    } else if (filter === "unmarked") {
      list = list.filter((m: Member) => !attendance[m.id]);
    }
    return list;
  }, [searchQuery, filter, attendance, membersActive]);

  // ✅ Nếu đang bật "Xem tất cả", thống kê sẽ tính trên toàn bộ attendanceAll
  const stats = useMemo(() => {
    const total = membersActive.length;

    const allStatuses = showAllDays
      ? Object.values(attendanceAll).flatMap((day) => Object.values(day))
      : Object.values(attendance);

    const absent = allStatuses.filter((s) => s === "absent").length;
    const late = allStatuses.filter((s) => s === "late").length;
    const excused = allStatuses.filter((s) => s === "excused").length;
    const unexcused = allStatuses.filter((s) => s === "unexcused").length;
    const marked = allStatuses.filter(
      (s) => s !== null && s !== undefined,
    ).length;
      const present = total - marked;

      console.log(present)


    return { total, present, absent, late, excused, unexcused, marked };
  }, [attendance, attendanceAll, membersActive, showAllDays]);

  const progressPercentage =
    stats.total > 0 ? (stats.marked / stats.total) * 100 : 0;

const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
  setAttendanceAll((prev) => {
    const prevStatus = prev[dateKey]?.[memberId]?.status;

    // nếu click lại cùng status -> remove record
    if (prevStatus === status) {
      const newDay = { ...(prev[dateKey] || {}) };
      delete newDay[memberId];

      return {
        ...prev,
        [dateKey]: newDay,
      };
    }

    return {
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [memberId]: {
          status,
          note: prev[dateKey]?.[memberId]?.note || "",
        },
      },
    };
  });
};

  const handleNoteChange = (memberId: string, note: string) => {
    setAttendanceAll((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [memberId]: {
          status: prev[dateKey]?.[memberId]?.status || null,
          note,
        },
      },
    }));
  };

const handleResetAll = () => {
  setAttendanceAll({});
  setNotesAll({});

  localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
  localStorage.removeItem(STORAGE_KEY_NOTES);

  toast.success("Đã reset toàn bộ điểm danh tất cả ngày");
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
      const resultAction = await dispatch(
        markAttendanceThunk({ records: attendanceAll }),
      );

      if (markAttendanceThunk.fulfilled.match(resultAction)) {
        toast.success("Đã lưu điểm danh thành công!");

        // Xóa dữ liệu localStorage (đã gửi thành công)
        setAttendanceAll({});
        setNotesAll({});
        localStorage.removeItem("attendance_draft_v2");
        localStorage.removeItem("attendance_notes_v2");

        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
      } else {
        toast.error(
          "Gửi thất bại: " + (resultAction.payload || "Unknown error"),
        );
      }
    } catch (error) {
      toast.error("Có lỗi khi gửi điểm danh");
      console.error("Error in handleConfirmSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn pb-24 md:pb-6">
        <AttendanceHeader
          compactMode={compactMode}
          onToggleCompact={() => setCompactMode(!compactMode)}
          onReset={handleResetAll}
        />

        <AttendanceDatePicker
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-semibold">
            {showAllDays
              ? "Thống kê tất cả ngày"
              : `Thống kê ngày ${format(selectedDate, "dd/MM/yyyy")}`}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllDays(!showAllDays)}
          >
            {showAllDays ? "Chỉ xem ngày hiện tại" : "Xem tất cả ngày"}
          </Button>
        </div>

        <AttendanceStats
          members={membersActive}
          attendance={attendance}
          selectedDate={selectedDate}
          stats={stats}
        />

        <AttendanceProgress
          marked={stats.marked}
          total={stats.total}
          percentage={progressPercentage}
        />

        <Card className="rounded-2xl shadow-md border-gray-200">
          <CardHeader className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-2xl">Danh Sách Đoàn Sinh</CardTitle>
                <CardDescription className="mt-1">
                  Đánh dấu trạng thái điểm danh
                </CardDescription>
              </div>

              <AttendanceFilters
                filter={filter}
                onFilterChange={setFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                stats={stats}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredMembers.map((member: Member) => (
                <AttendanceMemberCard
                  key={member.id}
                  member={member}
                  status={attendance[member.id]?.status || null}
                  note={attendance[member.id]?.note || ""}
                  isNotesExpanded={expandedNotes[member.id]}
                  compactMode={compactMode}
                  onStatusChange={(status) =>
                    handleStatusChange(member.id, status)
                  }
                  onNoteChange={(note) => handleNoteChange(member.id, note)}
                  onToggleNotes={() => toggleNotes(member.id)}
                />
              ))}
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

      <AttendanceConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSubmit}
        attendanceAll={attendanceAll}
        members={membersActive}
      />

      <AttendanceSuccessAnimation show={showSuccessAnimation} />

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-24 right-6 md:bottom-6 z-40 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 animate-in slide-in-from-bottom duration-300"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <AttendanceSubmitButton
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitClick}
      />
    </AdminLayout>
  );
}
