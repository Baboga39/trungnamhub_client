import {
  Home,
  Users,
  ClipboardCheck,
  CalendarCheck,
  Trophy,
  BarChart3,
  Activity,
  FileText,
  UserCog,
  Settings,
  ClipboardList,
  FileBarChart,
  CalendarClock,
  CalendarDays,
} from "lucide-react";

const baseModules = [
  {
    icon: CalendarDays,
    label: "Chương trình sinh hoạt",
    href: "/programs",
  },
  {
    icon: Users,
    label: "Đoàn sinh",
    href: "/students",
  },
  {
    icon: CalendarCheck,
    label: "Điểm danh",
    href: "/attendance",
  },
  {
    icon: ClipboardCheck,
    label: "Điểm danh hoạt động",
    href: "/attendance-activity",
  },
  {
    icon: Trophy,
    label: "Tổng quan điểm danh",
    href: "/attendance-calendar",
  },
  {
    icon: BarChart3,
    label: "Điểm số",
    href: "/scores",
  },
  {
    icon: Activity,
    label: "Hoạt động",
    href: "/activity",
  },
  {
    icon: FileText,
    label: "Tài liệu",
    href: "/documents",
  },
];

export const getMenuItems = (user) => {
  const branchCategory =
    user?.role === "admin"
      ? "Tất cả ngành"
      : user?.branch
        ? `Ngành ${user.branch}`
        : "Ngành Thiếu"

  return [
    {
      icon: Home,
      label: "Tổng quan",
      href: "/",
      category: "Tổng quan",
    },
    {
      icon: Trophy,
      label: "Executive Dashboard",
      href: "/executive-dashboard",
      category: "Tổng quan",
    },
    {
      icon: FileBarChart,
      label: "Trung Tâm Báo Cáo",
      href: "/report-center",
      category: "Tổng quan",
    },
    {
      icon: CalendarClock,
      label: "Báo cáo tự động",
      href: "/report-schedules",
      category: "Tổng quan",
    },

    ...baseModules.map((item) => ({
      ...item,
      category: branchCategory,
    })),

    {
      icon: ClipboardList,
      label: "Tài liệu chờ duyệt",
      href: "/pending-approvals",
      category: "Phê duyệt",
    },

    {
      icon: UserCog,
      label: "Người dùng",
      href: "/users",
      category: "Trưởng",
    },
    {
      icon: Settings,
      label: "Cài đặt",
      href: "/settings",
      category: "Trưởng",
    },
  ]
}