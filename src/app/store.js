// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import memberReducer from "../features/members/memberSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import userReducer from "../features/user/userSlice";
import scoreReducer from "../features/score/scoreSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
     members: memberReducer,
     attendance: attendanceReducer,
     users: userReducer,
     grades: scoreReducer,
     dashboard: dashboardReducer,
  },
});

export default store;
