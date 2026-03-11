import { createSlice } from "@reduxjs/toolkit";
import { markAttendanceActivityThunk } from "./activityAttendanceThunks";

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const attendanceActivitySlice = createSlice({
  name: "attendanceActivity",
  initialState,
  reducers: {
    resetAttendanceState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // MARK ATTENDANCE
      .addCase(markAttendanceActivityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(markAttendanceActivityThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      .addCase(markAttendanceActivityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Mark attendance failed";
      });
  },
});

export const { resetAttendanceActivityState } = attendanceActivitySlice.actions;

export default attendanceActivitySlice.reducer;