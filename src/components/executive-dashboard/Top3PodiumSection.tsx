import React from "react";
import { Crown, Medal, Star, Trophy, Sparkles } from "lucide-react";
import { ExecutiveTopMember } from "@/types/executiveDashboard";

interface Top3PodiumSectionProps {
  topMembers: ExecutiveTopMember[];
  loading: boolean;
  quarter: number;
  year: number;
  branch: string;
}

export const Top3PodiumSection: React.FC<Top3PodiumSectionProps> = ({
  topMembers,
  loading,
  quarter,
  year,
  branch,
}) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl mb-6 border border-indigo-500/20 animate-pulse">
        <div className="h-7 bg-indigo-700/50 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-indigo-950/60 rounded-2xl"></div>
      </div>
    );
  }

  let podiumMembers: ExecutiveTopMember[] = [];

  if (branch === "all") {
    // Pick the #1 Top Member from EACH branch (Ngành Thanh, Ngành Thiếu, Ngành Đồng)
    const targetBranches = ["Ngành Thanh", "Ngành Thiếu", "Ngành Đồng"];
    const pickedIds = new Set<number>();

    for (const b of targetBranches) {
      const bestInBranch = topMembers.find(
        (m) =>
          !pickedIds.has(m.id) &&
          (m.branch === b || m.branch.includes(b.replace("Ngành ", "")))
      );
      if (bestInBranch) {
        podiumMembers.push(bestInBranch);
        pickedIds.add(bestInBranch.id);
      }
    }

    // Fill remaining spots if less than 3
    for (const m of topMembers) {
      if (podiumMembers.length >= 3) break;
      if (!pickedIds.has(m.id)) {
        podiumMembers.push(m);
        pickedIds.add(m.id);
      }
    }

    // Sort the 3 branch representatives by overallScore descending to assign podium positions #1, #2, #3
    podiumMembers.sort((a, b) => b.overallScore - a.overallScore);
    podiumMembers = podiumMembers.map((m, idx) => ({
      ...m,
      rank: idx + 1,
    }));
  } else {
    // Specific branch selected: top 3 within that branch
    podiumMembers = topMembers.slice(0, 3).map((m, idx) => ({
      ...m,
      rank: idx + 1,
    }));
  }

  if (podiumMembers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl mb-6 border border-indigo-500/20 text-center py-12">
        <Trophy className="w-12 h-12 text-indigo-400/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Chưa có dữ liệu Top 3 cho Quý {quarter}/{year}</h3>
        <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại điểm số và lượt tham gia của đoàn sinh</p>
      </div>
    );
  }

  // Podium order: [Rank 2 (Silver), Rank 1 (Gold), Rank 3 (Bronze)]
  const podiumOrder = [
    podiumMembers[1] || null, // Rank 2
    podiumMembers[0] || null, // Rank 1
    podiumMembers[2] || null, // Rank 3
  ];

  const config = [
    {
      rank: 2,
      medalEmoji: "🥈",
      title: "Hạng 2",
      badgeColor: "bg-slate-200 text-slate-800 font-extrabold",
      gradient: "bg-gradient-to-t from-slate-700 via-slate-600 to-slate-500 border-slate-400",
      heightClass: "h-48 sm:h-56",
      ringColor: "ring-slate-300",
      iconColor: "text-slate-200",
    },
    {
      rank: 1,
      medalEmoji: "👑",
      title: "Hạng 1 - Quán Quân",
      badgeColor: "bg-amber-400 text-slate-900 font-black",
      gradient: "bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 border-amber-300 shadow-amber-500/30",
      heightClass: "h-60 sm:h-72",
      ringColor: "ring-amber-300 ring-4",
      iconColor: "text-amber-300",
    },
    {
      rank: 3,
      medalEmoji: "🥉",
      title: "Hạng 3",
      badgeColor: "bg-amber-800 text-amber-100 font-extrabold",
      gradient: "bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 border-amber-600",
      heightClass: "h-40 sm:h-48",
      ringColor: "ring-amber-700",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl mb-6 border border-indigo-500/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Vinh Danh Đại Diện Xuất Sắc Mỗi Ngành • Quý {quarter}/{year}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-200 via-white to-purple-200 bg-clip-text text-transparent">
              🏆 Top 3 Xuất Sắc Đại Diện Các Ngành
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Ghi nhận gương mặt xuất sắc nhất dẫn đầu từ mỗi Ngành (Thanh, Thiếu, Đồng) trong Quý
            </p>
          </div>
          <Star className="w-8 h-8 text-amber-400 animate-spin-slow" />
        </div>

        {/* Podium Stand Display */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
          {podiumOrder.map((member, idx) => {
            const cfg = config[idx];
            if (!member) return null;

            return (
              <div
                key={member.id}
                className={`flex flex-col items-center flex-1 max-w-[200px] transition-all duration-300 hover:-translate-y-1.5`}
              >
                {/* Avatar / Medal Header */}
                <div className="relative mb-3 flex flex-col items-center">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center shadow-lg ${cfg.ringColor}`}
                  >
                    <span className="text-2xl sm:text-3xl">{cfg.medalEmoji}</span>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full mt-1.5 shadow-md ${cfg.badgeColor}`}
                  >
                    #{member.rank}
                  </span>
                </div>

                {/* Member Name & Info */}
                <div className="text-center mb-2 px-1 w-full">
                  <h3 className="font-extrabold text-xs sm:text-base text-white truncate drop-shadow">
                    {member.name}
                  </h3>
                  <div className="text-[11px] font-extrabold text-amber-300 truncate">
                    {member.branch}
                  </div>
                  <div className="text-[10px] text-indigo-200/70 truncate">
                    {member.parish || "Xứ đoàn"}
                  </div>
                </div>

                {/* Podium Block */}
                <div
                  className={`w-full ${cfg.heightClass} ${cfg.gradient} rounded-t-2xl p-4 border-t border-l border-r flex flex-col items-center justify-between shadow-2xl relative overflow-hidden`}
                >
                  <div className="text-center mt-2">
                    <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider block">
                      Điểm Tích Lũy
                    </span>
                    <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                      {member.overallScore}
                    </span>
                  </div>

                  {/* Sub-metrics */}
                  <div className="w-full text-center text-[10px] sm:text-xs text-white/90 space-y-0.5 pt-2 border-t border-white/20">
                    <div>Chuyên cần: <b>{member.attendanceRate}%</b></div>
                    <div>Thi đua: <b>{member.score}</b></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
