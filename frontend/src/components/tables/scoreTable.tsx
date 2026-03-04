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
    const grouped: any = {};

    for (const g of grades) {
      const key = `${g.memberId}_${g.yearActive}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          memberId: g.memberId,
          yearActive: g.yearActive,
          mMember: g.mMember,
        };
      }

      const cat = categories.find((c) => c.id === g.categoryId);
      if (cat) grouped[key][normalizeKey(cat.name)] = g.score;
    }

    return Object.values(grouped);
  }, [grades, categories]);

  const calculateDynamicTotal = (score, categories) => {
    let totalWeighted = 0;
    let sumWeight = 0;

    categories.forEach((c) => {
      const key = normalizeKey(c.name);
      const value = Number(score[key]) || 0;
      totalWeighted += value * c.weight;
      sumWeight += c.weight;
    });

    return sumWeight > 0 ? totalWeighted / sumWeight : 0;
  };

  const processedScores = scores.map((s: any) => {
    const totalScore = calculateDynamicTotal(s, categories);
    const rank = getRank(totalScore);
    return { ...s, totalScore, rank };
  });

  const dynamicColumns: Column<any>[] = categories.map((c) => ({
    key: normalizeKey(c.name),
    label: `${c.name} (Hệ số ${c.weight})`,
    width: 150,
    render: (item) => {
      const value = item[normalizeKey(c.name)] || 0;
      const isNegative = c.weight < 0;
      return (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${isNegative ? "text-red-600" : "text-slate-800"}`}
          >
            {value}
          </span>
          <span
            className={`text-xs ${isNegative ? "text-red-500" : "text-slate-500"}`}
          >
            (×{c.weight} = {(value * c.weight).toFixed(1)})
          </span>
        </div>
      );
    },
  }));

  const columns: Column<any>[] = [
    {
      key: "member",
      label: "Tên đoàn sinh",
      width: 220,
      render: (item) => (
        <span className="font-semibold text-slate-800">
          {item.mMember?.name || `Đoàn sinh #${item.id}`}
        </span>
      ),
    },

    ...dynamicColumns,
    {
      key: "totalScore",
      label: "Tổng điểm",
      width: 120,
      render: (item) => (
        <span className="text-lg font-bold text-blue-600">
          {item.totalScore.toFixed(1)}
        </span>
      ),
    },
    {
      key: "yearActive",
      label: "Năm hoạt động",
      width: 220,
      render: (item) => (
        <span className="font-semibold text-center text-slate-800">
          {item.yearActive || `Năm hoạt động #${item.yearActive}`}
        </span>
      ),
    },
    {
      key: "rank",
      label: "Xếp loại",
      width: 150,
      render: (item) => (
        <Badge
          className={`${getRankColor(item.rank || "")} font-semibold border`}
        >
          {item.rank}
        </Badge>
      ),
    },
  ];

  const actions: DataTableAction<any>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: (score) => {
  const memberGrades = grades.filter(
    (g) =>
      g.memberId === score.memberId &&
      g.yearActive === score.yearActive
  );

  const findScoreByCategoryName = (name: string) => {
    const category = categories.find(
      (c) => normalizeKey(c.name) === normalizeKey(name)
    );
    const g = category
      ? memberGrades.find((mg) => mg.categoryId === category.id)
      : null;
    return g ? g.score : 0;
  };

  setEditingScore({
    id: score.id,
    name: score.mMember?.name || "",
    knowledge: findScoreByCategoryName("Kiến thức"),
    skill: findScoreByCategoryName("Kỹ năng"),
    attendance: findScoreByCategoryName("Chuyên cần"),
    bonus: findScoreByCategoryName("Thưởng"),
    penalty: findScoreByCategoryName("Phạt"),
  });

  setIsDialogOpen(true);
},

    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: "Xóa",
      variant: "destructive",
      onClick: (score) => console.log("delete", score),
    },
  ];

  if (loading) return <p className="p-6 text-slate-500">Đang tải dữ liệu...</p>;

  const handleSubmit = async (data: ScoreFormData) => {
    try {
      const member = members.find(
        (m) => m.name.toLowerCase() === data.name.toLowerCase(),
      );

      if (!member) {
        console.error("Không tìm thấy member:", data.name);
        return;
      }

      const categoryMap = {
        knowledge: "Kiến thức",
        skill: "Kỹ năng",
        attendance: "Chuyên cần",
        bonus: "Thưởng",
        penalty: "Phạt",
      };

      const scoresPayload = Object.entries(categoryMap)
        .map(([key, categoryName]) => {
          const cat = categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
          );
          if (!cat) return null;
          return {
            categoryId: cat.id,
            score: Number(data[key as keyof ScoreFormData]) || 0,
          };
        })
        .filter(Boolean);

      await dispatch(
        upsertScoreThunk({
          memberId: member.id,
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
        keyExtractor={(item) => item.id}
        onAdd={() => setIsDialogOpen(true)}
        addButtonText="Thêm điểm"
        searchPlaceholder="Tìm kiếm theo tên..."
      />
      <ScoreFormDialog
        open={isDialogOpen}
        members={members}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingScore(null);
        }}
        editingScore={editingScore}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
