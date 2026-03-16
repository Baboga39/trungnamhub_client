import activityApi from "@/api/activityApis";
import { createAsyncThunk } from "@reduxjs/toolkit";

// lấy danh sách activity
export const fetchActivitiesThunk = createAsyncThunk(
  "activities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await activityApi.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch activities failed");
    }
  }
);

// tạo hoặc cập nhật activity
export const upsertActivityThunk = createAsyncThunk(
  "activities/upsert",
  async (data, { rejectWithValue }) => {
    try {
      const res = await activityApi.upsert(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upsert activity failed");
    }
  }
);

// xóa activity
export const deleteActivityThunk = createAsyncThunk(
  "activities/delete",
  async (id, { rejectWithValue }) => {
    try {
      await activityApi.delete(id);
      return id; // trả về id đã xóa để reducer có thể cập nhật state
    } catch (err) {
      return rejectWithValue(err.response?.data || "Delete activity failed");
    }   
  })