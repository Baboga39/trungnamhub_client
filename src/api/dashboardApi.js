// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const dashboardApi = {
  stats: () => axiosInstance.get("/dashboard/stats"),
  top3Ranking: () => axiosInstance.get("/dashboard/top3-members"),
  ranking: () => axiosInstance.get("/dashboard/ranking"),
  gradeTimeLine: () => axiosInstance.get("/dashboard/grade-trend-timeline"),
  getRiskMembers: () => axiosInstance.get("/dashboard/risk-members"),
  getAttendanceStreak: () => axiosInstance.get("/dashboard/attendance-streak-top"),

  // Executive Cockpit Endpoints
  getExecutiveOverview: (params) => axiosInstance.get("/dashboard/executive/overview", { params }),
  getExecutiveBranches: (params) => axiosInstance.get("/dashboard/executive/branches", { params }),
  getExecutiveTopMembers: (params) => axiosInstance.get("/dashboard/executive/top-members", { params }),
  getExecutiveAttendanceTrend: (params) => axiosInstance.get("/dashboard/executive/attendance-trend", { params }),
  getExecutiveActivities: (params) => axiosInstance.get("/dashboard/executive/activities", { params }),
  getExecutiveRisks: (params) => axiosInstance.get("/dashboard/executive/risks", { params }),
};

export default dashboardApi;