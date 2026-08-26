"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Medal, Crown, Star, TrendingUp } from "lucide-react";
import { fetchTop3Ranking } from "@/features/dashboard/dashboardThunks";
import { Badge } from "@/components/ui/badge";

interface ApiItem {
  memberId: number;
  totalScore: number;
  rank?: string;
  quarter?: number;
  year?: number;
  member: {
    id: number;
    name: string;
    parish?: string;
  };
}

const podiumConfigs = {
  1: {
    rankNum: 1,
    height: "h-48 sm:h-64 md:h-72",
    icon: Crown,
    iconColor: "text-amber-500",
    iconBg: "bg-white ring-4 ring-amber-300/80 shadow-xl",
    gradient: "bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600",
  },
  2: {
    rankNum: 2,
    height: "h-40 sm:h-56 md:h-64",
    icon: Medal,
    iconColor: "text-blue-600",
    iconBg: "bg-white ring-4 ring-blue-200/90 shadow-lg",
    gradient: "bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700",
  },
  3: {
    rankNum: 3,
    height: "h-34 sm:h-48 md:h-56",
    icon: Medal,
    iconColor: "text-orange-500",
    iconBg: "bg-white ring-4 ring-orange-200/90 shadow-lg",
    gradient: "bg-gradient-to-b from-orange-400 via-orange-500 to-rose-600",
  },
};

export function Top3Ranking() {
  const dispatch = useDispatch();
  const { top3Ranking, loading } = useSelector(
    (state: any) => state.dashboard
  );

  const now = new Date();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const currentYear = now.getFullYear();

  const quarter = top3Ranking?.[0]?.quarter || currentQuarter;
  const year = top3Ranking?.[0]?.year || currentYear;

  useEffect(() => {
    dispatch(fetchTop3Ranking({}) as any);
  }, [dispatch]);

  const renderHeader = () => (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Top 3 Xuất Sắc
          </h3>

          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Quý {quarter}/{year}
          </Badge>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Đoàn sinh có điểm thi đua cao nhất trong quý
        </p>
      </div>

      <div className="shrink-0 p-2.5 sm:p-3 bg-amber-100/90 rounded-xl sm:rounded-2xl">
        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-400" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-5 sm:p-6 shadow-lg border border-slate-100">
        {renderHeader()}

        <div className="h-72 sm:h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!top3Ranking || top3Ranking.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-5 sm:p-6 shadow-lg border border-slate-100">
        {renderHeader()}

        <div className="flex flex-col items-center justify-center py-12 sm:py-14">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-50" />

            <div className="relative bg-white rounded-full p-5 shadow-lg">
              <TrendingUp className="w-9 h-9 text-slate-300" />
            </div>
          </div>

          <div className="text-center px-4">
            <h4 className="text-base font-bold text-slate-700 mb-1">
              Chưa có dữ liệu Quý {quarter}
            </h4>

            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Điểm thi đua sẽ hiển thị khi đoàn sinh trong ngành được chấm
              điểm trong Quý {quarter}/{year}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Normalize ranking
   *
   * API:
   * [rank 1, rank 2, rank 3]
   *
   * UI:
   * [rank 2, rank 1, rank 3]
   */
  const ranking = [...top3Ranking]
    .sort((a, b) => {
      const rankA = Number(a.rank) || 999;
      const rankB = Number(b.rank) || 999;

      return rankA - rankB;
    })
    .slice(0, 3);

  const performers = ranking.map((item: ApiItem, index: number) => {
    const rank = Number(item.rank) || index + 1;

    return {
      ...item,
      rank,
      config:
        podiumConfigs[rank as keyof typeof podiumConfigs] ||
        podiumConfigs[3],
    };
  });

  const orderedPerformers = [
    performers.find((item) => item.rank === 2),
    performers.find((item) => item.rank === 1),
    performers.find((item) => item.rank === 3),
  ].filter(Boolean) as typeof performers;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-50/90 via-purple-50/60 to-pink-50/80 p-4 sm:p-6 shadow-lg border border-indigo-100/60 overflow-hidden w-full max-w-full min-w-0">
      {renderHeader()}

      {/* Podium */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-4 md:gap-6 max-w-2xl mx-auto pt-7 sm:pt-10 pb-1 w-full min-w-0">
        {orderedPerformers.map((item) => {
          const config = item.config;
          const IconComponent = config.icon;

          return (
            <div
              key={item.memberId}
              className="
                group
                flex
                flex-col
                items-center
                flex-1
                max-w-[130px]
                min-w-0
                transition-transform
                duration-200
                hover:-translate-y-1
              "
            >
              {/* Medal */}
              <div
                className={`
                  relative
                  z-20
                  w-10 h-10
                  sm:w-14 sm:h-14
                  rounded-xl sm:rounded-2xl
                  flex items-center justify-center
                  ${config.iconBg}
                  ${item.rank === 1 ? "scale-105 sm:scale-110" : ""}
                  mb-[-18px] sm:mb-[-24px]
                `}
              >
                <IconComponent
                  className={`
                    w-5 h-5
                    sm:w-7 sm:h-7
                    ${config.iconColor}
                  `}
                />

                {/* Rank */}
                <span
                  className="
                    absolute
                    -top-1.5
                    -right-1.5
                    w-4 h-4
                    sm:w-6 sm:h-6
                    rounded-full
                    bg-white
                    border border-slate-200
                    shadow-md
                    text-[8px] sm:text-[10px]
                    font-black
                    text-slate-700
                    flex items-center justify-center
                  "
                >
                  {item.rank}
                </span>
              </div>

              {/* Pillar */}
              <div
                className={`
                  relative
                  w-full
                  min-w-0
                  ${config.height}
                  ${config.gradient}
                  rounded-2xl sm:rounded-3xl
                  px-1.5 sm:px-4
                  pt-7 sm:pt-10
                  pb-3 sm:pb-5
                  flex
                  flex-col
                  items-center
                  justify-between
                  text-white
                  shadow-lg
                  overflow-hidden
                `}
              >
                {/* Shine */}
                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-20
                    bg-gradient-to-b
                    from-white/15
                    to-transparent
                    pointer-events-none
                  "
                />

                {/* Member */}
                <div className="relative z-10 w-full text-center min-w-0 px-0.5">
                  <p
                    className="
                      font-bold
                      text-[11px] sm:text-sm md:text-base
                      leading-tight
                      truncate
                    "
                    title={item.member?.name}
                  >
                    {item.member?.name}
                  </p>

                  {item.member?.parish && (
                    <p
                      className="
                        text-white/75
                        text-[9px] sm:text-xs
                        font-medium
                        mt-0.5 sm:mt-1
                        truncate
                      "
                      title={item.member.parish}
                    >
                      {item.member.parish}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="relative z-10 text-center">
                  <p
                    className="
                      text-xl
                      sm:text-3xl
                      md:text-4xl
                      font-black
                      tracking-tight
                      leading-none
                    "
                  >
                    {item.totalScore}
                  </p>

                  <p
                    className="
                      text-white/70
                      text-[8px]
                      sm:text-[10px]
                      font-bold
                      tracking-[0.18em]
                      mt-0.5 sm:mt-1
                    "
                  >
                    ĐIỂM
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}