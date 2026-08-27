// src/features/auth/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../api/authApi";
import { jwtDecode } from "jwt-decode";

// 🔹 LOGIN
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);

      if (res.data?.token) {
        // lưu token vào localStorage
        localStorage.setItem("accessToken", res.data.token);

        // decode token ra user
        const decoded = jwtDecode(res.data.token);
        const user = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          branch: decoded.branch,
          phone: decoded.phone || "",
          birthDate: decoded.birthDate || "",
          startYear: decoded.startYear,
          sumEvent: decoded.sumEvent,
        };

        // trả user đã decode để slice nhận
        return { user };
      }

      return rejectWithValue("No token found in response");
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 LOGOUT
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    localStorage.removeItem("accessToken");
  } catch {
    localStorage.removeItem("accessToken");
  }
});

// 🔹 CHANGE PROFILE
export const changeProfileThunk = createAsyncThunk(
  "auth/changeProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.changeProfile(data);
      return res; // res.data ở slice bạn đã dùng action.payload.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 RESET PASSWORD
export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.resetPassword(data);
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const getPermissionsThunk = createAsyncThunk(
  "auth/getPermissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const userId = state.auth?.user?.userId
      if (!userId) throw new Error("User ID not found")

      const res = await authApi.getPermissions(userId)

      return res.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getUserPermissionsThunk = createAsyncThunk(
  "auth/getUserPermissions",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await authApi.getPermissions(userId); // gọi /auth/permissions/:id
      return res.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 UPSERT PERMISSIONS
export const upsertPermissionsThunk = createAsyncThunk(
  "auth/upsertPermissions",
  async (data, { rejectWithValue }) => {
    try {
      await authApi.upSertPermissions(data);
    
      return data.screenIds;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
