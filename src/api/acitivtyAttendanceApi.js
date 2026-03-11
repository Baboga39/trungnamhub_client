// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const activityAttendanceApi = {
  upsert: (data) => axiosInstance.post("/activity-attendance/mark-attendance", data ),
};

export default activityAttendanceApi;
