import React from "react";

const PageLoadingFallback = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 blur-md bg-indigo-500/20 rounded-full"></div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-200 tracking-wide animate-pulse">
        Đang tải trang...
      </p>
    </div>
  );
};

export default PageLoadingFallback;
