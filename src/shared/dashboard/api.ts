import { apiRequest } from "../api/client";

export type StudentDashboardData = {
  role: "student";
  enrollment: { academic_year: string; grade: string; grade_level: number } | null;
  statistics: {
    total_lectures: number;
    completed_lectures: number;
    highest_score: number | null;
    subjects_count: number;
    attempts_remaining: number;
    active_access_grants: number;
  };
  subjects: Array<{ id: number; title: string; total_lectures: number; completed_lectures: number }>;
  announcements: Array<{ id: number; title: string; body: string; publish_at?: string | null }>;
};

export type ManagementDashboardData = {
  role: "teacher" | "assistant";
  statistics: {
    total_students: number;
    active_students: number;
    inactive_students: number;
    risk_students: number;
    pending_support_requests: number;
    ready_videos: number;
    processing_videos: number;
    failed_videos: number;
    draft_content: number;
  };
  top_students: Array<{ id: number; name: string; highest_score: number }>;
  recent_content: Array<{ id: number; title: string; status: string; updated_at: string }>;
  most_watched: Array<{ id: number; title: string; views: number }>;
};

export type DashboardData = StudentDashboardData | ManagementDashboardData;

export type AuditLog = {
  id: number;
  description_key: string;
  section_key: string;
  assistant: { id: number; name: string };
  created_at: string;
};

export const loadDashboard = () => apiRequest<{ dashboard: DashboardData }>("/dashboard");
export const loadAuditLogs = () => apiRequest<{ audit_logs: AuditLog[] }>("/audit_logs");
