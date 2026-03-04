"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendData {
  month: string
  avgScore: number
  attendanceRate: number
}

export function TrendAnalysis() {
  const [data, setData] = useState<TrendData[]>([])

  useEffect(() => {
    fetch("/api/dashboard/trend-analysis")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Xu hướng 6 tháng</CardTitle>
        <p className="text-sm text-muted-foreground">Điểm số và điểm danh theo thời gian</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Điểm TB"
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="attendanceRate"
              stroke="#10b981"
              strokeWidth={3}
              name="Tỷ lệ điểm danh"
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
