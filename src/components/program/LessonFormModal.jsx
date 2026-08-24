import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import programApi from "@/api/programApi";
import {
  Calendar,
  UserCheck,
  BookOpen,
  Clock,
  Users,
  Info,
  Layers,
  MapPin,
  Paperclip,
  Trash2,
  Percent,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";

export default function LessonFormModal({
  open,
  onOpenChange,
  program,
  lesson = null,
  onSuccess,
}) {
  const isEdit = Boolean(lesson);

  const [date, setDate] = useState("");
  const [lessonText, setLessonText] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [plannedParticipantCount, setPlannedParticipantCount] = useState("15");
  const [actualParticipantCount, setActualParticipantCount] = useState(0);
  const [commonProgramCode, setCommonProgramCode] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [note, setNote] = useState("");
  const [evaluationPercent, setEvaluationPercent] = useState("");
  const [selectedLeaderIds, setSelectedLeaderIds] = useState([]);

  // Data lists
  const [branchUsers, setBranchUsers] = useState([]);
  const [commonPrograms, setCommonPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // Uploading state
  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load master data & users on modal open
  useEffect(() => {
    if (open && program) {
      loadMasterData();
    }
  }, [open, program]);

  // Load lesson data if editing
  useEffect(() => {
    if (open) {
      if (lesson) {
        setDate(lesson.date || "");
        setLessonText(lesson.lessonText || "");
        setPrepared(Boolean(lesson.prepared));
        setDurationMinutes(
          lesson.durationMinutes !== null && lesson.durationMinutes !== undefined
            ? String(lesson.durationMinutes)
            : ""
        );
        setPlannedParticipantCount(
          lesson.plannedParticipantCount !== null && lesson.plannedParticipantCount !== undefined
            ? String(lesson.plannedParticipantCount)
            : "0"
        );
        setActualParticipantCount(lesson.actualParticipantCount || 0);
        setCommonProgramCode(
          lesson.commonProgram?.code || lesson.commonProgramCode || ""
        );
        setLocationCode(lesson.location?.code || lesson.locationCode || "");
        setNote(lesson.note || "");
        setEvaluationPercent(
          lesson.evaluationPercent !== null && lesson.evaluationPercent !== undefined
            ? String(lesson.evaluationPercent)
            : ""
        );
        setSelectedLeaderIds(
          (lesson.leaders || []).map((ldr) => Number(ldr.userId))
        );
        setExistingFiles(lesson.files || []);
      } else {
        // Reset defaults for new lesson
        setDate("");
        setLessonText("");
        setPrepared(false);
        setDurationMinutes("90");
        setPlannedParticipantCount("15");
        setActualParticipantCount(0);
        setCommonProgramCode("NGHI_LE");
        setLocationCode("TRAI_DUONG");
        setNote("");
        setEvaluationPercent("");
        setSelectedLeaderIds([]);
        setExistingFiles([]);
        setFileToUpload(null);
      }
    }
  }, [open, lesson]);

  const loadMasterData = async () => {
    try {
      const branchId = program?.branch?.id || program?.branchId;
      const [usersRes, commonRes, locRes] = await Promise.all([
        programApi.getProgramUsers(branchId),
        programApi.getCommonPrograms(),
        programApi.getLocations(),
      ]);

      setBranchUsers(usersRes.data || usersRes || []);
      setCommonPrograms(commonRes.data || commonRes || []);
      setLocations(locRes.data || locRes || []);
    } catch (err) {
      console.error("Failed to load master data for lesson form:", err);
    }
  };

  // Date validation helper for Quarter date range bounds
  const getQuarterBounds = () => {
    if (!program) return { min: "", max: "" };
    const y = Number(program.year);
    const q = Number(program.quarter);

    let startMonth = "01";
    let endMonth = "03";
    let endDay = "31";

    if (q === 2) {
      startMonth = "04";
      endMonth = "06";
      endDay = "30";
    } else if (q === 3) {
      startMonth = "07";
      endMonth = "09";
      endDay = "30";
    } else if (q === 4) {
      startMonth = "10";
      endMonth = "12";
      endDay = "31";
    }

    return {
      min: `${y}-${startMonth}-01`,
      max: `${y}-${endMonth}-${endDay}`,
    };
  };

  const bounds = getQuarterBounds();

  const handleLeaderToggle = (userId) => {
    const idNum = Number(userId);
    setSelectedLeaderIds((prev) =>
      prev.includes(idNum)
        ? prev.filter((id) => id !== idNum)
        : [...prev, idNum]
    );
  };

  const handleFileDelete = async (fileId) => {
    if (!lesson?.id) return;
    try {
      await programApi.deleteLessonFile(lesson.id, fileId);
      setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("Đã xóa file bài giảng");
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error("Vui lòng chọn ngày học");
      return;
    }

    if (bounds.min && bounds.max) {
      if (date < bounds.min || date > bounds.max) {
        toast.error(
          `Ngày học phải nằm trong Quý ${program.quarter}/${program.year} (${bounds.min} đến ${bounds.max})`
        );
        return;
      }
    }

    if (!lessonText.trim()) {
      toast.error("Vui lòng nhập nội dung bài học");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date,
        lessonText: lessonText.trim(),
        prepared,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        plannedParticipantCount: plannedParticipantCount ? Number(plannedParticipantCount) : 0,
        commonProgramCode: commonProgramCode || null,
        locationCode: locationCode || null,
        note: note.trim() || null,
        evaluationPercent: evaluationPercent !== "" ? Number(evaluationPercent) : null,
      };

      let lessonResult;
      if (isEdit) {
        const res = await programApi.updateLesson(lesson.id, payload);
        lessonResult = res.data || res;
      } else {
        const res = await programApi.createLesson(program.id, payload);
        lessonResult = res.data || res;
      }

      const lessonId = lessonResult.id;

      // Synchronize leaders
      if (selectedLeaderIds.length > 0) {
        for (const uId of selectedLeaderIds) {
          try {
            await programApi.addLeader(lessonId, { userId: uId, role: "MAIN" });
          } catch (leaderErr) {
            console.warn(`Leader assignment warning for ${uId}:`, leaderErr);
          }
        }
      }

      // Upload attached file if selected
      if (fileToUpload) {
        try {
          await programApi.uploadLessonFile(lessonId, fileToUpload);
        } catch (fileErr) {
          console.error("File upload error:", fileErr);
        }
      }

      toast.success(
        isEdit
          ? "Cập nhật bài học thành công!"
          : "Thêm bài học mới thành công!"
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDurationText = (mins) => {
    if (!mins || isNaN(mins)) return "";
    const m = Number(mins);
    const hours = Math.floor(m / 60);
    const remainingMins = m % 60;
    if (hours > 0) {
      return `(${hours} giờ ${remainingMins > 0 ? `${remainingMins} phút` : ""})`;
    }
    return `(${m} phút)`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-100 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            {isEdit ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {program
              ? `Chương trình Quý ${program.quarter}/${program.year} - ${program.branch?.name || ""}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Row 1: Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Ngày học <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={date}
                min={bounds.min}
                max={bounds.max}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
              {bounds.min && bounds.max && (
                <p className="text-[11px] text-slate-400">
                  Hợp lệ: {bounds.min} đến {bounds.max}
                </p>
              )}
            </div>

            {/* Duration Minutes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Thời gian (Phút)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="90"
                  min="1"
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  phút
                </span>
              </div>
              {durationMinutes && (
                <p className="text-[11px] text-blue-600 font-medium">
                  {formatDurationText(durationMinutes)}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Lesson Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                Bài học <span className="text-red-500">*</span>
              </Label>
              {isEdit && ["APPROVED", "PUBLISHED"].includes(program?.status) && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                  Đã duyệt (Khóa tên bài)
                </span>
              )}
            </div>
            <Textarea
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              placeholder="Nhập nội dung bài học (Ví dụ: Đọc Kinh Hôm - Các cách lạy; Nghi thức đánh lễ Đức Chí Tôn)..."
              rows={3}
              required
              disabled={isEdit && ["APPROVED", "PUBLISHED"].includes(program?.status)}
              className={`rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm ${
                isEdit && ["APPROVED", "PUBLISHED"].includes(program?.status)
                  ? "bg-slate-100 text-slate-600 cursor-not-allowed border-dashed"
                  : ""
              }`}
            />
            {isEdit && ["APPROVED", "PUBLISHED"].includes(program?.status) && (
              <p className="text-[11px] text-amber-600">
                Chương trình Quý đã được phê duyệt nên tên bài học bị khóa để đảm bảo tính toàn vẹn. Bạn vẫn có thể chỉnh sửa các thông tin khác (ngày giờ, người phụ trách, ghi chú, đính kèm file...).
              </p>
            )}
          </div>

          {/* Row 3: Prepared Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <Checkbox
              id="prepared-checkbox"
              checked={prepared}
              onCheckedChange={(checked) => setPrepared(Boolean(checked))}
              className="rounded-md border-slate-300"
            />
            <label
              htmlFor="prepared-checkbox"
              className="text-sm font-medium text-slate-700 cursor-pointer select-none"
            >
              Đã chuẩn bị bài giảng
            </label>
          </div>

          {/* Row 4: Leaders Multi Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
              Trưởng hướng dẫn
            </Label>
            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50/50">
              {branchUsers.length > 0 ? (
                branchUsers.map((u) => {
                  const isChecked = selectedLeaderIds.includes(Number(u.id));
                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleLeaderToggle(u.id)}
                        className="rounded-md"
                      />
                      <span className="font-medium text-slate-700">{u.name}</span>
                      {u.role && (
                        <span className="text-[11px] text-slate-400">
                          ({u.role})
                        </span>
                      )}
                    </label>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-1 text-center">
                  Đang tải danh sách Huỳnh Trưởng...
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Planned vs Actual Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Planned Count */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Số lượng ĐS dự kiến
              </Label>
              <Input
                type="number"
                value={plannedParticipantCount}
                onChange={(e) => setPlannedParticipantCount(e.target.value)}
                placeholder="15"
                min="0"
                className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actual Count (READ ONLY) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  Số lượng ĐS thực tế
                </Label>
                <div
                  className="flex items-center text-slate-400 cursor-help"
                  title="Số lượng thực tế được lấy tự động từ hệ thống điểm danh (Có mặt + Trễ)"
                >
                  <Info className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={`${actualParticipantCount} / ${plannedParticipantCount || 0}`}
                  disabled
                  className="rounded-xl bg-emerald-50 text-emerald-800 font-bold border-emerald-200 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-400" />
                Tự động đồng bộ từ Điểm danh
              </p>
            </div>
          </div>

          {/* Row 6: Common Program & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Common Program */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                Chương trình chung
              </Label>
              <Select value={commonProgramCode} onValueChange={setCommonProgramCode}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn chương trình chung" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {commonPrograms.map((cp) => (
                    <SelectItem key={cp.code} value={cp.code}>
                      {cp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Vị trí
              </Label>
              <Select value={locationCode} onValueChange={setLocationCode}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {locations.map((loc) => (
                    <SelectItem key={loc.code} value={loc.code}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 7: File Attachment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              File bài giảng (Upload Cloudinary)
            </Label>

            {/* Existing files list */}
            {existingFiles.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {existingFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100 text-xs"
                  >
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-700 hover:underline flex items-center gap-1.5 truncate max-w-[80%]"
                    >
                      <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{f.originalName || f.fileName}</span>
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDelete(f.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* File Input */}
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-xs font-medium text-slate-600">
                <Upload className="h-4 w-4 text-slate-400" />
                <span className="truncate">
                  {fileToUpload ? fileToUpload.name : "Chọn file đính kèm (PDF, Word, Image...)"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files[0] || null)}
                  className="hidden"
                />
              </label>
              {fileToUpload && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileToUpload(null)}
                  className="h-9 px-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Xóa chọn
                </Button>
              )}
            </div>
          </div>

          {/* Row 8: Note & Evaluation Percent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Ghi chú
              </Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Chuẩn bị máy chiếu..."
                className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-slate-400" />
                Đánh giá (%)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={evaluationPercent}
                  onChange={(e) => setEvaluationPercent(e.target.value)}
                  placeholder="80"
                  min="0"
                  max="100"
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 hover:bg-slate-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                "Lưu thay đổi"
              ) : (
                "Thêm bài học"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
