// src/features/user/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  getUsersThunk,
  upSertUserThunk,
  deleteUserThunk,
} from "./userThunks";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 LẤY DANH SÁCH NGƯỜI DÙNG
      .addCase(getUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 THÊM / CẬP NHẬT NGƯỜI DÙNG
      .addCase(upSertUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upSertUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;

        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        } else {
          state.users.push(updatedUser);
        }
      })
      .addCase(upSertUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 XOÁ NGƯỜI DÙNG
      .addCase(deleteUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.loading = false;

        // backend trả về id hoặc object { id: ... }
        const deletedId =
          typeof action.payload === "object"
            ? action.payload.id
            : action.payload;

        // loại bỏ user khỏi danh sách
        state.users = state.users.filter((u) => u.id !== deletedId);
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
