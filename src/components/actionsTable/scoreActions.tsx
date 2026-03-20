import { Pencil, Trash2 } from "lucide-react";
import { DataTableAction } from "@/components/common/data-table";

const normalizeKey = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "_");

export const getScoreActions = ({
  onEdit,
  onDelete,
}: {
  onEdit: (score: any) => void;
  onDelete: (score: any) => void;
}): DataTableAction<any>[] => [
  {
    icon: <Pencil className="h-4 w-4" />,
    label: "Chỉnh sửa",
    onClick: (score) => {
      onEdit({
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
    },
  },
  {
    icon: <Trash2 className="h-4 w-4" />,
    label: "Xóa",
    variant: "destructive",
    onClick: onDelete,
  },
];