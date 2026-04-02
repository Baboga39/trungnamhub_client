"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../libs/utils"
import { menuItems } from "@/libs/menuItems"
import { getPermissionsThunk } from "@/features/auth/authThunks"

export function Sidebar({ isCollapsed = false, onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { permissions, isAuthenticated } = useSelector((state) => state.auth)

  const [openGroups, setOpenGroups] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getPermissionsThunk())
    }
  }, [dispatch, isAuthenticated])

  const visibleMenus = menuItems.filter((item) =>
    permissions.includes(item.href)
  )

  const groupedMenus = visibleMenus.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full bg-white"
    >
      <nav className="flex-1 py-4 space-y-3 overflow-y-auto px-2">
        {Object.entries(groupedMenus).map(([category, items]) => {
          const isOpen = openGroups[category] ?? true

          const isGroupActive = items.some(
            (i) => i.href === location.pathname
          )

          return (
            <div key={category}>
              {/* 🔹 Group Title */}
              {!isCollapsed && (
                <button
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [category]: !prev[category],
                    }))
                  }
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center"
                >
                  {category}
                  <motion.span
                    animate={{ rotate: isOpen ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    ⌄
                  </motion.span>
                </button>
              )}

              {/* 🔹 Animated Group */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {items.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        location.pathname === item.href

                      return (
                        <motion.button
                          key={item.label}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            navigate(item.href)
                            onNavigate?.()
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-2xl text-sm font-medium transition-all duration-200",
                            isCollapsed
                              ? "px-3 py-3 justify-center"
                              : "px-4 py-3",
                            isActive
                              ? "bg-[#60A5FA] text-white shadow-lg shadow-blue-200/50"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          )}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <motion.div
                            animate={{
                              scale: isActive ? 1.15 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>

                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Help Card */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-slate-100"
        >
          <div className="px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D] shadow-sm">
            <p className="text-sm font-bold text-slate-800">
              Cần hỗ trợ?
            </p>
            <p className="text-xs text-slate-700">
              Liên hệ: 0814069391
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}