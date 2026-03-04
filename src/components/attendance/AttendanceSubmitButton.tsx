"use client"

import { Button } from "../ui/button"
import { Save } from "lucide-react"

interface AttendanceSubmitButtonProps {
  isSubmitting: boolean
  onSubmit: () => void
}

export function AttendanceSubmitButton({ isSubmitting, onSubmit }: AttendanceSubmitButtonProps) {
  return (
    <>
      {/* Mobile floating button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-50">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-xl transition-all duration-300 h-14 text-base font-semibold rounded-2xl"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Đang lưu..." : "Lưu Điểm Danh"}
        </Button>
      </div>

      {/* Desktop button */}
      <div className="hidden md:flex justify-end mt-6">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl px-8"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Đang lưu..." : "Lưu Điểm Danh"}
        </Button>
      </div>
    </>
  )
}
