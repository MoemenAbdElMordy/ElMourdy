export type Role = "guest" | "student" | "parent" | "teacher" | "assistant";

export type RouteParams = {
  lessonId?: number;
  lectureId?: number;
  subjectId?: number;
  chapterId?: number;
  studentId?: number;
  parentId?: number;
  examId?: number;
  attemptId?: number;
  jumpToLectures?: boolean;
  phone?: string;
  verificationRole?: "student" | "parent";
};

export type AppRoute =
  | "not-found"
  | "home"
  | "login"
  | "register"
  | "parent-register"
  | "otp"
  | "forgot"
  | "free-content"
  | "about"
  | "arabic-secondary"
  | "arabic-first-secondary"
  | "arabic-second-secondary"
  | "arabic-third-secondary"
  | "nahw-secondary"
  | "balagha-secondary"
  | "student-dashboard"
  | "subjects"
  | "chapters"
  | "lessons"
  | "video"
  | "exam"
  | "homeworks"
  | "exam-result"
  | "error-review"
  | "progress"
  | "announcements"
  | "activation"
  | "student-settings"
  | "parent-dashboard"
  | "parent-results"
  | "parent-errors"
  | "admin-dashboard"
  | "assistant-dashboard"
  | "students-list"
  | "student-detail"
  | "parents-list"
  | "parent-detail"
  | "student-preview"
  | "management-reports"
  | "content-subjects"
  | "exam-manage"
  | "homework-manage"
  | "activation-codes"
  | "announcements-admin"
  | "assistants"
  | "audit-log"
  | "support-requests"
  | "academic-years";

export type Navigate = (route: AppRoute, params?: RouteParams, asRole?: Role) => void;
