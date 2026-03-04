// src/features/auth/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import dashboardApi from "../../api/dashboardApi";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    const res = await dashboardApi.stats()
    return res.data
  }
)

export const fetchTop3Ranking = createAsyncThunk(
  "dashboard/fetchTop3Ranking",
  async () => { 
    const res = await dashboardApi.top3Ranking()
    return res.data
  }
)

export const fetchRanking = createAsyncThunk(
  "dashboard/fetchRanking",
  async () => {
    const res = await dashboardApi.ranking()
    return res.data 
  } 
)

export const fetchGradeTimeLine = createAsyncThunk(
  "dashboard/fetchGradeTimeLine",
  async () => {
    const res = await dashboardApi.gradeTimeLine()
    return res.data
  }
);

export const fetchRiskMembers = createAsyncThunk(
  "dashboard/fetchRiskMembers",
  async () => {
    const res = await dashboardApi.getRiskMembers()
    return res.data
  }
);

export const fetchAttendanceStreak = createAsyncThunk(
  "dashboard/fetchAttendanceStreak",
  async () => {
    const res = await dashboardApi.getAttendanceStreak()
    return res.data
  }
);