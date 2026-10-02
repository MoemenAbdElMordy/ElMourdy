import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Navigate } from "../../app/routing/types";
import { ApiError } from "../../shared/api/client";
import {
  loadAuditLogs,
  loadDashboard,
  type AuditLog,
  type ManagementDashboardData,
  type StudentDashboardData,
} from "../../shared/dashboard/api";
import { Badge2, Card2 } from "../../shared/ui";
import { StudentWorkspace, ManagementWorkspace } from "./workspace-views";
import { emptyPagination, PaginationControls, type PaginationMeta } from "../../shared/pagination";

const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : "تعذر تحميل البيانات";

function LoadingState() {
  return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">جارٍ تحميل البيانات…</div>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="min-h-[60vh] grid place-items-center px-4"><Card2 className="max-w-md text-center"><AlertTriangle className="mx-auto mb-3 text-red-500"/><p className="mb-4">{message}</p><button className="btn-primary" onClick={retry}>إعادة المحاولة</button></Card2></div>;
}

export function ConnectedStudentDashboard({ nav, authUser }: { nav: Navigate; authUser?: { name?: string } | null }) {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    loadDashboard()
      .then((response) => {
        if (response.dashboard.role === "student") setData(response.dashboard);
        else setError("هذا الحساب لا يملك صلاحية لوحة الطالب");
      })
      .catch((reason) => setError(errorMessage(reason)));
  };
  useEffect(() => {
    load();
  }, []);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState />;
  return <StudentWorkspace data={data} nav={nav} name={authUser?.name}/>;
}

export function ConnectedManagementDashboard({ nav, role }: { nav: Navigate; role: "teacher" | "assistant" }) {
  const [data, setData] = useState<ManagementDashboardData | null>(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    loadDashboard()
      .then((response) => {
        if (response.dashboard.role !== "student") setData(response.dashboard);
        else setError("هذا الحساب لا يملك صلاحية لوحة الإدارة");
      })
      .catch((reason) => setError(errorMessage(reason)));
  };
  useEffect(() => {
    load();
  }, []);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState />;
  return <ManagementWorkspace data={data} nav={nav} role={role}/>;
}

export function ConnectedAuditLogPage() {
  const [items, setItems] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState("");
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  const load = () => { setError(""); loadAuditLogs(page).then((response) => {setItems(response.audit_logs);setPagination(response.pagination);}).catch((reason) => setError(errorMessage(reason))); };
  useEffect(() => { load(); }, [page]);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!items) return <LoadingState />;
  const descriptions:Record<string,string>={academic_year_created:"أنشأ سنة دراسية جديدة",academic_year_updated:"عدّل بيانات سنة دراسية",academic_year_content_copied:"نسخ محتوى سنة دراسية",academic_year_students_rolled_over:"رحّل الطلاب إلى سنة دراسية جديدة",announcement_created:"نشر إعلانًا جديدًا",announcement_updated:"عدّل إعلانًا",announcement_deleted:"حذف إعلانًا",student_status_updated:"غيّر حالة حساب طالب",student_enrollment_updated:"غيّر الصف أو السنة الدراسية لطالب",student_password_reset:"غيّر كلمة مرور طالب",student_parent_phone_updated:"غيّر رقم ولي أمر طالب",student_device_removed:"أزال جهازًا مسجلًا لطالب",support_request_approved:"وافق على طلب دعم",support_request_rejected:"رفض طلب دعم",session_started:"سجّل الدخول إلى المنصة",session_ended:"سجّل الخروج من المنصة",item_created:"أضاف عنصرًا جديدًا",item_updated:"عدّل بيانات موجودة",item_removed:"حذف أو أزال عنصرًا",operation_completed:"أكمل عملية",video_processing_retried:"أعاد محاولة معالجة فيديو",request_reviewed:"راجع طلبًا",administrative_action:"نفّذ إجراءً إداريًا"};
  const sections:Record<string,string>={academic_years:"السنوات الدراسية",announcements:"الإعلانات",students:"إدارة الطلاب",support_requests:"طلبات الدعم",content:"المحتوى",videos:"الفيديوهات",exams:"الاختبارات",activation_codes:"أكواد التفعيل",lesson_access:"صلاحيات الدروس",account:"الحساب",platform_management:"إدارة المنصة"};
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-5xl mx-auto"><div className="mb-6"><h1 className="text-2xl font-black">متابعة نشاط المساعدين</h1><p className="mt-1 text-sm text-muted-foreground">يعرض الإجراءات الإدارية التي نفذها المساعدون فقط، دون إظهار بيانات الطلاب.</p></div><div className="audit-timeline">{items.map(item=><article key={item.id}><span className="audit-timeline-dot" aria-hidden="true"/><div><header><strong>{item.assistant.name}</strong><Badge2 variant="primary">{sections[item.section_key]||sections.platform_management}</Badge2></header><p>{descriptions[item.description_key]||descriptions.administrative_action}</p><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("ar-EG")}</time></div></article>)}{!items.length&&<Card2><p>لم ينفذ المساعدون أي إجراءات إدارية حتى الآن.</p></Card2>}</div><PaginationControls pagination={pagination} onPageChange={setPage}/></div></div>;
}
