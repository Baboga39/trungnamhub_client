"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import type { Column, DataTableAction } from "@/components/common/data-table";
import { ScoreFormDialog } from "@/components/score/score-form-dialog";
import type { Score, ScoreFormData } from "@/types/score";
import { fetchMembersThunk } from "@/features/members/memberThunks";
import { getRank, getRankColor } from "@/libs/score-utils";
import {
  getCategoriesThunk,
  getAllThunk,
  upsertScoreThunk,
} from "@/features/score/scoreThunks";
import { getScoreColumns } from "../columns/scoreColumns";
import { getScoreActions } from "../actionsTable/scoreActions";
import { getScoreFilterOptions } from "../filterOptions/scoreFilterOptions";

export default function ScoresTable() {
  const dispatch = useDispatch();
  const { grades, categories, loading } = useSelector((state) => state.grades);
  const { members } = useSelector((state) => state.members);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

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

  const calculateDynamicTotal = (score, categories) => {
    let totalWeighted = 0;
    let sumWeight = 0;

    categories.forEach((c) => {
      if (c.name === "Thưởng" || c.name === "Phạt") return;

      const key = normalizeKey(c.name);
      const value = Number(score[key]) || 0;

      totalWeighted += value * c.weight;
      sumWeight += c.weight;
    });

    return sumWeight > 0 ? totalWeighted / sumWeight : 0;
  };

  const processedScores = scores.map((s: any) => {
    const baseScore = calculateDynamicTotal(s, categories);

    const bonus = Number(s[normalizeKey("Thưởng")] || 0);
    const penalty = Number(s[normalizeKey("Phạt")] || 0);
    const activity = Number(s.activityBonus || 0);

    const totalScore = baseScore + bonus - penalty + activity;

    const rank = getRank(totalScore);

    return {
      ...s,
      totalScore,
      rank,
      term: `${s.quarter}_${s.year}`,
    };
  });

  const filterOptions = getScoreFilterOptions(processedScores);



  const columns = useMemo(() => getScoreColumns(categories), [categories]);

  const actions = getScoreActions({
  onEdit: (data) => {
    setEditingScore(data);
    setIsDialogOpen(true);
  },
  onDelete: (score) => console.log("delete", score),
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
        description="Điểm được tính theo công thức: Σ(Điểm × Hệ số)"
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
    </div>
  );
}
