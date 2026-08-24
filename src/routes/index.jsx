import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ReportCenterPage from "../pages/ReportCenterPage";
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
import ApproveProgramPage from "@/pages/ApproveProgramPage";
import PendingApprovalsPage from "@/pages/PendingApprovalsPage";
import ReportSchedulePage from "@/pages/ReportSchedulePage";
import ExecutiveDashboardPage from "@/pages/ExecutiveDashboardPage";
import PublicExecutiveDashboardPage from "@/pages/PublicExecutiveDashboardPage";
import ProgramsPage from "@/pages/ProgramsPage";
import ProgramDetailPage from "@/pages/ProgramDetailPage";
import PendingProgramApprovalsPage from "@/pages/PendingProgramApprovalsPage";

export const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/approve", element: <ApproveDocumentPage /> },
  { path: "/approve-program", element: <ApproveProgramPage /> },
  { path: "/public-dashboard", element: <PublicExecutiveDashboardPage /> },
  { path: "/documents", element: <DocumentPage /> },
];

export const privateRoutes = [
  { path: "/", element: <DashboardPage /> },
  { path: "/executive-dashboard", element: <ExecutiveDashboardPage /> },
  { path: "/students", element: <StudentPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/attendance", element: <AttendancePage /> },
  { path: "/attendance-calendar", element: <AttendanceCalendarPage /> },
  { path: "/users", element: <UserPage /> },
  { path: "/activity", element: <ActivityPage /> },
  { path: "/scores", element: <ScorePage /> },
  { path: "/attendance-activity", element: <AttendanceActivityPage /> },
  { path: "/pending-approvals", element: <PendingApprovalsPage /> },
  { path: "/pending-program-approvals", element: <PendingProgramApprovalsPage /> },
  { path: "/report-center", element: <ReportCenterPage /> },
  { path: "/programs", element: <ProgramsPage /> },
  { path: "/programs/:programId", element: <ProgramDetailPage /> },
  { path: "/report-schedules", element: <ReportSchedulePage /> },
];
