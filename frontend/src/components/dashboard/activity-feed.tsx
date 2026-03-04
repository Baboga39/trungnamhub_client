"use client"
import { cn } from "@/lib/utils"
import { UserPlus, CheckCircle, Calendar, Award, Bell, type LucideIcon } from "lucide-react"

interface ActivityItem {
  id: string
  type: "attendance" | "event" | "award" | "member" | "notification"
  title: string
  description: string
  time: string
  icon?: LucideIcon
}

const activityIcons: Record<ActivityItem["type"], { icon: LucideIcon; color: string; bg: string }> = {
  attendance: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  event: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
  award: { icon: Award, color: "text-yellow-500", bg: "bg-yellow-100" },
  member: { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-100" },
  notification: { icon: Bell, color: "text-orange-500", bg: "bg-orange-100" },
}

interface ActivityFeedProps {
  title: string
  activities: ActivityItem[]
}

export function ActivityFeed({ title, activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const { icon: Icon, color, bg } = activityIcons[activity.type]
          return (
            <div key={activity.id} className="flex gap-4">
              <div className="relative">
                <div className={cn("rounded-full p-2", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-border" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
