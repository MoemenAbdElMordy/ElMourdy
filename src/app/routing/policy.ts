import type { AppRoute, Role } from "./types";

export const ROUTE_POLICY: Record<AppRoute, readonly Role[]> = {
  "not-found": ["guest", "student", "parent", "teacher", "assistant"],
  home: ["guest", "student", "parent", "teacher", "assistant"],
  login: ["guest", "student", "parent", "teacher", "assistant"],
  register: ["guest"],
  "parent-register": ["guest"],
  otp: ["guest"],
  forgot: ["guest"],
  "free-content": ["guest", "student", "parent", "teacher", "assistant"],
  about: ["guest", "student", "parent", "teacher", "assistant"],
  "student-dashboard": ["student"],
  subjects: ["student"],
  chapters: ["student"],
  lessons: ["student"],
  video: ["student", "teacher", "assistant"],
  exam: ["student"],
  "exam-result": ["student"],
  "error-review": ["student", "parent"],
  progress: ["student"],
  announcements: ["student", "parent", "teacher", "assistant"],
  activation: ["student"],
  "student-settings": ["student"],
  "parent-dashboard": ["parent"],
  "parent-results": ["parent"],
  "parent-errors": ["parent"],
  "admin-dashboard": ["teacher", "assistant"],
  "assistant-dashboard": ["assistant"],
  "students-list": ["teacher", "assistant"],
  "student-detail": ["teacher", "assistant"],
  "content-subjects": ["teacher", "assistant"],
  "exam-manage": ["teacher"],
  "activation-codes": ["teacher"],
  "announcements-admin": ["teacher", "assistant"],
  assistants: ["teacher"],
  "audit-log": ["teacher"],
  "support-requests": ["teacher", "assistant"],
  "academic-years": ["teacher"],
};

export const ROLE_DEFAULT: Record<Role, AppRoute> = {
  guest: "home",
  student: "student-dashboard",
  parent: "parent-dashboard",
  teacher: "admin-dashboard",
  assistant: "admin-dashboard",
};

export function canAccess(role: Role, route: AppRoute): boolean {
  return ROUTE_POLICY[route].includes(role);
}
