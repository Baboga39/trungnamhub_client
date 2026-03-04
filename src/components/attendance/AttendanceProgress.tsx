import { Card, CardContent } from "../ui/card"
import { Progress } from "../ui/progress"

interface AttendanceProgressProps {
  marked: number
  total: number
}

export function AttendanceProgress({ marked, total }: AttendanceProgressProps) {
  const percentage = (marked / total) * 100

  return (
    <Card className="rounded-xl shadow-sm border border-gray-100 w-full">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Tiến độ điểm danh</p>
              <p className="text-base font-semibold text-gray-900">
                {marked}/{total} người
              </p>
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {Math.round(percentage)}%
            </div>
          </div>
          <Progress value={percentage} className="h-2 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
