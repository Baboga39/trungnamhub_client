import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import programApi from "@/api/programApi";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  BookOpen,
  UserCheck,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApproveProgramPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      navigate("/not-found");
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await programApi.getProgramApprovalDetail(token);
        if (!isMounted) return;
        setData(res.data || res);
      } catch (err) {
        console.error("Fetch program approval detail error:", err);
        if (!isMounted) return;
        toast.error(err?.response?.data?.message || "Token phê duyệt không hợp lệ hoặc đã hết hạn!");
        navigate("/not-found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const handleAction = async (action) => {
    try {
      setSubmitting(true);
      await programApi.handleProgramApproval({
        token,
        action,
        comment,
      });

      toast.success(
        action === "APPROVE"
          ? "Đã phê duyệt chương trình sinh hoạt thành công!"
          : "Đã từ chối chương trình sinh hoạt!"
      );
      navigate("/programs");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi xử lý phê duyệt!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin phê duyệt chương trình..." />;
  if (!data) return null;

  const prog = data.program;
  const lessons = prog?.lessons || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-scaleIn">
      <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
              <BookOpen size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Building size={12} className="mr-1 inline" /> {prog.branch?.name || `Ngành ${prog.branchId}`}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  v{prog.version}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mt-1">
                Chương trình Sinh hoạt Quý {prog.quarter}/{prog.year}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Yêu cầu phê duyệt cho {lessons.length} bài học
              </p>
            </div>
          </div>
        </div>

        {/* Note if available */}
        {prog.note && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-sm">
            <strong className="text-slate-900 font-semibold">Ghi chú chương trình:</strong> {prog.note}
          </div>
        )}

        {/* Lessons List Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays size={20} className="text-blue-600" />
            Danh sách bài học trong Quý ({lessons.length} bài)
          </h2>

          {lessons.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              Chưa có bài học nào được thêm vào chương trình này.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id || idx}
                  className="p-4 bg-slate-50 border rounded-xl space-y-2 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-base">
                      Bài {idx + 1}: {lesson.lessonText}
                    </span>
                    <span className="text-xs bg-white px-2.5 py-1 rounded-md border font-medium text-slate-600 flex items-center gap-1">
                      <CalendarDays size={12} /> {lesson.date}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {lesson.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {lesson.durationMinutes} phút
                      </span>
                    )}
                    {lesson.locationCode && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {lesson.locationCode}
                      </span>
                    )}
                  </div>

                  {lesson.leaders && lesson.leaders.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lesson.leaders.map((ldr, i) => (
                        <Badge key={i} variant="outline" className="text-[11px] bg-white">
                          <UserCheck size={11} className="mr-1 inline text-blue-500" />
                          {ldr.name} ({ldr.role})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {lesson.files && lesson.files.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2">
                      {lesson.files.map((file, fIdx) => (
                        <a
                          key={fIdx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                        >
                          <FileText size={12} /> {file.originalName}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-semibold text-slate-700">
            Ghi chú / Nhận xét của Người duyệt (Tùy chọn)
          </label>
          <textarea
            className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 min-h-[100px] outline-none text-sm"
            placeholder="Nhập lý do nếu bạn từ chối hoặc lời nhắn gửi Ban điều hành..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={() => handleAction("REJECT")}
            disabled={submitting}
            className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            <XCircle size={20} />
            Từ Chối Bản Này
          </button>

          <button
            onClick={() => handleAction("APPROVE")}
            disabled={submitting}
            className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Đồng Ý Phê Duyệt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
