import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CreateProgramModal from "@/components/program/CreateProgramModal";
import DeleteConfirmDialog from "@/components/program/DeleteConfirmDialog";
import programApi from "@/api/programApi";
import {
  Plus,
  CalendarDays,
  ChevronRight,
  Layers,
  BookOpen,
  Loader2,
  Inbox,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i);

const QUARTER_OPTIONS = [
  { value: "all", label: "Tất cả quý" },
  { value: "1", label: "Quý 1 (T1–T3)" },
  { value: "2", label: "Quý 2 (T4–T6)" },
  { value: "3", label: "Quý 3 (T7–T9)" },
  { value: "4", label: "Quý 4 (T10–T12)" },
];

const BRANCH_OPTIONS = [
  { id: "Đồng", name: "Ngành Đồng" },
  { id: "Thiếu", name: "Ngành Thiếu" },
  { id: "Thanh", name: "Ngành Thanh" },
];

const STATUS_CONFIG = {
  DRAFT: { label: "Nháp", className: "bg-amber-100 text-amber-700 border-amber-200" },
  PENDING: { label: "Chờ duyệt", className: "bg-blue-100 text-blue-700 border-blue-200" },
  NEED_REVISION: { label: "Cần sửa", className: "bg-red-100 text-red-700 border-red-200" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  PUBLISHED: { label: "Đã đăng", className: "bg-teal-100 text-teal-700 border-teal-200" },
  ARCHIVED: { label: "Lưu trữ", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

function getBranchName(branchId) {
  const found = BRANCH_OPTIONS.find(
    (b) => b.id === String(branchId) || b.name === String(branchId)
  );
  return found ? found.name : `Ngành ${branchId}`;
}

export default function ProgramsPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === "admin";
  const userBranch = user?.branch || "";

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters: default to user's branch if available
  const [filterYear, setFilterYear] = useState(String(CURRENT_YEAR));
  const [filterQuarter, setFilterQuarter] = useState("all");
  const [filterBranch, setFilterBranch] = useState(userBranch ? String(userBranch) : "all");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPrograms = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = {};
        if (filterYear) params.year = filterYear;
        if (filterQuarter && filterQuarter !== "all") params.quarter = filterQuarter;
        if (filterBranch && filterBranch !== "all") {
          params.branchId = filterBranch;
        }

        const res = await programApi.getPrograms(params);
        setPrograms(res.data || res || []);
      } catch (err) {
        console.error("Failed to load programs:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filterYear, filterQuarter, filterBranch]
  );

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await programApi.deleteProgram(deleteTarget.id);
      toast.success("Đã xóa chương trình sinh hoạt");
      setDeleteTarget(null);
      fetchPrograms(true);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateSuccess = (newProgram) => {
    fetchPrograms(true);
    if (newProgram?.id) {
      setTimeout(() => navigate(`/programs/${newProgram.id}`), 300);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ─────────── Header ─────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-500" />
              Chương trình sinh hoạt
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Mặc định hiển thị Ngành của bạn. Bạn có thể lọc xem chương trình Ngành khác.
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo chương trình
          </Button>
        </div>

        {/* ─────────── Filter Bar ─────────── */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Năm:
                </span>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-28 rounded-xl border-gray-200 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quarter Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Quý:
                </span>
                <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                  <SelectTrigger className="w-40 rounded-xl border-gray-200 text-sm">
                    <SelectValue placeholder="Tất cả quý" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {QUARTER_OPTIONS.map((q) => (
                      <SelectItem key={q.value} value={q.value}>
                        {q.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Filter (Available to ALL users to view other branches) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Ngành:
                </span>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger className="w-44 rounded-xl border-gray-200 text-sm">
                    <SelectValue placeholder="Tất cả Ngành" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Tất cả Ngành</SelectItem>
                    {BRANCH_OPTIONS.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPrograms(true)}
                disabled={refreshing}
                className="rounded-xl border-gray-200 hover:bg-slate-50 ml-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─────────── Program Cards ─────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-slate-500 font-medium">
              Đang tải danh sách chương trình...
            </span>
          </div>
        ) : programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              Chưa có chương trình sinh hoạt
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6 max-w-xs">
              Chưa có chương trình nào cho{" "}
              {filterQuarter && filterQuarter !== "all" ? `Quý ${filterQuarter}/` : ""}
              {filterYear}.{" "}
              "Hãy tạo chương trình mới cho Ngành của bạn."
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo chương trình
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => {
              const statusConf = STATUS_CONFIG[prog.status] || STATUS_CONFIG.DRAFT;
       
              const canEdit = isAdmin || String(prog.branchId) === String(userBranch);
              console.log(canEdit);
              
              return (
                <Card
                  key={prog.id}
                  className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/programs/${prog.id}`)}
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
                          <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            Quý {prog.quarter} / {prog.year}
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {prog.branch?.name || getBranchName(prog.branchId)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] font-semibold rounded-lg px-2 py-0.5 border ${statusConf.className}`}
                      >
                        {statusConf.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4">
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>
                          <span className="font-semibold text-slate-700">
                            {prog.lessonCount ?? 0}
                          </span>{" "}
                          bài học
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {canEdit ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/programs/${prog.id}`);
                              }}
                              title="Chỉnh sửa chương trình"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(prog);
                              }}
                              title="Xóa chương trình"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                            Chỉ xem
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 ml-1 transition-colors" />
                      </div>
                    </div>
                    {prog.note && (
                      <p className="text-xs text-slate-400 mt-2 truncate italic">
                        {prog.note}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────── Modals ─────────── */}
      <CreateProgramModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={handleCreateSuccess}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Xóa chương trình sinh hoạt"
        description={
          deleteTarget
            ? `Bạn có chắc muốn xóa chương trình Quý ${deleteTarget.quarter}/${deleteTarget.year} - ${deleteTarget.branch?.name || getBranchName(deleteTarget.branchId)}? Toàn bộ bài học bên trong cũng sẽ bị xóa.`
            : ""
        }
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </AdminLayout>
  );
}
