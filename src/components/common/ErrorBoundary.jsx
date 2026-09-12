import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Auto-reload once if dynamic import chunk failed (due to new deployment on Vercel)
    const isChunkLoadError =
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("Loading chunk");

    if (isChunkLoadError) {
      const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_attempt", "true");
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem("chunk_reload_attempt");
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem("chunk_reload_attempt");
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 px-4 text-white">
          <div className="max-w-md w-full p-6 sm:p-8 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              Đã có bản cập nhật mới hoặc lỗi kết nối
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Trang web vừa có bản cập nhật mới hoặc đường truyền gặp gián đoạn. Vui lòng tải lại trang để tiếp tục sử dụng mượt mà.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all duration-200 active:scale-95"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
