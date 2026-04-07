import { CheckCircle, XCircle, Eye } from "lucide-react";
import { DataTableAction } from "../common/data-table";

export const getPendingApprovalActions = ({
  onView,
  onApprove,
  onReject,
}: {
  onView: (row: any) => void;
  onApprove: (row: any) => void;
  onReject: (row: any) => void;
}): DataTableAction<any>[] => [
  {
    label: "Xem tài liệu",
    icon: <Eye size={16} />,
    onClick: onView,
  },
  {
    label: "Đồng Ý",
    icon: <CheckCircle size={16} />,
    onClick: onApprove,
    className: "text-blue-600 border-blue-200 hover:bg-blue-50",
  },
  {
    label: "Từ Chối",
    icon: <XCircle size={16} />,
    onClick: onReject,
    variant: "destructive" as const,
  },
];
