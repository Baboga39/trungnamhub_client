import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface SelectOption {
  label: string;
  value: string | number;
  sublabel?: string;
}

interface CustomMultiSelectProps {
  options: SelectOption[];
  value?: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export function CustomMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "— Chọn nhiều tùy chọn —",
  disabled = false,
  loading = false,
  loadingText = "Đang tải...",
}: CustomMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = (opt: SelectOption) => {
    const isSelected = value.indexOf(opt.value) > -1;
    if (isSelected) {
      onChange(value.filter((v) => v !== opt.value));
    } else {
      onChange([...value, opt.value]);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string | number) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const isDisabled = disabled || loading;
  const selectedOptions = options.filter((o) => value.indexOf(o.value) > -1);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full flex items-center justify-between px-3 py-2 min-h-[42px]",
          "bg-white border text-sm transition-all outline-none",
          open
            ? "border-blue-400 rounded-t-xl rounded-b-none"
            : "rounded-xl border-slate-200 hover:border-slate-300",
          isDisabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer",
        ].join(" ")}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2 overflow-hidden">
          {loading ? (
            <span className="text-slate-400">{loadingText}</span>
          ) : selectedOptions.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selectedOptions.map((sel) => (
              <span
                key={sel.value}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-100"
              >
                {sel.label}
                <X
                  size={12}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={(e) => removeValue(e, sel.value)}
                />
              </span>
            ))
          )}
        </div>
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
            options.map((opt, i) => {
              const checked = value.indexOf(opt.value) > -1;
              return (
                <div key={opt.value}>
                  {i > 0 && <div className="h-px bg-slate-50" />}
                  <div
                    onClick={() => handleToggle(opt)}
                    className={[
                      "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors text-sm",
                      checked
                        ? "bg-blue-50/50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-xs text-slate-400 truncate">{opt.sublabel}</span>
                      )}
                    </div>
                    {checked && (
                      <Check size={14} className="flex-shrink-0 text-blue-500 ml-2" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
