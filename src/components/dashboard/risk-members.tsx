"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, UserX, CheckCircle } from "lucide-react"
import { fetchRiskMembers } from "@/features/dashboard/dashboardThunks"

type RiskMember = {
  id: number
  fullName: string
  parish: string
  riskScore: number
  riskLevel: "high" | "medium" | "low"
  reasons: string[]
  absentCount: number
  averageGrade: number | null
}

export function RiskMembers() {
  const dispatch = useDispatch()

  const { riskMembers, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchRiskMembers())
  }, [dispatch])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <UserX className="h-4 w-4" />
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cần quan tâm
            </CardTitle>
            <CardDescription>Đoàn sinh có nguy cơ cao</CardDescription>
          </div>
          <Badge variant="destructive" className="text-sm">
            {riskMembers?.length || 0}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-orange-200 rounded-full blur-xl opacity-50" />
              <div className="relative bg-white rounded-full p-6 shadow-xl">
                <AlertTriangle className="w-8 h-8 text-slate-300 animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : riskMembers?.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {riskMembers.map((member: RiskMember) => (
              <div
                key={member.id}
                className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{member.fullName}</div>
                    <div className="text-xs text-gray-500">{member.parish}</div>
                  </div>
                  <Badge variant="outline" className={getRiskColor(member.riskLevel)}>
                    {getRiskIcon(member.riskLevel)}
                    <span className="ml-1 capitalize">{member.riskLevel}</span>
                  </Badge>
                </div>

                <div className="flex gap-4 mb-2 text-sm">
                  <div className="flex items-center gap-1">
                    <UserX className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">{member.absentCount} lần vắng</span>
                  </div>
                  {member.averageGrade !== null && (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">
                        ĐTB: {member.averageGrade.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {member.reasons.map((reason, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-xl opacity-50" />
              <div className="relative bg-white rounded-full p-6 shadow-xl">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-700 mb-2">
                Tất cả bình yên
              </h4>
              <p className="text-sm text-slate-500 max-w-xs">
                Không có đoàn sinh nào cần quan tâm lúc này. Tình hình học tập và chuyên cần rất tốt!
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
