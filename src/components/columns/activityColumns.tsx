"use client";

import { Column } from "../common/data-table";
import { Calendar } from "lucide-react";
import { Badge } from "../ui/badge";

export interface Activity {
  id?: number;
  name: string;
  description?: string;
  year: number | string;
  quarter: number | string;
  date: string;
  createdBy?: {
    name: string;
  };
}

export const activityColumns: Column<Activity>[] = [
  {
    key: "name",
    label: "Tên hoạt động",
    width: 220,
  },
  {
    key: "description",
    label: "Mô tả",
    width: 260,
    render: (item) => (
      <span className="text-slate-600">
        {item.description || "Không có mô tả"}
      </span>
    ),
  },
  {
    key: "date",
    label: "Ngày",
    width: 120,
    render: (item) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        {item.date}
      </div>
    ),
  },
  {
    key: "term",
    label: "Kỳ",
    width: 140,
    render: (item) => (
      <Badge variant="secondary">
        {`Q${item.quarter} - ${item.year}`}
      </Badge>
    ),
  },
  {
    key: "createdBy",
    label: "Người tạo",
    width: 180,
    render: (item) => (
      <span className="font-medium text-slate-700">
        {item.createdBy?.name || "-"}
      </span>
    ),
  },
];