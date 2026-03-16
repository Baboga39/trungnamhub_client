// src/api/attendanceApi.js
import { get } from "react-hook-form";
import axiosInstance from "../libs/axiosInstance";

const activityAttendanceApi = {
  upsert: (data) => axiosInstance.post("/activity-attendance/mark-attendance", data ),
  getByActivityId: (activityId) => axiosInstance.get(`/activity-attendance/${activityId}/attendance`),
};

export default activityAttendanceApi;
