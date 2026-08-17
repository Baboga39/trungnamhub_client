import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import programApi from "@/api/programApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, SendHorizontal, UserCheck, ShieldCheck } from "lucide-react";

export default function SendProgramApprovalDialog({
  open,
  onOpenChange,
  program,
  mode = "send", // "send" | "resubmit"
  onSuccess,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && program) {
      loadUsers();
      setSelectedUserIds([]);
    }
  }, [open, program]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all users for branch or system admins
      const res = await programApi.getProgramUsers(program.branchId);
      const userList = res.data || res || [];
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load users for approval:", err);
      toast.error("Không thể tải danh sách người duyệt!");
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 người phê duyệt!");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "resubmit") {
        await programApi.resubmitProgram(program.id, selectedUserIds);
        toast.success("Đã trình lại phiên bản mới thành công!");
      } else {
        await programApi.sendProgramApproval(program.id, selectedUserIds);
        toast.success("Đã gửi yêu cầu phê duyệt thành công!");
      }

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Submit approval error:", err);
      toast.error(err?.response?.data?.message || "Lỗi khi gửi yêu cầu phê duyệt!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <SendHorizontal size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800">
                {mode === "resubmit" ? "Trình lại Chương trình Sinh hoạt" : "Gửi Phê duyệt Chương trình"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {program?.branch?.name || `Ngành ${program?.branchId}`} - Q{program?.quarter}/{program?.year}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <p className="text-sm font-medium text-slate-700">
            Chọn người phê duyệt <span className="text-blue-600 font-bold">({selectedUserIds.length})</span>:
          </p>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách người duyệt...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              Không tìm thấy tài khoản người dùng thích hợp.
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
              {users.map((u) => {
                const selected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selected
                        ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.role === "admin" && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          <ShieldCheck size={12} className="mr-1 inline" /> Admin
                        </Badge>
                      )}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check size={14} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selectedUserIds.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserCheck size={16} />
                {mode === "resubmit" ? "Trình lại ngay" : "Gửi phê duyệt"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
