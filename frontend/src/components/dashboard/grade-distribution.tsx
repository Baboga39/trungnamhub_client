"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp } from "lucide-react"

type GradeDistribution = {
  categoryName: string
  ranges: {
    range: string
    count: number
  }[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function GradeDistribution() {
  const [data, setData] = useState<GradeDistribution[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/grade-distribution")
      .then((res) => res.json())
      .then((result) => {
        setData(result)
        if (result.length > 0) {
          setSelectedCategory(result[0].categoryName)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error loading grade distribution:", err)
        setLoading(false)
      })
  }, [])

  const currentData = data.find((d) => d.categoryName === selectedCategory)?.ranges || []

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Phân bố điểm số</CardTitle>
            <CardDescription>Histogram phân bố theo loại điểm</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {data.map((category) => (
            <button
              key={category.categoryName}
              onClick={() => setSelectedCategory(category.categoryName)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.categoryName
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Đang tải...</div>
        ) : currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {currentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
        )}
      </CardContent>
    </Card>
  )
}
