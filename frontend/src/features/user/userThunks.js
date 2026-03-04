// src/features/members/memberThunks.js
import userApi from "@/api/userApi";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const getUsersThunk = createAsyncThunk(
  "users/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getAll();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const upSertUserThunk = createAsyncThunk(
  "users/upSert",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.upSert(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await userApi.delete(userId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);