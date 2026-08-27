"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cake, Gift, Sparkles, Calendar, Heart, PartyPopper } from "lucide-react"
import { fetchQuarterlyBirthdays } from "@/features/dashboard/dashboardThunks"

type BirthdayMember = {
  id: number
  userId?: number
  fullName: string
  birthDate: string
  birthDay: number
  birthMonth: number
  birthYear: number | null
  formattedDate: string
  age: number | null
  parish: string
  church: string
  branch: string
  group: string
  gender: string
  isLeader?: boolean
  role?: string
  isToday: boolean
  isThisMonth: boolean
}

export function QuarterlyBirthdays() {
  const dispatch = useDispatch()
  const { quarterlyBirthdays, quarterlyBirthdaysLoading } = useSelector(
    (state: any) => state.dashboard
  )

  const currentMonth = new Date().getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL")

  useEffect(() => {
    dispatch(fetchQuarterlyBirthdays({}) as any)
  }, [dispatch])

  const quarter = quarterlyBirthdays?.quarter || Math.ceil(currentMonth / 3)
  const allMembers: BirthdayMember[] = quarterlyBirthdays?.members || []
  const quarterMonths: number[] = quarterlyBirthdays?.quarterMonths || [
    (quarter - 1) * 3 + 1,
    (quarter - 1) * 3 + 2,
    (quarter - 1) * 3 + 3,
  ]

  const filteredMembers =
    selectedMonth === "ALL"
      ? allMembers
      : allMembers.filter((m) => m.birthMonth === selectedMonth)

  const todayCount = allMembers.filter((m) => m.isToday).length
  const leaderCount = allMembers.filter((m) => m.isLeader).length
  const memberCount = allMembers.length - leaderCount

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-50 via-pink-50/70 to-amber-50/60 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-200">
              <Cake className="h-5 w-5 text-white animate-bounce" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                Sinh nhật Quý {quarter}
                {todayCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    <PartyPopper size={12} /> {todayCount} hôm nay!
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Mừng tuổi mới đoàn sinh &amp; quý Trưởng
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-pink-100/90 text-pink-700 hover:bg-pink-100 font-semibold px-2.5 py-1 text-xs rounded-full border border-pink-200"
          >
            {leaderCount > 0
              ? `${memberCount} đoàn sinh • ${leaderCount} Trưởng`
              : `${allMembers.length} thành viên`}
          </Badge>
        </div>

        {/* Month filter tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-pink-100/60 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedMonth("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              selectedMonth === "ALL"
                ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800"
            }`}
          >
            Tất cả ({allMembers.length})
          </button>
          {quarterMonths.map((m) => {
            const count = allMembers.filter((item) => item.birthMonth === m).length
            const isCurrentMonthNow = m === currentMonth
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  selectedMonth === m
                    ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800"
                }`}
              >
                <span>Tháng {m}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedMonth === m
                      ? "bg-white/30 text-white"
                      : isCurrentMonthNow
                      ? "bg-pink-100 text-pink-700 font-bold"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {quarterlyBirthdaysLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="p-4 bg-white/80 rounded-full shadow-inner animate-pulse">
              <Gift className="w-8 h-8 text-pink-300 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Đang tải danh sách sinh nhật...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`p-3 rounded-xl bg-white/95 backdrop-blur-sm border transition-all duration-200 hover:shadow-md flex items-center justify-between ${
                  member.isToday
                    ? "border-rose-300 ring-2 ring-rose-400/40 bg-gradient-to-r from-rose-50/80 to-white"
                    : member.isLeader
                    ? "border-indigo-200 bg-gradient-to-r from-indigo-50/40 via-white to-white shadow-xs"
                    : member.isThisMonth
                    ? "border-pink-200/90 shadow-sm"
                    : "border-slate-100/90 hover:border-pink-200"
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      member.isToday
                        ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white animate-pulse"
                        : member.isLeader
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border border-indigo-300"
                        : member.isThisMonth
                        ? "bg-pink-100 text-pink-700 border border-pink-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200/60"
                    }`}
                  >
                    {member.isToday ? (
                      <PartyPopper size={18} />
                    ) : (
                      <span>{member.formattedDate.split("/")[0]}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-800 truncate">
                        {member.fullName}
                      </span>
                      {member.isLeader && (
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200"
                        >
                          {member.role || "Trưởng"}
                        </Badge>
                      )}
                      {member.isToday && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500 text-white shadow-xs animate-bounce">
                          🎉 Hôm nay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 truncate">
                      {member.isLeader ? (
                        <span className="text-indigo-600 font-medium">
                          {member.branch ? `Ngành ${member.branch}` : "Ban Quản Trị"}
                        </span>
                      ) : member.parish ? (
                        <span className="text-slate-600 font-medium">{member.parish}</span>
                      ) : member.church ? (
                        <span>{member.church}</span>
                      ) : (
                        <span className="text-slate-400">Đoàn sinh</span>
                      )}
                      {member.group && !member.isLeader && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{member.group}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Info: Date & Age */}
                <div className="text-right shrink-0 pl-2">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-pink-600">
                    <Calendar size={13} className="text-pink-400" />
                    <span>{member.formattedDate}</span>
                  </div>
                  {member.age !== null && member.age > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Mừng {member.age} tuổi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-200 rounded-full blur-lg opacity-40" />
              <div className="relative bg-white rounded-full p-4 shadow-md border border-pink-100">
                <Gift className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {selectedMonth === "ALL"
                  ? `Chưa có sinh nhật trong Quý ${quarter}`
                  : `Không có ai sinh vào Tháng ${selectedMonth}`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Các đoàn sinh và Trưởng có ngày sinh trong Quý sẽ được hiển thị tại đây
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
