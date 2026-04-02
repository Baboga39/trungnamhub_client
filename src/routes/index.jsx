import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import StudentPage from "../pages/studentPage";
import ProfilePage from "@/pages/ProfilePage";
import AttendancePage from "@/pages/AttendancePage";
import AttendanceCalendarPage from "@/pages/AttendanceCalendarPage";
import UserPage from "@/pages/UserPage";
import ActivityPage from "@/pages/ActivityPage";
import ScorePage from "@/pages/Score";
import AttendanceActivityPage from "@/pages/ActivityAttendancePage";
import DocumentPage from "@/pages/DocumentPage";
import ApproveDocumentPage from "@/pages/ApproveDocumentPage";
import PendingApprovalsPage from "@/pages/PendingApprovalsPage";
export const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/approve", element: <ApproveDocumentPage /> },
  { path: "/documents", element: <DocumentPage /> },
];

export const privateRoutes = [
  { path: "/", element: <DashboardPage /> },
  { path: "/students", element: <StudentPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/attendance", element: <AttendancePage /> },
  { path: "/attendance-calendar", element: <AttendanceCalendarPage /> },
  { path: "/users", element: <UserPage /> },
  { path: "/activity", element: <ActivityPage /> },
  { path: "/scores", element: <ScorePage /> },
  { path: "/attendance-activity", element: <AttendanceActivityPage /> },
  { path: "/pending-approvals", element: <PendingApprovalsPage /> },
];
