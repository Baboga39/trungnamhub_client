export const selectGlobalLoading = (state) =>
  state.members?.loading ||
  state.attendance?.loading ||
  state.auth?.loading ||
  false;
