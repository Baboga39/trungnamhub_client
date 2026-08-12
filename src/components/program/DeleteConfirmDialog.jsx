import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận xóa",
  description = "Bạn có chắc muốn xóa mục này? Thao tác không thể hoàn tác.",
  onConfirm,
  loading = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-[420px] border border-gray-100 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-slate-50">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-200"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
