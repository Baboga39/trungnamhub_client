"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../libs/utils"
import { getMenuItems } from "@/libs/menuItems"
import { getPermissionsThunk } from "@/features/auth/authThunks"

export function Sidebar({ isCollapsed = false, onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const {
    permissions,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth)

  const [openGroups, setOpenGroups] = useState({})

  // Load permissions
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getPermissionsThunk())
    }
  }, [dispatch, isAuthenticated])

  // Generate menu theo user.branch
  const menuItems = useMemo(() => {
    return getMenuItems(user)
  }, [user])

  // Filter menu theo permission
  const visibleMenus = useMemo(() => {
    // Chưa load permission -> tạm thời hiển thị menu
    if (!permissions || permissions.length === 0) {
      return menuItems
    }

    return menuItems.filter((item) => {
      // Luôn cho phép trang tổng quan
      if (item.href === "/") {
        return true
      }

      // Giữ logic cũ: Programs luôn được phép
      if (item.href === "/programs" || item.href === "/pending-program-approvals") {
        return true
      }

      return permissions.includes(item.href)
    })
  }, [menuItems, permissions])

  // Group menu theo category
  const groupedMenus = useMemo(() => {
    return visibleMenus.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }

      acc[item.category].push(item)

      return acc
    }, {})
  }, [visibleMenus])

  const toggleGroup = (category) => {
    setOpenGroups((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? true),
    }))
  }

  return (
    <motion.div
      animate={{
        width: isCollapsed ? 80 : 240,
      }}
      transition={{
        duration: 0.25,
      }}
      className="flex flex-col h-full bg-white"
    >
      {/* =========================
          MENU
      ========================== */}
      <nav className="flex-1 py-4 space-y-3 overflow-y-auto px-2">
        {Object.entries(groupedMenus).map(([category, items]) => {
          const isOpen = openGroups[category] ?? true

          const isGroupActive = items.some(
            (item) => location.pathname === item.href
          )

          return (
            <div key={category}>
              {/* =========================
                  GROUP TITLE
              ========================== */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(category)}
                  className={cn(
                    "w-full px-3 py-2 text-xs font-semibold",
                    "uppercase tracking-wider",
                    "flex justify-between items-center",
                    "transition-colors duration-200",
                    isGroupActive
                      ? "text-slate-600"
                      : "text-slate-400"
                  )}
                >
                  <span>{category}</span>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 0 : 180,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    ⌄
                  </motion.span>
                </button>
              )}

              {/* =========================
                  GROUP CONTENT
              ========================== */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon

                        const isActive =
                          location.pathname === item.href

                        return (
                          <motion.button
                            key={`${item.href}-${item.label}`}
                            type="button"
                            whileHover={{
                              scale: 1.03,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() => {
                              navigate(item.href)
                              onNavigate?.()
                            }}
                            className={cn(
                              "w-full flex items-center gap-3",
                              "rounded-2xl text-sm font-medium",
                              "transition-all duration-200",
                              isCollapsed
                                ? "px-3 py-3 justify-center"
                                : "px-4 py-3",
                              isActive
                                ? "bg-[#60A5FA] text-white shadow-lg shadow-blue-200/50"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            )}
                            title={
                              isCollapsed
                                ? `${item.label}${category ? ` • ${category}` : ""}`
                                : undefined
                            }
                          >
                            {/* ICON */}
                            <motion.div
                              animate={{
                                scale: isActive ? 1.15 : 1,
                              }}
                              transition={{
                                duration: 0.2,
                              }}
                              className="shrink-0"
                            >
                              <Icon className="h-5 w-5" />
                            </motion.div>

                            {/* LABEL */}
                            {!isCollapsed && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  x: -10,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  x: -10,
                                }}
                                transition={{
                                  duration: 0.2,
                                }}
                                className="truncate"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* =========================
          HELP CARD
      ========================== */}
      {!isCollapsed && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
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