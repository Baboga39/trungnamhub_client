import { Badge } from "@/components/ui/badge";

export const documentColumns = [
  {
    key: "title",
    label: "Tên tài liệu",
    render: (row: any) => row.title,
  },
  {
    key: "version",
    label: "Version",
  },
  {
    key: "createdBy",
    label: "Người tạo",
    render: (row: any) => (
      <span className="font-medium text-slate-700">
        {row.createdBy?.name || "Không rõ"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    render: (row: any) => {
      const badgeClasses =
        row.status === "APPROVED"
          ? "border-transparent bg-green-100 text-green-700 hover:bg-green-200"
          : row.status === "NEED_REVISION"
            ? "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            : "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200";

      return <Badge className={badgeClasses}>{row.status}</Badge>;
    },
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
  },
];
