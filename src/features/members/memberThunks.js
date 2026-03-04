// src/features/members/memberThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import memberApi from "../../api/memberApi";

export const fetchMembersThunk = createAsyncThunk(
  "members/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await memberApi.getAll();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const upSertMemberThunk = createAsyncThunk(
  "members/upSert",
  async (data, { rejectWithValue }) => {
    try {
      const res = await memberApi.upSert(data);
      console.log("Upsert response data:", res);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
); 

export const getMembersActive = createAsyncThunk(
  "members/getMembersActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await memberApi.getMembersActive();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);