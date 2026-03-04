"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy } from "lucide-react"
import { fetchAttendanceStreak } from "@/features/dashboard/dashboardThunks"

type StreakMember = {
  id: string
  fullName: string
  currentStreak: number
  longestStreak: number
  parish: string
}

export function AttendanceStreak() {
  const dispatch = useDispatch()

  const members: StreakMember[] = useSelector(
    (state: any) => state.dashboard.attendanceStreak
  )
  const loading = useSelector(
    (state: any) => state.dashboard.attendanceStreakLoading
  )

  useEffect(() => {
    dispatch(fetchAttendanceStreak())
  }, [dispatch])

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              Chuỗi điểm danh
            </CardTitle>
            <CardDescription>Top đoàn sinh có chuỗi dài nhất</CardDescription>
          </div>
          <Trophy className="h-6 w-6 text-orange-600" />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Đang tải...</div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {member.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.parish}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-600 font-bold">
                      <Flame className="h-4 w-4" />
                      {member.currentStreak}
                    </div>
                    <div className="text-xs text-gray-500">Hiện tại</div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-50 border-orange-200 text-orange-700"
                  >
                    Max: {member.longestStreak}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Chưa có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  )
}
