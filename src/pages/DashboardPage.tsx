"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AdminLayout } from "../components/layouts/admin-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EnhancedRankingTable } from "@/components/dashboard/enhanced-ranking-table"
import { QuarterlyBirthdays } from "@/components/dashboard/quarterly-birthdays"
import { QuickActions } from "@/components/dashboard/quick-actions"

import { Users, GraduationCap, Calendar, UserCheck, ClipboardList, PlusCircle, Award } from "lucide-react"
import { AttendanceStreak } from "@/components/dashboard/attendance-streak"
import { RiskMembers } from "@/components/dashboard/risk-members"
import { GradeTrendTimeline } from "@/components/dashboard/grade-trend-timeline"
import { SmartKpiCards } from "@/components/dashboard/smart-kpi-cards"
import { Top3Ranking } from "@/components/dashboard/top-3-ranking"
import { fetchDashboardStats } from "../features/dashboard/dashboardThunks"
import { useNavigate } from "react-router-dom"
import { Shield, ChevronRight } from "lucide-react"

const quickActions = [
  {
    id: "0",
    title: "Executive Cockpit",
    description: "Trưởng Đoàn Cockpit",
    icon: Shield,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    url: "/executive-dashboard",
  },
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
    url: "/report-center"
  },
]

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { stats, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats() as any)
  }, [dispatch])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Executive Banner */}
        <div
          onClick={() => navigate("/executive-dashboard")}
          className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Executive Dashboard — Quý Trưởng Đoàn</h2>
              <p className="text-xs text-slate-300">Xem ngay báo cáo tổng quan đa chiều, so sánh các Ngành & Cảnh báo nguy cơ</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20 transition-colors">
            <span>Mở Executive Cockpit</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

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
            title="Điểm danh gần nhất"
            value={
              loading
                ? "..."
                : `${stats?.latestAttendance?.rate?.toFixed(1) ?? stats?.attendanceRate?.value?.toFixed(1) ?? 0}%`
            }
            subtitle={
              loading
                ? "..."
                : stats?.latestAttendance?.hasData && stats?.latestAttendance?.date
                ? `${stats.latestAttendance.presentCount}/${stats.latestAttendance.totalMembers} đoàn sinh (${stats.latestAttendance.date})`
                : "Chưa có buổi sinh hoạt"
            }
            icon={UserCheck}
            trend={
              stats?.latestAttendance?.hasData
                ? {
                    value: Math.abs(stats?.latestAttendance?.trend ?? stats?.attendanceRate?.trend ?? 0),
                    isPositive: (stats?.latestAttendance?.trend ?? stats?.attendanceRate?.trend ?? 0) >= 0,
                    label: "so với buổi trước",
                  }
                : undefined
            }
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
            <QuarterlyBirthdays />
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
