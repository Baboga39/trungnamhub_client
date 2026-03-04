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

export function ScoreFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingScore,
  categories,
  members,
}: ScoreFormDialogProps) {
  
  const [formData, setFormData] = useState<ScoreFormData>({
    name: "",
    knowledge: 0,
    skill: 0,
    attendance: 0,
    bonus: 0,
    penalty: 0,
  });

  useEffect(() => {
    if (editingScore) {
      setFormData({
        name: editingScore.name,
        knowledge: editingScore.knowledge,
        skill: editingScore.skill,
        attendance: editingScore.attendance,
        bonus: editingScore.bonus,
        penalty: editingScore.penalty,
      });
    } else {
      setFormData({
        name: "",
        knowledge: 0,
        skill: 0,
        attendance: 0,
        bonus: 0,
        penalty: 0,
      });
    }
  }, [editingScore, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert "" -> 0 trước khi submit
    const normalized: ScoreFormData = {
      ...formData,
      knowledge: formData.knowledge === "" ? 0 : formData.knowledge,
      skill: formData.skill === "" ? 0 : formData.skill,
      attendance: formData.attendance === "" ? 0 : formData.attendance,
      bonus: formData.bonus === "" ? 0 : formData.bonus,
      penalty: formData.penalty === "" ? 0 : formData.penalty,
    };

    onSubmit(normalized);
    onOpenChange(false);
  };

  const previewTotal = calculateTotalScoreDynamic(formData, categories);
  const previewRank = getRank(previewTotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {editingScore ? "Chỉnh sửa điểm" : "Thêm điểm mới"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin điểm thi đua của đoàn sinh. Tổng điểm sẽ được tính tự động.
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          {/* --- INPUTS --- */}
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="knowledge" className="text-sm font-semibold">
                Kiến thức (HS3)
              </Label>
              <Input
                id="knowledge"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.knowledge === "" ? "" : formData.knowledge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    knowledge: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill" className="text-sm font-semibold">
                Kỹ năng (HS3)
              </Label>
              <Input
                id="skill"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.skill === "" ? "" : formData.skill}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skill: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance" className="text-sm font-semibold">
                Chuyên cần (HS2)
              </Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={formData.attendance === "" ? "" : formData.attendance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attendance: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus" className="text-sm font-semibold">
                Điểm thưởng
              </Label>
              <Input
                id="bonus"
                type="number"
                min="0"
                step="0.5"
                value={formData.bonus === "" ? "" : formData.bonus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bonus: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="penalty" className="text-sm font-semibold">
                Điểm phạt
              </Label>
              <Input
                id="penalty"
                type="number"
                min="0"
                step="0.5"
                value={formData.penalty === "" ? "" : formData.penalty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penalty: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="h-11"
              />
            </div>

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
