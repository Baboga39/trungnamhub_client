// src/api/authApi.js
import axiosInstance from "../libs/axiosInstance";

const authApi = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  logout: () => axiosInstance.post("/auth/logout"),
  getProfile: () => axiosInstance.get("/auth/profile"),
  changeProfile: (data) => axiosInstance.put("/auth/change-info", data),
  resetPassword: (data) => axiosInstance.put("/auth/reset-password", data),
 getPermissions: (userId) => axiosInstance.get(`/auth/permissions/${userId}`),
  upSertPermissions: (data) => axiosInstance.post("/auth/permissions/upsert", data),
};

export default authApi;
