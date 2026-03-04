"use client"

import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { UserX, Clock, FileCheck, FileX, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

type AttendanceStatus = "absent" | "late" | "excused" | null

interface Member {
  id: string
  name: string
  avatar?: string
  parish: string
}

interface AttendanceMemberCardProps {
  member: Member
  status: AttendanceStatus
  note: string
  isNotesExpanded: boolean
  compactMode: boolean
  onStatusChange: (status: AttendanceStatus) => void
  onNoteChange: (note: string) => void
  onToggleNotes: () => void
}

export function AttendanceMemberCard({
  member,
  status,
  note,
  isNotesExpanded,
  compactMode,
  onStatusChange,
  onNoteChange,
  onToggleNotes,
}: AttendanceMemberCardProps) {
  const getRowBackground = (status: AttendanceStatus) => {
    if (!status) return "bg-white"
    switch (status) {
      case "absent":
        return "bg-red-50/50"
      case "late":
        return "bg-orange-50/50"
      case "excused":
        return "bg-blue-50/50"

      default:
        return "bg-white"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-gray-200 p-3 transition-all duration-300 hover:shadow-lg hover:border-gray-300",
        getRowBackground(status),
      )}
    >
      <div className="flex items-center gap-3">
        {!compactMode && (
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-sm">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold text-xs">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            {status && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                  status === "absent" && "bg-red-500",
                  status === "late" && "bg-orange-500",
                  status === "excused" && "bg-blue-500",
                  status === "unexcused" && "bg-purple-500",
                )}
              />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-gray-900 truncate">{member.name}</p>
          {!compactMode && <p className="text-xs text-gray-500 truncate">{member.parish}</p>}
        </div>
        {status && (
          <Badge
            className={cn(
              "transition-all rounded-full px-2 py-0.5 font-medium shadow-sm text-xs",
              status === "absent" && "bg-red-100 text-red-700 border-red-200",
              status === "late" && "bg-amber-100 text-amber-700 border-amber-200",
              status === "excused" && "bg-blue-100 text-blue-700 border-blue-200",
              status === "unexcused" && "bg-purple-100 text-purple-700 border-purple-200",
            )}
          >
            {status === "absent" && "Vắng"}
            {status === "late" && "Trễ"}
            {status === "excused" && "Có phép"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange("absent")}
          className={cn(
            "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
            status === "absent"
              ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg scale-105"
              : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300",
          )}
        >
          <UserX className="mr-1.5 h-4 w-4" />
          Vắng
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange("late")}
          className={cn(
            "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
            status === "late"
              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-lg scale-105"
              : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-300",
          )}
        >
          <Clock className="mr-1.5 h-4 w-4" />
          Đi trễ
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange("excused")}
          className={cn(
            "transition-all duration-300 h-9 rounded-xl font-medium shadow-sm hover:shadow-md text-sm",
            status === "excused"
              ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg scale-105"
              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300",
          )}
        >
          <FileCheck className="mr-1.5 h-4 w-4" />
          Có phép
        </Button>

        
      
      </div>

      {status && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNotes}
            className="w-full justify-between rounded-xl hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              Ghi chú
            </span>
            {isNotesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {isNotesExpanded && (
            <Textarea
              placeholder="Ghi chú lý do (ví dụ: Ốm, Đi công tác gia đình...)"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-all resize-none text-sm"
              rows={3}
            />
          )}
        </div>
      )}
    </div>
  )
}
