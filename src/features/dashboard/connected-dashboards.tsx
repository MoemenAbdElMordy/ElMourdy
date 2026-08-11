import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BookOpen, CheckCircle, Clock, RotateCcw, Star, Users, Video } from "lucide-react";
import type { Navigate } from "../../app/routing/types";
import { ApiError } from "../../shared/api/client";
import {
  loadAuditLogs,
  loadDashboard,
  type AuditLog,
  type ManagementDashboardData,
  type StudentDashboardData,
} from "../../shared/dashboard/api";
import { Badge2, Card2, StatCard } from "../../shared/ui";

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
  const stats = data.statistics;
  const progress = stats.total_lectures ? Math.round((stats.completed_lectures / stats.total_lectures) * 100) : 0;
  const activated = stats.active_access_grants > 0;
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black">أهلًا، {authUser?.name?.split(" ")[0] ?? "طالبنا"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {data.enrollment ? `${data.enrollment.grade} — ${data.enrollment.academic_year}` : "لا يوجد تسجيل دراسي نشط"}
            </p>
          </div>
          <Badge2 variant={activated ? "success" : "warning"}>{activated ? "يوجد محتوى مفعّل" : "لا يوجد محتوى مدفوع مفعّل"}</Badge2>
        </div>
        {!activated && (
          <Card2 className="mb-5 border-yellow-300">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="text-yellow-600 shrink-0" size={18} />
              <div><strong>يمكنك مشاهدة المحتوى المجاني الآن.</strong><p className="text-sm text-muted-foreground mt-1">فعّل كود درس للوصول إلى المحتوى المدفوع.</p></div>
              <button onClick={() => nav("activation")} className="mr-auto text-primary text-sm font-bold">التفعيل</button>
            </div>
          </Card2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="المحاضرات المكتملة" value={`${stats.completed_lectures}/${stats.total_lectures}`} icon={CheckCircle} />
          <StatCard label="أعلى درجة" value={stats.highest_score == null ? "—" : `${Math.round(stats.highest_score)}%`} icon={Star} />
          <StatCard label="المواد المسجلة" value={stats.subjects_count} icon={BookOpen} />
          <StatCard label="المحاولات المتبقية" value={stats.attempts_remaining} icon={RotateCcw} />
        </div>
        <Card2 className="mb-5">
          <div className="flex justify-between text-sm font-bold mb-2"><span>التقدم الإجمالي</span><span>{progress}%</span></div>
          <div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} /></div>
        </Card2>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="flex justify-between"><h2 className="font-black">موادي</h2><button className="text-primary text-sm" onClick={() => nav("subjects")}>عرض الكل</button></div>
            {data.subjects.map((subject) => {
              const subjectProgress = subject.total_lectures ? Math.round((subject.completed_lectures / subject.total_lectures) * 100) : 0;
              return <Card2 key={subject.id} className="cursor-pointer" onClick={() => nav("subjects")}>
                <div className="flex justify-between gap-4"><div><strong>{subject.title}</strong><p className="text-xs text-muted-foreground mt-1">{subject.completed_lectures} من {subject.total_lectures} محاضرة</p></div><Badge2 variant="primary">{subjectProgress}%</Badge2></div>
              </Card2>;
            })}
            {data.subjects.length === 0 && <Card2><p className="text-sm text-muted-foreground">لم يُنشر محتوى لهذا الصف بعد.</p></Card2>}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><h2 className="font-black">الإعلانات</h2><button className="text-primary text-sm" onClick={() => nav("announcements")}>عرض الكل</button></div>
            {data.announcements.map((item) => <Card2 key={item.id}><strong className="text-sm">{item.title}</strong><p className="text-xs text-muted-foreground mt-2 line-clamp-3">{item.body}</p></Card2>)}
            {data.announcements.length === 0 && <Card2><p className="text-sm text-muted-foreground">لا توجد إعلانات جديدة.</p></Card2>}
          </div>
        </div>
      </div>
    </div>
  );
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
  const stats = data.statistics;
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between gap-3 mb-6"><div><h1 className="text-2xl font-black">{role === "teacher" ? "لوحة قيادة المنصة" : "لوحة المساعد"}</h1><p className="text-sm text-muted-foreground mt-1">بيانات حقيقية ومحدّثة من المنصة</p></div><Badge2 variant="primary">مباشر</Badge2></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="إجمالي الطلاب" value={stats.total_students} icon={Users} />
          <StatCard label="الطلاب النشطون" value={stats.active_students} icon={CheckCircle} />
          <StatCard label="غير النشطين منذ 30 يومًا" value={stats.inactive_students} icon={Clock} />
          <StatCard label="طلاب يحتاجون متابعة" value={stats.risk_students} icon={AlertTriangle} />
          <StatCard label="طلبات الدعم المعلقة" value={stats.pending_support_requests} icon={Activity} />
          <StatCard label="فيديوهات جاهزة" value={stats.ready_videos} icon={Video} />
          <StatCard label="فيديوهات قيد المعالجة" value={stats.processing_videos} icon={Clock} />
          <StatCard label="محتوى مسودة" value={stats.draft_content} icon={BookOpen} />
        </div>
        {stats.failed_videos > 0 && <Card2 className="mb-5 border-red-300"><div className="flex gap-2 text-red-600"><AlertTriangle size={18}/><strong>{stats.failed_videos} فيديو فشل في المعالجة ويحتاج مراجعة.</strong></div></Card2>}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card2><h2 className="font-black mb-3">أفضل الطلاب</h2>{data.top_students.map((student, index) => <button key={student.id} onClick={() => nav("student-detail", { studentId: student.id })} className="w-full flex justify-between py-2 border-t border-border text-sm"><span>{index + 1}. {student.name}</span><strong>{Math.round(student.highest_score)}%</strong></button>)}{!data.top_students.length && <p className="text-sm text-muted-foreground">لا توجد نتائج حتى الآن.</p>}</Card2>
          <Card2><h2 className="font-black mb-3">آخر محتوى تم تعديله</h2>{data.recent_content.map((item) => <div key={item.id} className="py-2 border-t border-border"><div className="flex justify-between text-sm"><strong>{item.title}</strong><Badge2 variant={item.status === "published" ? "success" : "default"}>{item.status}</Badge2></div><p className="text-xs text-muted-foreground mt-1">{new Date(item.updated_at).toLocaleString("ar-EG")}</p></div>)}{!data.recent_content.length && <p className="text-sm text-muted-foreground">لا يوجد محتوى بعد.</p>}</Card2>
          <Card2><h2 className="font-black mb-3">الأكثر مشاهدة</h2>{data.most_watched.map((item) => <div key={item.id} className="flex justify-between py-2 border-t border-border text-sm"><span>{item.title}</span><strong>{item.views} مشاهدة</strong></div>)}{!data.most_watched.length && <p className="text-sm text-muted-foreground">لا توجد مشاهدات حتى الآن.</p>}</Card2>
        </div>
      </div>
    </div>
  );
}

