"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Search, Shield, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "react-toastify"
import { ScrollArea } from "../ui/scroll-area"
import { menuItems } from "../../libs/menuItems" 
import { useDispatch } from "react-redux"
import { upsertPermissionsThunk, getUserPermissionsThunk } from "@/features/auth/authThunks"

export default function PermissionsDialog({
  open,
  onOpenChange,
  userName,
  userId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userId: number
}) {
  const [selectedScreens, setSelectedScreens] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch()

  // ✅ Khi modal mở => fetch quyền user này
  useEffect(() => {
    if (open && userId) {
      dispatch(getUserPermissionsThunk(userId))
        .unwrap()
        .then((permissions) => {
          setSelectedScreens(permissions)
        })
        .catch((err) => {
          console.error("Lỗi load quyền:", err)
        })
    }
  }, [open, userId, dispatch])

  // ✅ Group menuItems theo category
  const groupedScreens = useMemo(() => {
    const filtered = menuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered.reduce(
      (acc, item) => {
        const cat = item.category || "Khác"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
      },
      {} as Record<string, typeof menuItems>
    )
  }, [searchQuery])

  const handleToggleScreen = (href: string) => {
    setSelectedScreens((prev) =>
      prev.includes(href) ? prev.filter((id) => id !== href) : [...prev, href]
    )
  }

  const handleSelectAll = () => setSelectedScreens(menuItems.map((m) => m.href))
  const handleDeselectAll = () => setSelectedScreens([])

  const handleSave = async () => {
    try {
      await dispatch(
        upsertPermissionsThunk({
          userId,
          screenIds: selectedScreens,
        })
      ).unwrap()

      toast.success(`Đã cập nhật quyền truy cập cho ${userName}`)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-blue-600" />
            Phân quyền màn hình
          </DialogTitle>
          <DialogDescription>
            Quản lý quyền truy cập các màn hình cho{" "}
            <span className="font-semibold text-slate-900">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Nội dung chọn quyền */}
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm màn hình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {selectedScreens.length}/{menuItems.length}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Chọn tất cả
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Bỏ chọn tất cả
            </Button>
          </div>

          <ScrollArea className="pr-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(groupedScreens).map(([category, screens]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                    {category}
                    <Badge variant="outline" className="text-xs">
                      {screens.filter((s) => selectedScreens.includes(s.href)).length}/{screens.length}
                    </Badge>
                  </h3>

                  <div className="space-y-2">
                    {screens.map((screen) => {
                      const isSelected = selectedScreens.includes(screen.href)
                      return (
                        <div
                          key={screen.href}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                          }`}
                          onClick={() => handleToggleScreen(screen.href)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleScreen(screen.href)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-slate-900">{screen.label}</p>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                            </div>
                            {screen.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{screen.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {selectedScreens.length === 0 ? (
              <>
                <XCircle className="h-4 w-4 text-orange-500" />
                <span>Chưa chọn màn hình nào</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  Đã chọn <span className="font-semibold">{selectedScreens.length}</span> màn hình
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Lưu quyền
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
