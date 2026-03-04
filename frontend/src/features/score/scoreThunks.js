// src/features/members/memberThunks.js
import scoreApi from "@/api/scoreApi";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const getAllThunk = createAsyncThunk(
  "grades/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await scoreApi.getAll();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCategoriesThunk = createAsyncThunk(
  "grades/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await scoreApi.getAllCategories();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const upsertScoreThunk = createAsyncThunk(
  "grades/upsert",
  async (data, { rejectWithValue }) => {
    try {
      const res = await scoreApi.upsert(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);