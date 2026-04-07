import { Edit, Shield, Trash2 } from "lucide-react";
import { DataTableAction } from "../common/data-table";

export const getUserActions = ({
  onEdit,
  onManagePermissions,
  onDelete,
}: {
  onEdit: (user: any) => void;
  onManagePermissions: (user: any) => void;
  onDelete: (user: any) => void;
}): DataTableAction<any>[] => [
  {
    icon: <Edit className="h-4 w-4" />,
    label: "Chỉnh sửa",
    onClick: onEdit,
  },
  {
    icon: <Shield className="h-4 w-4" />,
    label: "Phân quyền",
    onClick: onManagePermissions,
  },
  {
    icon: <Trash2 className="h-4 w-4 text-destructive" />,
    label: "Xóa",
    onClick: onDelete,
  },
];
