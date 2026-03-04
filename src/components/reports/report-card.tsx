"use client"

import { FileSpreadsheet, Download, Calendar, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ReportCardProps {
  title: string
  description: string
  date: string
  size: string
  fileName: string
  onDownload: () => void
  color?: "blue" | "green" | "purple" | "orange"
}

const colorVariants = {
  blue: {
    bg: "bg-blue-50/80",
    hover: "hover:bg-blue-100/80",
    icon: "text-blue-500",
    button: "hover:bg-blue-500 hover:text-white",
    border: "border-blue-200/50",
  },
  green: {
    bg: "bg-emerald-50/80",
    hover: "hover:bg-emerald-100/80",
    icon: "text-emerald-500",
    button: "hover:bg-emerald-500 hover:text-white",
    border: "border-emerald-200/50",
  },
  purple: {
    bg: "bg-purple-50/80",
    hover: "hover:bg-purple-100/80",
    icon: "text-purple-500",
    button: "hover:bg-purple-500 hover:text-white",
    border: "border-purple-200/50",
  },
  orange: {
    bg: "bg-orange-50/80",
    hover: "hover:bg-orange-100/80",
    icon: "text-orange-500",
    button: "hover:bg-orange-500 hover:text-white",
    border: "border-orange-200/50",
  },
}

export function ReportCard({ title, description, date, size, fileName, onDownload, color = "blue" }: ReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const variant = colorVariants[color]

  const handleDownload = async () => {
    setIsDownloading(true)
    await onDownload()
    setTimeout(() => setIsDownloading(false), 1500)
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-300",
        "hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1",
        variant.border,
        variant.bg,
        variant.hover,
      )}
    >
      <div className="p-6 space-y-4">
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
              variant.bg,
              "ring-1 ring-white/50 shadow-sm",
            )}
          >
            <FileSpreadsheet className={cn("h-6 w-6", variant.icon)} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn("rounded-full transition-all duration-300", variant.button, isDownloading && "animate-pulse")}
          >
            <Download className={cn("h-4 w-4", isDownloading && "animate-bounce")} />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight line-clamp-2">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            <span>{size}</span>
          </div>
        </div>

        {/* File Name */}
        <div className="pt-2">
          <p className="text-xs font-mono text-slate-400 truncate">{fileName}</p>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
}
