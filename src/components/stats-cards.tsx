"use client"

import { Users, UserCheck, Trophy, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useEffect, useState } from "react"

const stats = [
  {
    title: "Tổng đoàn sinh",
    value: 248,
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
    color: "from-[#60A5FA] to-[#3B82F6]",
    bgColor: "from-blue-50 to-blue-100/50",
    sparklineData: [220, 225, 230, 235, 240, 243, 248],
  },
  {
    title: "Có mặt hôm nay",
    value: 234,
    change: "+5",
    changeType: "increase" as const,
    icon: UserCheck,
    color: "from-[#10B981] to-[#059669]",
    bgColor: "from-emerald-50 to-emerald-100/50",
    sparklineData: [210, 215, 220, 228, 230, 232, 234],
  },
  {
    title: "Điểm trung bình",
    value: 8.5,
    change: "+0.3",
    changeType: "increase" as const,
    icon: Trophy,
    color: "from-[#F59E0B] to-[#D97706]",
    bgColor: "from-amber-50 to-amber-100/50",
    sparklineData: [7.8, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5],
  },
  {
    title: "Tiến độ học tập",
    value: 87,
    change: "-2%",
    changeType: "decrease" as const,
    icon: TrendingUp,
    color: "from-[#8B5CF6] to-[#7C3AED]",
    bgColor: "from-violet-50 to-violet-100/50",
    sparklineData: [92, 91, 90, 89, 88, 87, 87],
  },
]

function useAnimatedCounter(end: number, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg className="w-full h-12 opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-current`}
      />
    </svg>
  )
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const ChangeIcon = stat.changeType === "increase" ? ArrowUpRight : ArrowDownRight

        return <StatCard key={stat.title} stat={stat} Icon={Icon} ChangeIcon={ChangeIcon} index={index} />
      })}
    </div>
  )
}

function StatCard({
  stat,
  Icon,
  ChangeIcon,
  index,
}: {
  stat: (typeof stats)[0]
  Icon: any
  ChangeIcon: any
  index: number
}) {
  const animatedValue = useAnimatedCounter(typeof stat.value === "number" ? stat.value : 0, 1500)
  const displayValue = typeof stat.value === "number" && stat.value < 100 ? stat.value.toFixed(1) : animatedValue

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${stat.bgColor} rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${stat.color} blur-2xl`} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5">
        <Sparkline data={stat.sparklineData} color={stat.color} />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          <div
            className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold ${
              stat.changeType === "increase" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            <ChangeIcon className="h-3 w-3" />
            {stat.change}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{displayValue}</h3>
        </div>
      </div>
    </div>
  )
}
