import { Badge } from "@/components/ui/badge";

export const pendingApprovalColumns = [
  {
    key: "title",
    label: "Tên tài liệu",
    render: (row: any) => <span className="font-semibold text-slate-800">{row.document?.title}</span>,
  },
  {
    key: "version",
    label: "Version",
    render: (row: any) => `v${row.document?.version || 1}`,
  },
  {
    key: "createdBy",
    label: "Người yêu cầu",
    render: (row: any) => row.document?.createdBy?.name || "Hệ thống",
  },
  {
    key: "createdAt",
    label: "Ngày gửi",
    render: (row: any) => new Date(row.createdAt).toLocaleDateString("vi-VN"),
  },
  {
    key: "status",
    label: "Trạng thái",
    render: () => (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-transparent">
        Cần Bạn Duyệt
      </Badge>
    ),
  },
];
