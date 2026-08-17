import React, { useState, useEffect } from "react";
import programApi from "@/api/programApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, History, Loader2, MessageSquare } from "lucide-react";

export default function ProgramApprovalHistoryModal({ open, onOpenChange, programId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && programId) {
      loadHistory();
    }
  }, [open, programId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await programApi.getProgramApprovalHistory(programId);
      setLogs(res.data || res || []);
    } catch (err) {
      console.error("Failed to load approval history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "APPROVE":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 font-semibold">
            <CheckCircle2 size={14} /> Đã Phê Duyệt
          </Badge>
        );
      case "REJECT":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-semibold">
            <XCircle size={14} /> Từ Chối
          </Badge>
        );
      case "RESUBMIT":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1 font-semibold">
            <RefreshCw size={14} /> Trình Lại
          </Badge>
        );
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <History size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">
                Lịch sử Phê duyệt
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Nhật ký thao tác và nhận xét qua các phiên bản
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-3 max-h-[350px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải lịch sử...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              Chưa có lịch sử phê duyệt nào cho chương trình này.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                      log.action === "APPROVE"
                        ? "border-emerald-500 bg-emerald-50"
                        : log.action === "REJECT"
                        ? "border-red-500 bg-red-50"
                        : "border-blue-500 bg-blue-50"
                    }`}
                  />

                  <div className="bg-slate-50 border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">
                        {log.reviewerName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        v{log.version}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {getActionBadge(log.action)}
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    {log.comment && (
                      <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border flex items-start gap-1.5">
                        <MessageSquare size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="italic">"{log.comment}"</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
