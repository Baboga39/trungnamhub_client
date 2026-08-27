// src/features/attendance/attendanceThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import attendanceApi from "../../api/attendanceApi";

export const markAttendanceThunk = createAsyncThunk(
  "attendance/mark",
  async (records, { rejectWithValue }) => {
    try {
      const res = await attendanceApi.mark(records);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAllAttendanceThunk = createAsyncThunk(
  "attendance/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await attendanceApi.getAll(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
