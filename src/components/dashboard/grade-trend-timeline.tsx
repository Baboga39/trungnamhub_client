"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { BarChart3 } from "lucide-react"
import { fetchGradeTimeLine } from "@/features/dashboard/dashboardThunks"

const BAR_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
]

export function GradeTrendTimeline() {
  const dispatch = useDispatch()
  const { gradeTimeLine, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchGradeTimeLine())
  }, [dispatch])

  if (loading || !gradeTimeLine)
    return <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl animate-pulse" />

  const { data = [], categories = [] } = gradeTimeLine

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Điểm số theo quý
          </h3>
          <p className="text-sm text-slate-500">Trung bình điểm từng tiêu chí theo quý ({new Date().getFullYear()})</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 13 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {categories.map((cat: string, i: number) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={cat}
              fill={BAR_COLORS[i % BAR_COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

