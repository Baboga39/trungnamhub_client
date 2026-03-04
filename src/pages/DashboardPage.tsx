"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AdminLayout } from "../components/layouts/admin-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EnhancedRankingTable } from "@/components/dashboard/enhanced-ranking-table"
import { AbsentMembersTable } from "@/components/dashboard/absent-members-table"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Users, GraduationCap, Calendar, UserCheck, ClipboardList, PlusCircle, Award } from "lucide-react"
import { AttendanceStreak } from "@/components/dashboard/attendance-streak"
import { RiskMembers } from "@/components/dashboard/risk-members"
import { GradeTrendTimeline } from "@/components/dashboard/grade-trend-timeline"
import { SmartKpiCards } from "@/components/dashboard/smart-kpi-cards"
import { Top3Ranking } from "@/components/dashboard/top-3-ranking"
import { fetchDashboardStats } from "../features/dashboard/dashboardThunks"
import { url } from "zod"

const quickActions = [
  {
    id: "1",
    title: "Điểm danh",
    description: "Điểm danh nhanh",
    icon: UserCheck,
    color: "text-green-600",
    bgColor: "bg-green-100",
    url: "/attendance",
  },
  {
    id: "2",
    title: "Thêm đoàn sinh",
    description: "Thêm thành viên mới",
    icon: PlusCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    url: "/students"
  },
  {
    id: "3",
    title: "Chấm điểm",
    description: "Chấm điểm thi đua",
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    url: "/scores"
  },
  {
    id: "4",
    title: "Báo cáo",
    description: "Xem báo cáo",
    icon: ClipboardList,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats() as any)
  }, [dispatch])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Tổng đoàn sinh"
            value={loading ? "..." : stats?.totalMembers?.value?.toString() || "0"}
            subtitle="So với tháng trước"
            icon={Users}
            trend={{
              value: Math.abs(stats?.totalMembers?.trend || 0),
              isPositive: (stats?.totalMembers?.trend || 0) >= 0,
            }}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />

          <StatsCard
            title="Huynh trưởng"
            value={loading ? "..." : stats?.totalManagers?.value?.toString() || "0"}
            subtitle="So với tháng trước"
            icon={GraduationCap}
            trend={{
              value: Math.abs(stats?.totalManagers?.trend || 0),
              isPositive: (stats?.totalManagers?.trend || 0) >= 0,
            }}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />

          <StatsCard
            title="Điểm danh tháng này"
            value={loading ? "..." : `${stats?.attendanceRate?.value?.toFixed(1) || 0}%`}
            subtitle="So với tháng trước"
            icon={UserCheck}
            trend={{
              value: Math.abs(stats?.attendanceRate?.trend || 0),
              isPositive: (stats?.attendanceRate?.trend || 0) >= 0,
            }}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />

          <StatsCard
            title={`Buổi sinh hoạt ${stats?.totalSessions?.year || ""}`}
            value={loading ? "..." : stats?.totalSessions?.value?.toString() || "0"}
            subtitle="So với năm trước"
            icon={Calendar}
            trend={{
              value: Math.abs(stats?.totalSessions?.trend || 0),
              isPositive: (stats?.totalSessions?.trend || 0) >= 0,
              label:"So với năm trước",
            }}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Top3Ranking />
            <SmartKpiCards />
            <EnhancedRankingTable />
            <GradeTrendTimeline />
           
          </div>

          <div className="space-y-6">
            <QuickActions title="Thao tác nhanh" actions={quickActions} />
            <AttendanceStreak />
            <RiskMembers />
            <AbsentMembersTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
