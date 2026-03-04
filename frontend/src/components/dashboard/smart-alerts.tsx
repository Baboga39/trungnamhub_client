"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

interface Alert {
  id: string
  type: "danger" | "warning" | "info"
  title: string
  description: string
  memberName?: string
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    fetch("/api/dashboard/smart-alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data))
  }, [])

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-red-50 border-red-200",
          icon: AlertTriangle,
          iconColor: "text-red-600",
          badgeColor: "bg-red-500",
        }
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: AlertCircle,
          iconColor: "text-yellow-600",
          badgeColor: "bg-yellow-500",
        }
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: Info,
          iconColor: "text-blue-600",
          badgeColor: "bg-blue-500",
        }
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-red-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cảnh báo thông minh</CardTitle>
        <p className="text-sm text-muted-foreground">Các vấn đề cần quan tâm</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.map((alert) => {
            const style = getAlertStyle(alert.type)
            const Icon = style.icon
            return (
              <div key={alert.id} className={`p-4 rounded-lg border ${style.bg} transition-all hover:shadow-md`}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full bg-white ${style.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <Badge className={`${style.badgeColor} text-white text-xs`}>
                        {alert.type === "danger" ? "Nghiêm trọng" : alert.type === "warning" ? "Cảnh báo" : "Thông tin"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    {alert.memberName && (
                      <p className="text-xs font-medium text-gray-600 mt-2">Đoàn sinh: {alert.memberName}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
