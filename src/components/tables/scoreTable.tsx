"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import type { Column, DataTableAction } from "@/components/common/data-table";
import { ScoreFormDialog } from "@/components/score/score-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { Score, ScoreFormData } from "@/types/score";
import { fetchMembersThunk } from "@/features/members/memberThunks";
import { calculateTotalScoreDynamic, getRank, getRankColor } from "@/libs/score-utils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getCategoriesThunk,
  getAllThunk,
  upsertScoreThunk,
  deleteScoreThunk,
} from "@/features/score/scoreThunks";
import { getScoreColumns } from "../columns/scoreColumns";
import { getScoreActions } from "../actionsTable/scoreActions";
import { getScoreFilterOptions } from "../filterOptions/scoreFilterOptions";

export default function ScoresTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { grades, categories, loading } = useSelector((state: any) => state.grades);
  const { members } = useSelector((state: any) => state.members);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  const [scoreToDelete, setScoreToDelete] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(getCategoriesThunk());
    dispatch(getAllThunk());
    dispatch(fetchMembersThunk());
  }, [dispatch]);

  const normalizeKey = (str: string) => str.toLowerCase().replace(/\s+/g, "_");

 

  const scores = useMemo(() => {
    return grades.map((g: any) => {
      const row: any = {
        id: `${g.memberId}_${g.year}_${g.quarter}`,
        memberId: g.memberId,
        year: g.year,
        name: g.mMember?.name || "",
        quarter: g.quarter,
        mMember: g.mMember,
        activityBonus: g.activityScore || 0,
        activityCount: g.activityCount || 0,
      };

      if (g.scores) {
        Object.entries(g.scores).forEach(([key, value]) => {
          row[key] = value;
        });
      }

      return row;
    });
  }, [grades]);

  // Xác định các cột điểm thực tế được đánh giá trong từng Quý
  const quarterCategoriesMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    grades.forEach((g: any) => {
      const termKey = `${g.quarter}_${g.year}`;
      if (!map[termKey]) {
        map[termKey] = [];
      }
      if (g.scores) {
        Object.keys(g.scores).forEach((catKey) => {
          const matchingCat = categories.find(
            (c: any) =>
              normalizeKey(c.name) === catKey &&
              c.name !== "Thưởng" &&
              c.name !== "Phạt"
          );
          if (matchingCat && !map[termKey].some((c) => c.id === matchingCat.id)) {
            map[termKey].push(matchingCat);
          }
        });
      }
    });

    return map;
  }, [grades, categories]);

  const processedScores = useMemo(() => {
    return scores.map((s: any) => {
      const termKey = `${s.quarter}_${s.year}`;
      // Lấy danh sách các môn được tổ chức thi/chấm trong quý đó
      const quarterCategories =
        quarterCategoriesMap[termKey] && quarterCategoriesMap[termKey].length > 0
          ? quarterCategoriesMap[termKey]
          : categories.filter((c: any) => c.name !== "Thưởng" && c.name !== "Phạt");

      const baseScore = calculateTotalScoreDynamic(s, quarterCategories);

      const bonus = Number(s[normalizeKey("Thưởng")] || 0);
      const penalty = Number(s[normalizeKey("Phạt")] || 0);
      const activity = Number(s.activityBonus || 0);

      const totalScore = baseScore + bonus - penalty + activity;
      const rank = getRank(totalScore);

      return {
        ...s,
        totalScore,
        rank,
        term: termKey,
      };
    });
  }, [scores, quarterCategoriesMap, categories]);

  const filterOptions = getScoreFilterOptions(processedScores);



  const columns = useMemo(() => getScoreColumns(categories), [categories]);

  const handleConfirmDelete = async () => {
    if (!scoreToDelete) return;
    try {
      setIsDeleting(true);
      await dispatch(
        deleteScoreThunk({
          memberId: scoreToDelete.memberId,
          year: scoreToDelete.year,
          quarter: scoreToDelete.quarter,
        })
      ).unwrap();
      toast.success("Đã xóa điểm thi đua thành công!");
      dispatch(getAllThunk());
    } catch (err: any) {
      toast.error("Xóa điểm thất bại: " + (err || "Đã xảy ra lỗi"));
    } finally {
      setIsDeleting(false);
      setScoreToDelete(null);
    }
  };

  const actions = getScoreActions({
    onEdit: (data) => {
      setEditingScore(data);
      setIsDialogOpen(true);
    },
    onDelete: (score) => {
      setScoreToDelete(score);
      setIsConfirmOpen(true);
    },
  });

  if (loading) {
    return <p className="p-6 text-slate-500">Đang tải dữ liệu...</p>;
  }

  const handleSubmit = async (data: any) => {
    try {
      const member = members.find(
        (m) => m.name.toLowerCase() === data.name.toLowerCase(),
      );

      if (!member) return;

      const legacyKeyMap: Record<string, string> = {
        "Kiến thức": "knowledge",
        "Kỹ năng": "skill",
        "Chuyên cần": "attendance",
        "Thưởng": "bonus",
        "Phạt": "penalty",
      };

      const scoresPayload = categories
        .map((cat: any) => {
          const normKey = normalizeKey(cat.name);
          const legacyKey = legacyKeyMap[cat.name];

          const val =
            data[cat.id] ??
            data[normKey] ??
            (legacyKey ? data[legacyKey] : undefined) ??
            0;

          return {
            categoryId: cat.id,
            score: Number(val) || 0,
          };
        })
        .filter(Boolean);

      await dispatch(
        upsertScoreThunk({
          memberId: member.id,
          year: data.year,
          quarter: data.quarter,
          scores: scoresPayload,
        }),
      ).unwrap();

      await dispatch(getAllThunk());

      setIsDialogOpen(false);
      setEditingScore(null);
    } catch (err) {
      console.error("Upsert failed:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Điểm thi đua</h1>

      <DataTable
        title="Bảng điểm thi đua"
        description="Điểm được tính theo công thức: [Σ(Điểm × Hệ số) / Σ Hệ số] + Thưởng - Phạt + Hoạt động"
        columns={columns}
        data={processedScores}
        actions={actions}
        key={columns.map((c) => c.key).join("-")}
        filterOptions={filterOptions}
        keyExtractor={(item) => item.id}
       
        onAdd={() => setIsDialogOpen(true)}
        addButtonText="Thêm điểm"
        searchPlaceholder="Tìm kiếm theo tên..."
      />

      <ScoreFormDialog
        open={isDialogOpen}
        members={members}
        categories={categories}
        editingScore={editingScore}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingScore(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xóa điểm thi đua"
        description={`Bạn có chắc chắn muốn xóa tất cả điểm Quý ${scoreToDelete?.quarter}/${scoreToDelete?.year} của em ${scoreToDelete?.name || "này"}?`}
        message="Hành động này sẽ xóa toàn bộ các cột điểm thi đua của đoàn sinh trong Quý và không thể hoàn tác."
        icon="trash"
        iconColor="red"
        isDangerous={true}
        confirmText="Xóa điểm"
        cancelText="Hủy"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
