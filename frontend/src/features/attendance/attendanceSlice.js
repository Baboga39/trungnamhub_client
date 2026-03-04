// src/features/attendance/attendanceSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getAllAttendanceThunk, markAttendanceThunk } from "./attendanceThunks";

const initialState = {
  marking: false,
  error: null,
  loading: false,
  lastMarked: null, 
  list: [],
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceState: (state) => {
      state.marking = false;
      state.error = null;
      state.lastMarked = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAttendanceThunk.pending, (state) => {
        state.marking = true;
        state.error = null;
      })
      .addCase(markAttendanceThunk.fulfilled, (state, action) => {
        state.marking = false;
        state.lastMarked = action.payload;
      })
      .addCase(markAttendanceThunk.rejected, (state, action) => {
        state.marking = false;
        state.error = action.payload;
      })
      .addCase(getAllAttendanceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAttendanceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getAllAttendanceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
