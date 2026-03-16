"use client"

import { useMemo } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Users, UserCheck, UserX, Clock, FileCheck, FileX } from "lucide-react"
import { format } from "date-fns"
import type { RootState } from "@/store/store"

export function AttendanceStats({
  members,
  attendance,
}: {
  members: any[]
  attendance: Record<string, { status: string | null }>
}) {
const stats = useMemo(() => {
  const values = Object.values(attendance).map((a) => a.status)

  const absent = values.filter((v) => v === "absent").length
  const late = values.filter((v) => v === "late").length
  const excused = values.filter((v) => v === "excused").length
  const unexcused = values.filter((v) => v === "unexcused").length

  const marked = absent + late + excused + unexcused
  const present = members.length - marked

  return {
    total: members.length,
    present,
    absent,
    late,
    excused,
    unexcused,
  }
}, [attendance, members])

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
      <StatCard title="Tổng số" value={stats.total} icon={<Users />} />
      <StatCard title="Có mặt" value={stats.present} icon={<UserCheck />} color="emerald" />
      <StatCard title="Vắng" value={stats.absent} icon={<UserX />} color="red" />
      <StatCard title="Đi trễ" value={stats.late} icon={<Clock />} color="amber" />
      <StatCard title="Có phép" value={stats.excused} icon={<FileCheck />} color="blue" />
      <StatCard title="Không phép" value={stats.unexcused} icon={<FileX />} color="purple" />
    </div>
  )
}


function StatCard({ title, value, icon, color = "gray" }: any) {
  return (
    <Card className={`rounded-2xl shadow-md border-${color}-200`}>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
      </CardContent>
    </Card>
  )
}
