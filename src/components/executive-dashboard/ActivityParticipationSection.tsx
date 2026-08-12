import React from "react";
import { Flame, CheckCircle, Calendar } from "lucide-react";
import { ExecutiveActivity } from "@/types/executiveDashboard";

interface ActivityParticipationSectionProps {
  activities: ExecutiveActivity[];
  loading: boolean;
}

export const ActivityParticipationSection: React.FC<ActivityParticipationSectionProps> = ({
  activities,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">🏕️ Mức độ Tham gia Phong trào & Ngoại khóa</h2>
          <p className="text-xs text-slate-500">Tỷ lệ đoàn sinh tham gia các chuỗi hoạt động ngoại khóa trong Quý</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Chưa có hoạt động ngoại khóa nào được tổ chức trong khoảng thời gian này.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const dateStr = act.date ? new Date(act.date).toLocaleDateString("vi-VN") : "";
            return (
              <div key={act.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-extrabold text-slate-900 text-sm">{act.name}</span>
                    {dateStr && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-600">
                      {act.joinedCount} / {act.totalMembers} em ({act.participationRate}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${act.participationRate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
