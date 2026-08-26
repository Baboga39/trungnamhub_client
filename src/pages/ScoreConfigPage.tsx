"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calculator,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  BarChart3,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getCategoriesThunk,
  upsertCategoryThunk,
  deleteCategoryThunk,
  getAllThunk,
} from "@/features/score/scoreThunks";
import { getRank, getRankColor } from "@/libs/score-utils";

// Bảng màu phân bổ trọng số hài hòa theo phong cách Trung Nam Hub
const COLOR_PALETTE = [
  { bg: "bg-blue-600", text: "text-blue-700", light: "bg-blue-50", border: "border-blue-200" },
  { bg: "bg-indigo-600", text: "text-indigo-700", light: "bg-indigo-50", border: "border-indigo-200" },
  { bg: "bg-sky-600", text: "text-sky-700", light: "bg-sky-50", border: "border-sky-200" },
  { bg: "bg-slate-600", text: "text-slate-700", light: "bg-slate-100", border: "border-slate-300" },
  { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50/80", border: "border-blue-200" },
  { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50/80", border: "border-indigo-200" },
];

export default function ScoreConfigPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state: any) => state.grades);

  // State cho hiển thị giải thích công thức
  const [showFormula, setShowFormula] = useState(false);

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

  // State cho bộ mô phỏng tính điểm (Live Score Simulator)
  const [simulatedScores, setSimulatedScores] = useState<Record<string, number>>({});
  const [simulatedBonus, setSimulatedBonus] = useState<number>(0);
  const [simulatedPenalty, setSimulatedPenalty] = useState<number>(0);
  const [simulatedActivity, setSimulatedActivity] = useState<number>(0.6);

  useEffect(() => {
    dispatch(getCategoriesThunk() as any);
  }, [dispatch]);

  // Phân loại danh mục
  const regularCategories = useMemo(
    () => categories.filter((c: any) => c.name !== "Thưởng" && c.name !== "Phạt"),
    [categories]
  );

  const specialCategories = useMemo(
    () => categories.filter((c: any) => c.name === "Thưởng" || c.name === "Phạt"),
    [categories]
  );

  const totalWeight = useMemo(() => {
    return regularCategories.reduce(
      (sum: number, c: any) => sum + (Number(c.weight) || 0),
      0
    );
  }, [regularCategories]);

  // Khởi tạo điểm mô phỏng mặc định
  useEffect(() => {
    if (regularCategories.length > 0) {
      const initialSim: Record<string, number> = {};
      regularCategories.forEach((c: any) => {
        if (simulatedScores[c.id] === undefined) {
          initialSim[c.id] = c.name === "Chuyên cần" ? 9 : 8;
        } else {
          initialSim[c.id] = simulatedScores[c.id];
        }
      });
      setSimulatedScores(initialSim);
    }
  }, [regularCategories]);

  // Tính toán kết quả mô phỏng
  const simulationResult = useMemo(() => {
    let weightedSum = 0;
    let sumWeight = 0;

    regularCategories.forEach((cat: any) => {
      const score = simulatedScores[cat.id] ?? 8;
      const weight = Number(cat.weight) || 0;
      weightedSum += score * weight;
      sumWeight += weight;
    });

    const baseScore = sumWeight > 0 ? weightedSum / sumWeight : 0;
    const finalTotal = baseScore + simulatedBonus - simulatedPenalty + simulatedActivity;
    const rank = getRank(finalTotal);

    return {
      baseScore: parseFloat(baseScore.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      rank,
    };
  }, [regularCategories, simulatedScores, simulatedBonus, simulatedPenalty, simulatedActivity]);

  // Danh sách môn học được lọc theo search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return regularCategories;
    const q = searchQuery.toLowerCase().trim();
    return regularCategories.filter((c: any) => c.name.toLowerCase().includes(q));
  }, [regularCategories, searchQuery]);

  // Thêm hạng mục mới
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Vui lòng nhập tên môn / hạng mục điểm");
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
      toast.error(
        "Thêm hạng mục thất bại: " + (err?.message || err || "Lỗi không xác định")
      );
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

      toast.success(`Đã cập nhật hạng mục "${editName.trim()}"!`);
      setEditingId(null);
      dispatch(getCategoriesThunk() as any);
      dispatch(getAllThunk() as any);
    } catch (err: any) {
      toast.error(
        "Cập nhật thất bại: " + (err?.message || err || "Lỗi không xác định")
      );
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
      toast.error(
        "Xóa thất bại: " + (err?.message || err || "Lỗi không xác định")
      );
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  // Reset mô phỏng về mặc định
  const handleResetSimulation = () => {
    const defaultSim: Record<string, number> = {};
    regularCategories.forEach((c: any) => {
      defaultSim[c.id] = c.name === "Chuyên cần" ? 9 : 8;
    });
    setSimulatedScores(defaultSim);
    setSimulatedBonus(0);
    setSimulatedPenalty(0);
    setSimulatedActivity(0.6);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-blue-600" />
              Cấu hình môn học & trọng số
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Quản lý các cột điểm thi đua và phân bổ hệ số nhân áp dụng cho bảng điểm và báo cáo.
            </p>
          </div>
          <Button
            onClick={() => navigate("/scores")}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-2 text-sm w-fit"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Xem bảng điểm thi đua</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng số cột điểm</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{categories.length}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                {regularCategories.length} môn + {specialCategories.length} T/P
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng trọng số</p>
                <p className="text-2xl font-bold text-blue-600 mt-0.5">{totalWeight}</p>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-medium">
                Mẫu số gia quyền
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Môn tính hệ số</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{regularCategories.length}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                Điểm cơ sở
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Thưởng / Phạt</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{specialCategories.length}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                Cộng/Trừ trực tiếp
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Thanh Phân Bổ Tỷ Trọng Môn Học */}
        {regularCategories.length > 0 && (
          <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Tỷ trọng đóng góp điểm của các môn học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phần trăm đóng góp của từng môn trong điểm cơ sở có trọng số (Tổng trọng số: {totalWeight})
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-slate-50 border-slate-200 self-start sm:self-auto">
                Σ Hệ số = {totalWeight}
              </Badge>
            </div>

            {/* Visual multi-segment bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {regularCategories.map((cat: any, index: number) => {
                const percent = (Number(cat.weight) / (totalWeight || 1)) * 100;
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                return (
                  <div
                    key={cat.id}
                    className={`h-full ${color.bg} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                    title={`${cat.name}: Hệ số ${cat.weight} (${percent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend badges */}
            <div className="flex flex-wrap gap-2 pt-0.5">
              {regularCategories.map((cat: any, index: number) => {
                const percent = ((Number(cat.weight) / (totalWeight || 1)) * 100).toFixed(1);
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                return (
                  <div
                    key={cat.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${color.light} border ${color.border} text-xs`}
                  >
                    <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500">(HS {cat.weight})</span>
                    <span className={`font-bold ${color.text}`}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Collapsible Formula Section */}
        <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFormula((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm font-bold text-slate-800">
                  Công thức tính điểm thi đua (Bình quân gia quyền động)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động chia theo tổng hệ số của các môn thực tế có điểm trong quý
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-600 hidden sm:inline">
                {showFormula ? "Thu gọn" : "Xem chi tiết"}
              </span>
              {showFormula ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </div>
          </button>

          {showFormula && (
            <CardContent className="p-5 pt-0 border-t border-slate-100 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 text-center tracking-wide overflow-x-auto">
                Tổng điểm = [ (Σ Điểm môn có điểm × Hệ số) / (Σ Hệ số của các môn có điểm) ] + Thưởng - Phạt + Điểm hoạt động
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-blue-600" /> 1. Điểm cơ sở theo môn thực tế
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Từng môn nhân với Hệ số tương ứng, sau đó chia cho <strong>tổng trọng số của những môn thực tế có điểm</strong> trong quý.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-emerald-600" /> 2. Thưởng & Phạt
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Điểm Thưởng (+) hoặc Phạt (-) được cộng/trừ trực tiếp vào điểm tổng kết quả.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-600" /> 3. Điểm hoạt động
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Tự động cộng từ các buổi tham gia hoạt động ngoại khóa thực tế (+0.2 điểm/buổi).
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Live Interactive Score Simulator */}
        <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-600 fill-current" />
                Trình mô phỏng tính điểm trực quan
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Kéo điểm thử nghiệm để xem ngay tác động của hệ số lên tổng điểm và xếp loại.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSimulation}
              className="h-8 px-2.5 text-xs rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Đặt lại thử nghiệm
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {regularCategories.map((cat: any, index: number) => {
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                const currentVal = simulatedScores[cat.id] ?? 8;
                return (
                  <div key={cat.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span className="text-slate-500 font-medium">(Hệ số {cat.weight})</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={currentVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSimulatedScores((prev) => ({
                            ...prev,
                            [cat.id]: Number(e.target.value),
                          }))
                        }
                        className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                      <span className={`w-11 text-center font-bold text-xs px-1.5 py-0.5 rounded-md ${color.light} ${color.text} border ${color.border}`}>
                        {currentVal}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bonus / Penalty / Activity Sliders */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Thưởng (+)</span>
                  <span className="text-emerald-600 text-[11px] font-medium">+ Cộng trực tiếp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={simulatedBonus}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedBonus(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer h-1.5 bg-emerald-100 rounded-lg"
                  />
                  <span className="w-11 text-center font-bold text-xs px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-300">
                    +{simulatedBonus}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-800">Phạt (-)</span>
                  <span className="text-red-600 text-[11px] font-medium">- Trừ trực tiếp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={simulatedPenalty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedPenalty(Number(e.target.value))}
                    className="flex-1 accent-red-600 cursor-pointer h-1.5 bg-red-100 rounded-lg"
                  />
                  <span className="w-11 text-center font-bold text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-300">
                    -{simulatedPenalty}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800">Điểm hoạt động</span>
                  <span className="text-amber-600 text-[11px] font-medium">+0.2/buổi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.2"
                    value={simulatedActivity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedActivity(Number(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer h-1.5 bg-amber-100 rounded-lg"
                  />
                  <span className="w-11 text-center font-bold text-xs px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-300">
                    +{simulatedActivity}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Result Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-700">
                    Kết quả mô phỏng
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Điểm cơ sở: <strong className="text-slate-800">{simulationResult.baseScore}</strong> | Thưởng/Phạt: <strong className="text-emerald-700">+{simulatedBonus}</strong> / <strong className="text-red-700">-{simulatedPenalty}</strong> | Hoạt động: <strong className="text-amber-700">+{simulatedActivity}</strong>
                </p>
              </div>

              <div className="flex items-center gap-5 self-start sm:self-center">
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Tổng điểm thi đua</p>
                  <p className="text-2xl font-extrabold text-blue-600 tracking-tight">
                    {simulationResult.finalTotal}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5">Xếp loại dự kiến</p>
                  <Badge className={`text-xs font-bold px-3 py-0.5 ${getRankColor(simulationResult.rank)}`}>
                    {simulationResult.rank}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Thêm mới & Thưởng phạt */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Thêm môn / Cột điểm mới
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Tạo thêm môn học / hạng mục đánh giá mới
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleAddCategory} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Tên hạng mục điểm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="VD: Giáo lý Hè, Kinh thánh, Kỷ luật..."
                      value={newCatName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                      className="h-10 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Trọng số (Hệ số nhân) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="1, 2, 3..."
                      value={newCatWeight}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatWeight(e.target.value)}
                      className="h-10 rounded-lg text-sm font-semibold text-blue-600"
                      required
                    />
                    {/* Quick preset weight buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                      {[1, 2, 3, 4].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setNewCatWeight(w)}
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors ${
                            Number(newCatWeight) === w
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          HS {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-xs transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    {isSubmitting ? "Đang thêm..." : "Thêm cột điểm"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Thẻ Thưởng & Phạt */}
            {specialCategories.length > 0 && (
              <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Hạng mục thưởng & phạt trực tiếp
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {specialCategories.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {cat.name === "Thưởng"
                            ? "Cộng trực tiếp vào điểm tổng"
                            : "Trừ trực tiếp khỏi điểm tổng"}
                        </p>
                      </div>
                      <Badge
                        className={
                          cat.name === "Thưởng"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium"
                            : "bg-red-50 text-red-700 border-red-200 text-xs font-medium"
                        }
                      >
                        {cat.name === "Thưởng" ? "+ Cộng điểm" : "- Trừ điểm"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cột phải: Danh sách và điều chỉnh trọng số */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      Danh sách môn học tính theo hệ số ({regularCategories.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Bấm "Sửa" để thay đổi Tên hoặc Hệ số nhân của từng cột điểm.
                    </CardDescription>
                  </div>

                  {/* Thanh tìm kiếm nhanh */}
                  <div className="relative w-full sm:w-56">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm môn học..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 rounded-lg text-xs bg-white border-slate-200"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Scale className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm text-slate-600">
                        {searchQuery ? "Không tìm thấy môn học phù hợp" : "Chưa có cột điểm nào"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {searchQuery ? "Hãy thử từ khóa tìm kiếm khác." : "Hãy tạo cột điểm đầu tiên ở form bên cạnh."}
                      </p>
                    </div>
                  ) : (
                    filteredCategories.map((cat: any, index: number) => {
                      const isEditing = editingId === cat.id;
                      const isAttendance = cat.name === "Chuyên cần";
                      const percentage = (
                        (Number(cat.weight) / (totalWeight || 1)) *
                        100
                      ).toFixed(0);
                      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

                      return (
                        <div
                          key={cat.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                        >
                          {isEditing ? (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                              <div className="sm:col-span-7">
                                <Label className="text-xs text-slate-500 font-medium mb-1 block">
                                  Tên hạng mục
                                </Label>
                                <Input
                                  value={editName}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                                  className="h-9 rounded-lg text-sm bg-white"
                                  placeholder="Tên hạng mục"
                                />
                              </div>
                              <div className="sm:col-span-5 flex items-end gap-2">
                                <div className="flex-1">
                                  <Label className="text-xs text-slate-500 font-medium mb-1 block">
                                    Hệ số nhân
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={editWeight}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditWeight(e.target.value)}
                                    className="h-9 rounded-lg text-sm font-semibold text-blue-600 bg-white"
                                    placeholder="Hệ số"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(cat.id)}
                                  disabled={isSubmitting}
                                  className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-9 px-2.5 border-slate-300 text-slate-600 rounded-lg text-xs"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start sm:items-center gap-3.5 flex-1">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center font-bold shrink-0">
                                  <span className="text-sm leading-none">{cat.weight}</span>
                                  <span className="text-[9px] font-semibold uppercase mt-0.5 text-blue-600">
                                    HS
                                  </span>
                                </div>

                                <div className="space-y-1 flex-1 max-w-md">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-800 text-sm">
                                      {cat.name}
                                    </span>
                                    {isAttendance && (
                                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium py-0">
                                        Tự động từ điểm danh
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Progress bar biểu thị tỷ trọng */}
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                      <span>Hệ số: <strong className="text-slate-700">{cat.weight}</strong></span>
                                      <span className="font-medium text-slate-600">{percentage}% tỷ trọng</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, Number(percentage))}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(cat)}
                                  className="h-8 px-2.5 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium"
                                >
                                  <Edit2 className="h-3 w-3 mr-1 text-slate-500" /> Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDeleteConfirm(cat)}
                                  className="h-8 px-2.5 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg text-xs font-medium"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Xóa
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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

      <ScrollToTopButton />
    </AdminLayout>
  );
}
