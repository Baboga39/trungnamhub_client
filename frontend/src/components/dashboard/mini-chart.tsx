"use client"

import type * as React from "react"

interface MiniChartProps {
  title: string
  data: { label: string; value: number; color: string }[]
  type?: "bar" | "donut"
}

export function MiniChart({ title, data, type = "bar" }: MiniChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      {type === "bar" ? (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {
                data.reduce(
                  (acc, item, index) => {
                    const percentage = (item.value / total) * 100
                    const dashArray = `${percentage} ${100 - percentage}`
                    const dashOffset = -acc.offset
                    acc.elements.push(
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="12"
                        stroke={item.color}
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-500"
                      />,
                    )
                    acc.offset += percentage
                    return acc
                  },
                  { elements: [] as React.ReactNode[], offset: 0 },
                ).elements
              }
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">Tổng</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
