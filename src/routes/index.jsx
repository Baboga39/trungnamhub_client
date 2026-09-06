import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ReportCenterPage = lazy(() => import("../pages/ReportCenterPage"));
const StudentPage = lazy(() => import("../pages/studentPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AttendancePage = lazy(() => import("@/pages/AttendancePage"));
const AttendanceCalendarPage = lazy(() => import("@/pages/AttendanceCalendarPage"));
const UserPage = lazy(() => import("@/pages/UserPage"));
const ActivityPage = lazy(() => import("@/pages/ActivityPage"));
const ScorePage = lazy(() => import("@/pages/Score"));
const ScoreConfigPage = lazy(() => import("@/pages/ScoreConfigPage"));
const AttendanceActivityPage = lazy(() => import("@/pages/ActivityAttendancePage"));
const DocumentPage = lazy(() => import("@/pages/DocumentPage"));
const ApproveDocumentPage = lazy(() => import("@/pages/ApproveDocumentPage"));
const ApproveProgramPage = lazy(() => import("@/pages/ApproveProgramPage"));
const PendingApprovalsPage = lazy(() => import("@/pages/PendingApprovalsPage"));
const ReportSchedulePage = lazy(() => import("@/pages/ReportSchedulePage"));
const ExecutiveDashboardPage = lazy(() => import("@/pages/ExecutiveDashboardPage"));
const PublicExecutiveDashboardPage = lazy(() => import("@/pages/PublicExecutiveDashboardPage"));
const ProgramsPage = lazy(() => import("@/pages/ProgramsPage"));
const ProgramDetailPage = lazy(() => import("@/pages/ProgramDetailPage"));
const PendingProgramApprovalsPage = lazy(() => import("@/pages/PendingProgramApprovalsPage"));

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
  { path: "/score-config", element: <ScoreConfigPage /> },
  { path: "/attendance-activity", element: <AttendanceActivityPage /> },
  { path: "/pending-approvals", element: <PendingApprovalsPage /> },
  { path: "/pending-program-approvals", element: <PendingProgramApprovalsPage /> },
  { path: "/report-center", element: <ReportCenterPage /> },
  { path: "/programs", element: <ProgramsPage /> },
  { path: "/programs/:programId", element: <ProgramDetailPage /> },
  { path: "/report-schedules", element: <ReportSchedulePage /> },
];
