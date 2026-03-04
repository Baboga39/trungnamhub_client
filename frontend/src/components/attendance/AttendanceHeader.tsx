"use client"

import { Button } from "../ui/button"
import { Maximize2, Minimize2, RotateCcw } from "lucide-react"

interface AttendanceHeaderProps {
  compactMode: boolean
  onToggleCompact: () => void
  onReset: () => void
}

export function AttendanceHeader({ compactMode, onToggleCompact, onReset }: AttendanceHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Điểm Danh Đoàn Sinh
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Quản lý điểm danh hàng ngày</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCompact}
          className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
        >
          {compactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
