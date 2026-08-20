"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

export function AbsentMembersTable() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/v1/dashboard/absent-members")
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
      <Card className="p-6 bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold">Đoàn sinh vắng nhiều</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse" />
          ))}
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

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full blur-xl opacity-50" />
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-700 mb-2">
              Không có điểm cắt
            </h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Tất cả đoàn sinh đều có mức chuyên cần tốt. Không ai vắng quá nhiều!
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse" />
          </div>
        </div>
      ) : (
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
      )}
    </Card>
  )
}
