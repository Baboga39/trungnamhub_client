"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { fetchGradeTimeLine } from "@/features/dashboard/dashboardThunks"

export function GradeTrendTimeline() {
  const dispatch = useDispatch()
  const { gradeTimeLine, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchGradeTimeLine())
  }, [dispatch])

  if (loading || !gradeTimeLine)
    return <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl animate-pulse" />

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Xu hướng điểm số
          </h3>
          <p className="text-sm text-slate-500">Theo dõi tiến độ 6 tháng</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={gradeTimeLine}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={3} name="Điểm trung bình" />
          <Line type="monotone" dataKey="max" stroke="#10b981" strokeDasharray="5 5" name="Điểm cao nhất" />
          <Line type="monotone" dataKey="min" stroke="#f59e0b" strokeDasharray="5 5" name="Điểm thấp nhất" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
