// src/components/common/GlobalLoading.jsx
import React from "react";
import { useSelector } from "react-redux";

const GlobalLoading = () => {
  const membersLoading = useSelector((state) => state.members.loading);
  const attendanceLoading = useSelector((state) => state.attendance.loading);
  const authLoading = useSelector((state) => state.auth?.loading);

  const isLoading = membersLoading || attendanceLoading || authLoading;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 blur-md bg-cyan-400/30 rounded-full"></div>
      </div>
      <p className="mt-4 text-white font-semibold animate-pulse bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Đang tải dữ liệu ✨...
      </p>
    </div>
  );
};

export default GlobalLoading;
