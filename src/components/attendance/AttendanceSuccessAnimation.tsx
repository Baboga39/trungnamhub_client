import { CheckCircle2 } from "lucide-react"

interface AttendanceSuccessAnimationProps {
  show: boolean
}

export function AttendanceSuccessAnimation({ show }: AttendanceSuccessAnimationProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">Thành công!</h3>
            <p className="text-gray-600 mt-1">Điểm danh đã được lưu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
