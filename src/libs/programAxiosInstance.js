import axios from "axios";
import { toast } from "react-toastify";

const programAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PROGRAM_API_URL || "http://localhost:5001/api/v1",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization Bearer Token
programAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("Lỗi khởi tạo yêu cầu!");
    return Promise.reject(error);
  }
);

// Response Interceptor: Format responses and handle error toasts
programAxiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      toast.error("Hết phiên làm việc - Vui lòng đăng nhập lại!");
      localStorage.removeItem("accessToken");
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } else if (status === 403) {
      toast.error(message || "Bạn không có quyền truy cập dữ liệu ngành này!");
    } else if (message) {
      toast.error(message);
    } else if (status === 404) {
      toast.error("Không tìm thấy dữ liệu chương trình!");
    } else if (status >= 500) {
      toast.error("Lỗi hệ thống máy chủ chương trình! Vui lòng thử lại sau.");
    } else {
      toast.error("Có lỗi xảy ra! Vui lòng liên hệ quản trị viên.");
    }

    return Promise.reject(error);
  }
);

export default programAxiosInstance;
