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

  /*
    API trả dạng:
    {
      memberId,
      year,
      quarter,
      mMember,
      scores: {},
      activityScore,
      activityCount
    }
  */

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
      const key = normalizeKey(c.name);
      const value = Number(score[key]) || 0;

      totalWeighted += value * c.weight;
      sumWeight += c.weight;
    });

    return sumWeight > 0 ? totalWeighted / sumWeight : 0;
  };

  const processedScores = scores.map((s: any) => {
    const baseScore = calculateDynamicTotal(s, categories);
    const totalScore = baseScore + (s.activityBonus || 0);

    const rank = getRank(totalScore);

    return {
      ...s,
      totalScore,
      rank,
      term: `${s.quarter}_${s.year}`,
    };
  });

  const filterOptions = [
    {
      key: "rank",
      label: "Xếp loại",
      options: Array.from(new Set(processedScores.map((s) => s.rank))).map(
        (r) => ({
          value: r,
          label: r,
        }),
      ),
    },
    {
      key: "term",
      label: "Kỳ đánh giá",
      options: Array.from(
        new Set(processedScores.map((s) => `${s.quarter}_${s.year}`)),
      ).map((t) => {
        const [quarter, year] = t.split("_");
        return {
          value: t,
          label: `Q${quarter} - ${year}`,
        };
      }),
    },
  ];

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
            className={`font-medium ${
              isNegative ? "text-red-600" : "text-slate-800"
            }`}
          >
            {value}
          </span>

          <span
            className={`text-xs ${
              isNegative ? "text-red-500" : "text-slate-500"
            }`}
          >
            (×{c.weight} = {(value * c.weight).toFixed(1)})
          </span>
        </div>
      );
    },
  }));

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Tên đoàn sinh",
      width: 220,
      render: (item) => (
        <span className="font-semibold text-slate-800">{item.name}</span>
      ),
    },

    ...dynamicColumns,

    {
      key: "activityBonus",
      label: "Điểm hoạt động",
      width: 160,
      render: (item) => (
        <span className="font-semibold text-green-600">
          +{item.activityBonus?.toFixed(1) || "0.0"}
          {item.activityCount ? ` (${item.activityCount} buổi)` : ""}
        </span>
      ),
    },

    {
      key: "totalScore",
      label: "Tổng điểm",
      width: 120,
      render: (item) => (
        <span className="text-lg font-bold text-blue-600">
          {item.totalScore?.toFixed(1) || "0.0"}
        </span>
      ),
    },

    {
      key: "term",
      label: "Kỳ đánh giá",
      width: 160,
      render: (item) => (
        <span className="font-semibold text-slate-700">
          {`Q${item.quarter} - ${item.year}`}
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
        setEditingScore({
          id: score.id,
          name: score.mMember?.name || "",
          knowledge: score[normalizeKey("Kiến thức")] || 0,
          skill: score[normalizeKey("Kỹ năng")] || 0,
          attendance: score[normalizeKey("Chuyên cần")] || 0,
          bonus: score[normalizeKey("Thưởng")] || 0,
          penalty: score[normalizeKey("Phạt")] || 0,
          year: score.year,
          quarter: score.quarter,
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

  if (loading) {
    return <p className="p-6 text-slate-500">Đang tải dữ liệu...</p>;
  }

  const handleSubmit = async (data: ScoreFormData) => {
    try {
      const member = members.find(
        (m) => m.name.toLowerCase() === data.name.toLowerCase(),
      );

      if (!member) return;

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
            score: Number(data[key]) || 0,
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
