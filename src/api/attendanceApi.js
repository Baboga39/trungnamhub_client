// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const attendanceApi = {
  mark: (records) => axiosInstance.post("/attendance/mark", records ),
  getAll: () => axiosInstance.get("/attendance/all"),
};

export default attendanceApi;
