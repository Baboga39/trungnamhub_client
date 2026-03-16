// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const activityApi = {
  upsert: (data) => axiosInstance.post("/activities/upsert", data ),
  getAll: () => axiosInstance.get("/activities/all"),
  delete: (id) => axiosInstance.delete(`/activities/${id}`),
};

export default activityApi;
