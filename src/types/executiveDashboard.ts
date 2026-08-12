export interface KpiMetric {
  value: number;
  diff: number;
  trendPercent?: number;
}

export interface ExecutiveOverview {
  year: number;
  quarter: number;
  totalMembers: KpiMetric;
  attendanceRate: KpiMetric;
  averageScore: KpiMetric;
  activityParticipation: KpiMetric;
  riskMembers: KpiMetric;
}

export interface BranchPerformance {
  branchName: string;
  level: number;
  totalMembers: number;
  attendanceRate: number;
  averageScore: number;
  activityRate: number;
  riskCount: number;
  healthScore: number;
  rank: number;
  medal: string;
}

export interface ExecutiveTopMember {
  id: number;
  name: string;
  parish: string;
  branch: string;
  overallScore: number;
  score: number;
  attendanceRate: number;
  activityRate: number;
  rankText: string;
  rank: number;
  medal: string;
}

export interface AttendanceTrendPoint {
  date: string;
  label: string;
  all: number;
  [key: string]: string | number;
}

export interface ExecutiveActivity {
  id: number;
  name: string;
  date: string;
  joinedCount: number;
  totalMembers: number;
  participationRate: number;
}

export interface ExecutiveRiskMember {
  id: number;
  fullName: string;
  parish: string;
  branch: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  absentCount: number;
  averageGrade: number | null;
  reasons: string[];
}

export interface DashboardQueryParams {
  year?: number;
  quarter?: number;
  branch?: string;
  sortBy?: 'overall' | 'attendance' | 'score' | 'activity';
  limit?: number;
}
