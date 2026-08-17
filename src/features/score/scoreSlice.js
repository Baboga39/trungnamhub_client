// src/features/members/scoreSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  getAllThunk,
  getCategoriesThunk,
  upsertScoreThunk,
  deleteScoreThunk,
} from "./scoreThunks";

const initialState = {
  grades: [],
  categories: [],
  loading: false,
  error: null,
};

const gradeSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Lấy danh sách điểm
      .addCase(getAllThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = action.payload;
      })
      .addCase(getAllThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Lấy danh mục
      .addCase(getCategoriesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Upsert (Thêm hoặc Cập nhật điểm)
      .addCase(upsertScoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(upsertScoreThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;

        if (Array.isArray(updated)) {
          updated.forEach((u) => {
            const index = state.grades.findIndex((g) => g.id === u.id);
            if (index !== -1) {
              state.grades[index] = u;
            } else {
              state.grades.push(u);
            }
          });
        } else if (updated) {
          const index = state.grades.findIndex((g) => g.id === updated.id);
          if (index !== -1) {
            state.grades[index] = updated;
          } else {
            state.grades.push(updated);
          }
        }
      })
      .addCase(upsertScoreThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete Score
      .addCase(deleteScoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteScoreThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteScoreThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = gradeSlice.actions;
export default gradeSlice.reducer;
