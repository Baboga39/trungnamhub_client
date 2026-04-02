import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDocumentsThunk,
  createDocumentThunk,
  deleteDocumentThunk,
} from "./documentThunks";

const initialState = {
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ===== FETCH =====
      .addCase(fetchDocumentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload || [];
      })

      .addCase(fetchDocumentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch documents failed";
      })

      // ===== CREATE =====
      .addCase(createDocumentThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(createDocumentThunk.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 thêm vào đầu list (không cần gọi lại API)
        state.documents.unshift(action.payload);
      })

      .addCase(createDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Create document failed";
      })

      // ===== DELETE =====
      .addCase(deleteDocumentThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteDocumentThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.documents = state.documents.filter(
          (doc) => doc.id !== action.payload
        );
      })

      .addCase(deleteDocumentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete document failed";
      });
  },
});

export default documentSlice.reducer;