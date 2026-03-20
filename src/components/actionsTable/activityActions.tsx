import { Edit, Trash2, Eye } from "lucide-react";
import { DataTableAction } from "../common/data-table";

export const getActivityActions = ({
  onEdit,
  onDelete,
  onViewAttendance,
}: {
  onEdit: (activity: any) => void;
  onDelete: (activity: any) => void;
  onViewAttendance: (activity: any) => void;
}): DataTableAction<any>[] => {
  return [
    {
      icon: <Eye className="h-4 w-4" />,
      label: "Xem tham gia",
      onClick: onViewAttendance,
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: onEdit,
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: "Xóa",
      onClick: onDelete,
      variant: "destructive",
    },
  ];
};