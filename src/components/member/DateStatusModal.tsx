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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { changeMemberStatus } from "../../features/members/memberThunks";

interface Member {
  id: number;
  active: boolean;
  promotionDate?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess?: () => void;
}

export default function DateStatusModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: Props){
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState<
  "ACTIVE" | "INACTIVE" | "PROMOTED"
>("ACTIVE");

const [date, setDate] = useState<Date | null>(new Date());

const [note, setNote] = useState("");

const [loading, setLoading] = useState(false);
useEffect(() => {
  if (!member) return;

  if (member.active) {
    setStatus("ACTIVE");
  } else if (member.promotionDate) {
    setStatus("PROMOTED");
  } else {
    setStatus("INACTIVE");
  }

  setDate(new Date());
  setNote("");
}, [member]);

const handleSubmit = async () => {

  if (!member) {
    toast.error("Thiếu thông tin");
    return;
  }

  try {
    setLoading(true);

    await dispatch(
      changeMemberStatus({
        memberId: member.id,

        status: status === "ACTIVE",

        promotionDate:
          status === "PROMOTED"
            ? date?.toISOString()
            : null,

        note,
      })
    ).unwrap();

    toast.success("Cập nhật trạng thái thành công");

    onOpenChange(false);

    onSuccess?.();
  } catch (err: any) {
    toast.error(err?.message || "Có lỗi xảy ra");
  } finally {
    setLoading(false);
  }
};

  const statusLabel =
    status === "ACTIVE"
      ? "Hoạt động lại"
      : status === "PROMOTED"
        ? "Lên ngành"
        : "Ngưng sinh hoạt";

  const statusColor =
    status === "ACTIVE"
      ? "text-green-600"
      : status === "PROMOTED"
        ? "text-blue-600"
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
              {status === "PROMOTED"
                ? "Chọn ngày lên ngành"
                : "Xác nhận thay đổi trạng thái thành viên"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
  <Label>Trạng thái</Label>

  <Select
    value={status}
    onValueChange={(value) =>
      setStatus(value as "ACTIVE" | "INACTIVE" | "PROMOTED")
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="ACTIVE">
        Đang sinh hoạt
      </SelectItem>

      <SelectItem value="INACTIVE">
        Ngưng sinh hoạt
      </SelectItem>

      <SelectItem value="PROMOTED">
        Đã lên ngành
      </SelectItem>
    </SelectContent>
  </Select>
</div>  

          {/* DATE PICKER */}
          {status === "PROMOTED" && (
            <div className="space-y-2">
              {" "}
              <Label>Ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !date && "text-muted-foreground",
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
          )}

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
                status === "ACTIVE"
                  ? "bg-green-600 hover:bg-green-700"
                  : status === "PROMOTED"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-500 hover:bg-red-600",
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
