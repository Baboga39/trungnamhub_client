import { createSlice } from "@reduxjs/toolkit";
import {
  markAttendanceActivityThunk,
  getAttendanceByActivityIdThunk,
  deleteAttendanceActivityThunk,
} from "./activityAttendanceThunks";

const initialState = {
  attendance: [],
  loading: false,
  error: null,
  success: false,
};

const attendanceActivitySlice = createSlice({
  name: "attendanceActivity",
  initialState,
  reducers: {
    resetAttendanceActivityState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // =============================
      // GET ATTENDANCE
      // =============================

      .addCase(getAttendanceByActivityIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAttendanceByActivityIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload || [];
      })

      .addCase(getAttendanceByActivityIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Get attendance activity failed";
      })

      // =============================
      // MARK ATTENDANCE
      // =============================

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
      })

      // =============================
      // DELETE ATTENDANCE
      // =============================

      .addCase(deleteAttendanceActivityThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteAttendanceActivityThunk.fulfilled, (state, action) => {
        state.loading = false;

        const deletedIds = action.payload.ids;

        state.attendance = state.attendance.filter(
          (item) => !deletedIds.includes(item.id)
        );
      })

      .addCase(deleteAttendanceActivityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete attendance failed";
      });
  },
});

export const { resetAttendanceActivityState } = attendanceActivitySlice.actions;

export default attendanceActivitySlice.reducer;