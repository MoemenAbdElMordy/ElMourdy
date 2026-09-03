import type { AppRoute, RouteParams } from "./types";

const routes = new Set<AppRoute>([
  "not-found",
  "home", "login", "register", "parent-register", "otp", "forgot", "free-content", "about",
  "arabic-secondary", "arabic-first-secondary", "arabic-second-secondary", "arabic-third-secondary", "nahw-secondary", "balagha-secondary",
  "student-dashboard", "subjects", "chapters", "lessons", "video", "exam", "homeworks",
  "exam-result", "error-review", "progress", "announcements", "activation", "student-settings",
  "parent-dashboard", "parent-results", "parent-errors", "admin-dashboard",
  "assistant-dashboard", "students-list", "student-detail", "content-subjects",
  "parents-list", "parent-detail", "student-preview", "management-reports",
  "exam-manage", "homework-manage", "activation-codes", "announcements-admin", "assistants", "audit-log", "support-requests", "academic-years",
]);

export function parseLocation(): { route: AppRoute; params: RouteParams } {
  const legacyHash = window.location.hash.replace(/^#\/?/, "");
  const raw = legacyHash || window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!raw) return { route: "home", params: {} };

  const [candidate, idPart, modifier] = raw.split("/");
  const route = routes.has(candidate as AppRoute) ? candidate as AppRoute : "not-found";
  const id = Number.parseInt(idPart, 10);
  const params: RouteParams = {};

  if (Number.isFinite(id)) {
    if (route === "video") params.lessonId = id;
    if (route === "chapters") params.subjectId = id;
    if (route === "lessons") params.chapterId = id;
    if (route === "student-detail") params.studentId = id;
    if (route === "student-preview") params.studentId = id;
    if (route === "parent-detail") params.parentId = id;
    if (route === "exam") params.examId = id;
    if (["exam-result", "error-review", "parent-errors"].includes(route)) params.attemptId = id;
  }
  if (modifier === "lectures") params.jumpToLectures = true;

  return { route, params };
}

export function routeToPath(route: AppRoute, params: RouteParams): string {
  const id = route === "lessons" ? params.chapterId :
    route === "chapters" ? params.subjectId :
      route === "student-detail" ? params.studentId :
        route === "student-preview" ? params.studentId :
          route === "parent-detail" ? params.parentId :
        route === "exam" ? params.examId :
          ["exam-result", "error-review", "parent-errors"].includes(route) ? params.attemptId : params.lessonId;
  const suffix = params.jumpToLectures ? `/${id ?? 0}/lectures` : id ? `/${id}` : "";
  return route === "home" ? "/" : `/${route}${suffix}`;
}

export const parseHash = parseLocation;
export const routeToHash = (route: AppRoute, params: RouteParams) => routeToPath(route, params).replace(/^\//, "");
