import { createAsyncThunk } from "@reduxjs/toolkit";
import activityAttendanceApi from "@/api/acitivtyAttendanceApi";

export const markAttendanceActivityThunk = createAsyncThunk(
  "attendanceActivity/markAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const res = await activityAttendanceApi.upsert(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Mark attendance activity failed"
      );
    }
  }
);