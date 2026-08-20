// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const dashboardApi = {
  stats: () => axiosInstance.get("/dashboard/stats"),
  top3Ranking: (params) => axiosInstance.get("/dashboard/top3-members", { params }),

  ranking: () => axiosInstance.get("/dashboard/ranking"),
  gradeTimeLine: () => axiosInstance.get("/dashboard/grade-trend-timeline"),
  getRiskMembers: () => axiosInstance.get("/dashboard/risk-members"),
  getAttendanceStreak: () => axiosInstance.get("/dashboard/attendance-streak-top"),
  getQuarterlyBirthdays: (params) => axiosInstance.get("/dashboard/quarterly-birthdays", { params }),


  // Executive Cockpit Endpoints
  getExecutiveOverview: (params) => axiosInstance.get("/dashboard/executive/overview", { params }),
  getExecutiveBranches: (params) => axiosInstance.get("/dashboard/executive/branches", { params }),
  getExecutiveTopMembers: (params) => axiosInstance.get("/dashboard/executive/top-members", { params }),
  getExecutiveAttendanceTrend: (params) => axiosInstance.get("/dashboard/executive/attendance-trend", { params }),
  getExecutiveActivities: (params) => axiosInstance.get("/dashboard/executive/activities", { params }),
  getExecutiveRisks: (params) => axiosInstance.get("/dashboard/executive/risks", { params }),

  // Public Executive Dashboard Endpoints (No Token Required)
  getPublicExecutiveOverview: (params) => axiosInstance.get("/dashboard/executive/public/overview", { params }),
  getPublicExecutiveBranches: (params) => axiosInstance.get("/dashboard/executive/public/branches", { params }),
  getPublicExecutiveTopMembers: (params) => axiosInstance.get("/dashboard/executive/public/top-members", { params }),
  getPublicExecutiveAttendanceTrend: (params) => axiosInstance.get("/dashboard/executive/public/attendance-trend", { params }),
  getPublicExecutiveActivities: (params) => axiosInstance.get("/dashboard/executive/public/activities", { params }),
  getPublicExecutiveRisks: (params) => axiosInstance.get("/dashboard/executive/public/risks", { params }),
};

export default dashboardApi;