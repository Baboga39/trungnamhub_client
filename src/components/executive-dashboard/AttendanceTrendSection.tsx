import React, { useState } from "react";
import { Calendar, Layers } from "lucide-react";
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-pulse h-80">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-56 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">📅 Diễn biến Chuyên cần theo Buổi sinh hoạt</h2>
            <p className="text-xs text-slate-500">Biểu đồ tỷ lệ tham gia qua các tuần sinh hoạt trong Quý</p>
          </div>
        </div>

        {/* Series Filter Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { key: "all", label: "Toàn Đoàn" },
            { key: "Ngành Thanh", label: "Ngành Thanh" },
            { key: "Ngành Thiếu", label: "Ngành Thiếu" },
            { key: "Ngành Đồng", label: "Ngành Đồng" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSeries(s.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeSeries === s.key
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Chưa có dữ liệu sinh hoạt trong khoảng thời gian này.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }}
                formatter={(value: any) => [`${value}%`, "Tỷ lệ chuyên cần"]}
              />
              <Legend />

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

              {(activeSeries === "all" || activeSeries === "Ngành Thanh") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Thanh"
                  name="Ngành Thanh"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}

              {(activeSeries === "all" || activeSeries === "Ngành Thiếu") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Thiếu"
                  name="Ngành Thiếu"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}

              {(activeSeries === "all" || activeSeries === "Ngành Đồng") && (
                <Line
                  type="monotone"
                  dataKey="Ngành Đồng"
                  name="Ngành Đồng"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
