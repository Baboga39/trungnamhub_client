// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import memberReducer from "../features/members/memberSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import userReducer from "../features/user/userSlice";
import scoreReducer from "../features/score/scoreSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import activitiesReducer from "../features/activity/activitySlice";
import attendanceActivityReducer from "../features/activityAttendance/activityAttendacneSlice";
import documentReducer from "../features/document/documentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    members: memberReducer,
    attendance: attendanceReducer,
    users: userReducer,
    grades: scoreReducer,
    dashboard: dashboardReducer,
    activities: activitiesReducer,
    attendanceActivity: attendanceActivityReducer,
    documents: documentReducer,
  },
});

export default store;
