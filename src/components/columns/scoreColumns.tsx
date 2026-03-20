"use client";

import { Column } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { getRankColor } from "@/libs/score-utils";

const normalizeKey = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "_");

export const getScoreColumns = (categories: any[]): Column<any>[] => {
  const dynamicColumns: Column<any>[] = categories.map((c) => ({
    key: normalizeKey(c.name),
    label: `${c.name} (Hệ số ${c.weight})`,
    width: 150,
    render: (item) => {
      const value = item[normalizeKey(c.name)] || 0;

      if (c.name === "Thưởng") {
        return <span className="font-semibold text-green-600">+{value}</span>;
      }

      if (c.name === "Phạt") {
        return <span className="font-semibold text-red-600">-{value}</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{value}</span>
          <span className="text-xs text-slate-500">
            (×{c.weight} = {(value * c.weight).toFixed(1)})
          </span>
        </div>
      );
    },
  }));

  return [
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
};