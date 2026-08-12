import programAxiosInstance from "../libs/programAxiosInstance";

const programApi = {
  // Quarter Programs
  getPrograms: (params) => programAxiosInstance.get("/programs", { params }),
  getProgram: (id) => programAxiosInstance.get(`/programs/${id}`),
  createProgram: (data) => programAxiosInstance.post("/programs", data),
  updateProgram: (id, data) => programAxiosInstance.patch(`/programs/${id}`, data),
  deleteProgram: (id) => programAxiosInstance.delete(`/programs/${id}`),

  // Program Lessons
  getLessons: (programId) => programAxiosInstance.get(`/programs/${programId}/lessons`),
  getLesson: (id) => programAxiosInstance.get(`/lessons/${id}`),
  createLesson: (programId, data) => programAxiosInstance.post(`/programs/${programId}/lessons`, data),
  updateLesson: (id, data) => programAxiosInstance.patch(`/lessons/${id}`, data),
  deleteLesson: (id) => programAxiosInstance.delete(`/lessons/${id}`),

  // Program Leaders
  getLeaders: (lessonId) => programAxiosInstance.get(`/program-lessons/${lessonId}/leaders`),
  addLeader: (lessonId, data) => programAxiosInstance.post(`/program-lessons/${lessonId}/leaders`, data),
  removeLeader: (lessonId, userId) =>
    programAxiosInstance.delete(`/program-lessons/${lessonId}/leaders/${userId}`),

  // Branch Users from Core
  getProgramUsers: (branchId) => programAxiosInstance.get("/users", { params: { branchId } }),

  // Master Data
  getCommonPrograms: () => programAxiosInstance.get("/common-programs"),
  getLocations: () => programAxiosInstance.get("/locations"),

  // Lesson Files Upload & Delete
  uploadLessonFile: (lessonId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return programAxiosInstance.post(`/program-lessons/${lessonId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteLessonFile: (lessonId, fileId) =>
    programAxiosInstance.delete(`/program-lessons/${lessonId}/files/${fileId}`),

  // Attendance Integration
  ensureSession: (lessonId) =>
    programAxiosInstance.post(`/program-lessons/${lessonId}/ensure-session`),
  syncAttendance: (lessonId) =>
    programAxiosInstance.post(`/program-lessons/${lessonId}/sync-attendance`),
  getLessonAttendance: (lessonId) =>
    programAxiosInstance.get(`/program-lessons/${lessonId}/attendance`),
};

export default programApi;
