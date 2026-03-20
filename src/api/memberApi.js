// src/api/memberApi.js
import axiosInstance from "../libs/axiosInstance";

const memberApi = {
  getAll: () => axiosInstance.get("/members"),
  upSert: (data) => axiosInstance.post("/members", data),
  getMembersActive: () => axiosInstance.get("/members/active"),
  changeStatus: (memberId, status, note) => axiosInstance.patch(`/members/status`, { memberId, status, note }),
  getHistory: (memberId) => axiosInstance.get(`/members/${memberId}/history`),
  deleteHistory: (id) => axiosInstance.delete(`/members/history/${id}`),
};

export default memberApi;
