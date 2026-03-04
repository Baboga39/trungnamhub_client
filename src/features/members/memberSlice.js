// src/features/members/memberSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMembersThunk,
  getMembersActive,
  upSertMemberThunk,
} from "./memberThunks";

const initialState = {
  members: [],
  membersActive: [],
  loading: false,
  error: null,
};

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(upSertMemberThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upSertMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMember = action.payload;

        const index = state.members.findIndex((m) => m.id === updatedMember.id);

        if (index !== -1) {
          state.members[index] = updatedMember;
        } else {
          state.members.push(updatedMember);
        }
      })
      .addCase(upSertMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMembersActive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMembersActive.fulfilled, (state, action) => {
        state.loading = false;
        state.membersActive = action.payload;
      })
      .addCase(getMembersActive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default memberSlice.reducer;
