// src/api/authApi.js
import axiosInstance from "../libs/axiosInstance";

const scoreApi = {
  getAll: () => axiosInstance.get("/grades/all"),
  getAllCategories: () => axiosInstance.get("/grades/categories"),
  upsert: (data) => axiosInstance.post("/grades/score/upsert", data),
};

export default scoreApi;
