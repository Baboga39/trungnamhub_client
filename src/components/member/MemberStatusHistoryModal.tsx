"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";


interface StatusHistory {
  id: number;
  memberId: number;
  status: boolean;
  date: string;
  note: string | null;
  createdAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StatusHistory[];
  loading?: boolean;
  onDelete?: (ids: number[]) => Promise<void>;
}

export default function MemberStatusHistoryModal({
  open,
  onOpenChange,
  data = [],
  loading = false,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<StatusHistory[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(data);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        data.filter(
          (i) =>
            i.date.toLowerCase().includes(q) ||
            (i.note || "").toLowerCase().includes(q),
        ),
      );
    }
  }, [search, data]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length || !onDelete) return;
    await onDelete(selectedIds);
    setSelectedIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Lịch sử hoạt động
          </DialogTitle>
        </DialogHeader>

        {/* Bulk delete */}
        {selectedIds.length > 0 && (
          <div className="flex justify-between items-center mt-3 bg-red-50 border border-red-200 p-3 rounded-lg">
            <span className="text-sm font-medium text-red-700">
              Đã chọn {selectedIds.length} mục
            </span>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
            >
              <Trash2 className="w-4 h-4" />
              Xóa đã chọn
            </button>
          </div>
        )}

        {/* List */}
        <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => {
              const selected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition flex items-start gap-3",
                    selected
                      ? "bg-red-50 border-red-300"
                      : "hover:bg-slate-50 border-slate-200",
                  )}
                >
                  {/* Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 cursor-pointer rounded"
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          Ngày trạng thái:
                        </span>
                        <span className="text-sm text-slate-600">
                          {item.date}
                        </span>
                      </div>
                      <Badge
                        className={
                          item.status
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {item.status ? "✓ Hoạt động" : "✕ Nghỉ sinh hoạt"}
                      </Badge>
                    </div>

                    {/* Note */}
                    {item.note && (
                      <div className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded mb-2 inline-block">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {item.note}
                      </div>
                    )}

                    {/* Created At */}
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {item.createdAt}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Inbox className="w-12 h-12 mb-3 opacity-60" />
              <p className="text-lg font-semibold">Không có dữ liệu</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