export function ConnectedAuditLogPage() {
  const [items, setItems] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState("");
  const load = () => { setError(""); loadAuditLogs().then((response) => setItems(response.audit_logs)).catch((reason) => setError(errorMessage(reason))); };
  useEffect(() => { load(); }, []);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!items) return <LoadingState />;
  const descriptions:Record<string,string>={academic_year_created:"أنشأ سنة دراسية جديدة",academic_year_updated:"عدّل بيانات سنة دراسية",academic_year_content_copied:"نسخ محتوى سنة دراسية",academic_year_students_rolled_over:"رحّل الطلاب إلى سنة دراسية جديدة",announcement_created:"نشر إعلانًا جديدًا",announcement_updated:"عدّل إعلانًا",announcement_deleted:"حذف إعلانًا",student_status_updated:"غيّر حالة حساب طالب",student_enrollment_updated:"غيّر الصف أو السنة الدراسية لطالب",student_password_reset:"غيّر كلمة مرور طالب",student_parent_phone_updated:"غيّر رقم ولي أمر طالب",student_device_removed:"أزال جهازًا مسجلًا لطالب",support_request_approved:"وافق على طلب دعم",support_request_rejected:"رفض طلب دعم",session_started:"سجّل الدخول إلى المنصة",session_ended:"سجّل الخروج من المنصة",item_created:"أضاف عنصرًا جديدًا",item_updated:"عدّل بيانات موجودة",item_removed:"حذف أو أزال عنصرًا",operation_completed:"أكمل عملية",video_processing_retried:"أعاد محاولة معالجة فيديو",request_reviewed:"راجع طلبًا",administrative_action:"نفّذ إجراءً إداريًا"};
  const sections:Record<string,string>={academic_years:"السنوات الدراسية",announcements:"الإعلانات",students:"إدارة الطلاب",support_requests:"طلبات الدعم",content:"المحتوى",videos:"الفيديوهات",exams:"الاختبارات",activation_codes:"أكواد التفعيل",lesson_access:"صلاحيات الدروس",account:"الحساب",platform_management:"إدارة المنصة"};
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-5xl mx-auto"><div className="mb-6"><h1 className="text-2xl font-black">متابعة نشاط المساعدين</h1><p className="mt-1 text-sm text-muted-foreground">يعرض الإجراءات الإدارية التي نفذها المساعدون فقط، دون إظهار بيانات الطلاب.</p></div><Card2 className="!p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-3 text-right">المساعد</th><th className="p-3 text-right">ما قام به</th><th className="p-3 text-right">القسم</th><th className="p-3 text-right">الوقت</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-border"><td className="p-3 font-semibold">{item.assistant.name}</td><td className="p-3">{descriptions[item.description_key]||descriptions.administrative_action}</td><td className="p-3"><Badge2 variant="primary">{sections[item.section_key]||sections.platform_management}</Badge2></td><td className="p-3 whitespace-nowrap">{new Date(item.created_at).toLocaleString("ar-EG")}</td></tr>)}</tbody></table></div>{items.length === 0 && <p className="p-8 text-center text-muted-foreground">لم ينفذ المساعدون أي إجراءات إدارية حتى الآن.</p>}</Card2></div></div>;
}
