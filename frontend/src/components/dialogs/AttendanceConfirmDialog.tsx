"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { format, parse } from "date-fns"
import { vi } from "date-fns/locale"

interface AttendanceConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  attendanceAll: Record<string, Record<string, string | null>>
  members: Array<{ id: string; name: string }>
}

export function AttendanceConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  attendanceAll,
  members,
}: AttendanceConfirmDialogProps) {
const getMemberName = (id: string) =>
  members.find((m) => String(m.id) === String(id))?.name || `ID ${id}`


  // Hàm gom đoàn sinh theo trạng thái
  const groupByStatus = (records: Record<string, string | null>, status: string) =>
    Object.keys(records).filter((id) => records[id] === status).map(getMemberName)

  const dateKeys = Object.keys(attendanceAll).sort()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xác nhận điểm danh</DialogTitle>
          <DialogDescription>
            Hiển thị tất cả các ngày có dữ liệu điểm danh ({dateKeys.length} ngày)
          </DialogDescription>
        </DialogHeader>

        {dateKeys.length === 0 && (
          <p className="text-center text-gray-500 italic py-6">
            Chưa có dữ liệu điểm danh nào
          </p>
        )}

        <div className="space-y-6 py-4">
          {dateKeys.map((dateKey) => {
            const records = attendanceAll[dateKey]
            const present = groupByStatus(records, "present")
            const absent = groupByStatus(records, "absent")
            const late = groupByStatus(records, "late")
            const excused = groupByStatus(records, "excused")
            const unexcused = groupByStatus(records, "unexcused")

            const total = Object.keys(records).length

            return (
              <div
                key={dateKey}
                className="border rounded-xl p-4 bg-gray-50 shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  🗓 {format(parse(dateKey, "yyyy-MM-dd", new Date()), "EEEE, dd/MM/yyyy", {
                    locale: vi,
                  })}
                </h3>

                <div className="text-sm text-gray-600 mb-2">
                  Tổng cộng: <b>{total}</b> người điểm danh
                </div>

                <div className="space-y-3">
                  {present.length > 0 && (
                    <div>
                      <h4 className="text-emerald-600 font-semibold text-sm">
                        ✅ Có mặt ({present.length})
                      </h4>
                      <ul className="text-sm list-disc list-inside text-gray-700">
                        {present.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {absent.length > 0 && (
                    <div>
                      <h4 className="text-red-600 font-semibold text-sm">
                        ❌ Vắng ({absent.length})
                      </h4>
                      <ul className="text-sm list-disc list-inside text-gray-700">
                        {absent.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {late.length > 0 && (
                    <div>
                      <h4 className="text-amber-600 font-semibold text-sm">
                        ⏰ Đi trễ ({late.length})
                      </h4>
                      <ul className="text-sm list-disc list-inside text-gray-700">
                        {late.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {excused.length > 0 && (
                    <div>
                      <h4 className="text-blue-600 font-semibold text-sm">
                        📘 Có phép ({excused.length})
                      </h4>
                      <ul className="text-sm list-disc list-inside text-gray-700">
                        {excused.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {unexcused.length > 0 && (
                    <div>
                      <h4 className="text-purple-600 font-semibold text-sm">
                        🚫 Không phép ({unexcused.length})
                      </h4>
                      <ul className="text-sm list-disc list-inside text-gray-700">
                        {unexcused.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
