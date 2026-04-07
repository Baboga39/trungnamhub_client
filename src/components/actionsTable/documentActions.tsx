import { Download, Trash2, Send, Clock } from "lucide-react";
import { DataTableAction } from "../common/data-table";

export const getDocumentActions = ({
  onResubmit,
  onDownload,
  onDelete,
  onHistory,
}: {
  onResubmit: (row: any) => void;
  onDownload: (row: any) => void;
  onDelete: (row: any) => void;
  onHistory: (row: any) => void;
}): DataTableAction<any>[] => [
  {
    label: "Tái gửi",
    icon: <Send size={16} />,
    onClick: onResubmit,
  },
  {
    label: "Tải",
    icon: <Download size={16} />,
    onClick: onDownload,
  },
  {
    label: "Xóa",
    icon: <Trash2 size={16} />,
    variant: "destructive" as const,
    onClick: onDelete,
  },
  {
    label: "Lịch sử",
    icon: <Clock size={16} />,
    onClick: onHistory,
  },
];
