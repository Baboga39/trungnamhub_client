// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchAttendanceStreak, fetchDashboardStats, fetchGradeTimeLine, fetchRanking, fetchRiskMembers, fetchTop3Ranking } from "./dashboardThunks";


const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { stats: null,top3Ranking: null, loading: false,  error: null, gradeTimeLine: null,  ranking: null , riskMembers: null, attendanceStreak  : []},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload
        state.loading = false
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
      .addCase(fetchTop3Ranking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
      .addCase(fetchTop3Ranking.fulfilled, (state, action) => {
        state.top3Ranking = action.payload
        state.loading = false
      })
      .addCase(fetchTop3Ranking.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRanking.fulfilled, (state, action) => {
        state.ranking = action.payload
        state.loading = false
      })
      .addCase(fetchRanking.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRanking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
      .addCase(fetchGradeTimeLine.fulfilled, (state, action) => {
        state.gradeTimeLine = action.payload
        state.loading = false
      })
      .addCase(fetchGradeTimeLine.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchGradeTimeLine.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
      .addCase(fetchRiskMembers.fulfilled, (state, action) => {
        state.riskMembers = action.payload
        state.loading = false
      })
      .addCase(fetchRiskMembers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRiskMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
      .addCase(fetchAttendanceStreak.fulfilled, (state, action) => {
        state.attendanceStreak = action.payload
        state.loading = false
      })
      .addCase(fetchAttendanceStreak.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAttendanceStreak.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload;
      })
  }
})


export default dashboardSlice.reducer;
