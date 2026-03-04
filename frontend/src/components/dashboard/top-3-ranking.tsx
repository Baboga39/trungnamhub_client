"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Medal, Crown, Star } from "lucide-react";
import { fetchTop3Ranking } from "@/features/dashboard/dashboardThunks";

interface ApiItem {
  memberId: number;
  totalScore: number;
  member: {
    id: number;
    name: string;
    parish?: string;
  };
}

const medalIcons = [
  {
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-100 to-yellow-100",
  },
  {
    icon: Crown,
    color: "text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
  },
  {
    icon: Medal,
    color: "text-orange-500",
    bgColor: "bg-gradient-to-br from-orange-100 to-red-100",
  },
];

const rankPositions = [
  "h-32 md:h-40 order-2 md:order-1",
  "h-40 md:h-52 order-1 md:order-2",
  "h-32 md:h-40 order-3 md:order-3",
];

const gradients = [
  "bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600",
  "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700",
  "bg-gradient-to-br from-orange-400 via-orange-500 to-red-600",
];

export function Top3Ranking() {
  const dispatch = useDispatch();
  const { top3Ranking, loading } = useSelector((state: any) => state.dashboard);

  useEffect(() => {
    dispatch(fetchTop3Ranking() as any);
  }, [dispatch]);

  if (loading || !top3Ranking || top3Ranking.length < 3) {
    return (
      <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl animate-pulse" />
    );
  }

  // API sort: [rank1, rank2, rank3]
  const performers = [
    { ...top3Ranking[1], rank: 2 },
    { ...top3Ranking[0], rank: 1 },
    { ...top3Ranking[2], rank: 3 },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 shadow-lg overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Top 3 Xuất Sắc
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Các đoàn sinh có điểm cao nhất
            </p>
          </div>
          <Star className="w-6 h-6 text-amber-400" />
        </div>

        <div className="flex items-flex-end justify-center gap-3 md:gap-6 h-80 px-2">
          {performers.map((item, index) => {
            const IconComponent = medalIcons[index].icon;
            const isTop = index === 1;

            return (
              <div
                key={item.memberId}
                className={`flex flex-col items-center flex-1 ${rankPositions[index]} transition-transform hover:scale-105`}
              >
                <div
                  className={`${medalIcons[index].bgColor} rounded-full p-6 mb-4 shadow-xl ${isTop ? "ring-4 ring-amber-200" : ""}`}
                >
                  <IconComponent
                    className={`${medalIcons[index].color} w-8 h-8`}
                  />
                </div>

                <div
                  className={`${gradients[index]} w-full rounded-3xl p-6 flex flex-col items-center justify-between flex-1 shadow-2xl relative`}
                >
                  <div className="absolute -top-3 -right-3 bg-white text-slate-800 text-sm font-black rounded-full w-12 h-12 flex items-center justify-center shadow-xl">
                    #{item.rank}
                  </div>

                  <div className="text-center flex-1 flex flex-col justify-center mt-3">
                    <p className="text-white font-bold text-lg truncate">
                      {item.member.name}
                    </p>
                    {item.member.parish && (
                      <p className="text-white/90 text-xs">
                        {item.member.parish}
                      </p>
                    )}
                  </div>

                  <div className="text-center mt-auto">
                    <p className="text-white text-5xl font-black">
                      {item.totalScore}
                    </p>
                    <p className="text-white/90 text-xs font-bold mt-1">ĐIỂM</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
