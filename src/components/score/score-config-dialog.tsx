"use client";

import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Settings2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calculator,
  Info,
  Scale,
  Sparkles,
  HelpCircle,
  BarChart3,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  upsertCategoryThunk,
  deleteCategoryThunk,
  getCategoriesThunk,
  getAllThunk,
} from "@/features/score/scoreThunks";

interface ScoreConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_PALETTE = [
  { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
  { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-200" },
  { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
  { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50", border: "border-cyan-200" },
  { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50", border: "border-teal-200" },
];

export function ScoreConfigDialog({ open, onOpenChange }: ScoreConfigDialogProps) {
  const dispatch = useDispatch();
  const { categories } = useSelector((state: any) => state.grades);

  // State cho thêm mới
  const [newCatName, setNewCatName] = useState("");
  const [newCatWeight, setNewCatWeight] = useState<number | string>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState<number | string>(1);

  // State cho modal xóa an toàn
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State tìm kiếm môn học
  const [searchQuery, setSearchQuery] = useState("");

  // Danh sách phân loại
  const regularCategories = useMemo(
    () => categories.filter((c: any) => c.name !== "Thưởng" && c.name !== "Phạt"),
    [categories]
  );

  const specialCategories = useMemo(
    () => categories.filter((c: any) => c.name === "Thưởng" || c.name === "Phạt"),
    [categories]
  );

  const totalWeight = useMemo(() => {
    return regularCategories.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0);
  }, [regularCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return regularCategories;
    const q = searchQuery.toLowerCase().trim();
    return regularCategories.filter((c: any) => c.name.toLowerCase().includes(q));
  }, [regularCategories, searchQuery]);

  // Xử lý thêm hạng mục mới
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Vui lòng nhập tên hạng mục điểm");
      return;
    }
    const weightNum = Number(newCatWeight);
    if (isNaN(weightNum) || weightNum < 0) {
      toast.error("Trọng số (hệ số) phải là số >= 0");
      return;
    }

    try {
      setIsSubmitting(true);
      await (dispatch as any)(
        upsertCategoryThunk({
          name: newCatName.trim(),
          weight: weightNum,
          active: true,
        })
      ).unwrap();

      toast.success(`Đã thêm môn "${newCatName.trim()}" (Hệ số ${weightNum}) thành công!`);
      setNewCatName("");
      setNewCatWeight(1);
      dispatch(getCategoriesThunk() as any);
      dispatch(getAllThunk() as any);
    } catch (err: any) {
      toast.error("Thêm hạng mục thất bại: " + (err?.message || err || "Lỗi không xác định"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditWeight(cat.weight);
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditWeight(1);
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      toast.error("Tên hạng mục không được để trống");
      return;
    }
    const weightNum = Number(editWeight);
    if (isNaN(weightNum) || weightNum < 0) {
      toast.error("Trọng số phải là số >= 0");
      return;
    }

    try {
      setIsSubmitting(true);
      await (dispatch as any)(
        upsertCategoryThunk({
          id,
          name: editName.trim(),
          weight: weightNum,
          active: true,
        })
      ).unwrap();

      toast.success(`Đã cập nhật môn "${editName.trim()}"!`);
      setEditingId(null);
      dispatch(getCategoriesThunk() as any);
      dispatch(getAllThunk() as any);
    } catch (err: any) {
      toast.error("Cập nhật thất bại: " + (err?.message || err || "Lỗi không xác định"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDeleteConfirm = (cat: any) => {
    setCategoryToDelete(cat);
    setIsConfirmDeleteOpen(true);
  };

  // Xác nhận xóa hạng mục
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await (dispatch as any)(deleteCategoryThunk(categoryToDelete.id)).unwrap();
      toast.success(`Đã xóa hạng mục "${categoryToDelete.name}" thành công!`);
      dispatch(getCategoriesThunk() as any);
      dispatch(getAllThunk() as any);
    } catch (err: any) {
      toast.error("Xóa thất bại: " + (err?.message || err || "Lỗi không xác định"));
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-slate-200 shadow-2xl">
          {/* Header với Gradient đẹp mắt */}
          <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-t-3xl border-b border-indigo-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  Cấu Hình Môn Học & Trọng Số
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-xs sm:text-sm mt-0.5">
                  Tùy biến các cột điểm thi đua và thay đổi trọng số (hệ số) áp dụng cho công thức tính.
                </DialogDescription>
              </div>
            </div>

            {/* Thẻ công thức trực quan */}
            <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100 text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between font-semibold text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Calculator className="h-4 w-4" /> Công thức tính điểm tổng:
                </span>
                <span className="bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full text-xs border border-blue-400/30">
                  Linh hoạt theo môn có điểm
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 font-mono text-xs sm:text-sm text-center text-emerald-300 border border-emerald-500/20 overflow-x-auto">
                Tổng điểm = [ (Σ Điểm môn có điểm × Hệ số) / (Σ Hệ số các môn có điểm) ] + Thưởng - Phạt + Hoạt động
              </div>
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="p-7 space-y-6 bg-slate-50/50">
            {/* Form thêm mới */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3.5 text-slate-800 font-bold text-sm">
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Thêm cột điểm / Môn học mới</span>
              </div>
              <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">
                    Tên môn / Hạng mục <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Giáo lý Hè, Kinh thánh, Kỷ luật..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">
                    Trọng số (Hệ số) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newCatWeight}
                    onChange={(e) => setNewCatWeight(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm font-semibold text-blue-600"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {isSubmitting ? "Đang thêm..." : "Thêm mục"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Danh sách các hạng mục tính điểm theo trọng số */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  Môn học tính theo hệ số ({regularCategories.length})
                </h3>
                <div className="relative w-full sm:w-52">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm môn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {filteredCategories.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    {searchQuery ? "Không tìm thấy môn học phù hợp." : "Chưa có hạng mục điểm nào. Hãy thêm hạng mục đầu tiên phía trên."}
                  </div>
                ) : (
                  filteredCategories.map((cat: any, index: number) => {
                    const isEditing = editingId === cat.id;
                    const isAttendance = cat.name === "Chuyên cần";
                    const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                    const percentage = ((Number(cat.weight) / (totalWeight || 1)) * 100).toFixed(0);

                    return (
                      <div
                        key={cat.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                            <div className="sm:col-span-7">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-9 rounded-lg text-sm bg-white"
                                placeholder="Tên hạng mục"
                              />
                            </div>
                            <div className="sm:col-span-5 flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                className="h-9 rounded-lg text-sm font-semibold text-blue-600 w-24 bg-white"
                                placeholder="Hệ số"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(cat.id)}
                                disabled={isSubmitting}
                                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-9 px-3 border-slate-300 text-slate-600 rounded-lg text-xs"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`h-9 w-9 rounded-xl ${color.light} border ${color.border} ${color.text} flex items-center justify-center font-bold text-xs shrink-0`}>
                                {cat.weight}×
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                                  {isAttendance && (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-normal py-0">
                                      Tự động từ điểm danh
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span>Trọng số: <strong>{cat.weight}</strong></span>
                                  <span className={`font-semibold ${color.text}`}>{percentage}% tỷ trọng</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(cat)}
                                className="h-8 px-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium"
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" /> Sửa
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDeleteConfirm(cat)}
                                className="h-8 px-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Các mục cộng / trừ trực tiếp */}
            {specialCategories.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Hạng mục cộng/trừ trực tiếp (Thưởng & Phạt)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specialCategories.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                          <Badge
                            className={
                              cat.name === "Thưởng"
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {cat.name === "Thưởng" ? "+ Cộng điểm" : "- Trừ điểm"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Cộng/trừ trực tiếp vào điểm tổng sau khi nhân hệ số
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-7 py-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between sm:justify-end gap-2 rounded-b-3xl">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-6"
            >
              Đóng cấu hình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal xác nhận xóa an toàn */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Xác nhận xóa môn học / hạng mục điểm"
        description={`Bạn có chắc chắn muốn xóa hạng mục "${categoryToDelete?.name}" (Hệ số ${categoryToDelete?.weight})?`}
        message={
          categoryToDelete?.name === "Chuyên cần" || categoryToDelete?.name === "Thưởng" || categoryToDelete?.name === "Phạt"
            ? `Cảnh báo: "${categoryToDelete?.name}" là hạng mục mặc định của hệ thống. Nếu xóa/ẩn, các công thức tính toán liên quan có thể bị ảnh hưởng.`
            : "Hành động này sẽ ẩn/xóa cột điểm này khỏi bảng điểm và các form nhập điểm tiếp theo."
        }
        icon="trash"
        iconColor="red"
        isDangerous={true}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
