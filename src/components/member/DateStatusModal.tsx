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
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "../../libs/utils";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { changeMemberStatus } from "../../features/members/memberThunks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: number | null;
  status: boolean | null; // true = active, false = inactive
  onSuccess?: () => void;
}

export default function DateStatusModal({
  open,
  onOpenChange,
  memberId,
  status,
  onSuccess,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [date, setDate] = useState<Date | null>(new Date());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!memberId || status === null || !date) {
      toast.error("Thiếu thông tin");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        changeMemberStatus({
          memberId,
          status,
          note,
        })
      ).unwrap();

      toast.success("Cập nhật trạng thái thành công ✨");

      onOpenChange(false);
      setNote("");
      setDate(new Date());

      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = status
    ? "Hoạt động lại"
    : "Ngưng sinh hoạt";

  const statusColor = status
    ? "text-green-600"
    : "text-red-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className={cn("text-xl font-semibold", statusColor)}>
              {statusLabel}
            </DialogTitle>
            <DialogDescription>
              Chọn ngày thay đổi trạng thái cho thành viên
            </DialogDescription>
          </DialogHeader>

          {/* DATE PICKER */}
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "dd/MM/yyyy", { locale: vi })
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={(d) => setDate(d || null)}
                  locale={vi}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* NOTE */}
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

          {/* ACTION */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                status
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              )}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}