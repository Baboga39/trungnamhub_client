"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Loader2, ArrowUpCircle, ChevronRight } from "lucide-react";
import { cn } from "../../libs/utils";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { promoteBranch } from "../../features/members/memberThunks";

const BRANCH_LIST = [
  { level: 1, name: "Đồng", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { level: 2, name: "Thiếu", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { level: 3, name: "Thanh", color: "bg-blue-100 text-blue-700 border-blue-300" },
];

interface Member {
  id: number;
  name: string;
  branch?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess?: () => void;
}

function getBranchInfo(branchName: string | null | undefined) {
  if (!branchName) return null;
  const normalized = branchName.trim().normalize("NFC");
  return BRANCH_LIST.find(
    (b) => normalized.toLowerCase() === b.name.toLowerCase()
  ) || null;
}

export default function PromoteBranchModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const currentBranch = getBranchInfo(member?.branch);
  const nextBranch = currentBranch
    ? BRANCH_LIST.find((b) => b.level === currentBranch.level + 1)
    : null;

  const canPromote = currentBranch && nextBranch;
  const isMaxLevel = currentBranch && !nextBranch;
  const isInvalidBranch = member && !currentBranch;

  const handleSubmit = async () => {
    if (!member || !canPromote) return;

    try {
      setLoading(true);
      await dispatch(
        promoteBranch({ memberId: member.id, note })
      ).unwrap();
      toast.success(
        `Lên ngành thành công: ${currentBranch!.name} → ${nextBranch!.name}`
      );
      setNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi lên ngành");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5" />
              Lên Ngành
            </DialogTitle>
            <DialogDescription>
              {member
                ? `Chuyển ngành cho: ${member.name}`
                : "Chọn đoàn sinh để lên ngành"}
            </DialogDescription>
          </DialogHeader>

          {/* Branch Progress */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-600">
              Tiến trình Ngành
            </Label>
            <div className="flex items-center justify-center gap-2 py-3">
              {BRANCH_LIST.map((branch, index) => {
                const isCurrent =
                  currentBranch?.level === branch.level;
                const isNext = nextBranch?.level === branch.level;
                const isPast =
                  currentBranch && branch.level < currentBranch.level;

                return (
                  <div key={branch.level} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-300",
                        isCurrent &&
                          `${branch.color} ring-2 ring-offset-2 ring-current scale-105`,
                        isNext &&
                          "bg-indigo-50 text-indigo-600 border-indigo-300 border-dashed animate-pulse",
                        isPast &&
                          "bg-slate-100 text-slate-400 border-slate-200 line-through",
                        !isCurrent &&
                          !isNext &&
                          !isPast &&
                          "bg-slate-50 text-slate-400 border-slate-200"
                      )}
                    >
                      <div className="text-xs opacity-60 mb-0.5">
                        Cấp {branch.level}
                      </div>
                      {branch.name}
                    </div>
                    {index < BRANCH_LIST.length - 1 && (
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isNext ? "text-indigo-500" : "text-slate-300"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Messages */}
          {isInvalidBranch && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-3 text-sm">
              ⚠️ Ngành hiện tại "{member?.branch || "(trống)"}" không hợp lệ.
              Vui lòng cập nhật ngành trước khi lên ngành.
            </div>
          )}

          {isMaxLevel && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3 text-sm">
              🎓 Đoàn sinh đã ở ngành cao nhất ({currentBranch?.name}
              ), không thể lên thêm.
            </div>
          )}

          {canPromote && (
            <>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <div className="text-sm text-slate-500 mb-1">
                  Sẽ chuyển từ
                </div>
                <div className="flex items-center justify-center gap-3 text-lg font-bold">
                  <span className={cn("px-3 py-1 rounded-lg border", currentBranch!.color)}>
                    {currentBranch!.name}
                  </span>
                  <span className="text-indigo-500">→</span>
                  <span className={cn("px-3 py-1 rounded-lg border", nextBranch!.color)}>
                    {nextBranch!.name}
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>Ghi chú (tuỳ chọn)</Label>
                <Textarea
                  placeholder="Nhập lý do hoặc ghi chú..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>

            {canPromote && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Xác nhận lên ngành
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
