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
  async (includeInactive = false, { rejectWithValue }) => {
    try {
      const res = await scoreApi.getAllCategories(includeInactive);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const upsertCategoryThunk = createAsyncThunk(
  "grades/upsertCategory",
  async (data, { rejectWithValue }) => {
    try {
      const res = await scoreApi.upsertCategory(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  "grades/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await scoreApi.deleteCategory(id);
      return { id, data: res.data };
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

export const deleteScoreThunk = createAsyncThunk(
  "grades/deleteScore",
  async (data, { rejectWithValue }) => {
    try {
      const res = await scoreApi.deleteScore(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);