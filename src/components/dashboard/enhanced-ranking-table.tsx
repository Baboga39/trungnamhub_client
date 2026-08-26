"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card } from "@/components/ui/card"
import { Trophy, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react"
import { fetchRanking } from "@/features/dashboard/dashboardThunks"
import { motion } from "framer-motion"

export function EnhancedRankingTable() {
  const dispatch = useDispatch()
  const { ranking, loading } = useSelector((state: any) => state.dashboard)

  useEffect(() => {
    dispatch(fetchRanking({ limit: 10 }))
  }, [dispatch])

  if (loading) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Trophy className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            Bảng xếp hạng thi đua
          </h3>
        </div>
        <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl animate-pulse" />
      </Card>
    )
  }

  if (!ranking || ranking.length === 0) {
    return (
      <Card className="p-6 bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            Bảng xếp hạng thi đua
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full blur-xl opacity-50" />
            <div className="relative bg-white rounded-full p-6 shadow-xl">
              <Zap className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-700 mb-2">
              Chưa có dữ liệu xếp hạng
            </h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Dữ liệu bảng xếp hạng sẽ xuất hiện khi có đủ kết quả thi đua từ các đoàn sinh
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
          </div>
        </div>
      </Card>
    )
  }

  const maxScore = ranking[0]?.totalScore || 1

  return (
    <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden w-full max-w-full min-w-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shrink-0">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
          Bảng xếp hạng thi đua
        </h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {ranking.map((item, index) => {
          const percent = (item.totalScore / maxScore) * 100

          return (
            <motion.div
              key={item.memberId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative p-3 sm:p-4 rounded-xl border bg-gradient-to-r from-white to-gray-50
              ${item.trend === "up" ? "ring-2 ring-green-300/50 shadow-green-200" : ""}
              ${index === 0 ? "shadow-lg sm:scale-[1.01]" : "shadow-sm"}
              overflow-hidden min-w-0
              `}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Rank / Medal */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-base sm:text-lg font-bold
                  bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow shrink-0">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : item.rank}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.memberName}</div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">{item.holyName}</div>

                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Score + Trend */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg">{item.totalScore.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">điểm</div>
                  </div>

                  <div className={`p-1.5 rounded-full
                    ${item.trend === "up" ? "bg-green-100" :
                      item.trend === "down" ? "bg-red-100" : "bg-gray-100"}`}>
                    {item.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {item.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                    {item.trend === "same" && <Minus className="h-4 w-4 text-gray-600" />}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
