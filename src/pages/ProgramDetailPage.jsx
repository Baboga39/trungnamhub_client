import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LessonFormModal from "@/components/program/LessonFormModal";
import DeleteConfirmDialog from "@/components/program/DeleteConfirmDialog";
import programApi from "@/api/programApi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  CalendarDays,
  Layers,
  MapPin,
  Paperclip,
  RefreshCw,
  Loader2,
  Info,
  ClipboardCheck,
  BookOpen,
  AlertTriangle,
  Inbox,
  RotateCcw,
} from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: { label: "Nháp", className: "bg-amber-100 text-amber-700 border-amber-200" },
  PUBLISHED: { label: "Đã đăng", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ARCHIVED: { label: "Lưu trữ", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
  } catch {
    return dateStr;
  }
}

function formatDuration(mins) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}g${m}p` : `${h} giờ`;
  return `${m} phút`;
}

export default function ProgramDetailPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === "admin";

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [deleteLesson, setDeleteLesson] = useState(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [syncingLessonId, setSyncingLessonId] = useState(null);

  const fetchProgram = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await programApi.getProgram(programId);
        setProgram(res.data || res);
      } catch (err) {
        console.error("Failed to load program detail:", err);
        setError("Không thể tải thông tin chương trình. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  useEffect(() => {
    if (programId) fetchProgram();
  }, [fetchProgram, programId]);

  const handleLessonFormSuccess = () => {
    setEditLesson(null);
    fetchProgram(true);
  };

  const handleDeleteLesson = async () => {
    if (!deleteLesson) return;
    setDeleteLessonLoading(true);
    try {
      await programApi.deleteLesson(deleteLesson.id);
      toast.success(`Đã xóa bài học ngày ${formatDate(deleteLesson.date)}`);
      setDeleteLesson(null);
      fetchProgram(true);
    } catch (err) {
      console.error("Delete lesson error:", err);
    } finally {
      setDeleteLessonLoading(false);
    }
  };

  const handleEnsureSession = async (lesson) => {
    try {
      await programApi.ensureSession(lesson.id);
      toast.success("Đã liên kết buổi điểm danh. Đang mở trang điểm danh...");
      setTimeout(() => {
        navigate("/attendance");
      }, 800);
    } catch (err) {
      console.error("Ensure session error:", err);
    }
  };

  const handleSyncAttendance = async (lessonId) => {
    setSyncingLessonId(lessonId);
    try {
      const res = await programApi.syncAttendance(lessonId);
      const result = res.data || res;
      toast.success(
        `Đồng bộ thành công! Thực tế: ${result.actualParticipantCount} ĐS (Có mặt: ${result.breakdown?.present || 0}, Trễ: ${result.breakdown?.late || 0})`
      );
      fetchProgram(true);
    } catch (err) {
      console.error("Sync attendance error:", err);
    } finally {
      setSyncingLessonId(null);
    }
  };

  // Summary stats
  const stats = program?.lessons
    ? {
        total: program.lessons.length,
        prepared: program.lessons.filter((l) => l.prepared).length,
        unprepared: program.lessons.filter((l) => !l.prepared).length,
        totalPlanned: program.lessons.reduce(
          (sum, l) => sum + (l.plannedParticipantCount || 0),
          0
        ),
        totalActual: program.lessons.reduce(
          (sum, l) => sum + (l.actualParticipantCount || 0),
          0
        ),
      }
    : null;

  const userBranch = user?.branch || "";

  const canEdit = isAdmin || (userBranch && String(program?.branch.name) === String(userBranch));
  const statusConf = program
    ? STATUS_CONFIG[program.status] || STATUS_CONFIG.DRAFT
    : STATUS_CONFIG.DRAFT;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ─────────── Back + Header ─────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/programs")}
            className="rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Danh sách chương trình
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-slate-500 font-medium">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Có lỗi xảy ra</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">{error}</p>
            <Button onClick={() => fetchProgram()} className="rounded-xl">
              Thử lại
            </Button>
          </div>
        ) : program ? (
          <>
            {/* Read-Only Alert Banner if viewing another branch */}
            {!canEdit && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Chế độ xem tham khảo:</span> Bạn đang xem chương trình sinh hoạt của&nbsp;
                  <span className="font-bold underline">
                    {program.branch?.name || `Ngành ${program.branchId}`}
                  </span>
                  . Chỉ Huỳnh Trưởng thuộc Ngành này mới có quyền thêm, sửa hoặc xóa bài học.
                </div>
              </div>
            )}

            {/* ─────────── Program Header Card ─────────── */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-800">
                          Quý {program.quarter} / {program.year}
                        </h1>
                        <Badge
                          className={`text-[10px] font-semibold rounded-lg px-2 py-0.5 border ${statusConf.className}`}
                        >
                          {statusConf.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {program.branch?.name || `Ngành ${program.branchId}`}
                      </p>
                      {program.note && (
                        <p className="text-xs text-slate-400 mt-1 italic">{program.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProgram(true)}
                      className="rounded-xl border-gray-200 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Làm mới
                    </Button>
                    {canEdit && (
                      <Button
                        onClick={() => {
                          setEditLesson(null);
                          setShowLessonForm(true);
                        }}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-200"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Thêm bài học
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─────────── Stats Summary ─────────── */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    label: "Tổng số buổi",
                    value: stats.total,
                    icon: <BookOpen className="h-4 w-4" />,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Đã chuẩn bị",
                    value: stats.prepared,
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Chưa chuẩn bị",
                    value: stats.unprepared,
                    icon: <Circle className="h-4 w-4" />,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                  {
                    label: "ĐS dự kiến",
                    value: stats.totalPlanned,
                    icon: <Users className="h-4 w-4" />,
                    color: "text-violet-600",
                    bg: "bg-violet-50",
                  },
                  {
                    label: "ĐS thực tế",
                    value: stats.totalActual,
                    icon: <ClipboardCheck className="h-4 w-4" />,
                    color: "text-teal-600",
                    bg: "bg-teal-50",
                  },
                ].map((s) => (
                  <Card
                    key={s.label}
                    className="rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0 ${s.color}`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* ─────────── Lessons Table ─────────── */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader className="px-6 pt-5 pb-3">
                <CardTitle className="text-lg font-bold text-slate-800">
                  Danh sách bài học
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {program.lessons?.length || 0} buổi sinh hoạt trong Quý{" "}
                  {program.quarter}/{program.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-4">
                {!program.lessons || program.lessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                      <Inbox className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700">
                      Chưa có bài học nào
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">
                      Nhấn "+ Thêm bài học" để bắt đầu lập chương trình.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditLesson(null);
                        setShowLessonForm(true);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Thêm bài học đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80 border-y border-gray-100">
                          <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            Ngày
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            Trưởng HD
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">
                            Bài học
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            CB bài
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 inline mr-0.5" />
                            Thời gian
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            DK / TT
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            CT Chung
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            Vị trí
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            File
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            %
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {program.lessons.map((lesson, idx) => {
                          const isSyncing = syncingLessonId === lesson.id;
                          return (
                            <tr
                              key={lesson.id}
                              className={`hover:bg-blue-50/40 transition-colors ${
                                idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                              }`}
                            >
                              {/* Date */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="font-semibold text-slate-700 text-sm">
                                  {formatDate(lesson.date)}
                                </span>
                              </td>

                              {/* Leaders */}
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {lesson.leaders && lesson.leaders.length > 0 ? (
                                    lesson.leaders.map((ldr) => (
                                      <span
                                        key={ldr.userId}
                                        className="inline-block px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap"
                                      >
                                        {ldr.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 text-xs">—</span>
                                  )}
                                </div>
                              </td>

                              {/* Lesson Text */}
                              <td className="py-3 px-4 max-w-[260px]">
                                <p
                                  className="text-slate-700 text-sm leading-snug line-clamp-2"
                                  title={lesson.lessonText}
                                >
                                  {lesson.lessonText || "—"}
                                </p>
                                {lesson.note && (
                                  <p className="text-xs text-slate-400 italic mt-0.5 truncate">
                                    {lesson.note}
                                  </p>
                                )}
                              </td>

                              {/* Prepared */}
                              <td className="py-3 px-4 text-center">
                                {lesson.prepared ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300 mx-auto" />
                                )}
                              </td>

                              {/* Duration */}
                              <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600 text-xs font-medium">
                                {formatDuration(lesson.durationMinutes)}
                              </td>

                              {/* Planned / Actual */}
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-slate-400 text-xs font-medium">
                                    {lesson.plannedParticipantCount ?? 0}
                                  </span>
                                  <span className="text-slate-300">/</span>
                                  <span
                                    className="text-emerald-600 font-bold text-sm"
                                    title="Số lượng thực tế từ điểm danh"
                                  >
                                    {lesson.actualParticipantCount ?? 0}
                                  </span>
                                </div>
                              </td>

                              {/* Common Program */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {lesson.commonProgram?.name ? (
                                  <span className="inline-block px-2 py-0.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-medium">
                                    {lesson.commonProgram.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              {/* Location */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {lesson.location?.name ? (
                                  <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {lesson.location.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              {/* Files */}
                              <td className="py-3 px-4 text-center">
                                {lesson.files && lesson.files.length > 0 ? (
                                  <a
                                    href={lesson.files[0].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={lesson.files[0].originalName}
                                    className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Paperclip className="h-3.5 w-3.5" />
                                  </a>
                                ) : (
                                  <span className="text-slate-300 text-xs">—</span>
                                )}
                              </td>

                              {/* Evaluation % */}
                              <td className="py-3 px-4 text-center">
                                {lesson.evaluationPercent !== null &&
                                lesson.evaluationPercent !== undefined ? (
                                  <span
                                    className={`text-sm font-bold ${
                                      lesson.evaluationPercent >= 80
                                        ? "text-emerald-600"
                                        : lesson.evaluationPercent >= 50
                                        ? "text-amber-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {lesson.evaluationPercent}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1 flex-nowrap">
                                  {canEdit ? (
                                    <>
                                      {/* Edit */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={() => {
                                          setEditLesson(lesson);
                                          setShowLessonForm(true);
                                        }}
                                        title="Chỉnh sửa bài học"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>

                                      {/* Sync Attendance */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        onClick={() => handleSyncAttendance(lesson.id)}
                                        disabled={isSyncing}
                                        title="Đồng bộ điểm danh"
                                      >
                                        {isSyncing ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <RotateCcw className="h-3.5 w-3.5" />
                                        )}
                                      </Button>

                                      {/* Attendance */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => handleEnsureSession(lesson)}
                                        title="Mở điểm danh"
                                      >
                                        <ClipboardCheck className="h-3.5 w-3.5" />
                                      </Button>

                                      {/* Delete */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setDeleteLesson(lesson)}
                                        title="Xóa bài học"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Chỉ xem
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* ─────────── Lesson Form Modal ─────────── */}
      <LessonFormModal
        open={showLessonForm}
        onOpenChange={(v) => {
          setShowLessonForm(v);
          if (!v) setEditLesson(null);
        }}
        program={program}
        lesson={editLesson}
        onSuccess={handleLessonFormSuccess}
      />

      {/* ─────────── Delete Lesson Dialog ─────────── */}
      <DeleteConfirmDialog
        open={Boolean(deleteLesson)}
        onOpenChange={(v) => !v && setDeleteLesson(null)}
        title="Xóa bài học"
        description={
          deleteLesson
            ? `Bạn có chắc muốn xóa bài học ngày ${formatDate(deleteLesson.date)}? Thao tác này không thể hoàn tác.`
            : ""
        }
        onConfirm={handleDeleteLesson}
        loading={deleteLessonLoading}
      />
    </AdminLayout>
  );
}
