import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Đang tải dữ liệu..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px]">
      <div className="relative flex items-center justify-center mb-4">
        {/* Vòng nền mờ */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-blue-100"></div>
        {/* Vòng xoay chính */}
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin absolute" />
      </div>
      <p className="text-slate-500 font-medium animate-pulse mt-6">{message}</p>
    </div>
  );
}
