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

export const changeMemberStatus = createAsyncThunk(
  "members/changeStatus",
  async (
    { memberId, active, promotionDate, note },
    { rejectWithValue }
  ) => {
    try {
      const res = await memberApi.changeStatus(
        memberId,
        active,
        promotionDate,
        note
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMemberHistory = createAsyncThunk(
  "members/getHistory",
  async (memberId, { rejectWithValue }) => {
    try {
      const res = await memberApi.getHistory(memberId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMemberHistory = createAsyncThunk(
  "members/deleteHistory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await memberApi.deleteHistory(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const promoteBranch = createAsyncThunk(
  "members/promoteBranch",
  async ({ memberId, note, effectiveDate }, { rejectWithValue }) => {
    try {
      const res = await memberApi.promoteBranch(memberId, note, effectiveDate);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);