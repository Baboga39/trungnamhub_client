// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { changeProfileThunk, getPermissionsThunk, loginThunk, logoutThunk, upsertPermissionsThunk } from "./authThunks";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("accessToken");

// Nếu có token thì decode ra user
let decodedUser = null;
if (token) {
  try {
    const decoded = jwtDecode(token);
    decodedUser = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      startYear: decoded.startYear,
      sumEvent: decoded.sumEvent,
    };
  } catch (err) {
    console.error("Token không hợp lệ:", err);
    localStorage.removeItem("accessToken");
  }
}

const initialState = {
  user: decodedUser, 
  loading: false,
  error: null,
  permissions: [],
  isAuthenticated: !!decodedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(changeProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.data };
      })
      .addCase(changeProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })   .addCase(getPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload || [];
      })
      .addCase(getPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 UPSERT PERMISSIONS
      .addCase(upsertPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertPermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(upsertPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
