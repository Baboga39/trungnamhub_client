import { Power, Edit, Clock, ArrowUpCircle } from "lucide-react";
import { DataTableAction } from "../common/data-table";

export const getMemberActions = ({
  onEdit,
  onChangeStatus,
  onViewHistory,
  onPromoteBranch,
}: {
  onEdit: (member: any) => void;
  onChangeStatus: (member: any) => void;
  onViewHistory: (member: any) => void;
  onPromoteBranch: (member: any) => void;
}): DataTableAction<any>[] => {
  return [
    {
      icon: <ArrowUpCircle className="h-4 w-4" />,
      label: "Lên Ngành",
      onClick: onPromoteBranch,
    },
    {
      icon: <Power className="h-4 w-4" />,
      label: "Đổi trạng thái",
      onClick: onChangeStatus,
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: onEdit,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Lịch sử",
      onClick: onViewHistory,
    },
  ];
};