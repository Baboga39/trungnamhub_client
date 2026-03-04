"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { cn } from "../../libs/utils"
import { menuItems } from "@/libs/menuItems"
import { getPermissionsThunk } from "@/features/auth/authThunks"

export function Sidebar({ isCollapsed = false, onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // 🧠 Lấy quyền từ Redux
  const { permissions, isAuthenticated } = useSelector((state) => state.auth)

  // 🔁 Fetch quyền khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getPermissionsThunk())
    }
  }, [dispatch, isAuthenticated])

  // ✅ Chỉ hiển thị menu có quyền
  const visibleMenus = menuItems.filter((item) =>
    permissions.includes(item.href)
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation Menu */}
      <nav
        className={cn(
          "flex-1 py-4 space-y-1 overflow-y-auto",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {visibleMenus.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href

          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.href)
                onNavigate?.()
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-200",
                "group relative",
                isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                isActive
                  ? "bg-[#60A5FA] text-white shadow-lg shadow-blue-200/50 hover:bg-[#3B82F6]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Help Card */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D] shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-0.5">Cần hỗ trợ?</p>
            <p className="text-xs text-slate-700">Liên hệ: 0814069391</p>
          </div>
        </div>
      )}
    </div>
  )
}
