"use client"

import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "../../lib/utils"

interface AttendanceDatePickerProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function AttendanceDatePicker({ selectedDate, onSelectDate }: AttendanceDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal shadow-md hover:shadow-lg transition-all duration-300 h-11 md:h-10 md:w-[320px] rounded-2xl border-gray-200",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4" />
          {selectedDate ? (
            <span className="text-sm">{format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi })}</span>
          ) : (
            <span className="text-sm">Chọn ngày điểm danh</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl" align="start">
        <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && onSelectDate(date)} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
