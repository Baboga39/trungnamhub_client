import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { AdminLayout } from "../components/layouts/admin-layout";
import { ExecutiveHeader } from "@/components/executive-dashboard/ExecutiveHeader";
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

export default function ExecutiveDashboardPage() {
  const user = useSelector((state: any) => state.auth.user);

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

  const extractData = (res: any) => {
    if (!res) return null;
    if (res.data !== undefined) {
      if (res.data?.data !== undefined) return res.data.data;
      return res.data;
    }
    return res;
  };

  const extractArray = (res: any) => {
    const val = extractData(res);
    if (Array.isArray(val)) return val;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  // Fetch Overview
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const res: any = await dashboardApi.getExecutiveOverview({ year, quarter, branch });
      const data = extractData(res);
      setOverview(data);
    } catch (err) {
      console.error("Failed to fetch executive overview:", err);
    } finally {
      setLoadingOverview(false);
    }
  }, [year, quarter, branch]);

  // Fetch Branch Performance
  const fetchBranches = useCallback(async () => {
    try {
      setLoadingBranches(true);
      const res: any = await dashboardApi.getExecutiveBranches({ year, quarter });
      const list = extractArray(res);
      setBranches(list);
    } catch (err) {
      console.error("Failed to fetch executive branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  }, [year, quarter]);

  // Fetch Top Members
  const fetchTopMembers = useCallback(async () => {
    try {
      setLoadingTopMembers(true);
      const res: any = await dashboardApi.getExecutiveTopMembers({ year, quarter, branch, sortBy, limit: 100 });
      const list = extractArray(res);
      setTopMembers(list);
    } catch (err) {
      console.error("Failed to fetch executive top members:", err);
    } finally {
      setLoadingTopMembers(false);
    }
  }, [year, quarter, branch, sortBy]);

  // Fetch Attendance Trend
  const fetchTrend = useCallback(async () => {
    try {
      setLoadingTrend(true);
      const res: any = await dashboardApi.getExecutiveAttendanceTrend({ year, quarter, branch });
      const list = extractArray(res);
      setTrend(list);
    } catch (err) {
      console.error("Failed to fetch executive trend:", err);
    } finally {
      setLoadingTrend(false);
    }
  }, [year, quarter, branch]);

  // Fetch Activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      const res: any = await dashboardApi.getExecutiveActivities({ year, quarter, branch });
      const list = extractArray(res);
      setActivities(list);
    } catch (err) {
      console.error("Failed to fetch executive activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [year, quarter, branch]);

  // Fetch Risks
  const fetchRisks = useCallback(async () => {
    try {
      setLoadingRisks(true);
      const res: any = await dashboardApi.getExecutiveRisks({ year, quarter, branch });
      const list = extractArray(res);
      setRiskMembers(list);
    } catch (err) {
      console.error("Failed to fetch executive risks:", err);
    } finally {
      setLoadingRisks(false);
    }
  }, [year, quarter, branch]);

  useEffect(() => {
    fetchOverview();
    fetchBranches();
    fetchTopMembers();
    fetchTrend();
    fetchActivities();
    fetchRisks();
  }, [fetchOverview, fetchBranches, fetchTopMembers, fetchTrend, fetchActivities, fetchRisks]);

  return (
    <AdminLayout>
      <div className="min-h-screen pb-12">
        {/* Executive Header with Global Filters */}
        <ExecutiveHeader
          year={year}
          quarter={quarter}
          branch={branch}
          userRole={user?.role}
          userBranch={user?.branch}
          onYearChange={setYear}
          onQuarterChange={setQuarter}
          onBranchChange={setBranch}
        />

        {/* 5 Executive KPI Cards */}
        <KpiOverviewSection data={overview} loading={loadingOverview} />

        {/* Top 3 Xuất sắc Podium Section */}
        <Top3PodiumSection
          topMembers={topMembers}
          loading={loadingTopMembers}
          quarter={quarter}
          year={year}
          branch={branch}
        />

        {/* Risk Center Section */}
        <RiskCenterSection riskMembers={riskMembers} loading={loadingRisks} />

        {/* Branch Performance Comparison */}
        <BranchPerformanceSection
          branches={branches}
          loading={loadingBranches}
          onSelectBranch={(b) => setBranch(b)}
        />

        {/* Attendance Trend Chart */}
        <AttendanceTrendSection data={trend} loading={loadingTrend} />

        {/* Main Content Grid: Top Members & Activity Participation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopMembersSection
              members={topMembers}
              loading={loadingTopMembers}
              onSortChange={setSortBy}
              currentSort={sortBy}
            />
          </div>
          <div>
            <ActivityParticipationSection activities={activities} loading={loadingActivities} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
