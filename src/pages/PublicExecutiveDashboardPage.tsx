import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { KpiOverviewSection } from "@/components/executive-dashboard/KpiOverviewSection";
import { BranchPerformanceSection } from "@/components/executive-dashboard/BranchPerformanceSection";
import { TopMembersSection } from "@/components/executive-dashboard/TopMembersSection";
import { AttendanceTrendSection } from "@/components/executive-dashboard/AttendanceTrendSection";
import { ActivityParticipationSection } from "@/components/executive-dashboard/ActivityParticipationSection";
import { RiskCenterSection } from "@/components/executive-dashboard/RiskCenterSection";
import { Top3PodiumSection } from "@/components/executive-dashboard/Top3PodiumSection";

import dashboardApi from "@/api/dashboardApi";
import {
  ExecutiveOverview,
  BranchPerformance,
  ExecutiveTopMember,
  AttendanceTrendPoint,
  ExecutiveActivity,
  ExecutiveRiskMember,
} from "@/types/executiveDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Share2,
  RefreshCw,
  Globe,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

export default function PublicExecutiveDashboardPage() {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

  const [year, setYear] = useState<number>(currentYear);
  const [quarter, setQuarter] = useState<number>(currentQuarter);
  const [branch, setBranch] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"overall" | "score" | "attendance" | "activity">("overall");

  const [overview, setOverview] = useState<ExecutiveOverview | null>(null);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [topMembers, setTopMembers] = useState<ExecutiveTopMember[]>([]);
  const [trend, setTrend] = useState<AttendanceTrendPoint[]>([]);
  const [activities, setActivities] = useState<ExecutiveActivity[]>([]);
  const [riskMembers, setRiskMembers] = useState<ExecutiveRiskMember[]>([]);

  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
  const [loadingTopMembers, setLoadingTopMembers] = useState<boolean>(true);
  const [loadingTrend, setLoadingTrend] = useState<boolean>(true);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [loadingRisks, setLoadingRisks] = useState<boolean>(true);

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const extractObject = (res: any) => {
    if (!res) return null;
    if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
    return res;
  };

  // Fetch Public Overview
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const res: any = await dashboardApi.getPublicExecutiveOverview({ year, quarter, branch });
      setOverview(extractObject(res));
    } catch (err) {
      console.error("Failed to fetch public executive overview:", err);
    } finally {
      setLoadingOverview(false);
    }
  }, [year, quarter, branch]);

  // Fetch Public Branch Performance
  const fetchBranches = useCallback(async () => {
    try {
      setLoadingBranches(true);
      const res: any = await dashboardApi.getPublicExecutiveBranches({ year, quarter });
      setBranches(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch public executive branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  }, [year, quarter]);

  // Fetch Public Top Members
  const fetchTopMembers = useCallback(async () => {
    try {
      setLoadingTopMembers(true);
      const res: any = await dashboardApi.getPublicExecutiveTopMembers({ year, quarter, branch, sortBy, limit: 100 });
      setTopMembers(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch public executive top members:", err);
    } finally {
      setLoadingTopMembers(false);
    }
  }, [year, quarter, branch, sortBy]);

  // Fetch Public Attendance Trend
  const fetchTrend = useCallback(async () => {
    try {
      setLoadingTrend(true);
      const res: any = await dashboardApi.getPublicExecutiveAttendanceTrend({ year, quarter, branch });
      setTrend(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch public executive trend:", err);
    } finally {
      setLoadingTrend(false);
    }
  }, [year, quarter, branch]);

  // Fetch Public Activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const res: any = await dashboardApi.getPublicExecutiveActivities({ year, quarter, branch });
      setActivities(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch public executive activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [year, quarter, branch]);

  // Fetch Public Risks
  const fetchRisks = useCallback(async () => {
    try {
      setLoadingRisks(true);
      const res: any = await dashboardApi.getPublicExecutiveRisks({ year, quarter, branch });
      setRiskMembers(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch public executive risks:", err);
    } finally {
      setLoadingRisks(false);
    }
  }, [year, quarter, branch]);

  const refreshAllData = () => {
    fetchOverview();
    fetchBranches();
    fetchTopMembers();
    fetchTrend();
    fetchActivities();
    fetchRisks();
  };

  useEffect(() => {
    refreshAllData();
  }, [fetchOverview, fetchBranches, fetchTopMembers, fetchTrend, fetchActivities, fetchRisks]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết chia sẻ Báo cáo Gia Đình Hưng Đạo!");
  };

const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* ────────────────── Public Header Bar ────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md shadow-blue-200">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Gia Đình Hưng Đạo Trung Nam
                </h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  <Globe className="w-3 h-3 mr-1 inline" /> Công khai
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Báo cáo Chỉ số & Bảng Vàng Xuất Sắc Gia Đình Hưng Đạo
              </p>
            </div>
          </div>

          {/* Filter Bar & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
                <SelectTrigger className="w-24 border-0 bg-transparent text-xs font-bold h-7 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">
                      Năm {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Select value={String(quarter)} onValueChange={(val) => setQuarter(Number(val))}>
                <SelectTrigger className="w-24 border-0 bg-transparent text-xs font-bold h-7 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[1, 2, 3, 4].map((q) => (
                    <SelectItem key={q} value={String(q)} className="text-xs">
                      Quý {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <Select value={branch} onValueChange={(val) => setBranch(val)}>
                <SelectTrigger className="w-32 border-0 bg-transparent text-xs font-bold h-7 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-bold">Tất cả Ngành</SelectItem>
                  <SelectItem value="Đồng" className="text-xs">🟡 Ngành Đồng</SelectItem>
                  <SelectItem value="Thiếu" className="text-xs">🔵 Ngành Thiếu</SelectItem>
                  <SelectItem value="Thanh" className="text-xs">🔴 Ngành Thanh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAllData}
              className="rounded-xl h-9 text-xs border-slate-200 hover:bg-slate-100"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>

            {/* Share Button */}
            <Button
              size="sm"
              onClick={handleShareLink}
              className="rounded-xl h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ────────────────── Main Dashboard Content ────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top 3 Honor Roll Podium */}
        <Top3PodiumSection
          topMembers={topMembers}
          loading={loadingTopMembers}
          quarter={quarter}
          year={year}
          branch={branch}
        />

        {/* Executive KPI Stats Cards */}
        <KpiOverviewSection data={overview} loading={loadingOverview} />

        {/* Branch Performance Grid */}
        <BranchPerformanceSection branches={branches} loading={loadingBranches} />

        {/* Bảng Vàng Đoàn Sinh Xuất Sắc */}
        <TopMembersSection
          members={topMembers}
          loading={loadingTopMembers}
          onSortChange={setSortBy}
          currentSort={sortBy}
        />

        {/* Attendance Trend Line Chart */}
        <AttendanceTrendSection data={trend} loading={loadingTrend} />

        {/* Activity Rates & Risk Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityParticipationSection activities={activities} loading={loadingActivities} />
          <RiskCenterSection riskMembers={riskMembers} loading={loadingRisks} />
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-400">
        <p>© {currentYear} Trung Nam Hub. Báo cáo Tổng quan Gia Đình Hưng Đạo được cập nhật tự động.</p>
      </footer>
    </div>
  );
}
