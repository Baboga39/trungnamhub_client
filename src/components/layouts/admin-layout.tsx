"use client"

import { type ReactNode, useState, useEffect } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar-nav"
import { Footer } from "./footer"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
<Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-50 flex flex-col",
            "bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
            // Mobile behavior
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop behavior
            "lg:translate-x-0",
            sidebarOpen ? "lg:w-64" : "lg:w-20",
            // Width on mobile
            "w-64",
          )}
        >
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <Sidebar isCollapsed={!sidebarOpen && !isMobile} onNavigate={() => setMobileSidebarOpen(false)} />
          </div>

          {/* Toggle button ra mép ngoài sidebar */}
          <div className="absolute top-1/2 right-[-14px] transform -translate-y-1/2 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full backdrop-blur-sm bg-white/80 
                         hover:bg-white/90 shadow-md border border-gray-200 
                         transition-all duration-300"
              onClick={handleToggle}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              ) : (
                <ChevronRight className="h-6 w-6 text-slate-700" />
              )}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
          <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
            <div className="space-y-6">{children}</div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
