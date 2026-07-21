// src/api/memberApi.js
import axiosInstance from "../libs/axiosInstance";

const memberApi = {
  getAll: () => axiosInstance.get("/members"),
  upSert: (data) => axiosInstance.post("/members", data),
  getMembersActive: () => axiosInstance.get("/members/active"),
  changeStatus: (memberId, active, promotionDate, note) =>
    axiosInstance.patch("/members/status", {
      memberId,
      active,
      promotionDate,
      note,
    }),
  getHistory: (memberId) => axiosInstance.get(`/members/${memberId}/history`),
  deleteHistory: (ids) => axiosInstance.delete(`/members/history`, { data: { ids } }),
};

export default memberApi;
