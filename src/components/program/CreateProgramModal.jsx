import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import programApi from "@/api/programApi";
import { Calendar, Layers, FileText, Loader2 } from "lucide-react";

const BRANCH_OPTIONS = [
  { id: "1", name: "Ngành Ấu" },
  { id: "2", name: "Ngành Thiếu" },
  { id: "3", name: "Ngành Nghĩa" },
  { id: "4", name: "Ngành Hiệp" },
  { id: "5", name: "Ban Huynh Trưởng" },
];

export default function CreateProgramModal({ open, onOpenChange, onSuccess }) {
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === "admin";
  const userBranch = user?.branch || "2";

  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState("3");
  const [branchId, setBranchId] = useState(userBranch);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setYear(new Date().getFullYear());
      setQuarter("3");
      setBranchId(isAdmin ? userBranch || "2" : userBranch);
      setNote("");
    }
  }, [open, isAdmin, userBranch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!year || isNaN(year) || year < 2000) {
      toast.error("Vui lòng nhập năm hợp lệ (ví dụ: 2026)");
      return;
    }

    setLoading(true);
    try {
      const response = await programApi.createProgram({
        year: Number(year),
        quarter: Number(quarter),
        branchId: isAdmin ? String(branchId) : String(userBranch),
        note: note.trim() || null,
      });

      toast.success("Tạo chương trình sinh hoạt thành công!");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(response.data || response);
      }
    } catch (err) {
      console.error("Error creating program:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (bId) => {
    const found = BRANCH_OPTIONS.find((b) => b.id === String(bId) || b.name === String(bId));
    return found ? found.name : `Ngành ${bId}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px] rounded-2xl p-6 bg-white border border-gray-100 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Tạo chương trình sinh hoạt mới
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Tạo khung chương trình sinh hoạt theo Ngành, Năm và Quý.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Branch Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Ngành
            </Label>
            {isAdmin ? (
              <Select value={String(branchId)} onValueChange={setBranchId}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn Ngành" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {BRANCH_OPTIONS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={getBranchName(userBranch)}
                disabled
                className="rounded-xl bg-slate-100 font-medium text-slate-700 cursor-not-allowed border-gray-200"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Year Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Năm
              </Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                min="2000"
                max="2100"
                required
                className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quarter Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quý
              </Label>
              <Select value={String(quarter)} onValueChange={setQuarter}>
                <SelectTrigger className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn Quý" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">Quý 1 (T1 - T3)</SelectItem>
                  <SelectItem value="2">Quý 2 (T4 - T6)</SelectItem>
                  <SelectItem value="3">Quý 3 (T7 - T9)</SelectItem>
                  <SelectItem value="4">Quý 4 (T10 - T12)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Ghi chú (Tùy chọn)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú chung cho quý này..."
              rows={3}
              className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 hover:bg-slate-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang khởi tạo...
                </>
              ) : (
                "Tạo chương trình"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
