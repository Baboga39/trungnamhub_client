"use client";
import { Menu } from "lucide-react";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import { cn } from "../../libs/utils";
import { useNavigate } from "react-router-dom";

// 🔹 Redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { logoutThunk } from "../../features/auth/authThunks";

const notifications = [
  {
    id: 1,
    title: "Điểm danh mới",
    message: "Lớp 10A đã hoàn thành điểm danh",
    time: "5 phút trước",
    unread: true,
  },
  {
    id: 2,
    title: "Cập nhật điểm số",
    message: "Điểm số học kỳ đã được cập nhật",
    time: "1 giờ trước",
    unread: true,
  },
  {
    id: 3,
    title: "Thông báo mới",
    message: "Lịch họp phụ huynh đã được đăng",
    time: "2 giờ trước",
    unread: false,
  },
];
interface NavbarProps {
  onMenuClick?: () => void;
}
export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 🔹 lấy user từ Redux
  const user = useSelector((state: RootState) => state.auth.user);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 🔹 logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      localStorage.removeItem("accessToken"); // sửa lại key cho khớp
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-full hover:bg-slate-100 h-10 w-10"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6 text-slate-700" />
        </Button>
        {/* Logo */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 lg:w-64 flex-shrink-0">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-lg lg:text-xl font-bold text-white">ĐS</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h2 className="font-bold text-sm lg:text-base text-slate-900 truncate">
              Đoàn Sinh
            </h2>
            <p className="text-xs text-slate-500 truncate">
              Quản lý thông minh
            </p>
          </div>
        </div>

        {/* Search Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm đoàn sinh..."
              className="w-full pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Btn */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-slate-100"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        >
          <Search className="h-5 w-5 text-slate-600" />
        </Button>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative hover:bg-blue-50 hover:text-blue-600 transition-colors h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-80 sm:w-96 p-0 rounded-xl shadow-xl border border-slate-200 bg-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                <h3 className="font-semibold text-sm text-slate-900">
                  Thông báo
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-slate-500">
                    {unreadCount} chưa đọc
                  </span>
                )}
              </div>
              {/* List */}
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-all",
                      "hover:bg-blue-50/70",
                      n.unread ? "bg-blue-50/40" : "bg-white",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 italic">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="px-4 py-2 border-t bg-slate-50 rounded-b-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                >
                  Xem tất cả thông báo
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors h-10 w-10"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full h-10 w-10 p-0 hover:ring-2 hover:ring-blue-200 transition-all"
              >
                <Avatar className="h-10 w-10 border-2 border-blue-100">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-400 text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {user?.name ?? "Người dùng"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email ?? "Không có email"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm đoàn sinh..."
              className="w-full pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
