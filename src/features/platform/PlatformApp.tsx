/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import {
  Moon, Sun, Menu, X, ChevronRight, ChevronDown, ChevronLeft,
  Play, Lock, CheckCircle, XCircle, Clock, Award, BookOpen,
  Users, LogOut, Bell, Search,
  Plus, Edit2, Trash2, Eye, Download, AlertTriangle,
  Info, RotateCcw, Home, FileText, Video, Key, Shield,
  Activity, Star, UserCheck, UserX,
  Copy, Printer, RefreshCw, Check, AlertCircle, Upload
} from "lucide-react";
import { parseLocation, routeToPath } from "../../app/routing/hash-router";
import { canAccess, ROLE_DEFAULT } from "../../app/routing/policy";
import type { AppRoute, Navigate, Role, RouteParams } from "../../app/routing/types";
import { AboutPage, HomePage, LoginPage, RegisterPage, ParentRegisterPage, OTPPage, ForgotPage, FreeContentPage } from "../public/pages";
import { AccountVerificationGate } from "../public/account-verification-gate";
import { StudentSettingsPage } from "../student/settings-page";
import { ConnectedVideoPage } from "../student/connected-video-page";
import { ParentDashboard } from "../parent/pages";
import { Day5AcademicYearsPage, Day5AssistantsPage, Day5StudentDetailPage, Day5StudentsListPage } from "../admin/day5-pages";
import { CurriculumManagePage } from "../admin/curriculum-page";
import { StudentCurriculumPage } from "../student/curriculum-pages";
import { ConnectedActivationCodesPage } from "../admin/activation-codes-page";
import { ConnectedActivationPage } from "../student/activation-page";
import { ConnectedAnnouncementsPage, ConnectedAttemptResultPage, ConnectedExamManagePage, ConnectedHomeworksPage, ConnectedResultsPage, ConnectedStudentExamPage, ConnectedSupportRequestsPage } from "../learning/connected-pages";
import { ConnectedAuditLogPage, ConnectedManagementDashboard, ConnectedStudentDashboard } from "../dashboard/connected-dashboards";
import { ManagementReportsPage, ParentDetailPage, ParentsListPage, StudentPreviewPage } from "../admin/teacher-control-pages";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Pager, Select2, StatCard, ToastContainer, cn, notify } from "../../shared/ui";
import { login, logout, restoreSession, type AuthUser } from "../../shared/auth/session";
import { loadAnnouncements, type Announcement } from "../../shared/learning/api";

// ============================================================
// ACCESS DENIED
// ============================================================
type ShellProps = {
  role: Role;
  nav: Navigate;
  dark: boolean;
  setDark: Dispatch<SetStateAction<boolean>>;
  setRole: Dispatch<SetStateAction<Role>>;
  onLogout: () => Promise<void>;
  authUser: AuthUser | null;
};
type NavItem = {l:string;view:AppRoute};

function AccessDenied({ role, nav }: Pick<ShellProps,"role"|"nav">) {
  const dest = ROLE_DEFAULT[role as Role] || "home";
  const label = role==="student"?"لوحة الطالب":role==="parent"?"لوحة الأهل":role==="teacher"?"لوحة الأستاذ":role==="assistant"?"لوحة المساعد":"الصفحة الرئيسية";
  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center p-6" role="alert" aria-live="assertive">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-muted-foreground"/>
        </div>
        <h2 className="text-lg font-black mb-2">وصول غير مصرح به</h2>
        <p className="text-sm text-muted-foreground mb-5">لا تملك صلاحية الوصول إلى هذه الصفحة بدورك الحالي.</p>
        <Btn onClick={() => nav(dest)} className="w-full">العودة إلى {label}</Btn>
      </div>
    </div>
  );
}

function NotFoundPage({ nav }: Pick<ShellProps,"nav">) {
  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-7xl font-black text-primary/20 mb-3">404</div>
        <h1 className="text-xl font-black mb-2">الصفحة غير موجودة</h1>
        <p className="text-sm text-muted-foreground mb-5">الرابط الذي فتحته غير صحيح أو لم يعد متاحًا.</p>
        <Btn className="w-full" onClick={() => nav("home")}>العودة إلى الصفحة الرئيسية</Btn>
      </div>
    </div>
  );
}

