"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar-nav";
import { Footer } from "./footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { AiChatDrawer } from "@/components/ai-assistant/AiChatDrawer";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // 🔥 KEY: nếu chưa auth → bỏ hết layout
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Navbar chỉ hiện khi login */}
      <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1 relative">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ✅ Sidebar chỉ hiện khi login */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-50 flex flex-col",
            "bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0",
            sidebarOpen ? "lg:w-64" : "lg:w-20",
            "w-64",
          )}
        >
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <Sidebar
              isCollapsed={!sidebarOpen && !isMobile}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>

          <div className="absolute top-1/2 right-[-14px] transform -translate-y-1/2 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-100"
              onClick={handleToggle}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
          <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* Global AI Assistant Chat Drawer */}
      <AiChatDrawer />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
