// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const attendanceApi = {
  mark: (records) => axiosInstance.post("/attendance/mark", records ),
  getAll: (params) => axiosInstance.get("/attendance/all", { params }),
};

export default attendanceApi;
