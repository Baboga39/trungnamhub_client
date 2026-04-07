import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layouts/admin-layout";
import { toast } from "react-toastify";
import reportApi from "@/api/reportApi";
import userApi from "@/api/userApi";
import {
  Clock, Plus, Trash2, Pencil, Power, PowerOff,
  CalendarClock, ChevronDown, X, Check, Loader2
} from "lucide-react";
import { CustomMultiSelect } from "@/components/common/CustomMultiSelect";

// ─── Preset cron expressions ────────────────────────────────────────────────
const CRON_PRESETS = [
  {
    label: "Cuối mỗi Quý (23:59 ngày cuối)",
    description: "31/3, 30/6, 30/9, 31/12 lúc 23:59",
    value: "59 23 L 3,6,9,12 *",
    display: "Cuối quý",
  },
  {
    label: "Đầu mỗi Quý (08:00 sáng ngày đầu)",
    description: "1/1, 1/4, 1/7, 1/10 lúc 08:00",
    value: "0 8 1 1,4,7,10 *",
    display: "Đầu quý",
  },
  {
    label: "Cuối mỗi tháng (23:00 ngày cuối tháng)",
    description: "Ngày cuối mỗi tháng lúc 23:00",
    value: "0 23 L * *",
    display: "Cuối tháng",
  },
  {
    label: "Mỗi tuần (Thứ 2 lúc 08:00)",
    description: "Sáng thứ 2 hàng tuần",
    value: "0 8 * * 1",
    display: "Hàng tuần",
  },
  {
    label: "Tùy chỉnh...",
    description: "Nhập Cron Expression thủ công",
    value: "custom",
    display: "Tùy chỉnh",
  },
];

const FREQUENCY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Cuối quý":   { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  "Đầu quý":   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  "Cuối tháng":{ bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400" },
  "Hàng tuần": { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  "Tùy chỉnh": { bg: "bg-slate-100", text: "text-slate-600",  dot: "bg-slate-400" },
};

function getPresetDisplay(cronExpr: string) {
  const preset = CRON_PRESETS.find((p) => p.value === cronExpr);
  return preset?.display ?? "Tùy chỉnh";
}

// ─── Custom Cron Builder UI ──────────────────────────────────────────────────
const WEEKDAYS = [
  { label: "Hai", value: 1 }, { label: "Ba", value: 2 }, { label: "Tư", value: 3 },
  { label: "Năm", value: 4 }, { label: "Sáu", value: 5 }, { label: "Bảy", value: 6 },
  { label: "CN", value: 0 },
];
const MONTHS = [
  { label: "Th.1", value: 1 }, { label: "Th.2", value: 2 }, { label: "Th.3", value: 3 },
  { label: "Th.4", value: 4 }, { label: "Th.5", value: 5 }, { label: "Th.6", value: 6 },
  { label: "Th.7", value: 7 }, { label: "Th.8", value: 8 }, { label: "Th.9", value: 9 },
  { label: "Th.10", value: 10 }, { label: "Th.11", value: 11 }, { label: "Th.12", value: 12 },
];

type RepeatType = "daily" | "weekly" | "monthly";

interface CustomCronState {
  repeatType: RepeatType;
  hour: number;
  minute: number;
  weekdays: number[];   // used when repeatType = weekly
  dayOfMonth: string;   // used when repeatType = monthly, "" means *
  months: number[];     // used when repeatType = monthly
}

function buildCronFromCustom(s: CustomCronState): string {
  const h = s.hour;
  const m = s.minute;
  if (s.repeatType === "daily") return `${m} ${h} * * *`;
  if (s.repeatType === "weekly") {
    const days = s.weekdays.length > 0 ? s.weekdays.join(",") : "*";
    return `${m} ${h} * * ${days}`;
  }
  // monthly
  const months = s.months.length > 0 ? s.months.join(",") : "*";
  const dom = s.dayOfMonth.trim() !== "" ? s.dayOfMonth : "*";
  return `${m} ${h} ${dom} ${months} *`;
}

