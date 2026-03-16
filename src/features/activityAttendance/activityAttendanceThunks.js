import { createAsyncThunk } from "@reduxjs/toolkit";
import activityAttendanceApi from "@/api/acitivtyAttendanceApi";
import { exp } from "three/src/nodes/math/MathNode";

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
export const getAttendanceByActivityIdThunk = createAsyncThunk(
  "attendanceActivity/getAttendanceByActivityId", 
  async (id, { rejectWithValue }) => {
    try {
      const res = await activityAttendanceApi.getByActivityId(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Get attendance activity failed"
      );
    }
  }
);

export const deleteAttendanceActivityThunk = createAsyncThunk(
  "attendanceActivity/deleteAttendance",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await activityAttendanceApi.delete(ids);
      return { ids, ...res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Delete attendance activity failed"
      );
    }
  }
);