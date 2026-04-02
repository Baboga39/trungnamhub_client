// src/api/attendanceApi.js
import axiosInstance from "../libs/axiosInstance";

const documentApi = {
  getAll: () => axiosInstance.get("/documents/getAllDocument"),
  create: (data) => axiosInstance.post("/documents/create", data),
  delete: (id) => axiosInstance.delete(`/documents/delete/${id}`),
  sendApproval: (data) => axiosInstance.post("/documents/send-approval", data),
  getPendingApprovals: () => axiosInstance.get("/documents/pending-approvals"),
  getApprovalDetail: (token) => axiosInstance.get(`/documents/approve-detail/${token}`),
  handleApproval: (data) => axiosInstance.post("/documents/handle-approval-by-mail", data),
  reSubmit: (data) => axiosInstance.post("/documents/resubmit", data),
};

export default documentApi;
