// src/api/authApi.js
import axiosInstance from "../libs/axiosInstance";

const scoreApi = {
  getAll: () => axiosInstance.get("/grades/all"),
  getAllCategories: (includeInactive = false) =>
    axiosInstance.get(`/grades/categories${includeInactive ? "?includeInactive=true" : ""}`),
  upsertCategory: (data) => axiosInstance.post("/grades/categories/upsert", data),
  deleteCategory: (id) => axiosInstance.delete(`/grades/categories/${id}`),
  upsert: (data) => axiosInstance.post("/grades/score/upsert", data),
  deleteScore: (data) => axiosInstance.post("/grades/score/delete", data),
};

export default scoreApi;
