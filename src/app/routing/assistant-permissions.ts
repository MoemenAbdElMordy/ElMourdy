import type { AppRoute } from "./types";

export const assistantRoutePermissions: Partial<Record<AppRoute, string>> = {
  "students-list": "manage_students",
  "student-detail": "manage_students",
  "content-subjects": "manage_content",
  "support-requests": "manage_support_requests",
  "announcements-admin": "manage_announcements",
  "audit-log": "view_reports",
  "academic-years": "manage_academic_years",
  "exam-manage": "manage_exams",
  "homework-manage": "manage_homeworks",
  "activation-codes": "manage_codes",
  "management-reports": "view_reports",
};

export function assistantCanOpen(route: AppRoute, permissions: string[]): boolean {
  const required = assistantRoutePermissions[route];
  return !required || permissions.includes(required);
}
