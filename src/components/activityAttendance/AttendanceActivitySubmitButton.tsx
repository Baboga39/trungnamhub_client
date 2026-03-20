"use client";

import { Loader2 } from "lucide-react";

interface Props {
  onSubmit: () => void;
  isSubmitting?: boolean;
  count?: number;
}

export function AttendanceActivitySubmitButton({
  onSubmit,
  isSubmitting = false,
  count = 0,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3 md:static md:bg-transparent md:border-0">
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-white font-medium shadow-lg transition-all
        bg-gradient-to-r from-blue-500 to-purple-500
        hover:from-blue-600 hover:to-purple-600
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>Lưu ({count})</>
        )}
      </button>
    </div>
  );
}