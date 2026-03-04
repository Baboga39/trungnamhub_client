"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface HeatmapData {
  date: string
  rate: number
  count: number
}

export function AttendanceHeatmap() {
  const [data, setData] = useState<HeatmapData[]>([])

  useEffect(() => {
    fetch("/api/dashboard/attendance-heatmap")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  const getColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500"
    if (rate >= 75) return "bg-green-400"
    if (rate >= 60) return "bg-yellow-400"
    if (rate >= 40) return "bg-orange-400"
    return "bg-red-400"
  }

  const weeks = []
  for (let i = 0; i < 12; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7))
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lịch điểm danh 12 tuần</CardTitle>
        <p className="text-sm text-muted-foreground">Heatmap hiển thị tỷ lệ điểm danh mỗi ngày</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${getColor(day?.rate || 0)} transition-all hover:scale-150 hover:shadow-lg cursor-pointer`}
                    title={`${day?.date || ""}: ${day?.rate || 0}% (${day?.count || 0} người)`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Thấp</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <div className="w-3 h-3 bg-orange-400 rounded-sm" />
              <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
            </div>
            <span>Cao</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
