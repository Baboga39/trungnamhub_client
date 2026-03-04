// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const dashboardApi = {
  stats: () => axiosInstance.get("/dashboard/stats" ),
  top3Ranking: () => axiosInstance.get("/dashboard/top3-members" ),
  ranking: () => axiosInstance.get("/dashboard/ranking" ),
  gradeTimeLine: () => axiosInstance.get("/dashboard/grade-trend-timeline" ),
  getRiskMembers: () => axiosInstance.get("/dashboard/risk-members" ),
  getAttendanceStreak: () => axiosInstance.get("/dashboard/attendance-streak-top" ),
};

export default dashboardApi;