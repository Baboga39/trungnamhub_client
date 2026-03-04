"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Trophy, Target, TrendingUp, Award, Star, Zap } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  achieved: boolean
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  target: Target,
  trending: TrendingUp,
  award: Award,
  star: Star,
  zap: Zap,
}

export function AchievementBadges() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    fetch("/api/dashboard/achievements")
      .then((res) => res.json())
      .then((data) => setAchievements(data))
  }, [])

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-amber-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Thành tích nổi bật</CardTitle>
        <p className="text-sm text-muted-foreground">Huy hiệu và danh hiệu xuất sắc</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Award
            return (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  achievement.achieved
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md hover:shadow-lg"
                    : "border-gray-200 bg-gray-50 opacity-60 grayscale"
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-3 rounded-full ${achievement.achieved ? achievement.color : "bg-gray-200"}`}>
                    <Icon className={`w-6 h-6 ${achievement.achieved ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.achieved && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">Đạt</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
