import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import programApi from "@/api/programApi";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Layers,
  BookOpen,
  Loader2,
  Inbox,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function PendingProgramApprovalsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Confirm Modal state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null); // "APPROVE" | "REJECT"
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await programApi.getPendingProgramApprovals();
      setData(res.data || res || []);
    } catch (err) {
      console.error("Fetch pending program approvals error:", err);
      toast.error(err?.response?.data?.message || "Không thể tải danh sách chương trình chờ duyệt");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleOpenAction = (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setComment("");
    setOpenConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return;
    try {
      setSubmitting(true);
      // Gọi API duyệt theo user ID (kèm programId)
      await programApi.handleProgramApprovalByUser(selectedItem.program.id, {
        action: actionType,
        comment,
      });

      toast.success(
        actionType === "APPROVE"
          ? "Đã phê duyệt chương trình sinh hoạt thành công!"
          : "Đã từ chối chương trình sinh hoạt!"
      );
      setOpenConfirm(false);
      fetchPending(true);
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-600" />
              Chương trình chờ duyệt
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Danh sách các chương trình sinh hoạt theo Quý đang chờ bạn xem xét và phê duyệt
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPending(true)}
            disabled={refreshing}
            className="rounded-xl border-gray-200 hover:bg-slate-50 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-slate-500 font-medium">
              Đang tải danh sách chờ duyệt...
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              Không có chương trình nào cần duyệt
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Hiện tại bạn không có yêu cầu phê duyệt chương trình sinh hoạt nào đang chờ xử lý.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((item) => {
              const prog = item.program;
              return (
                <Card
                  key={item.tokenId}
                  className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 pt-5 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
                          <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800">
                            Quý {prog.quarter} / {prog.year}
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {prog.branch?.name || `Ngành ${prog.branchId}`} • v{prog.version}
                          </CardDescription>
                        </div>
                      </div>

                      <Badge className="text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-200">
                        Cần bạn duyệt
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong className="text-slate-700">{prog.lessonCount}</strong> bài học
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>

                    {prog.note && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2 italic">
                        "{prog.note}"
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/programs/${prog.id}`)}
                        className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                        Xem chi tiết bài học
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAction(item, "REJECT")}
                          className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAction(item, "APPROVE")}
                          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Phê duyệt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal Confirm with feedback */}
        {openConfirm && selectedItem && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !submitting && setOpenConfirm(false)}
            />
            <div className="relative z-10 w-[440px] max-w-[90vw] bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-scaleIn">
              <div className="flex items-center gap-3">
                {actionType === "APPROVE" ? (
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <CheckCircle size={24} />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <XCircle size={24} />
                  </div>
                )}
                <h2
                  className={`text-xl font-bold ${
                    actionType === "APPROVE" ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {actionType === "APPROVE"
                    ? "Phê Duyệt Chương Trình"
                    : "Từ Chối Chương Trình"}
                </h2>
              </div>

              <p className="text-sm text-slate-600 border-l-4 border-slate-200 pl-3 py-1">
                Chương trình:{" "}
                <strong>
                  Quý {selectedItem.program.quarter}/{selectedItem.program.year} (
                  {selectedItem.program.branch?.name || `Ngành ${selectedItem.program.branchId}`})
                </strong>
              </p>

              <textarea
                className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[100px]"
                placeholder={
                  actionType === "APPROVE"
                    ? "Nhập ghi chú hoặc lời nhắn (tùy chọn)..."
                    : "Bắt buộc nhập lý do từ chối để phụ trách chỉnh sửa..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenConfirm(false)}
                  disabled={submitting}
                  className="rounded-xl text-slate-600"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={submitting || (actionType === "REJECT" && !comment.trim())}
                  className={`rounded-xl text-white font-medium min-w-[120px] ${
                    actionType === "APPROVE"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Xác nhận"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ScrollToTopButton />
    </AdminLayout>
  );
}
