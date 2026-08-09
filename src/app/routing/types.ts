export type Role = "guest" | "student" | "parent" | "teacher" | "assistant";

export type RouteParams = {
  lessonId?: number;
  lectureId?: number;
  subjectId?: number;
  chapterId?: number;
  studentId?: number;
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
  | "student-dashboard"
  | "subjects"
  | "chapters"
  | "lessons"
  | "video"
  | "exam"
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
  | "content-subjects"
  | "exam-manage"
  | "activation-codes"
  | "announcements-admin"
  | "assistants"
  | "audit-log"
  | "support-requests"
  | "academic-years";

export type Navigate = (route: AppRoute, params?: RouteParams, asRole?: Role) => void;
