 import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import StudentPage from "../pages/studentPage";
 import ProfilePage from "@/pages/ProfilePage";
 import AttendancePage from "@/pages/AttendancePage";
 import AttendanceCalendarPage from "@/pages/AttendanceCalendarPage";
 import UserPage from "@/pages/UserPage";
  import ReportPage from "@/pages/ReportPage";
  import ScorePage from "@/pages/Score";
export const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
];

export const privateRoutes = [
  { path: "/", element: <DashboardPage /> },
  { path: "/students", element: <StudentPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/attendance", element: <AttendancePage /> },
  { path: "/attendance-calendar", element: <AttendanceCalendarPage /> },
  { path: "/users", element: <UserPage /> },
  {path:"/reports", element: <ReportPage/>},
  {path:"/scores", element: <ScorePage/>}
];
