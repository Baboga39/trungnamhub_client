// src/api/authApi.js
import axiosInstance from "../libs/axiosInstance";

const userApi = {
  getAll: () => axiosInstance.get("/users"),
  upSert: (data) => axiosInstance.post("/users/upsert", data),
  delete: (userId) => axiosInstance.delete(`/users/${userId}`),
};

export default userApi;
