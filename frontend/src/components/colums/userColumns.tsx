import type { Column } from "../common/data-table"
import { Badge } from "../ui/badge"

interface User {
  id: number
  name: string
  email: string
  startYear: string
  sumEvent: number
  role: string
  createdAt: string
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "Admin":
      return "destructive" // Red
    case "Manager":
      return "default" // Blue
    case "Moderator":
      return "secondary" // Gray
    case "Thiếu Phó":
      return "outline" // Outlined
    default:
      return "secondary"
  }
}

export const userColumns: Column<User>[] = [
  {
    key: "name",
    label: "Họ và tên",
    sortable: true,
    render: (user) => <div className="font-medium text-slate-900">{user.name}</div>,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (user) => <div className="text-slate-600">{user.email}</div>,
  },
  {
    key: "role",
    label: "Vai trò",
    sortable: true,
    render: (user) => <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>,
  },
  {
    key: "startYear",
    label: "Ngày bắt đầu",
    sortable: true,
    render: (user) => <div className="text-slate-600">{user.startYear}</div>,
  },
  {
    key: "sumEvent",
    label: "Tổng sự kiện",
    sortable: true,
    render: (user) => <div className="text-center font-semibold text-blue-600">{user.sumEvent}</div>,
  },
  {
    key: "createdAt",
    label: "Ngày tạo",
    sortable: true,
    render: (user) => <div className="text-slate-500 text-sm">{user.createdAt}</div>,
  },
]
