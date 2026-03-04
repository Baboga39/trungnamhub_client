"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function AbsentMembersTable() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/absent-members")
      .then((res) => res.json())
      .then((members) => {
        setData(members)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error loading absent members:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-pink-500">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Đoàn sinh vắng nhiều</h3>
      </div>

      <div className="space-y-2">
        {data.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900">{member.fullName}</div>
              <div className="text-sm text-gray-500">{member.holyName}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">{member.absentCount} lần</div>
              <div className="text-xs text-gray-500">Gần nhất: {member.lastAbsent}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