// ============================================================
// TOP BAR
// ============================================================
function TopBar({ role, nav, dark, setDark, setRole, onLogout, authUser }: ShellProps) {
  const [mob, setMob] = useState(false);
  const [notif, setNotif] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (role === "guest") {
      setAnnouncements([]);
      return;
    }
    loadAnnouncements().then((response) => setAnnouncements(response.announcements.slice(0, 3))).catch(() => setAnnouncements([]));
  }, [role]);

  const links: Record<Role,NavItem[]> = {
    guest:    [{ l:"الرئيسية",view:"home"},{ l:"المحتوى المجاني",view:"free-content"},{ l:"من نحن",view:"about"}],
    student:  [{ l:"لوحتي",view:"student-dashboard"},{ l:"موادي",view:"subjects"},{ l:"واجباتي",view:"homeworks"},{ l:"تقدمي",view:"progress"},{ l:"الإعلانات",view:"announcements"},{ l:"التفعيل",view:"activation"},{ l:"الإعدادات",view:"student-settings"}],
    parent:   [{ l:"لوحة الأهل",view:"parent-dashboard"},{ l:"النتائج والمحاولات",view:"parent-results"}],
    teacher:  [{ l:"لوحة القيادة",view:"admin-dashboard"},{ l:"الطلاب",view:"students-list"},{ l:"أولياء الأمور",view:"parents-list"},{ l:"التقارير",view:"management-reports"},{ l:"المحتوى",view:"content-subjects"},{ l:"السنوات",view:"academic-years"},{ l:"الاختبارات",view:"exam-manage"},{ l:"الواجبات",view:"homework-manage"},{ l:"الأكواد",view:"activation-codes"},{ l:"طلبات الدعم",view:"support-requests"},{ l:"الإعلانات",view:"announcements-admin"},{ l:"المساعدون",view:"assistants"},{ l:"نشاط المساعدين",view:"audit-log"}],
    assistant:[{ l:"لوحتي",view:"admin-dashboard"},{ l:"الطلاب",view:"students-list"},{ l:"التقارير",view:"management-reports"},{ l:"المحتوى",view:"content-subjects"},{ l:"السنوات",view:"academic-years"},{ l:"الاختبارات",view:"exam-manage"},{ l:"الواجبات",view:"homework-manage"},{ l:"الأكواد",view:"activation-codes"},{ l:"طلبات الدعم",view:"support-requests"},{ l:"الإعلانات",view:"announcements-admin"},{ l:"نشاط المساعدين",view:"audit-log"}],
  };
  const assistantRoutePermissions: Partial<Record<AppRoute, string>> = {
    "students-list": "manage_students",
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
  const navLinks = (links[role] || []).filter((link) => {
    if (role !== "assistant") return true;
    const permission = assistantRoutePermissions[link.view];
    return !permission || authUser?.permissions.includes(permission);
  });
  const homeView = role==="student"?"student-dashboard":role==="parent"?"parent-dashboard":role==="teacher"||role==="assistant"?"admin-dashboard":"home";

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <a href={routeToPath(homeView, {})} onClick={(event) => { event.preventDefault(); nav(homeView); }} className="flex items-center gap-3 shrink-0">
          <img src="/images/mourdy-logo.png" alt="شعار منصة المرضي" className="h-10 w-10 rounded-full object-cover shadow-sm" width="40" height="40" />
          <div className="hidden sm:block leading-tight">
            <div className="font-black text-sm text-foreground">منصة المرضي</div>
            <div className="text-[10px] text-muted-foreground">خادم لغة أهل الجنة</div>
          </div>
        </a>

        <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map(l => (
            <a key={l.view} href={routeToPath(l.view, {})} onClick={(event) => { event.preventDefault(); nav(l.view); }} className="px-3 py-2 rounded-xl text-sm font-medium hover:bg-accent transition-colors whitespace-nowrap">
              {l.l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-xl hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}>
            {dark ? <Sun size={17}/> : <Moon size={17}/>}
          </button>

          {role !== "guest" && (
            <div className="relative">
              <button onClick={() => setNotif(!notif)} className="relative p-2 rounded-xl hover:bg-accent" aria-label="الإشعارات" aria-expanded={notif}>
                <Bell size={17}/>
                {announcements.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>}
              </button>
              {notif && (
                <div className="absolute left-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 p-4">
                  <div className="font-bold mb-3 text-sm">الإشعارات</div>
                  {announcements.map(a => (
                    <div key={a.id} className="py-2 border-b border-border last:border-0">
                      <div className="text-sm font-medium leading-snug">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{new Date(a.publish_at ?? a.created_at).toLocaleDateString("ar-EG")}</div>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-xs text-muted-foreground">لا توجد إشعارات جديدة.</p>}
                </div>
              )}
            </div>
          )}

          {role === "guest" ? (
            <div className="flex items-center gap-1.5">
              <Btn size="sm" variant="ghost" onClick={() => nav("login")}>دخول</Btn>
              <Btn size="sm" onClick={() => nav("register")}>تسجيل</Btn>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl text-xs">
                <Shield size={12} className="text-primary"/>
                <span className="text-primary font-bold">{role==="student"?"طالب":role==="parent"?"ولي أمر":role==="teacher"?"أستاذ":"مساعد"}</span>
              </div>
              <Btn aria-label="تسجيل الخروج" size="sm" variant="ghost" onClick={async () => {
                await onLogout();
                setRole("guest");
                nav("home", {}, "guest");
              }}>
                <LogOut size={15}/>
              </Btn>
            </div>
          )}
          <button onClick={() => setMob(!mob)} className="xl:hidden p-2 rounded-xl hover:bg-accent" aria-label="القائمة الرئيسية" aria-expanded={mob}>
            {mob ? <X size={17}/> : <Menu size={17}/>}
          </button>
        </div>
      </div>
      {mob && (
        <div className="xl:hidden border-t border-border bg-card px-4 py-2 flex flex-col gap-0.5">
          {navLinks.map(l => (
            <a key={l.view} href={routeToPath(l.view, {})} onClick={(event) => { event.preventDefault(); nav(l.view); setMob(false); }} className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent text-right">
              {l.l}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [role, setRole] = useState<Role>("guest");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState<AppRoute>(() => parseLocation().route);
  const [params, setParams] = useState<RouteParams>(() => parseLocation().params);

  useEffect(()=>{
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("dir","rtl");
    document.documentElement.setAttribute("lang","ar");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  },[dark]);

  useEffect(() => {
    const submitFormOnEnter = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.key !== "Enter" ||
        event.isComposing ||
        !(event.target instanceof HTMLInputElement) ||
        ["checkbox", "radio", "file", "button", "submit"].includes(event.target.type) ||
        !event.target.form
      ) return;

      event.preventDefault();
      event.target.form.requestSubmit();
    };

    document.addEventListener("keydown", submitFormOnEnter);
    return () => document.removeEventListener("keydown", submitFormOnEnter);
  }, []);

  useEffect(() => {
    const publicMetadata: Partial<Record<AppRoute, { title: string; description: string; imageAlt: string }>> = {
      home: {
        title: "منصة المرضي | اللغة العربية للمرحلة الثانوية",
        description: "منصة الأستاذ محمود عبدالمرضي لتعليم اللغة العربية لطلاب المرحلة الثانوية من خلال المحاضرات والاختبارات والمتابعة المستمرة.",
        imageAlt: "منصة المرضي لتعليم اللغة العربية للمرحلة الثانوية",
      },
      about: {
        title: "عن الأستاذ محمود عبدالمرضي | منصة المرضي",
        description: "تعرف على الأستاذ محمود عبدالمرضي ومنهج منصة المرضي في شرح اللغة العربية لطلاب المرحلة الثانوية ومتابعة تقدمهم.",
        imageAlt: "الأستاذ محمود عبدالمرضي ومنصة المرضي التعليمية",
      },
      "free-content": {
        title: "محاضرات لغة عربية مجانية للثانوية | منصة المرضي",
        description: "شاهد محاضرات مجانية في اللغة العربية لطلاب المرحلة الثانوية مع الأستاذ محمود عبدالمرضي، وسجّل مجانًا لحفظ تقدم المشاهدة.",
        imageAlt: "محاضرات اللغة العربية المجانية على منصة المرضي",
      },
    };
    const metadata = publicMetadata[view];
    const path = metadata ? routeToPath(view, {}) : "/";
    const canonicalUrl = `https://mourdy.com${path}`;
    document.title = metadata?.title ?? "منصة المرضي";

    const setMeta = (selector: string, content: string) => {
      const element = document.querySelector<HTMLMetaElement>(selector);
      if (element) element.content = content;
    };

    const description = metadata?.description ?? "منصة تعليمية خاصة بطلاب الأستاذ محمود عبدالمرضي.";
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', metadata?.title ?? "منصة المرضي");
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:image:alt"]', metadata?.imageAlt ?? "منصة المرضي");
    setMeta('meta[name="twitter:title"]', metadata?.title ?? "منصة المرضي");
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image:alt"]', metadata?.imageAlt ?? "منصة المرضي");

    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots) robots.content = metadata ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, nofollow";

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
  }, [view]);

  useEffect(() => {
    restoreSession().then((user) => {
      setAuthUser(user);
      setRole(user?.role ?? "guest");
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setAuthUser(null);
      setRole("guest");
      setView("login");
      setParams({});
      window.history.replaceState({}, "", "/login");
      notify("انتهت الجلسة أو تم تسجيل الدخول من جهاز آخر. سجل الدخول مرة أخرى.", "error");
    };
    window.addEventListener("elmourdy:session-expired", handleExpiredSession);
    return () => window.removeEventListener("elmourdy:session-expired", handleExpiredSession);
  }, []);

  // Sync browser back/forward navigation and migrate legacy hash links.
  useEffect(() => {
    const onLocationChange = () => {
      const { route, params: nextParams } = parseLocation();
      setView(route);
      setParams(nextParams);
    };
    if (window.location.hash) {
      const initial = parseLocation();
      window.history.replaceState({}, "", routeToPath(initial.route, initial.params));
    }
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);
    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
    };
  }, []);

  // The optional role keeps navigation decisions consistent during authentication transitions.
  const nav = useCallback((v: AppRoute, p: RouteParams = {}, asRole?: Role) => {
    const effectiveRole = asRole ?? role;
    if (!canAccess(effectiveRole, v)) {
      const dest = ROLE_DEFAULT[effectiveRole];
      setView(dest); setParams({});
      window.history.pushState({}, "", routeToPath(dest, {}));
      window.scrollTo({ top:0, behavior:"smooth" });
      return;
    }
    setView(v);
    setParams(p);
    window.history.pushState({}, "", routeToPath(v, p));
    window.scrollTo({ top:0, behavior:"smooth" });
  },[role]);

  const onLogin = async (phone: string, password: string) => {
    const user = await login(phone, password);
    setAuthUser(user);
    return user;
  };
  const onLogout = async () => {
    await logout();
    setAuthUser(null);
  };
  const ctx = { role, setRole, nav, params, dark, setDark, onLogin, onLogout, authUser, setAuthUser };

  if (!authReady) {
    return <div className="min-h-screen bg-background" role="status" aria-label="جاري تحميل الحساب" />;
  }

  if (authUser && !authUser.verified) {
    return <AccountVerificationGate user={authUser} onVerified={(user) => setAuthUser(user)} onLogout={async () => {
      await onLogout();
      setRole("guest");
      setView("login");
      window.history.replaceState({}, "", "/login");
    }}/>;
  }

  const render = () => {
    const assistantPermissionByRoute: Partial<Record<AppRoute, string>> = {
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
    const requiredPermission = role === "assistant" ? assistantPermissionByRoute[view] : undefined;
    if (!canAccess(role, view) || (requiredPermission && !authUser?.permissions.includes(requiredPermission))) {
      return <AccessDenied role={role} nav={nav}/>;
    }
    switch(view) {
      case "not-found":        return <NotFoundPage {...ctx}/>;
      case "home":             return <HomePage {...ctx}/>;
      case "login":            return <LoginPage {...ctx}/>;
      case "register":         return <RegisterPage {...ctx}/>;
      case "parent-register":  return <ParentRegisterPage {...ctx}/>;
      case "otp":              return <OTPPage {...ctx}/>;
      case "forgot":           return <ForgotPage {...ctx}/>;
      case "free-content":     return <FreeContentPage {...ctx}/>;
      case "about":            return <AboutPage {...ctx}/>;
      case "student-dashboard":return <ConnectedStudentDashboard {...ctx}/>;
      case "subjects":         return <StudentCurriculumPage {...ctx}/>;
      case "chapters":         return <StudentCurriculumPage {...ctx}/>;
      case "lessons":          return <StudentCurriculumPage {...ctx}/>;
      case "video":            return <ConnectedVideoPage {...ctx} role={role}/>;
      case "exam":             return <ConnectedStudentExamPage {...ctx}/>;
      case "homeworks":        return <ConnectedHomeworksPage {...ctx}/>;
      case "exam-result":      return <ConnectedAttemptResultPage {...ctx} role={role}/>;
      case "error-review":     return <ConnectedAttemptResultPage {...ctx} role={role}/>;
      case "progress":         return <ConnectedResultsPage {...ctx} role={role}/>;
      case "announcements":    return <ConnectedAnnouncementsPage/>;
      case "activation":       return <ConnectedActivationPage {...ctx}/>;
      case "student-settings": return <StudentSettingsPage authUser={authUser} setAuthUser={setAuthUser}/>;
      case "parent-dashboard": return <ParentDashboard {...ctx}/>;
      case "parent-results":   return <ConnectedResultsPage {...ctx} role={role}/>;
      case "parent-errors":    return <ConnectedAttemptResultPage {...ctx} role={role}/>;
      case "admin-dashboard":  return <ConnectedManagementDashboard {...ctx} role={role as "teacher" | "assistant"}/>;
      case "assistant-dashboard": return <ConnectedManagementDashboard {...ctx} role="assistant"/>;
      case "students-list":    return <Day5StudentsListPage {...ctx}/>;
      case "student-detail":   return <Day5StudentDetailPage {...ctx}/>;
      case "parents-list":    return <ParentsListPage {...ctx}/>;
      case "parent-detail":   return <ParentDetailPage {...ctx}/>;
      case "student-preview": return <StudentPreviewPage {...ctx}/>;
      case "management-reports": return <ManagementReportsPage {...ctx}/>;
      case "content-subjects": return <CurriculumManagePage {...ctx}/>;
      case "exam-manage":      return <ConnectedExamManagePage/>;
      case "homework-manage":  return <ConnectedExamManagePage assessmentType="homework"/>;
      case "activation-codes": return <ConnectedActivationCodesPage/>;
      case "announcements-admin": return <ConnectedAnnouncementsPage manage/>;
      case "assistants":       return <Day5AssistantsPage/>;
      case "audit-log":        return <ConnectedAuditLogPage/>;
      case "support-requests": return <ConnectedSupportRequestsPage/>;
      case "academic-years":  return <Day5AcademicYearsPage {...ctx}/>;
      default:                 return <NotFoundPage {...ctx}/>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{fontFamily:"'Cairo', sans-serif"}}>
      <a href="#main-content" className="skip-link">تخطي إلى المحتوى الرئيسي</a>
      <TopBar {...ctx}/>
      <main id="main-content" tabIndex={-1}>{render()}</main>
      <ToastContainer/>
    </div>
  );
}