// Parse a saved cron expression back into CustomCronState for edit mode
function parseCronToCustom(expr: string): CustomCronState {
  const base = emptyCron();
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return base;

  const [min, hr, dom, mon, wday] = parts;
  const minute = parseInt(min, 10);
  const hour   = parseInt(hr, 10);

  const parsedMin  = isNaN(minute) ? 0  : Math.min(59, Math.max(0, minute));
  const parsedHour = isNaN(hour)   ? 0  : Math.min(23, Math.max(0, hour));

  // Detect repeat type:
  // daily:   dom="*", mon="*", wday="*"
  // weekly:  dom="*", mon="*", wday!="*"
  // monthly: dom!="*", wday="*"
  if (dom === "*" && mon === "*" && wday === "*") {
    return { ...base, repeatType: "daily", hour: parsedHour, minute: parsedMin };
  }
  if (dom === "*" && mon === "*" && wday !== "*") {
    const weekdays = wday.split(",").map(Number).filter((n) => !isNaN(n));
    return { ...base, repeatType: "weekly", hour: parsedHour, minute: parsedMin, weekdays };
  }
  // monthly
  const months = mon !== "*" ? mon.split(",").map(Number).filter((n) => !isNaN(n)) : [];
  const dayOfMonth = dom !== "*" && dom !== "L" ? dom : "";
  return { repeatType: "monthly", hour: parsedHour, minute: parsedMin, weekdays: [], dayOfMonth, months };
}

function describeCron(s: CustomCronState): string {
  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  const timeStr = `${pad(s.hour)}:${pad(s.minute)}`;
  if (s.repeatType === "daily") return `Hàng ngày lúc ${timeStr}`;
  if (s.repeatType === "weekly") {
    const days = s.weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(", ");
    return `Hàng tuần (${days || "*"}) lúc ${timeStr}`;
  }
  const months = s.months.map((m) => `Th.${m}`).join(", ");
  const domLabel = s.dayOfMonth.trim() !== "" ? `Ngày ${s.dayOfMonth}` : "Mọi ngày";
  return `${domLabel} hàng tháng${s.months.length > 0 ? ` (${months})` : ""} lúc ${timeStr}`;
}

