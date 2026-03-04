export type AttendanceStatus = "absent" | "late" | "excused" | null

export interface Member {
  id: string
  fullName: string
  holyName: string
  birthDate: Date | null
  email: string | null
  phone: string | null
  address: string | null
  parish: string | null
  church: string | null
  startYear: number | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  managerId: string | null
}

export interface Attendance {
  id: string
  memberId: string
  sessionId: string
  date: Date
  status: AttendanceStatus
  note: string | null
  member?: Member
}

export interface Grade {
  id: string
  memberId: string
  categoryId: string
  score: number
  note: string | null
  date: Date
  member?: Member
  category?: GradeCategory
}

export interface GradeCategory {
  id: string
  name: string
  description: string | null
  weight: number
  maxScore: number
}

export interface Session {
  id: string
  name: string
  date: Date
  description: string | null
}

export interface DashboardStats {
  totalMembers: number
  totalManagers: number
  totalSessions: number
  attendanceRate: number
}

export interface RankingItem {
  memberId: string
  memberName: string
  holyName: string
  totalScore: number
  rank: number
  trend?: "up" | "down" | "same"
}
