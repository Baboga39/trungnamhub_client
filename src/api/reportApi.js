import axiosInstance from "../libs/axiosInstance";

const reportApi = {
  getTemplates: () => axiosInstance.get("/reports/templates"),
  executeReport: (templateId, parameters) =>
    axiosInstance.post("/reports/execute", { templateId, parameters }),
  sendReportEmail: (email, subject, files) =>
    axiosInstance.post("/reports/send-email", { email, subject, files }),

  // Schedule CRUD
  getSchedules: () => axiosInstance.get("/reports/schedules"),
  createSchedule: (data) => axiosInstance.post("/reports/schedules", data),
  updateSchedule: (id, data) => axiosInstance.put(`/reports/schedules/${id}`, data),
  deleteSchedule: (id) => axiosInstance.delete(`/reports/schedules/${id}`),
};

export default reportApi;
