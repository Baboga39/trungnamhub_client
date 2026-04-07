import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  label: string;
  value: string | number;
  sublabel?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "— Chọn một tùy chọn —",
  disabled = false,
  loading = false,
  loadingText = "Đang tải...",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  const isDisabled = disabled || loading;

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full flex items-center justify-between px-3 py-2.5",
          "bg-white border text-sm transition-all outline-none",
          open
            ? "border-blue-400 rounded-t-xl rounded-b-none"
            : "rounded-xl border-slate-200 hover:border-slate-300",
          isDisabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer",
          !selected ? "text-slate-400" : "text-slate-800",
        ].join(" ")}
      >
        <span className="truncate">
          {loading ? loadingText : selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={[
            "flex-shrink-0 text-slate-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown menu */}
      {open && !isDisabled && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-blue-400 border-t-0 rounded-b-xl overflow-hidden max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-slate-400">Không có dữ liệu</div>
          ) : (
            options.map((opt, i) => (
              <div key={opt.value}>
                {i > 0 && <div className="h-px bg-slate-50" />}
                <div
                  onClick={() => handleSelect(opt)}
                  className={[
                    "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors text-sm",
                    opt.value === value
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-xs text-slate-400 truncate">{opt.sublabel}</span>
                    )}
                  </div>
                  {opt.value === value && (
                    <Check size={13} className="flex-shrink-0 text-blue-500 ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}