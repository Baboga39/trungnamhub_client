import React from "react";
import { Crown, Medal, Star, Trophy, Sparkles, Award } from "lucide-react";
import { ExecutiveTopMember } from "@/types/executiveDashboard";

interface Top3PodiumSectionProps {
  topMembers: ExecutiveTopMember[];
  loading: boolean;
  quarter: number;
  year: number;
  branch: string;
}

// 3 Ngành theo màu vàng, xanh, đỏ: Đồng (Vàng) -> Thiếu (Xanh) -> Thanh (Đỏ)
const getBranchBadgeStyle = (branchName: string) => {
  if (branchName.includes("Đồng")) {
    return {
      bg: "bg-amber-100/90 text-amber-900 border-amber-300",
      dot: "bg-amber-500",
      label: "🟡 Ngành Đồng",
    };
  }
  if (branchName.includes("Thiếu")) {
    return {
      bg: "bg-blue-100/90 text-blue-900 border-blue-300",
      dot: "bg-blue-600",
      label: "🔵 Ngành Thiếu",
    };
  }
  if (branchName.includes("Thanh")) {
    return {
      bg: "bg-rose-100/90 text-rose-900 border-rose-300",
      dot: "bg-rose-600",
      label: "🔴 Ngành Thanh",
    };
  }
  return {
    bg: "bg-slate-100 text-slate-800 border-slate-300",
    dot: "bg-slate-500",
    label: branchName,
  };
};

export const Top3PodiumSection: React.FC<Top3PodiumSectionProps> = ({
  topMembers,
  loading,
  quarter,
  year,
  branch,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-6 animate-pulse">
        <div className="h-7 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  let podiumMembers: ExecutiveTopMember[] = [];

  if (branch === "all") {
    // Pick #1 representative from EACH branch in order: Ngành Đồng (Vàng), Ngành Thiếu (Xanh), Ngành Thanh (Đỏ)
    const targetBranches = ["Ngành Đồng", "Ngành Thiếu", "Ngành Thanh"];
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

    // Sort representatives by overallScore descending to assign podium positions Rank 1, 2, 3
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
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-6 text-center py-12">
        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Chưa có dữ liệu Top 3 cho Quý {quarter}/{year}</h3>
        <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại điểm số và lượt tham gia của đoàn sinh</p>
      </div>
    );
  }

  // Podium order: [Rank 2 (Silver - Left), Rank 1 (Gold - Center), Rank 3 (Bronze - Right)]
  const podiumOrder = [
    podiumMembers[1] || null, // Rank 2
    podiumMembers[0] || null, // Rank 1
    podiumMembers[2] || null, // Rank 3
  ];

  const config = [
    {
      rank: 2,
      medalIcon: Medal,
      title: "Hạng 2 • Á Quân",
      badgeColor: "bg-slate-200 text-slate-900 font-extrabold border border-slate-300",
      gradient: "bg-gradient-to-t from-slate-200 via-slate-100 to-white border-slate-300 shadow-slate-200/50",
      heightClass: "h-48 sm:h-56",
      avatarRing: "ring-slate-300 ring-4 bg-slate-50 text-slate-600",
      headerBg: "bg-slate-100 text-slate-800",
      iconColor: "text-slate-500",
      scoreColor: "text-slate-800",
    },
    {
      rank: 1,
      medalIcon: Crown,
      title: "Hạng 1 • Quán Quân",
      badgeColor: "bg-amber-400 text-amber-950 font-black border border-amber-500 shadow-md",
      gradient: "bg-gradient-to-t from-amber-200/90 via-amber-100/70 to-amber-50/50 border-amber-300 shadow-amber-200/60",
      heightClass: "h-60 sm:h-72",
      avatarRing: "ring-amber-400 ring-4 bg-amber-50 text-amber-600 shadow-lg shadow-amber-500/20",
      headerBg: "bg-amber-400 text-amber-950 font-black",
      iconColor: "text-amber-500",
      scoreColor: "text-amber-900",
    },
    {
      rank: 3,
      medalIcon: Star,
      title: "Hạng 3",
      badgeColor: "bg-amber-800 text-amber-100 font-extrabold border border-amber-900",
      gradient: "bg-gradient-to-t from-amber-100/80 via-orange-50/60 to-white border-amber-200 shadow-amber-100/50",
      heightClass: "h-40 sm:h-48",
      avatarRing: "ring-amber-700/60 ring-4 bg-amber-50 text-amber-700",
      headerBg: "bg-amber-800/90 text-amber-100",
      iconColor: "text-amber-700",
      scoreColor: "text-amber-950",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50/50 via-slate-50/80 to-white p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-md mb-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Vinh Danh Đại Diện Xuất Sắc các Ngành • Quý {quarter}/{year}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              🏆 Top 3 Xuất Sắc Dẫn Đầu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Ghi nhận gương mặt tiêu biểu từ các Ngành 🟡 Ngành Đồng • 🔵 Ngành Thiếu • 🔴 Ngành Thanh
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">Đại Diện Ngành</span>
          </div>
        </div>

        {/* Podium Stand Display */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 pb-2">
          {podiumOrder.map((member, idx) => {
            const cfg = config[idx];
            if (!member) return null;

            const Icon = cfg.medalIcon;
            const branchStyle = getBranchBadgeStyle(member.branch);

            return (
              <div
                key={member.id}
                className="flex flex-col items-center flex-1 max-w-[210px] transition-all duration-300 hover:-translate-y-2 group"
              >
                {/* Avatar & Rank Badge */}
                <div className="relative mb-3 flex flex-col items-center">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${cfg.avatarRing}`}
                  >
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${cfg.iconColor}`} />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full mt-1.5 shadow-md ${cfg.badgeColor}`}
                  >
                    #{member.rank}
                  </span>
                </div>

                {/* Member Name & Branch */}
                <div className="text-center mb-2.5 px-1 w-full">
                  <h3 className="font-black text-xs sm:text-base text-slate-900 truncate tracking-tight">
                    {member.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${branchStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${branchStyle.dot}`}></span>
                      {branchStyle.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1 font-medium">
                    {member.parish || "Xứ đoàn Trung Nam"}
                  </div>
                </div>

                {/* Podium Block */}
                <div
                  className={`w-full ${cfg.heightClass} ${cfg.gradient} rounded-t-3xl p-4 border-t border-l border-r flex flex-col items-center justify-between shadow-xl relative overflow-hidden`}
                >
                  <div className="text-center mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Điểm Tích Lũy
                    </span>
                    <span className={`text-2xl sm:text-4xl font-black ${cfg.scoreColor} drop-shadow-xs`}>
                      {member.overallScore}
                    </span>
                  </div>

                  {/* Sub-metrics */}
                  <div className="w-full text-center text-[10px] sm:text-xs text-slate-700 space-y-1 pt-2.5 border-t border-slate-300/60">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500">Chuyên cần:</span>
                      <span className="text-emerald-700 font-bold">{member.attendanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500">Thi đua:</span>
                      <span className="text-indigo-700 font-bold">{member.score}</span>
                    </div>
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
