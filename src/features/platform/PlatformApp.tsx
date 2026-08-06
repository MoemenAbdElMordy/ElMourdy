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
import { parseHash as parseRouteHash, routeToHash } from "../../app/routing/hash-router";
import { canAccess, ROLE_DEFAULT } from "../../app/routing/policy";
import type { AppRoute, Navigate, Role, RouteParams } from "../../app/routing/types";
import { HomePage, LoginPage, RegisterPage, ParentRegisterPage, OTPPage, ForgotPage, FreeContentPage } from "../public/pages";
import { StudentDashboard, SubjectsPage, ChaptersPage, LessonsPage, VideoPage, ExamPage, ExamResultPage, ErrorReviewPage, ProgressPage, AnnouncementsPage, ActivationPage, StudentSettingsPage } from "../student/pages";
import { ParentDashboard, ParentErrorsPage } from "../parent/pages";
import { AdminDashboard, StudentsListPage, StudentDetailPage, ContentManagePage, AssistantDashboard, ExamManagePage, ActivationCodesPage, AnnouncementsAdminPage, AssistantsPage, AuditLogPage, SupportRequestsPage, AcademicYearsPage } from "../admin/pages";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Pager, Select2, StatCard, ToastContainer, cn, notify } from "../../shared/ui";
import {
  GOVERNORATES, GRADES, STUDENTS, SUBJECTS, CHAPTERS, LESSONS,
  EXAM_QS, ANNOUNCEMENTS, ACTIVATION_CODES, AUDIT_LOGS,
  ABWAB, DURUS, MAHADARAT, rn,
} from "../../data/mock-data";
import { login, logout, restoreSession, type AuthUser } from "../../shared/auth/session";

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

  const links: Record<Role,NavItem[]> = {
    guest:    [{ l:"الرئيسية",view:"home"},{ l:"المحتوى المجاني",view:"free-content"},{ l:"من نحن",view:"about"}],
    student:  [{ l:"لوحتي",view:"student-dashboard"},{ l:"موادي",view:"subjects"},{ l:"تقدمي",view:"progress"},{ l:"الإعلانات",view:"announcements"},{ l:"التفعيل",view:"activation"},{ l:"الإعدادات",view:"student-settings"}],
    parent:   [{ l:"لوحة الأهل",view:"parent-dashboard"},{ l:"النتائج والمحاولات",view:"parent-results"}],
    teacher:  [{ l:"لوحة القيادة",view:"admin-dashboard"},{ l:"الطلاب",view:"students-list"},{ l:"المحتوى",view:"content-subjects"},{ l:"السنوات",view:"academic-years"},{ l:"الاختبارات",view:"exam-manage"},{ l:"الأكواد",view:"activation-codes"},{ l:"طلبات الدعم",view:"support-requests"},{ l:"الإعلانات",view:"announcements-admin"},{ l:"المساعدون",view:"assistants"},{ l:"سجل الأحداث",view:"audit-log"}],
    assistant:[{ l:"لوحتي",view:"admin-dashboard"},{ l:"الطلاب",view:"students-list"},{ l:"المحتوى",view:"content-subjects"},{ l:"طلبات الدعم",view:"support-requests"},{ l:"الإعلانات",view:"announcements-admin"}],
  };
  const assistantRoutePermissions: Partial<Record<AppRoute, string>> = {
    "students-list": "manage_students",
    "content-subjects": "manage_content",
    "support-requests": "manage_support_requests",
    "announcements-admin": "manage_announcements",
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
        <button onClick={() => nav(homeView)} className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg">م</div>
          <div className="hidden sm:block leading-tight">
            <div className="font-black text-sm text-foreground">منصة المرضي</div>
            <div className="text-[10px] text-muted-foreground">خادم لغة أهل الجنة</div>
          </div>
        </button>

        <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map(l => (
            <button key={l.view} onClick={() => nav(l.view)} className="px-3 py-2 rounded-xl text-sm font-medium hover:bg-accent transition-colors whitespace-nowrap">
              {l.l}
            </button>
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
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>
              </button>
              {notif && (
                <div className="absolute left-0 top-12 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 p-4">
                  <div className="font-bold mb-3 text-sm">الإشعارات</div>
                  {ANNOUNCEMENTS.slice(0,3).map(a => (
                    <div key={a.id} className="py-2 border-b border-border last:border-0">
                      <div className="text-sm font-medium leading-snug">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.date}</div>
                    </div>
                  ))}
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
            <button key={l.view} onClick={() => { nav(l.view); setMob(false); }} className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent text-right">
              {l.l}
            </button>
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
  // Initialize from hash synchronously so the correct view renders on first paint
  const [view, setView] = useState<AppRoute>(() => parseRouteHash().route);
  const [params, setParams] = useState<RouteParams>(() => parseRouteHash().params);

  useEffect(()=>{
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("dir","rtl");
    document.documentElement.setAttribute("lang","ar");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  },[dark]);

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
      window.location.hash = "login";
      notify("انتهت الجلسة أو تم تسجيل الدخول من جهاز آخر. سجل الدخول مرة أخرى.", "error");
    };
    window.addEventListener("elmourdy:session-expired", handleExpiredSession);
    return () => window.removeEventListener("elmourdy:session-expired", handleExpiredSession);
  }, []);

  // Hash-based routing: sync on back/forward and external hash changes
  useEffect(() => {
    const onHash = () => {
      const { route, params: nextParams } = parseRouteHash();
      setView(route);
      setParams(nextParams);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // nav accepts optional asRole to avoid stale-closure bugs (e.g. DemoRoleSwitcher sets role then calls nav)
  const nav = useCallback((v: AppRoute, p: RouteParams = {}, asRole?: Role) => {
    const effectiveRole = asRole ?? role;
    if (!canAccess(effectiveRole, v)) {
      const dest = ROLE_DEFAULT[effectiveRole];
      setView(dest); setParams({});
      window.location.hash = dest;
      window.scrollTo({ top:0, behavior:"smooth" });
      return;
    }
    setView(v);
    setParams(p);
    window.location.hash = routeToHash(v, p);
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

  const render = () => {
    const assistantPermissionByRoute: Partial<Record<AppRoute, string>> = {
      "students-list": "manage_students",
      "student-detail": "manage_students",
      "content-subjects": "manage_content",
      "support-requests": "manage_support_requests",
      "announcements-admin": "manage_announcements",
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
      case "student-dashboard":return <StudentDashboard {...ctx}/>;
      case "subjects":         return <SubjectsPage {...ctx}/>;
      case "chapters":         return <ChaptersPage {...ctx}/>;
      case "lessons":          return <LessonsPage {...ctx}/>;
      case "video":            return <VideoPage {...ctx} role={role}/>;
      case "exam":             return <ExamPage {...ctx}/>;
      case "exam-result":      return <ExamResultPage {...ctx}/>;
      case "error-review":     return <ErrorReviewPage {...ctx}/>;
      case "progress":         return <ProgressPage {...ctx}/>;
      case "announcements":    return <AnnouncementsPage/>;
      case "activation":       return <ActivationPage {...ctx}/>;
      case "student-settings": return <StudentSettingsPage authUser={authUser} setAuthUser={setAuthUser}/>;
      case "parent-dashboard": return <ParentDashboard {...ctx}/>;
      case "parent-results":   return <ParentDashboard {...ctx}/>;
      case "parent-errors":    return <ParentErrorsPage {...ctx}/>;
      case "admin-dashboard":  return role==="assistant"?<AssistantDashboard {...ctx}/>:<AdminDashboard {...ctx}/>;
      case "assistant-dashboard": return <AssistantDashboard {...ctx}/>;
      case "students-list":    return <StudentsListPage {...ctx}/>;
      case "student-detail":   return <StudentDetailPage {...ctx}/>;
      case "content-subjects": return <ContentManagePage role={role} nav={nav} params={params}/>;
      case "exam-manage":      return <ExamManagePage/>;
      case "activation-codes": return <ActivationCodesPage/>;
      case "announcements-admin": return <AnnouncementsAdminPage/>;
      case "assistants":       return <AssistantsPage/>;
      case "audit-log":        return <AuditLogPage/>;
      case "support-requests": return <SupportRequestsPage/>;
      case "academic-years":  return <AcademicYearsPage/>;
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
