"use client"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"

type FilterType = "all" | "marked" | "unmarked"

interface AttendanceFiltersProps {
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  stats: {
    total: number
    marked: number
  }
}

export function AttendanceFilters({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  stats,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
          className={cn(
            "rounded-xl transition-all duration-300 text-xs",
            filter === "all" && "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:shadow-lg",
          )}
        >
          Tất cả ({stats.total})
        </Button>
        <Button
          variant={filter === "marked" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("marked")}
          className={cn(
            "rounded-xl transition-all duration-300 text-xs",
            filter === "marked" && "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg",
          )}
        >
          Đã đánh dấu ({stats.marked})
        </Button>
        <Button
          variant={filter === "unmarked" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("unmarked")}
          className={cn(
            "rounded-xl transition-all duration-300 text-xs",
            filter === "unmarked" &&
              "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg",
          )}
        >
          Chưa đánh dấu ({stats.total - stats.marked})
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm đoàn sinh..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-all text-sm"
        />
      </div>
    </div>
  )
}
