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
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getCategoriesThunk,
  upsertCategoryThunk,
  deleteCategoryThunk,
  getAllThunk,
} from "@/features/score/scoreThunks";
import { getRank, getRankColor } from "@/libs/score-utils";

// Palette màu sắc cho thanh phân bổ trọng số
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

export default function ScoreConfigPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state: any) => state.grades);

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
      <div className="space-y-8 animate-fadeIn p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header banner với Gradient đẳng cấp */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-7 sm:p-9 shadow-2xl border border-indigo-800/40">
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 top-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 backdrop-blur-md">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
                <span>Cài Đặt Hệ Thống Điểm Số & Thi Đua</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Cấu Hình Môn Học & Trọng Số
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Tùy biến các cột điểm thi đua, phân bổ trọng số (hệ số) áp dụng cho từng môn. Hệ thống sẽ tự động cập nhật bảng điểm, form nhập liệu và báo cáo theo thời gian thực.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <Button
                onClick={() => navigate("/scores")}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Xem Bảng Điểm Thi Đua</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/40 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng số cột điểm</p>
                <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{regularCategories.length} môn + {specialCategories.length} thưởng/phạt</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/40 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng trọng số áp dụng</p>
                <p className="text-2xl font-bold text-indigo-600">{totalWeight}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Mẫu số của trung bình gia quyền</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Môn tính theo hệ số</p>
                <p className="text-2xl font-bold text-emerald-600">{regularCategories.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Kiến thức, Kỹ năng, Chuyên cần...</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Thưởng / Phạt trực tiếp</p>
                <p className="text-2xl font-bold text-amber-600">{specialCategories.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Cộng (+) hoặc Trừ (-) điểm tổng</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thanh Phân Bổ Tỷ Trọng Môn Học (Weight Distribution Visualizer) */}
        {regularCategories.length > 0 && (
          <Card className="rounded-3xl border-slate-200 shadow-sm bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Tỷ Trọng Đóng Góp Điểm Của Các Môn Học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phần trăm đóng góp của từng môn trong điểm cơ sở có trọng số (Tổng trọng số: {totalWeight})
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-slate-50 border-slate-200 self-start sm:self-auto">
                Σ Hệ số = {totalWeight}
              </Badge>
            </div>

            {/* Visual multi-segment bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 shadow-inner">
              {regularCategories.map((cat: any, index: number) => {
                const percent = (Number(cat.weight) / (totalWeight || 1)) * 100;
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                return (
                  <div
                    key={cat.id}
                    className={`h-full ${color.bg} first:rounded-l-full last:rounded-r-full transition-all duration-500 relative group`}
                    style={{ width: `${percent}%` }}
                    title={`${cat.name}: Hệ số ${cat.weight} (${percent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend badges */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {regularCategories.map((cat: any, index: number) => {
                const percent = ((Number(cat.weight) / (totalWeight || 1)) * 100).toFixed(1);
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                return (
                  <div
                    key={cat.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${color.light} border ${color.border} text-xs`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500">(HS {cat.weight})</span>
                    <span className={`font-bold ${color.text}`}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Formula Box Card */}
        <Card className="rounded-3xl border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-indigo-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Calculator className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-lg font-bold text-white">
                  Công Thức Tính Tổng Điểm Thi Đua (Linh Hoạt Theo Quý)
                </CardTitle>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-xs px-3 py-1 font-semibold self-start sm:self-auto">
                Bình Quân Gia Quyền Động (Dynamic Weighted Average)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 font-mono text-sm sm:text-base text-emerald-300 text-center tracking-wide overflow-x-auto shadow-inner">
              Tổng điểm = [ (Σ Điểm môn có điểm × Hệ số) / (Σ Hệ số của các môn có điểm) ] + Thưởng - Phạt + Điểm hoạt động
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Scale className="h-4 w-4" /> 1. Điểm cơ sở theo môn thực tế
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Từng môn nhân với Hệ số tương ứng, sau đó chia cho <strong>tổng trọng số của những môn thực tế có điểm</strong> trong quý đó (môn chưa thi sẽ không bị tính kéo tụt điểm).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> 2. Thưởng & Phạt
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Điểm Thưởng (+) hoặc Phạt (-) được cộng/trừ trực tiếp vào điểm tổng kết quả.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> 3. Điểm hoạt động
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Tự động cộng từ các buổi tham gia hoạt động ngoại khóa thực tế (+0.2 điểm/buổi).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Interactive Score Simulator (Trình Mô Phỏng Tính Điểm Trực Quan) */}
        <Card className="rounded-3xl border-slate-200 shadow-md bg-white overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Trình Mô Phỏng Tính Điểm Trực Quan
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Thử nghiệm nhập hoặc kéo điểm để xem ngay tác động của hệ số lên tổng điểm và xếp loại đoàn sinh.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSimulation}
                className="h-9 px-3 text-xs rounded-xl border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 self-start sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Đặt lại điểm thử nghiệm
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularCategories.map((cat: any, index: number) => {
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                const currentVal = simulatedScores[cat.id] ?? 8;
                return (
                  <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-semibold text-slate-500">(Hệ số {cat.weight})</span>
                    </div>
                    <div className="flex items-center gap-3">
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
                        className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <span className={`w-12 text-center font-bold text-sm px-2 py-0.5 rounded-lg ${color.light} ${color.text} border ${color.border}`}>
                        {currentVal}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bonus / Penalty / Activity Sliders */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">Thưởng (+)</span>
                  <span className="font-semibold text-emerald-600">+ Cộng trực tiếp</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={simulatedBonus}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedBonus(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-emerald-100 rounded-lg"
                  />
                  <span className="w-12 text-center font-bold text-sm px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                    +{simulatedBonus}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-800">Phạt (-)</span>
                  <span className="font-semibold text-red-600">- Trừ trực tiếp</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={simulatedPenalty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedPenalty(Number(e.target.value))}
                    className="flex-1 accent-red-600 cursor-pointer h-2 bg-red-100 rounded-lg"
                  />
                  <span className="w-12 text-center font-bold text-sm px-2 py-0.5 rounded-lg bg-red-100 text-red-700 border border-red-300">
                    -{simulatedPenalty}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-800">Điểm hoạt động</span>
                  <span className="font-semibold text-amber-600">+0.2/buổi</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.2"
                    value={simulatedActivity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedActivity(Number(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer h-2 bg-amber-100 rounded-lg"
                  />
                  <span className="w-12 text-center font-bold text-sm px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                    +{simulatedActivity}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Result Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg border border-indigo-800/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                    Kết Quả Mô Phỏng Tính Toán
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Điểm cơ sở có trọng số: <strong className="text-white">{simulationResult.baseScore}</strong> | Thưởng/Phạt: <strong className="text-emerald-300">+{simulatedBonus}</strong> / <strong className="text-rose-300">-{simulatedPenalty}</strong> | Hoạt động: <strong className="text-amber-300">+{simulatedActivity}</strong>
                </p>
              </div>

              <div className="flex items-center gap-6 self-start md:self-center">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Tổng điểm thi đua</p>
                  <p className="text-3xl font-extrabold text-blue-400 tracking-tight">
                    {simulationResult.finalTotal}
                  </p>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Xếp loại dự kiến</p>
                  <Badge className={`text-sm font-bold px-3.5 py-1 ${getRankColor(simulationResult.rank)}`}>
                    {simulationResult.rank}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Cột trái: Thêm mới & Thưởng phạt */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Thêm Môn / Cột Điểm Mới
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Tạo thêm môn học / hạng mục đánh giá mới
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Tên hạng mục điểm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="VD: Giáo lý Hè, Kinh thánh, Kỷ luật..."
                      value={newCatName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
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
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-semibold text-blue-600 focus:bg-white"
                      required
                    />
                    {/* Quick preset weight buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                      {[1, 2, 3, 4].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setNewCatWeight(w)}
                          className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold transition-all ${
                            Number(newCatWeight) === w
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
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
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Đang thêm..." : "Thêm cột điểm"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Thẻ Thưởng & Phạt */}
            {specialCategories.length > 0 && (
              <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-slate-800">
                      Hạng Mục Thưởng & Phạt
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {specialCategories.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
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
                            ? "bg-green-100 text-green-700 border-green-200 text-xs font-semibold"
                            : "bg-red-100 text-red-700 border-red-200 text-xs font-semibold"
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
            <Card className="rounded-3xl border-slate-200 shadow-md bg-white overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-indigo-600" />
                      Danh Sách Môn Học Tính Theo Hệ Số ({regularCategories.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Bấm nút "Sửa" để thay đổi Tên hoặc Trọng số của từng cột điểm.
                    </CardDescription>
                  </div>

                  {/* Thanh tìm kiếm nhanh */}
                  <div className="relative w-full sm:w-60">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm môn học..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="h-9 pl-9 rounded-xl text-xs bg-white border-slate-200"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Scale className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">
                        {searchQuery ? "Không tìm thấy môn học phù hợp" : "Chưa có cột điểm nào"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
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
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                        >
                          {isEditing ? (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-7">
                                <Label className="text-xs text-slate-500 font-medium mb-1 block">
                                  Tên hạng mục
                                </Label>
                                <Input
                                  value={editName}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                                  className="h-10 rounded-xl text-sm bg-white"
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
                                    className="h-10 rounded-xl text-sm font-semibold text-blue-600 bg-white"
                                    placeholder="Hệ số"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(cat.id)}
                                  disabled={isSubmitting}
                                  className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                                >
                                  <Check className="h-4 w-4 mr-1" /> Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-10 px-3.5 border-slate-300 text-slate-600 rounded-xl text-xs"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start sm:items-center gap-4 flex-1">
                                <div className={`h-12 w-12 rounded-2xl ${color.light} border ${color.border} ${color.text} flex flex-col items-center justify-center font-bold shrink-0 shadow-xs`}>
                                  <span className="text-base leading-none">{cat.weight}</span>
                                  <span className="text-[10px] font-semibold uppercase mt-0.5 opacity-80">
                                    Hệ số
                                  </span>
                                </div>

                                <div className="space-y-1.5 flex-1 max-w-md">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-base">
                                      {cat.name}
                                    </span>
                                    {isAttendance && (
                                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-medium py-0.5">
                                        Tự động từ điểm danh
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Progress bar biểu thị tỷ trọng */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                      <span>Trọng số: <strong className="text-slate-700">{cat.weight}</strong></span>
                                      <span className={`font-semibold ${color.text}`}>{percentage}% tỷ trọng</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${color.bg} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(100, Number(percentage))}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEdit(cat)}
                                  className="h-9 px-3.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-semibold transition-all"
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-1 text-blue-600" /> Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDeleteConfirm(cat)}
                                  className="h-9 px-3.5 border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-xs font-medium transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
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
