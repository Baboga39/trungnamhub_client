"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts"

interface RadarData {
  category: string
  score: number
  maxScore: number
}

export function PerformanceRadar() {
  const [data, setData] = useState<RadarData[]>([])

  useEffect(() => {
    fetch("/api/dashboard/performance-radar")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-violet-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Phân tích đa chiều</CardTitle>
        <p className="text-sm text-muted-foreground">Điểm trung bình theo từng hạng mục</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Radar name="Điểm TB" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
