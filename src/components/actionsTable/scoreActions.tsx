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
        ...score,
        name: score.name || score.mMember?.name || "",
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