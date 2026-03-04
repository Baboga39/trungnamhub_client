// src/libs/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";
import { clearUser } from "@/features/auth/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("Request setup error!");
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;


    if (status === 401) {
      toast.error("Unauthorized - Please login again!");
       localStorage.removeItem("accessToken");
          if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } else if(message){
        toast.error(message);
      } else if (status === 403) {
      toast.error("Forbidden - You don’t have permission!");
    } else if (status === 404) {
      toast.error("Resource not found!");
    } else if (status > 500) {
      toast.error("Server error! Please try again later.");
    } else {
      toast.error("Something went wrong! Please contact support.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
