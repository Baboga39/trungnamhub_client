import axiosInstance from "../libs/axiosInstance";

const fileApi = {
  uploadFile: (formData) =>
    axiosInstance.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default fileApi;
