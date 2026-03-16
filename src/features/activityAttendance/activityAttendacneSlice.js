import { createSlice } from "@reduxjs/toolkit";
import { 
  markAttendanceActivityThunk,
  getAttendanceByActivityIdThunk
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
      // GET ATTENDANCE BY ACTIVITY
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
      });
  },
});

export const { resetAttendanceActivityState } = attendanceActivitySlice.actions;

export default attendanceActivitySlice.reducer;