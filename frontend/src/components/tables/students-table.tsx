"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge, Edit, Eye, Trash2 } from "lucide-react";
import {
  DataTable,
  type Column,
  type DataTableAction,
} from "../common/data-table";

interface Student {
  id: number;
  name: string;
  class: string;
  attendance: number;
  score: number;
  status: string;
  avatar: string;
}

const students: Student[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    class: "Lớp A1",
    attendance: 95,
    score: 8.5,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    class: "Lớp A2",
    attendance: 98,
    score: 9.0,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    class: "Lớp B1",
    attendance: 88,
    score: 7.8,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    class: "Lớp B2",
    attendance: 92,
    score: 8.2,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    class: "Lớp C1",
    attendance: 85,
    score: 7.5,
    status: "warning",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 6,
    name: "Võ Thị Phương",
    class: "Lớp C2",
    attendance: 96,
    score: 8.8,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 7,
    name: "Đặng Văn Giang",
    class: "Lớp A1",
    attendance: 90,
    score: 8.0,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 8,
    name: "Bùi Thị Hoa",
    class: "Lớp B1",
    attendance: 93,
    score: 8.6,
    status: "active",
    avatar: "/placeholder-user.jpg",
  },
];

const getStatusBadge = (status: string) => {
  if (status === "active") {
    return (
      <Badge className="bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#BFDBFE] border-0 text-xs font-medium px-2.5 py-0.5 rounded-lg">
        Hoạt động
      </Badge>
    );
  }
  return (
    <Badge className="bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] border-0 text-xs font-medium px-2.5 py-0.5 rounded-lg">
      Cần chú ý
    </Badge>
  );
};

const getScoreBadge = (score: number) => {
  if (score >= 8.5) {
    return "bg-[#D1FAE5] text-[#065F46]";
  } else if (score >= 7.0) {
    return "bg-[#DBEAFE] text-[#1E40AF]";
  }
  return "bg-[#FEF3C7] text-[#92400E]";
};

export default function StudentsTable() {
  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Đoàn sinh",
      width: 280,
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarImage src={student.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-[#60A5FA] to-[#93C5FD] text-white text-sm font-semibold">
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              {student.name}
            </p>
            <p className="text-xs text-slate-500">
              ID: {student.id.toString().padStart(4, "0")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      label: "Lớp",
      width: 120,
      render: (student) => (
        <span className="text-sm font-medium text-slate-700">
          {student.class}
        </span>
      ),
    },
    {
      key: "attendance",
      label: "Điểm danh",
      width: 140,
      render: (student) => (
        <div className="flex items-center gap-2.5">
          <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] rounded-full transition-all duration-500"
              style={{ width: `${student.attendance}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700 min-w-[42px] tabular-nums">
            {student.attendance}%
          </span>
        </div>
      ),
    },
    {
      key: "score",
      label: "Điểm TB",
      width: 100,
      render: (student) => (
        <Badge
          className={`${getScoreBadge(
            student.score
          )} border-0 font-bold text-xs px-3 py-1 rounded-lg shadow-sm`}
        >
          {student.score}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: 120,
      render: (student) => getStatusBadge(student.status),
    },
  ];

  const actions: DataTableAction<Student>[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      label: "Xem chi tiết",
      onClick: (student) => console.log("View", student),
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: (student) => console.log("Edit", student),
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: "Xóa",
      onClick: (student) => console.log("Delete", student),
      variant: "destructive",
    },
  ];

  return (
   <DataTable
  title="Danh sách thành viên"
  columns={columns}
  data={members}
  actions={actions}
  keyExtractor={(m) => m.id}
  searchPlaceholder="Tìm kiếm thành viên..."
  filterFn={(member, query, filterValue) => {
    const q = query.toLowerCase()
    const matchesSearch =
      member.name.toLowerCase().includes(q) ||
      (member.church?.toLowerCase().includes(q) ?? false) ||
      (member.parish?.toLowerCase().includes(q) ?? false)

    const matchesFilter =
      filterValue === "all"
        ? true
        : filterValue === "active"
        ? member.active === true
        : member.active === false

    return matchesSearch && matchesFilter
  }}
/>

  );
}