function CustomCronBuilder({
  value,
  onChange,
}: {
  value: CustomCronState;
  onChange: (next: CustomCronState) => void;
}) {
  const set = (patch: Partial<CustomCronState>) => onChange({ ...value, ...patch });
  const toggleWeekday = (v: number) =>
    set({ weekdays: value.weekdays.indexOf(v) > -1 ? value.weekdays.filter((x) => x !== v) : [...value.weekdays, v] });
  const toggleMonth = (v: number) =>
    set({ months: value.months.indexOf(v) > -1 ? value.months.filter((x) => x !== v) : [...value.months, v] });

  const inputCls = "w-16 text-sm text-center border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-violet-400 bg-white";

  return (
    <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
      {/* Repeat type tabs */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Lặp lại</p>
        <div className="flex gap-1.5">
          {(["daily", "weekly", "monthly"] as RepeatType[]).map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => set({ repeatType: rt })}
              className={[
                "text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all",
                value.repeatType === rt
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300",
              ].join(" ")}
            >
              {rt === "daily" ? "Hàng ngày" : rt === "weekly" ? "Hàng tuần" : "Hàng tháng"}
            </button>
          ))}
        </div>
      </div>

      {/* Time picker */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Giờ chạy</p>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <button type="button" onClick={() => set({ hour: (value.hour + 1) % 24 })}
              className="text-slate-400 hover:text-violet-600 text-lg leading-none px-1">▲</button>
            <input type="number" min={0} max={23} value={value.hour}
              onChange={(e) => set({ hour: Math.min(23, Math.max(0, Number(e.target.value))) })}
              className={inputCls} />
            <button type="button" onClick={() => set({ hour: (value.hour - 1 + 24) % 24 })}
              className="text-slate-400 hover:text-violet-600 text-lg leading-none px-1">▼</button>
          </div>
          <span className="text-slate-400 font-bold text-lg">:</span>
          <div className="flex flex-col items-center gap-0.5">
            <button type="button" onClick={() => set({ minute: (value.minute + 5) % 60 })}
              className="text-slate-400 hover:text-violet-600 text-lg leading-none px-1">▲</button>
            <input type="number" min={0} max={59} value={value.minute}
              onChange={(e) => set({ minute: Math.min(59, Math.max(0, Number(e.target.value))) })}
              className={inputCls} />
            <button type="button" onClick={() => set({ minute: (value.minute - 5 + 60) % 60 })}
              className="text-slate-400 hover:text-violet-600 text-lg leading-none px-1">▼</button>
          </div>
          <span className="text-xs text-slate-400 ml-1">(giờ VN)</span>
        </div>
      </div>

      {/* Weekly: day picker */}
      {value.repeatType === "weekly" && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Ngày trong tuần</p>
          <div className="flex gap-1.5 flex-wrap">
            {WEEKDAYS.map((d) => {
              const active = value.weekdays.indexOf(d.value) > -1;
              return (
                <button key={d.value} type="button" onClick={() => toggleWeekday(d.value)}
                  className={[
                    "w-9 h-9 rounded-lg text-xs font-semibold border transition-all",
                    active ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300",
                  ].join(" ")}>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly: day + month picker */}
      {value.repeatType === "monthly" && (
        <>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Ngày trong tháng</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={31}
                value={value.dayOfMonth}
                placeholder="Bỏ trống = mọi ngày"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") { set({ dayOfMonth: "" }); return; }
                  const n = Number(raw);
                  if (!isNaN(n)) set({ dayOfMonth: String(Math.min(31, Math.max(1, n))) });
                }}
                className="w-32 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-violet-400 bg-white placeholder:text-slate-300"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Tháng áp dụng <span className="text-slate-300">(bỏ trống = mọi tháng)</span></p>
            <div className="flex gap-1.5 flex-wrap">
              {MONTHS.map((mo) => {
                const active = value.months.indexOf(mo.value) > -1;
                return (
                  <button key={mo.value} type="button" onClick={() => toggleMonth(mo.value)}
                    className={[
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                      active ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300",
                    ].join(" ")}>
                    {mo.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Preview */}
      <div className="pt-1 border-t border-slate-100 flex items-center gap-2">
        <span className="text-xs text-slate-400">Kết quả:</span>
        <code className="text-xs font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
          {buildCronFromCustom(value)}
        </code>
        <span className="text-xs text-slate-400">— {describeCron(value)}</span>
      </div>
    </div>
  );
}

// ─── Empty custom cron state ─────────────────────────────────────────────────
const emptyCron = (): CustomCronState => ({
  repeatType: "monthly",
  hour: 23,
  minute: 59,
  weekdays: [],
  dayOfMonth: "",
  months: [],
});

// ─── Empty form ────────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: "",
  templateId: "",
  cronPreset: "",
  cronExpression: "",
  emails: [] as string[],
  active: true,
});

// ─── Schedule Form Modal ───────────────────────────────────────────────────
function ScheduleModal({
  open,
  onClose,
  onSave,
  initialData,
  templates,
  users,
  loadingUsers,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  templates: any[];
  users: any[];
  loadingUsers: boolean;
}) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showCustomCron, setShowCustomCron] = useState(false);
  const [customCron, setCustomCron] = useState<CustomCronState>(emptyCron());

  useEffect(() => {
    if (initialData) {
      const preset = CRON_PRESETS.find((p) => p.value === initialData.cronExpression);
      const isCustom = !preset || preset.value === "custom";
      setForm({
        name: initialData.name,
        templateId: initialData.templateId,
        cronPreset: preset ? preset.value : "custom",
        cronExpression: initialData.cronExpression,
        emails: Array.isArray(initialData.emails) ? initialData.emails : [],
        active: initialData.active,
      });
      setShowCustomCron(isCustom);
      // Restore builder state from saved cron expression
      if (isCustom) {
        setCustomCron(parseCronToCustom(initialData.cronExpression));
      } else {
        setCustomCron(emptyCron());
      }
    } else {
      setForm(emptyForm());
      setShowCustomCron(false);
      setCustomCron(emptyCron());
    }
  }, [initialData, open]);

  // Keep cronExpression in sync with builder
  useEffect(() => {
    if (showCustomCron) {
      const expr = buildCronFromCustom(customCron);
      setForm((f) => ({ ...f, cronExpression: expr }));
    }
  }, [customCron, showCustomCron]);

  if (!open) return null;

  const userOptions = users.map((u) => ({ label: u.name, sublabel: u.email, value: u.email }));

  const handlePresetChange = (val: string) => {
    setForm((f) => ({ ...f, cronPreset: val, cronExpression: val === "custom" ? buildCronFromCustom(customCron) : val }));
    setShowCustomCron(val === "custom");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.templateId || !form.cronExpression || form.emails.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    await onSave({ ...form });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <CalendarClock size={15} className="text-violet-600" strokeWidth={1.8} />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {initialData ? "Chỉnh sửa lịch" : "Thêm lịch tự động"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tên lịch</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Gửi báo cáo cuối Quý"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 outline-none focus:border-violet-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Template */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Loại báo cáo</label>
            <div className="relative">
              <select
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 outline-none focus:border-violet-400 transition-all appearance-none"
              >
                <option value="">— Chọn loại báo cáo —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400">Năm và Quý sẽ được tự động tính theo thời điểm chạy.</p>
          </div>

          {/* Cron Preset */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tần suất chạy</label>
            <div className="grid grid-cols-1 gap-2">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetChange(preset.value)}
                  className={[
                    "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
                    form.cronPreset === preset.value
                      ? "border-violet-400 bg-violet-50"
                      : "border-slate-100 hover:border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div className={[
                    "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                    form.cronPreset === preset.value ? "border-violet-500 bg-violet-500" : "border-slate-300",
                  ].join(" ")}>
                    {form.cronPreset === preset.value && <Check size={9} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-tight">{preset.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Visual cron builder for custom */}
            {showCustomCron && (
              <CustomCronBuilder
                value={customCron}
                onChange={setCustomCron}
              />
            )}
          </div>

          {/* Emails */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Người nhận</label>
            <CustomMultiSelect
              options={userOptions}
              value={form.emails}
              onChange={(vals) => setForm((f) => ({ ...f, emails: vals as string[] }))}
              placeholder="— Chọn người nhận —"
              loading={loadingUsers}
              loadingText="Đang tải danh sách..."
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">Kích hoạt ngay</p>
              <p className="text-xs text-slate-400">Lịch sẽ bắt đầu chạy ngay sau khi lưu</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              className={[
                "relative rounded-full transition-all",
                form.active ? "bg-violet-500" : "bg-slate-200",
              ].join(" ")}
              style={{ height: 22, width: 40 }}
            >
              <span
                className={[
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                  form.active ? "left-5" : "left-0.5",
                ].join(" ")}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium py-2 px-5 rounded-xl transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Đang lưu..." : "Lưu lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ReportSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      reportApi.getSchedules(),
      reportApi.getTemplates(),
    ])
      .then(([sRes, tRes]: any) => {
        setSchedules(sRes.data || []);
        setTemplates(tRes.data || []);
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));

    userApi.getAll()
      .then((res: any) => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (s: any) => { setEditTarget(s); setModalOpen(true); };

  const handleSave = async (form: any) => {
    try {
      if (editTarget) {
        const res: any = await reportApi.updateSchedule(editTarget.id, form);
        setSchedules((prev) => prev.map((s) => s.id === editTarget.id ? res.data : s));
        toast.success("Đã cập nhật lịch tự động");
      } else {
        const res: any = await reportApi.createSchedule(form);
        setSchedules((prev) => [res.data, ...prev]);
        toast.success("Đã tạo lịch tự động thành công");
      }
      setModalOpen(false);
    } catch {
      toast.error("Lỗi khi lưu lịch, thử lại sau");
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await reportApi.deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success("Đã xóa lịch");
    } catch {
      toast.error("Không thể xóa lịch");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (s: any) => {
    setTogglingId(s.id);
    try {
      const res: any = await reportApi.updateSchedule(s.id, { ...s, active: !s.active });
      setSchedules((prev) => prev.map((item) => item.id === s.id ? res.data : item));
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    } finally {
      setTogglingId(null);
    }
  };

  const getTemplateName = (id: string) => templates.find((t) => t.id === id)?.name ?? id;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Báo cáo tự động</h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Cài đặt lịch hẹn để hệ thống tự động kết xuất và gửi báo cáo theo định kỳ.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            Thêm lịch mới
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-violet-100 border-t-violet-600" />
          </div>
        ) : schedules.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <CalendarClock size={22} className="text-violet-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-700 font-medium">Chưa có lịch tự động nào</p>
            <p className="text-sm text-slate-400 mt-1 mb-5">Tạo lịch để hệ thống tự gửi báo cáo định kỳ</p>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium border border-violet-200 rounded-xl px-4 py-2 hover:bg-violet-50 transition-colors"
            >
              <Plus size={14} /> Tạo lịch đầu tiên
            </button>
          </div>
        ) : (
          /* Schedule cards */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {schedules.map((s) => {
              const freqLabel = getPresetDisplay(s.cronExpression);
              const fc = FREQUENCY_COLORS[freqLabel] ?? FREQUENCY_COLORS["Tùy chỉnh"];
              const emails: string[] = Array.isArray(s.emails) ? s.emails : [];
              const isToggling = togglingId === s.id;
              const isDeleting = deletingId === s.id;

              return (
                <div
                  key={s.id}
                  className={[
                    "group relative bg-white border rounded-2xl p-5 transition-all",
                    s.active
                      ? "border-slate-100 hover:border-violet-200"
                      : "border-slate-100 opacity-60 grayscale",
                  ].join(" ")}
                >
                  {/* Status dot */}
                  <span className={[
                    "absolute top-4 right-4 w-2 h-2 rounded-full",
                    s.active ? "bg-emerald-400" : "bg-slate-300",
                  ].join(" ")} />

                  {/* Title */}
                  <div className="flex items-start gap-3 mb-3 pr-6">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-violet-500" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{getTemplateName(s.templateId)}</p>
                    </div>
                  </div>

                  {/* Frequency tag */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${fc.bg} ${fc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${fc.dot}`} />
                      {freqLabel}
                    </span>
                  </div>

                  {/* Cron expression */}
                  <code className="block text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-3 font-mono truncate">
                    {s.cronExpression}
                  </code>

                  {/* Recipients */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {emails.slice(0, 3).map((e) => (
                      <span key={e} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full truncate max-w-[140px]">{e}</span>
                    ))}
                    {emails.length > 3 && (
                      <span className="text-[11px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full">+{emails.length - 3}</span>
                    )}
                  </div>

                  {/* Last run */}
                  {s.lastRunAt && (
                    <p className="text-xs text-slate-400 mb-3">
                      Chạy lần cuối: {new Date(s.lastRunAt).toLocaleString("vi-VN")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(s)}
                      disabled={isToggling}
                      title={s.active ? "Tạm ngưng" : "Kích hoạt"}
                      className={[
                        "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                        s.active
                          ? "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                          : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50",
                      ].join(" ")}
                    >
                      {isToggling ? <Loader2 size={13} className="animate-spin" /> : s.active ? <PowerOff size={13} /> : <Power size={13} />}
                      {s.active ? "Tạm ngưng" : "Kích hoạt"}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(s)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil size={13} /> Sửa
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={isDeleting}
                      className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add new card */}
            <button
              onClick={openCreate}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-slate-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/30 transition-all min-h-[220px]"
            >
              <Plus size={22} strokeWidth={1.5} />
              <span className="text-sm font-medium">Thêm lịch mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editTarget}
        templates={templates}
        users={users}
        loadingUsers={loadingUsers}
      />
    </AdminLayout>
  );
}
