import React, { useState } from "react";
import { Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AttendanceTrendPoint } from "@/types/executiveDashboard";

interface AttendanceTrendSectionProps {
  data: AttendanceTrendPoint[];
  loading: boolean;
}

export const AttendanceTrendSection: React.FC<AttendanceTrendSectionProps> = ({ data, loading }) => {
  const [activeSeries, setActiveSeries] = useState<string>("all");

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6 animate-pulse h-80">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-56 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100/80 rounded-2xl text-emerald-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">📅 Diễn Biến Chuyên Cần Theo Tuần</h2>
            <p className="text-xs text-slate-500 font-medium">Tỷ lệ tham gia qua các buổi sinh hoạt trong Quý</p>
          </div>
        </div>

        {/* Series Filter Selector with 3 Ngành colors */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { key: "all", label: "Toàn Đoàn" },
            { key: "Ngành Đồng", label: "🟡 Ngành Đồng" },
            { key: "Ngành Thiếu", label: "🔵 Ngành Thiếu" },
            { key: "Ngành Thanh", label: "🔴 Ngành Thanh" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSeries(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSeries === s.key
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm font-medium">
          Chưa có dữ liệu sinh hoạt trong khoảng thời gian này.
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  color: "#0f172a",
                  fontWeight: "bold",
                }}
                formatter={(value: any) => [`${value}%`, "Tỷ lệ chuyên cần"]}
              />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", fontWeight: "600" }} />

              {(activeSeries === "all" || activeSeries === "all_series") && (
                <Line
                  type="monotone"
                  dataKey="all"
                  name="Toàn Xứ đoàn"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563eb" }}
                  activeDot={{ r: 6 }}
                />
              )}

              {(activeSeries === "all" || activeSeries === "Ngành Đồng") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Đồng"
                  name="🟡 Ngành Đồng"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#d97706" }}
                />
              )}

              {(activeSeries === "all" || activeSeries === "Ngành Thiếu") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Thiếu"
                  name="🔵 Ngành Thiếu"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#0284c7" }}
                />
              )}

              {(activeSeries === "all" || activeSeries === "Ngành Thanh") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Thanh"
                  name="🔴 Ngành Thanh"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#e11d48" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
