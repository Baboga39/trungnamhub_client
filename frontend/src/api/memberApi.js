// src/api/memberApi.js
import axiosInstance from "../libs/axiosInstance";

const memberApi = {
  getAll: () => axiosInstance.get("/members"),
  upSert: (data) => axiosInstance.post("/members", data),
  getMembersActive: () => axiosInstance.get("/members/active"),
};

export default memberApi;
