// src/constants/menuItems.js
import {
  Home,
  Users,
  ClipboardCheck,
  Trophy,
  BarChart3,
  Calendar,
  Settings,
  BookOpen,
} from "lucide-react"

// 🧭 Danh sách menu chính (JavaScript version)
export const menuItems = [
  {
    icon: Home,
    label: "Tổng quan",
    href: "/",
    category: "Dashboard",
    description: "Xem trang tổng quan hệ thống",
  },
  {
    icon: Users,
    label: "Đoàn sinh",
    href: "/students",
    category: "Quản lý",
    description: "Quản lý thông tin đoàn sinh",
  },
  {
    icon: ClipboardCheck,
    label: "Điểm danh",
    href: "/attendance",
    category: "Quản lý",
    description: "Điểm danh các buổi sinh hoạt",
  },
  {
    icon: Trophy,
    label: "Tổng quan điểm danh",
    href: "/attendance-calendar",
    category: "Báo cáo",
    description: "Thống kê xếp hạng đoàn sinh",
  },

    {
    icon: ClipboardCheck,
    label: "Điểm danh hoạt động",
    href: "/attendance-activity",
    category: "Điểm danh hoạt độngđặt",
    description: "Điểm danh hoạt động",
  },
  {
    icon: BarChart3,
    label: "Điểm số",
    href: "/scores",
    category: "Báo cáo",
    description: "Xem báo cáo điểm số",
  },
  {
    icon: Calendar,
    label: "Người dùng",
    href: "/users",
    category: "Cài đặt",
    description: "Quản lý tài khoản người dùng",
  },
  {
    icon: BookOpen,
    label: "Hoạt động ",
    href: "/activity",
    category: "Khác",
    description: "Tài liệu và hướng dẫn sử dụng",
  },
  {
    icon: Settings,
    label: "Cài đặt",
    href: "/settings",
    category: "Cài đặt",
    description: "Tùy chỉnh hệ thống",
  }
]
