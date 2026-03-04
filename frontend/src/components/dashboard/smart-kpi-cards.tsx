"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"

interface KPIData {
  label: string
  value: number
  change: number
  isPositive: boolean
  trend: Array<{ day: string; value: number }>
  icon: string
  color: string
}

export function SmartKpiCards() {
  const [kpis, setKpis] = useState<KPIData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/smart-kpi")
      .then((res) => res.json())
      .then((data) => {
        setKpis(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error loading KPI data:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const colorMap: Record<string, { bg: string; text: string; lightBg: string }> = {
    blue: { bg: "bg-blue-600", text: "text-blue-600", lightBg: "bg-blue-50" },
    green: { bg: "bg-green-600", text: "text-green-600", lightBg: "bg-green-50" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", lightBg: "bg-purple-50" },
    orange: { bg: "bg-orange-600", text: "text-orange-600", lightBg: "bg-orange-50" },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const colors = colorMap[kpi.color] || colorMap.blue
        return (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 ${colors.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative z-10 space-y-3">
              {/* Header with icon and change */}
              <div className="flex items-start justify-between">
                <div className={`${colors.bg} rounded-lg p-2.5`}>
                  {kpi.icon === "trending-up" ? (
                    <TrendingUp className="w-5 h-5 text-white" />
                  ) : kpi.icon === "trending-down" ? (
                    <TrendingDown className="w-5 h-5 text-white" />
                  ) : (
                    <Zap className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`text-sm font-semibold flex items-center gap-1 ${kpi.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {kpi.isPositive ? "↑" : "↓"} {Math.abs(kpi.change)}%
                </div>
              </div>

              {/* Value */}
              <div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{kpi.label}</p>
              </div>

              {/* Mini sparkline chart */}
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={kpi.trend}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill={colors.bg}
                    stroke={colors.bg}
                    fillOpacity={0.2}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      })}
    </div>
  )
}
