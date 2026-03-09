// src/features/activity/activitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchActivitiesThunk, upsertActivityThunk } from "./activityThunks";

const initialState = {
  activities: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH ACTIVITIES
      .addCase(fetchActivitiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchActivitiesThunk.fulfilled, (state, action) => {
        state.loading = false;

        // API trả về {statusCode,message,data}
        state.activities = action.payload || [];
      })

      .addCase(fetchActivitiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch activities failed";
      })

      // UPSERT ACTIVITY
      .addCase(upsertActivityThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(upsertActivityThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(upsertActivityThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Upsert activity failed";
      });
  },
});

export default activitySlice.reducer;