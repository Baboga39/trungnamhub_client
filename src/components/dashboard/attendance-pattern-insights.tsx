"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Calendar } from "lucide-react"

interface PatternData {
  day: string
  attendance: number
  recommended: boolean
}

export function AttendancePatternInsights() {
  const [data, setData] = useState<PatternData[]>([])
  const [loading, setLoading] = useState(true)
  const [bestDay, setBestDay] = useState("")

  useEffect(() => {
    fetch("/api/dashboard/attendance-pattern")
      .then((res) => res.json())
      .then((data) => {
        setData(data.pattern)
        setBestDay(data.bestDay)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error loading pattern:", err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl animate-pulse" />

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          Pattern điểm danh
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Ngày tốt nhất:{" "}
          <span className="font-semibold text-amber-700">{bestDay}</span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              color: "#fff",
            }}
            formatter={(value) => `${value}%`}
          />
          <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.recommended ? "#10b981" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          💡 <span className="font-medium">Gợi ý:</span> Nên tổ chức hoạt động vào{" "}
          <span className="text-green-600 font-semibold">{bestDay}</span> để có tỷ lệ điểm danh cao nhất
        </p>
      </div>
    </div>
  )
}
