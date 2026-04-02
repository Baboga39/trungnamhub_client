import documentApi from "@/api/documentApi";
import fileApi from "@/api/fileApi";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDocumentsThunk = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await documentApi.getAll();
      return res.data; 
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Fetch documents failed"
      );
    }
  }
);

// 📌 CREATE DOCUMENT
export const createDocumentThunk = createAsyncThunk(
  "documents/create",
  async (payload, { rejectWithValue }) => {
    try {
      // 1. Gửi file lên luồng riêng để lấy fileUrl & publicId
      const formData = new FormData();
      formData.append("file", payload.file);

      const fileRes = await fileApi.uploadFile(formData);
      const { fileUrl, publicId } = fileRes;

      // 2. Gửi thông tin JSON để tạo document
      const docData = {
        title: payload.title,
        fileUrl,
        publicId,
      };

      const res = await documentApi.create(docData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || "Create document failed"
      );
    }
  }
);

// 📌 DELETE DOCUMENT
export const deleteDocumentThunk = createAsyncThunk(
  "documents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await documentApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Delete document failed"
      );
    }
  }
);

// 📌 SEND APPROVAL
export const sendApprovalThunk = createAsyncThunk(
  "documents/sendApproval",
  async (data, { rejectWithValue }) => {
    try {
      const res = await documentApi.sendApproval(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Send approval failed"
      );
    }
  }
);

export const reSubmitDocumentThunk = createAsyncThunk(
  "documents/reSubmit",
  async (payload, { rejectWithValue }) => {
    try {
      // 🔥 1. Upload file trước
      const formData = new FormData();
      formData.append("file", payload.file);

      const fileRes = await fileApi.uploadFile(formData);
      const { fileUrl, publicId } = fileRes;

      // 🔥 2. Gửi lại document (KHÔNG cần approver)
      const res = await documentApi.reSubmit({
        documentId: payload.documentId,
        title: payload.title,
        fileUrl,
        publicId,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data ||
        "Re-submit document failed"
      );
    }
  }
);