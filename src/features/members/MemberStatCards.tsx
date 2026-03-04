import { useSelector } from "react-redux";
import { Users, UserCheck, Trophy, TrendingUp } from "lucide-react";
import { StatCard } from "../../components/layouts/StatsCards";

import {
  selectTotalMembers,
  selectActiveMembers,
  selectTotalMembersThisYear,
  selectMaxParish,
} from "./memberSelectors";

export function MemberStatCards() {
  const totalMembers = useSelector(selectTotalMembers);
  const activeMembers = useSelector(selectActiveMembers);
  const totalThisYear = useSelector(selectTotalMembersThisYear);
  const maxParish = useSelector(selectMaxParish);

  const stats = [
    {
      title: "Tổng đoàn sinh",
      value: totalMembers,
      subtitle: "Toàn hệ thống",
      change: "",
      changeType: "increase",
      icon: Users,
      color: "from-[#60A5FA] to-[#3B82F6]",
      bgColor: "from-blue-50 to-blue-100/50",
    },
    {
      title: "Đang sinh hoạt",
      value: activeMembers,
      subtitle: "Tham gia đều đặn",
      change: "",
      changeType: "increase",
      icon: UserCheck,
      color: "from-[#10B981] to-[#059669]",
      bgColor: "from-emerald-50 to-emerald-100/50",
    },
    {
      title: "Tham gia năm nay",
      value: totalThisYear,
      subtitle: "Thêm mới trong năm",
      change: "",
      changeType: "increase",
      icon: Trophy,
      color: "from-[#F59E0B] to-[#D97706]",
      bgColor: "from-amber-50 to-amber-100/50",
    },
    {
      title: "Xã Đạo đông nhất",
      value: maxParish?.parish || "Không rõ",
      subtitle: `${maxParish?.count || 0} đoàn sinh`,
      change: "",
      changeType: "increase",
      icon: TrendingUp,
      color: "from-[#8B5CF6] to-[#7C3AED]",
      bgColor: "from-violet-50 to-violet-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
}
