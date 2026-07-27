"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import type { Score, ScoreFormData } from "@/types/score";
import { calculateTotalScoreDynamic, getRank } from "@/libs/score-utils";

interface ScoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScoreFormData) => void;
  editingScore?: Score | null;
  categories: { id: number; name: string; weight: number }[];
  members: { id: number; name: string }[];
}

const normalizeKey = (str: string) => str.toLowerCase().replace(/\s+/g, "_");

export function ScoreFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingScore,
  categories,
  members,
}: ScoreFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    year: new Date().getFullYear(),
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    activityScore: 0,
  });

  useEffect(() => {
    if (editingScore) {
      const initialData: Record<string, any> = {
        name: editingScore.name || editingScore.mMember?.name || "",
        year: editingScore.year,
        quarter: editingScore.quarter,
        activityScore: editingScore.activityScore ?? editingScore.activityBonus ?? 0,
      };

      const legacyKeyMap: Record<string, string> = {
        "Kiến thức": "knowledge",
        "Kỹ năng": "skill",
        "Chuyên cần": "attendance",
        "Thưởng": "bonus",
        "Phạt": "penalty",
      };

      categories.forEach((cat) => {
        const normKey = normalizeKey(cat.name);
        const legacyKey = legacyKeyMap[cat.name];

        const scoreVal =
          (editingScore as any)[normKey] ??
          (editingScore as any)[cat.name] ??
          (editingScore as any)[cat.id] ??
          (legacyKey ? (editingScore as any)[legacyKey] : undefined) ??
          0;

        initialData[cat.id] = scoreVal;
        initialData[normKey] = scoreVal;
        if (legacyKey) {
          initialData[legacyKey] = scoreVal;
        }
      });

      setFormData(initialData);
    } else {
      const initialData: Record<string, any> = {
        name: "",
        year: new Date().getFullYear(),
        quarter: Math.floor(new Date().getMonth() / 3) + 1,
        activityScore: 0,
      };

      categories.forEach((cat) => {
        const normKey = normalizeKey(cat.name);
        initialData[cat.id] = 0;
        initialData[normKey] = 0;
      });

      setFormData(initialData);
    }
  }, [editingScore, open, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalized: Record<string, any> = { ...formData };

    categories.forEach((cat) => {
      const normKey = normalizeKey(cat.name);
      const rawVal = normalized[cat.id] ?? normalized[normKey];
      const val = rawVal === "" ? 0 : Number(rawVal) || 0;
      normalized[cat.id] = val;
      normalized[normKey] = val;
    });

    onSubmit(normalized as any);
    onOpenChange(false);
  };

  const previewTotal = calculateTotalScoreDynamic(formData, categories);
  const previewRank = getRank(previewTotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {editingScore ? "Chỉnh sửa điểm" : "Thêm điểm mới"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin điểm thi đua của đoàn sinh. Tổng điểm sẽ được tính tự
            động.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Tên đoàn sinh <span className="text-red-500">*</span>
            </Label>
            <select
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={!!editingScore}
              className={`h-11 w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                editingScore
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "border-slate-300"
              }`}
            >
              {!editingScore && <option value="">-- Chọn đoàn sinh --</option>}
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Năm</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quý</Label>
              <select
                value={formData.quarter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quarter: Number(e.target.value),
                  })
                }
                className="h-11 w-full rounded-md border border-slate-300 px-3"
              >
                <option value={1}>Quý 1</option>
                <option value={2}>Quý 2</option>
                <option value={3}>Quý 3</option>
                <option value={4}>Quý 4</option>
              </select>
            </div>
          </div>

          {/* --- DYNAMIC INPUTS --- */}
          <div className="grid grid-cols-2 gap-4">
            {categories
              .filter((cat) => cat.name !== "Thưởng" && cat.name !== "Phạt")
              .map((cat) => {
                const normKey = normalizeKey(cat.name);
                const isAttendance = cat.name === "Chuyên cần";
                const val = formData[cat.id] ?? formData[normKey] ?? 0;

                return (
                  <div key={cat.id} className="space-y-2">
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm font-semibold">
                      {cat.name} (HS{cat.weight})
                    </Label>
                    <Input
                      id={`cat-${cat.id}`}
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={isAttendance}
                      value={val === "" ? "" : val}
                      onChange={(e) => {
                        const newScore =
                          e.target.value === "" ? "" : Number(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          [cat.id]: newScore,
                          [normKey]: newScore,
                        }));
                      }}
                      className={`h-11 ${
                        isAttendance ? "bg-slate-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                );
              })}

            {categories
              .filter((cat) => cat.name === "Thưởng" || cat.name === "Phạt")
              .map((cat) => {
                const normKey = normalizeKey(cat.name);
                const legacyKey = cat.name === "Thưởng" ? "bonus" : "penalty";
                const val =
                  formData[cat.id] ??
                  formData[legacyKey] ??
                  formData[normKey] ??
                  0;

                return (
                  <div key={cat.id} className="space-y-2">
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm font-semibold">
                      {cat.name === "Thưởng" ? "Điểm thưởng" : "Điểm phạt"}
                    </Label>
                    <Input
                      id={`cat-${cat.id}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={val === "" ? "" : val}
                      onChange={(e) => {
                        const newScore =
                          e.target.value === "" ? "" : Number(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          [cat.id]: newScore,
                          [normKey]: newScore,
                          [legacyKey]: newScore,
                        }));
                      }}
                      className="h-11"
                    />
                  </div>
                );
              })}
          </div>
          <div className="space-y-2">
  <Label className="text-sm font-semibold">
    Điểm hoạt động
  </Label>
  <Input
    type="number"
    value={formData.activityScore}
    disabled
    className="h-11 bg-slate-100 text-slate-600 cursor-not-allowed"
  />
</div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Tổng điểm dự kiến:
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {previewTotal.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Xếp loại:
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {previewRank}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {editingScore ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
