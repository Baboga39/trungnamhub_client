"use client"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RankingItem {
  id: string
  rank: number
  name: string
  score: number
  previousRank?: number
  avatar?: string
  subtitle?: string
}

interface RankingTableProps {
  title: string
  data: RankingItem[]
  showTrend?: boolean
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return (
        <span className="flex h-5 w-5 items-center justify-center text-sm font-semibold text-muted-foreground">
          {rank}
        </span>
      )
  }
}

function getTrendIcon(current: number, previous?: number) {
  if (!previous) return <Minus className="h-4 w-4 text-muted-foreground" />
  if (current < previous) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (current > previous) return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export function RankingTable({ title, data, showTrend = true }: RankingTableProps) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-4 rounded-xl p-3 transition-colors",
              item.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30",
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center">{getRankIcon(item.rank)}</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {item.avatar || item.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.name}</p>
              {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">{item.score} điểm</p>
              {showTrend && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  {getTrendIcon(item.rank, item.previousRank)}
                  {item.previousRank && item.previousRank !== item.rank && (
                    <span className="text-xs text-muted-foreground">#{item.previousRank}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
