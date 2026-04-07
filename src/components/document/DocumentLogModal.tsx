"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Clock } from "lucide-react";
import documentApi from "@/api/documentApi";

export function DocumentLogModal({ open, onOpenChange, documentId }: any) {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && documentId) {
      setLoading(true);
      documentApi
        .getLogs(documentId)
        .then((res: any) => {
          setLogs(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to fetch logs:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, documentId]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: any) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* modal */}
      <div className="relative z-10 w-[600px] bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-h-[80vh] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Lịch sử phê duyệt
              </h2>
              <p className="text-sm text-slate-500">
                Lịch sử tất cả thay đổi và phê duyệt của tài liệu
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              <span className="animate-pulse">Đang tải dữ liệu...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
              Không có lịch sử phê duyệt nào.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any) => {
                const actionColors: Record<string, string> = {
                  APPROVE: "bg-green-100 text-green-700 border-green-200",
                  REJECT: "bg-red-100 text-red-700 border-red-200",
                  RESUBMIT: "bg-blue-100 text-blue-700 border-blue-200",
                };
                const actionLabels: Record<string, string> = {
                  APPROVE: "Đã phê duyệt",
                  REJECT: "Đã từ chối",
                  RESUBMIT: "Tái gửi",
                };

                const colorClass = actionColors[log.action] || "bg-slate-100 text-slate-700";
                const label = actionLabels[log.action] || log.action;

                return (
                  <div key={log.id} className="p-4 border rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {log.reviewer?.name || "Người dùng"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.reviewer?.email}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${colorClass}`}>
                        {label} - v{log.version}
                      </span>
                    </div>
                    {log.comment && (
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 mt-1">
                        <span className="font-medium">Ghi chú:</span> {log.comment}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-1">
                      {new Date(log.createdAt).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
