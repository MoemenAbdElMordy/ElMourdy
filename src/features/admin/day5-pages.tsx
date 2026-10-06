import { DetailSection } from "../../shared/ui/detail-section";
import { normalizeNumericInput } from "../../shared/auth/numeric-input";
import { useEffect, useState } from "react";
import { YearCollection, YearGradeCollection } from './year-collection';
import { AssistantDirectory } from './assistant-directory';
import { StudentDirectory } from './student-directory';
import { CalendarDays, ChevronRight, Download, Eye, Plus, Search, Shield, Trash2 } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { archiveAssistant, copyAcademicYearContent, createAcademicYear, createAssistant, exportStudent, exportStudents, loadAcademicYears, loadAssistants, loadGrades, loadStudent, loadStudents, removeStudentDevice, resetStudentPassword, rolloverAcademicYearStudents, updateAcademicYear, updateAssistant, updateStudentEnrollment, updateStudentParentPhone, updateStudentStatus, type AcademicYear, type AssistantRecord, type Grade, type StudentRecord } from "../../shared/admin/day5";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Select2, StatCard, notify } from "../../shared/ui";
import { createManualGrant, loadAccessGrants, revokeGrant, type AccessGrant } from "../../shared/activation-codes/api";
import { loadCurriculum, type Curriculum } from "../../shared/curriculum/api";
import { emptyPagination, PaginationControls, type PaginationMeta } from "../../shared/pagination";
import { assessmentScope, watchPercent, watchPercentValue, watchStatus, watchTime } from "./student-progress";

const permissionLabels: Record<string, string> = {
  manage_students: "إدارة الطلاب",
  manage_parent_phone: "تغيير رقم ولي الأمر",
  manage_devices: "إدارة الأجهزة",
  manage_support_requests: "طلبات الدعم",
  manage_content: "إدارة المحتوى",
  upload_videos: "رفع الفيديو",
  manage_exams: "إدارة الاختبارات",
  manage_homeworks: "إدارة الواجبات",
  manage_codes: "إدارة الأكواد",
  manage_announcements: "إدارة الإعلانات",
  view_reports: "عرض التقارير",
  manage_academic_years: "إدارة السنوات الدراسية",
};
const gradeLabel = (level?: number, name?: string) => (level === 1 ? "الصف الأول الثانوي" : level === 2 ? "الصف الثاني الثانوي" : level === 3 ? "الصف الثالث الثانوي" : name || "—");

export function Day5StudentsListPage({ nav }: any) {
  const [directoryMode, setDirectoryMode] = useState<'cards'|'table'>('cards');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [query, setQuery] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const refresh = () => {
    setLoading(true);
    loadStudents({ query, gradeId, status, page })
      .then((r) => { setStudents(r.students); setPagination(r.pagination); })
      .catch((e) => notify(e instanceof ApiError ? e.message : "تعذر تحميل الطلاب", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    loadGrades().then((r) => setGrades(r.grades));
  }, []);
  useEffect(() => {
    const timer = setTimeout(refresh, 250);
    return () => clearTimeout(timer);
  }, [query, gradeId, status, page]);
  useEffect(() => { setPage(1); }, [query, gradeId, status]);
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-black">قائمة الطلاب</h1>
          <div className="flex items-center gap-2"><Btn size="sm" variant="outline" onClick={()=>exportStudents({query,gradeId,status}).catch(()=>notify("تعذر تصدير تقرير الطلاب","error"))}><Download size={14}/> تنزيل وورد</Btn><Badge2 variant="primary">{pagination.total_count} طالب</Badge2></div>
        </div>
        <Card2 className="mb-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="بحث">
              <div className="relative">
                <Search size={15} className="absolute right-3 top-3 text-muted-foreground" />
                <input aria-label="بحث" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="الاسم أو رقم الهاتف أو البريد الإلكتروني" className="w-full pr-9 px-3 py-2.5 rounded-xl border border-border bg-background" />
              </div>
            </Field>
            <Select2
              label="الصف"
              value={gradeId}
              onChange={(e: any) => setGradeId(e.target.value)}
              options={[
                { value: "", label: "كل الصفوف" },
                ...grades.map((g) => ({
                  value: String(g.id),
                  label: gradeLabel(g.level, g.name),
                })),
              ]}
            />
            <Select2
              label="الحالة"
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              options={[
                { value: "", label: "كل الحالات" },
                { value: "active", label: "نشط" },
                { value: "suspended", label: "موقوف" },
              ]}
            />
          </div>
        </Card2>
        <div className="directory-toolbar"><p>كل طالب له حكاية. افتح ملفه وشوف تفاصيل تقدّمه.</p><div><button aria-pressed={directoryMode==='cards'} onClick={()=>setDirectoryMode('cards')}>بطاقات الطلاب</button><button aria-pressed={directoryMode==='table'} onClick={()=>setDirectoryMode('table')}>عرض الجدول</button></div></div>
        {directoryMode==='cards'&&<StudentDirectory students={students} onOpen={id=>nav('student-detail',{studentId:id})}/>}
        <Card2 className={directoryMode==='table'?'!p-0 overflow-hidden':'!p-0 border-0 bg-transparent shadow-none'}>
          {directoryMode==='table'&&<div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-right p-3">الطالب</th>
                  <th className="text-right p-3">الصف</th>
                  <th className="text-right p-3">المحافظة</th>
                  <th className="text-right p-3">السنتر</th>
                  <th className="text-right p-3">السنة</th>
                  <th className="text-center p-3">الحالة</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="p-3">
                      <strong>{student.name}</strong>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {student.phone}
                      </div>
                    </td>
                    <td className="p-3">{student.grade || "—"}</td>
                    <td className="p-3">{student.governorate || "—"}</td>
                    <td className="p-3">{student.center_name || "—"}</td>
                    <td className="p-3">{student.academic_year || "—"}</td>
                    <td className="p-3 text-center">
                      <Badge2 variant={student.status === "active" ? "success" : "danger"}>{student.status === "active" ? "نشط" : "موقوف"}</Badge2>
                    </td>
                    <td className="p-3">
                      <button aria-label={`عرض ${student.name}`} onClick={() => nav("student-detail", { studentId: student.id })}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>}
          {!loading && students.length === 0 && <p className="p-8 text-center text-muted-foreground">لا توجد نتائج مطابقة</p>}
          {loading && <p className="p-8 text-center text-muted-foreground">جارٍ التحميل…</p>}
        </Card2>
        <PaginationControls pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}

export function Day5StudentDetailPage({ nav, params, authUser }: any) {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [tree, setTree] = useState<Curriculum | null>(null);
  const [grantModal, setGrantModal] = useState(false);
  const [lessonId, setLessonId] = useState(0);
  const [expiresOn, setExpiresOn] = useState("");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollmentModal, setEnrollmentModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [parentPhoneModal, setParentPhoneModal] = useState(false);
  const [academicYearId, setAcademicYearId] = useState(0);
  const [gradeId, setGradeId] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [videoFilter, setVideoFilter] = useState<"all" | "watched" | "unwatched" | "completed">("all");
  const canManageCodes = authUser?.role === "teacher" || authUser?.permissions?.includes("manage_codes");
  const canManageParentPhone = authUser?.role === "teacher" || authUser?.permissions?.includes("manage_parent_phone");
  const canManageDevices = authUser?.role === "teacher" || authUser?.permissions?.includes("manage_devices");
  const refresh = () =>
    loadStudent(Number(params?.studentId))
      .then(async (r) => {
        setStudent(r.student);
        if (canManageCodes) {
          const [grantData, curriculumData] = await Promise.all([
            loadAccessGrants(r.student.id),
            loadCurriculum({
              academicYearId: r.student.academic_year_id,
              gradeId: r.student.grade_id,
            }),
          ]);
          setGrants(grantData.access_grants);
          setTree(curriculumData.curriculum);
          const first = curriculumData.curriculum.branches[0]?.chapters[0]?.lessons[0]?.id ?? 0;
          setLessonId(first);
        }
      })
      .catch((e) => notify(e instanceof ApiError ? e.message : "تعذر تحميل الطالب", "error"));
  useEffect(() => {
    void refresh();
    loadAcademicYears().then((response) => {
      setYears(response.academic_years);
      setGrades(response.grades);
    });
  }, [params?.studentId]);
  if (!student) return <div className="p-8 text-center">جارٍ تحميل بيانات الطالب…</div>;
  const toggle = async () => {
    const next = student.status === "active" ? "suspended" : "active";
    const response = await updateStudentStatus(student.id, next);
    setStudent(response.student);
    notify(next === "active" ? "تمت إعادة تفعيل الطالب" : "تم إيقاف الطالب وإنهاء جلساته", "success");
  };
  const lessons =
    tree?.branches.flatMap((branch) =>
      branch.chapters.flatMap((chapter) =>
        chapter.lessons.map((lesson) => ({
          id: lesson.id,
          label: `${branch.title} — ${chapter.title} — ${lesson.title}`,
        })),
      ),
    ) ?? [];
  const grantAccess = async () => {
    await createManualGrant({
      student_user_id: student.id,
      lesson_id: lessonId,
      academic_year_id: student.academic_year_id,
      expires_on: expiresOn,
    });
    setGrantModal(false);
    await refresh();
    notify("تم منح صلاحية الوصول", "success");
  };
  const revoke = async (id: number) => {
    await revokeGrant(id);
    await refresh();
    notify("تم إلغاء صلاحية الوصول", "success");
  };
  const visibleVideos = (student.video_progress ?? []).filter((video) =>
    videoFilter === "all" ||
    (videoFilter === "watched" && watchStatus(video.progress_percent) === "watched") ||
    (videoFilter === "unwatched" && watchStatus(video.progress_percent) === "not_watched") ||
    (videoFilter === "completed" && watchStatus(video.progress_percent) === "partial")
  );
  const formatDateTime = (value?:string|null) => value ? new Date(value).toLocaleString("ar-EG") : "—";
  const assessmentStatus = {not_started:"لم يبدأ",in_progress:"قيد الحل",submitted:"تم التسليم"} as const;
  const resultStatus = {passed:"ناجح",risk:"يحتاج متابعة",failed:"راسب"} as const;
  const rows: Array<[string, string | undefined]> = [
    ["الصف", student.grade],
    ["السنة الدراسية", student.academic_year],
    ["المحافظة", student.governorate],
    ["المدرسة", student.school],
    ["السنتر", student.center_name],
    ["هاتف الطالب", student.phone],
    ["هاتف ولي الأمر", student.parent_phone],
    ["البريد", student.email],
    ["حالة تفعيل الحساب", student.account_verified ? "مفعّل" : "غير مفعّل"],
    ["تاريخ التفعيل", formatDateTime(student.verified_at)],
    ["تاريخ إنشاء الحساب", formatDateTime(student.created_at)],
    ["آخر تسجيل دخول", formatDateTime(student.last_login_at)],
    ["آخر نشاط", formatDateTime(student.last_active_at)],
    ["الجلسات النشطة", String(student.active_sessions_count ?? 0)],
    ["إجمالي الجلسات", String(student.total_sessions_count ?? 0)],
    ["عدد الأجهزة النشطة", String(student.devices_count ?? 0)],
  ];
  const openEnrollment = () => {
    setAcademicYearId(student.academic_year_id ?? years.find((year) => year.status === "active")?.id ?? 0);
    setGradeId(student.grade_id ?? grades[0]?.id ?? 0);
    setEnrollmentModal(true);
  };
  const saveEnrollment = async () => {
    const response = await updateStudentEnrollment(student.id, academicYearId, gradeId);
    setStudent(response.student);
    setEnrollmentModal(false);
    notify("تم تحديث تسجيل الطالب الدراسي", "success");
  };
  const savePassword = async () => {
    await resetStudentPassword(student.id, newPassword);
    setNewPassword("");
    setPasswordModal(false);
    notify("تم تغيير كلمة المرور وإنهاء جلسات الطالب القديمة", "success");
  };
  const openParentPhone = () => {
    setNewParentPhone(student.parent_phone || "");
    setParentPhoneModal(true);
  };
  const saveParentPhone = async () => {
    try {
      const response = await updateStudentParentPhone(student.id, newParentPhone);
      setStudent(response.student);
      setParentPhoneModal(false);
      notify("تم تحديث رقم ولي الأمر وربط حسابه بالطالب", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر تحديث رقم ولي الأمر", "error");
    }
  };
  const removeDevice = async (deviceId: number) => {
    if (!window.confirm("هل تريد إزالة هذا الجهاز وإنهاء جلساته؟")) return;
    try {
      await removeStudentDevice(student.id, deviceId);
      await refresh();
      notify("تمت إزالة الجهاز وإنهاء جلساته", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر إزالة الجهاز", "error");
    }
  };
  return (
    <div className="workspace student-dossier">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => nav("students-list")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ChevronRight size={15} /> العودة للقائمة
        </button>
        <Card2 className="student-dossier-identity">
          <div className="flex justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-black">{student.name}</h1>
              <Badge2 variant={student.status === "active" ? "success" : "danger"}>{student.status === "active" ? "نشط" : "موقوف"}</Badge2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="outline" onClick={()=>exportStudent(student.id).catch(()=>notify("تعذر تصدير تقرير الطالب","error"))}><Download size={14}/> تقرير وورد</Btn>
              {authUser?.role === "teacher" && <Btn variant="outline" onClick={() => nav("student-preview", { studentId: student.id })}><Eye size={14}/> معاينة كطالب</Btn>}
              <Btn variant="outline" onClick={openEnrollment}>تغيير الصف أو السنة</Btn>
              {canManageParentPhone && <Btn variant="outline" onClick={openParentPhone}>تغيير رقم ولي الأمر</Btn>}
              <Btn variant="outline" onClick={() => setPasswordModal(true)}>تغيير كلمة المرور</Btn>
              <Btn variant={student.status === "active" ? "danger" : "primary"} onClick={toggle}>
                {student.status === "active" ? "إيقاف الحساب" : "إعادة التفعيل"}
              </Btn>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {rows.map(([label, value]) => (
              <div key={label} className="p-3 rounded-xl bg-muted">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-semibold mt-1" dir={label.includes("هاتف") || label === "البريد" ? "ltr" : undefined}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>
        </Card2>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <StatCard label="محاضرات مكتملة" value={student.progress?.completed_lectures ?? 0} icon={Eye} />
          <StatCard label="محاضرات تمت مشاهدتها" value={student.progress?.watched_lectures ?? 0} icon={CalendarDays} />
          <StatCard label="أعلى نتيجة" value={student.progress?.highest_score == null ? "—" : `${Math.round(student.progress.highest_score)}%`} icon={Shield} />
        </div>
        <DetailSection title="الواجبات والاختبارات" description="التكليفات المخصصة للطالب ونتائجها">
        {(["homework", "exam"] as const).map((kind) => {
          const items = (student.assessments ?? []).filter((assessment) => assessment.assessment_type === kind);
          return <Card2 className="mt-4" key={kind}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-black">{kind === "homework" ? "تقرير الواجبات" : "تقرير الاختبارات"}</h2><p className="mt-1 text-xs text-muted-foreground">يشمل كل ما هو مخصص لصف الطالب، سواء بدأه أم لم يبدأه.</p></div><Badge2 variant="primary">{items.length} {kind === "homework" ? "واجب" : "اختبار"}</Badge2></div>
            <div className="space-y-3">{items.map((assessment) => <div key={assessment.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><strong>{assessment.title}</strong><p className="mt-1 text-xs text-muted-foreground">{assessmentScope(assessment.scope)} • {assessment.questions_count} سؤال</p></div><Badge2 variant={assessment.status === "submitted" ? "success" : assessment.status === "in_progress" ? "warning" : "default"}>{assessmentStatus[assessment.status]}</Badge2></div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><span>المحاولات: <b>{assessment.attempts_count} من {assessment.max_attempts}</b></span><span>أفضل نتيجة: <b>{assessment.best_percent == null ? "—" : `${Math.round(assessment.best_percent)}%`}</b></span><span>آخر نتيجة: <b>{assessment.latest_percent == null ? "—" : `${Math.round(assessment.latest_percent)}%`}</b></span></div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>أول بدء: {formatDateTime(assessment.first_started_at)}</span><span>آخر نشاط: {formatDateTime(assessment.last_activity_at)}</span>{assessment.latest_result_status && <span>الحالة: {resultStatus[assessment.latest_result_status as keyof typeof resultStatus] ?? assessment.latest_result_status}</span>}</div>
            </div>)}{!items.length && <p className="py-4 text-center text-sm text-muted-foreground">لا توجد عناصر منشورة مخصصة لصف الطالب.</p>}</div>
          </Card2>;
        })}
        </DetailSection>
        <DetailSection title="متابعة المشاهدة" description="المحاضرات التي شاهدها الطالب ونسبة المشاهدة الفعلية">
        <Card2 className="mt-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-black">تقدم مشاهدة المحاضرات</h2><p className="mt-1 text-xs text-muted-foreground">كل فيديو متاح للصف الحالي وحالة مشاهدة الطالب الفعلية.</p></div>
            <div className="flex flex-wrap gap-2">{([['all','الكل'],['watched','شاهدها ٧٥٪ فأكثر'],['completed','مشاهدة جزئية ٢٠–٧٤٪'],['unwatched','لم يشاهدها أقل من ٢٠٪']] as const).map(([value,label])=><Btn key={value} size="sm" variant={videoFilter===value?"primary":"outline"} onClick={()=>setVideoFilter(value)}>{label}</Btn>)}</div>
          </div>
          <div className="space-y-3">
            {visibleVideos.map(video=><div key={video.lecture_id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><strong>{video.title}</strong><p className="mt-1 text-xs text-muted-foreground">{[video.branch,video.chapter,video.lesson].filter(Boolean).join(" — ")}</p></div><Badge2 variant={watchStatus(video.progress_percent)==="watched"?"success":watchStatus(video.progress_percent)==="partial"?"warning":"default"}>{watchStatus(video.progress_percent)==="watched"?"شاهدها":watchStatus(video.progress_percent)==="partial"?"مشاهدة جزئية":"لم يشاهدها"}</Badge2></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${watchPercentValue(video.progress_percent)}%`}} /></div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{watchPercent(video.progress_percent)} مشاهدة فعلية</span><span>{watchTime(video.watched_seconds)} من {watchTime(video.duration_seconds)}</span><span>توقف عند: {watchTime(video.last_position_seconds)}</span><span>{video.last_watched_at?`آخر فتح للفيديو: ${new Date(video.last_watched_at).toLocaleDateString("ar-EG")}`:"لم يبدأ بعد"}</span></div>
            </div>)}
            {!visibleVideos.length&&<p className="py-5 text-center text-sm text-muted-foreground">لا توجد محاضرات في هذا التصنيف.</p>}
          </div>
        </Card2>
        </DetailSection>
        <DetailSection title="الأجهزة والجلسات" description="الأجهزة المسجلة وإجراءات إدارتها حسب صلاحياتك">
        <Card2 className="mt-4">
          <h2 className="font-black mb-3">الأجهزة</h2>
          {student.devices?.map((device) => <div key={device.id} className="flex items-center justify-between gap-3 py-2 border-t border-border text-sm"><span className="flex-1">{device.name || [device.browser, device.os].filter(Boolean).join(" — ") || `جهاز ${device.id}`}</span><Badge2 variant={device.status === "active" ? "success" : "default"}>{device.status === "active" ? "نشط" : device.status === "removed" ? "تمت إزالته" : "محظور"}</Badge2>{canManageDevices && device.status === "active" && <Btn size="sm" variant="danger" onClick={() => removeDevice(device.id)}><Trash2 size={14}/> إزالة</Btn>}</div>)}
          {!student.devices?.length && <p className="text-sm text-muted-foreground">لا توجد أجهزة مسجلة.</p>}
        </Card2>
        </DetailSection>
        <DetailSection title="سجل المحاولات" description="التاريخ التفصيلي لمحاولات الحل">
        <Card2 className="mt-4">
          <h2 className="font-black mb-3">سجل محاولات الواجبات والاختبارات</h2>
          {student.attempts?.map((attempt) => <div key={attempt.id} className="grid gap-2 border-t border-border py-3 text-sm sm:grid-cols-[1fr_auto_auto]"><div><strong>{attempt.exam_title}</strong><p className="text-xs text-muted-foreground">{attempt.assessment_type === "homework" ? "واجب" : "اختبار"} • المحاولة رقم {attempt.attempt_number}</p></div><span>{attempt.percent == null ? assessmentStatus[attempt.status as keyof typeof assessmentStatus] ?? attempt.status : `${Math.round(attempt.percent)}% — ${resultStatus[attempt.result_status as keyof typeof resultStatus] ?? attempt.result_status}`}</span><span className="text-xs text-muted-foreground">{formatDateTime(attempt.submitted_at ?? attempt.started_at)}</span></div>)}
          {!student.attempts?.length && <p className="text-sm text-muted-foreground">لا توجد محاولات حتى الآن.</p>}
        </Card2>
        </DetailSection>
        {canManageCodes && (
          <Card2 className="mt-4">
            <div className="flex justify-between mb-3">
              <h2 className="font-black">صلاحيات الدروس</h2>
              <Btn size="sm" onClick={() => setGrantModal(true)}>
                منح صلاحية
              </Btn>
            </div>
            {grants.map((grant) => (
              <div key={grant.id} className="flex justify-between items-center border-t border-border py-3">
                <div>
                  <strong>{grant.lesson}</strong>
                  <p className="text-xs text-muted-foreground">
                    {grant.source === "manual" ? "يدوي" : "كود"} — حتى {grant.expires_on}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge2 variant={grant.status === "active" ? "success" : "default"}>{grant.status === "active" ? "نشط" : "ملغي"}</Badge2>
                  {grant.status === "active" && (
                    <Btn size="sm" variant="outline" onClick={() => revoke(grant.id)}>
                      إلغاء
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </Card2>
        )}
        <Modal2 open={grantModal} onClose={() => setGrantModal(false)} title="منح صلاحية درس" onSubmit={grantAccess}>
          <div className="space-y-3">
            <Select2
              label="الدرس"
              value={String(lessonId)}
              onChange={(e: any) => setLessonId(Number(e.target.value))}
              options={lessons.map((lesson) => ({
                value: String(lesson.id),
                label: lesson.label,
              }))}
            />
            <Input2 label="تاريخ الانتهاء" type="date" value={expiresOn} onInput={(event: any) => setExpiresOn(event.currentTarget.value)} />
            <Btn type="submit" className="w-full" disabled={!lessonId || !expiresOn}>
              منح الصلاحية
            </Btn>
          </div>
        </Modal2>
        <Modal2 open={enrollmentModal} onClose={() => setEnrollmentModal(false)} title="تغيير التسجيل الدراسي" onSubmit={saveEnrollment}>
          <div className="space-y-3">
            <Select2 label="السنة الدراسية" value={String(academicYearId)} onChange={(e: any) => setAcademicYearId(Number(e.target.value))} options={years.map((year) => ({ value: String(year.id), label: year.name }))} />
            <Select2 label="الصف" value={String(gradeId)} onChange={(e: any) => setGradeId(Number(e.target.value))} options={grades.map((grade) => ({ value: String(grade.id), label: gradeLabel(grade.level, grade.name) }))} />
            <Btn type="submit" className="w-full" disabled={!academicYearId || !gradeId}>حفظ التسجيل</Btn>
          </div>
        </Modal2>
        <Modal2 open={passwordModal} onClose={() => setPasswordModal(false)} title="تغيير كلمة مرور الطالب" onSubmit={savePassword}>
          <div className="space-y-3">
            <Input2 label="كلمة المرور الجديدة" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Btn type="submit" className="w-full" disabled={newPassword.length < 8}>حفظ كلمة المرور</Btn>
          </div>
        </Modal2>
        <Modal2 open={parentPhoneModal} onClose={() => setParentPhoneModal(false)} title="تغيير رقم ولي الأمر" onSubmit={saveParentPhone}>
          <div className="space-y-3">
            <Input2 label="رقم ولي الأمر الجديد" value={newParentPhone} dir="ltr" onChange={(e) => setNewParentPhone(e.target.value)} />
            <p className="text-xs text-muted-foreground">إذا كان للرقم حساب ولي أمر موثق، سيتم ربط الطالب به تلقائيًا.</p>
            <Btn type="submit" className="w-full" disabled={!newParentPhone.trim() || newParentPhone === student.phone}>حفظ رقم ولي الأمر</Btn>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

export function Day5AcademicYearsPage({ nav }: any) {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [sourceYearId, setSourceYearId] = useState(0);
  const [modal, setModal] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    starts_on: "",
    ends_on: "",
    status: "active",
  });
  const refresh = () =>
    loadAcademicYears()
      .then((r) => {
        setYears(r.academic_years);
        setSourceYearId((current) => current || r.academic_years.find((year) => year.status === "active")?.id || r.academic_years[0]?.id || 0);
      })
      .catch((e) => notify(e instanceof ApiError ? e.message : "تعذر تحميل السنوات", "error"));
  useEffect(() => {
    void refresh();
  }, []);
  const save = async () => {
    await createAcademicYear(form);
    setModal(false);
    setForm({ name: "", starts_on: "", ends_on: "", status: "active" });
    await refresh();
    notify("تم إنشاء السنة الدراسية", "success");
  };
  const archive = async (year: AcademicYear) => {
    try {
      await updateAcademicYear(year.id, { status: "archived" });
      await refresh();
      notify("تمت أرشفة السنة الدراسية", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر أرشفة السنة", "error");
    }
  };
  const copyContent = async (target: AcademicYear) => {
    try {
      const response = await copyAcademicYearContent(target.id, sourceYearId);
      notify(`تم نسخ ${response.copied_branches_count} مادة إلى السنة الجديدة`, "success");
      await refresh();
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر نسخ المنهج", "error");
    }
  };
  const rolloverStudents = async (target: AcademicYear) => {
    if (!window.confirm("سيتم نقل الطلاب للصف التالي وتفعيل السنة الجديدة. هل تريد الاستمرار؟")) return;
    try {
      const response = await rolloverAcademicYearStudents(target.id, sourceYearId);
      notify(`تم نقل ${response.moved_count} طالب، وإنهاء تسجيل ${response.graduated_count} طالب`, "success");
      await refresh();
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر ترحيل الطلاب", "error");
    }
  };
  const selectedYear = years.find((year) => year.id === selectedYearId);
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-5">
          <h1 className="text-2xl font-black">السنوات الدراسية</h1>
          <Btn onClick={() => setModal(true)}>
            <Plus size={15} /> سنة جديدة
          </Btn>
        </div>
        {years.length > 1 && <Card2 className="mb-4"><Select2 label="السنة المصدر لنسخ المنهج أو ترحيل الطلاب" value={String(sourceYearId)} onChange={(e: any) => setSourceYearId(Number(e.target.value))} options={years.map((year) => ({ value: String(year.id), label: year.name }))} /></Card2>}
        {selectedYear ? <div>
          <button type="button" onClick={() => setSelectedYearId(null)} className="mb-3 flex items-center gap-1 text-sm text-primary"><ChevronRight size={15}/> العودة إلى السنوات</button>
          <Card2 className="mb-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{selectedYear.name}</h2><p className="mt-1 text-sm text-muted-foreground">اختر الصف لعرض بياناته أو فتح تقريره التفصيلي</p></div><Badge2 variant={selectedYear.status === "active" ? "success" : "default"}>{selectedYear.status === "active" ? "السنة الحالية" : "سنة مؤرشفة"}</Badge2></div></Card2>
          <YearGradeCollection year={selectedYear} onNavigate={nav}/>
        </div> : <YearCollection years={years} onSelect={setSelectedYearId} actions={year=><>
          {year.status === "draft" && sourceYearId !== year.id && <Btn size="sm" variant="outline" onClick={() => copyContent(year)}>نسخ هيكل المنهج</Btn>}
          {year.status === "draft" && sourceYearId !== year.id && <Btn size="sm" onClick={() => rolloverStudents(year)}>ترحيل الطلاب وتفعيل السنة</Btn>}
          {year.status === "active" && <Btn size="sm" variant="outline" onClick={() => archive(year)}>أرشفة</Btn>}
        </>}/>}
        <Modal2 open={modal} onClose={() => setModal(false)} title="إنشاء سنة دراسية" onSubmit={save}>
          <div className="space-y-3">
            <Input2 label="اسم السنة" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
            <Input2
              label="تاريخ البداية"
              type="date"
              value={form.starts_on}
              onInput={(e: any) => {
                const value = e.currentTarget.value;
                setForm((v) => ({ ...v, starts_on: value }));
              }}
            />
            <Input2
              label="تاريخ النهاية"
              type="date"
              value={form.ends_on}
              onInput={(e: any) => {
                const value = e.currentTarget.value;
                setForm((v) => ({ ...v, ends_on: value }));
              }}
            />
            <Btn type="submit" className="w-full" disabled={!form.name || !form.starts_on || !form.ends_on}>
              إنشاء السنة
            </Btn>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

export function Day5AssistantsPage() {
  const [assistants, setAssistants] = useState<AssistantRecord[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AssistantRecord | null>(null);
  const empty = {
    name: "",
    phone: "",
    email: "",
    title: "",
    password: "",
    status: "active" as AssistantRecord["status"],
    permissions: [] as string[],
  };
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; email?: string }>({});
  const refresh = () =>
    loadAssistants(page)
      .then((r) => {
        setAssistants(r.assistants);
        setKeys(r.permission_keys);
        setPagination(r.pagination);
      })
      .catch((e) => notify(e instanceof ApiError ? e.message : "تعذر تحميل المساعدين", "error"));
  useEffect(() => {
    void refresh();
  }, [page]);
  const open = (assistant?: AssistantRecord) => {
    setFieldErrors({});
    setEditing(assistant || null);
    setForm(
      assistant
        ? {
            name: assistant.name,
            phone: assistant.phone,
            email: assistant.email || "",
            title: assistant.title || "",
            password: "",
            status: assistant.status,
            permissions: assistant.permissions,
          }
        : empty,
    );
    setModal(true);
  };
  const save = async () => {
    setFieldErrors({});
    try {
      if (editing)
        await updateAssistant(editing.id, {
        name: form.name,
        email: form.email.trim() ? form.email.trim().toLowerCase() : null,
        title: form.title,
        status: form.status,
        permissions: form.permissions,
        ...(form.password ? { password: form.password, password_confirmation: form.password } : {}),
        });
      else await createAssistant({ ...form, name: form.name.trim(), email: form.email.trim() ? form.email.trim().toLowerCase() : null, password_confirmation: form.password });
    } catch (error) {
      if (error instanceof ApiError) {
        const message = error.rawMessage.toLowerCase();
        const phone = message.includes("phone e164 has already been taken") ? "رقم الهاتف مستخدم في حساب آخر" :
          message.includes("phone number is invalid") ? "أدخل رقم هاتف صحيحًا" : undefined;
        const email = message.includes("email has already been taken") ? "البريد الإلكتروني مستخدم في حساب آخر؛ استخدم بريدًا مختلفًا أو اتركه فارغًا" :
          message.includes("email is invalid") ? "أدخل بريدًا إلكترونيًا صحيحًا" : undefined;
        if (phone || email) { setFieldErrors({ phone, email }); return; }
      }
      throw error;
    }
    setModal(false);
    await refresh();
    notify(editing ? "تم تحديث المساعد" : "تم إنشاء حساب المساعد", "success");
  };
  const archive = async (assistant: AssistantRecord) => {
    if (!window.confirm(`هل تريد أرشفة حساب ${assistant.name} وإنهاء كل جلساته؟`)) return;
    try {
      await archiveAssistant(assistant.id);
      await refresh();
      notify("تمت أرشفة حساب المساعد وإنهاء جلساته", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر أرشفة حساب المساعد", "error");
    }
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-5">
          <h1 className="text-2xl font-black">المساعدون</h1>
          <Btn onClick={() => open()}>
            <Plus size={15} /> إضافة مساعد
          </Btn>
        </div>
        <AssistantDirectory assistants={assistants} labels={permissionLabels} onEdit={open} onArchive={archive}/>
        <PaginationControls pagination={pagination} onPageChange={setPage} />
        <Modal2 open={modal} onClose={() => setModal(false)} title={editing ? "تعديل المساعد" : "إضافة مساعد"} onSubmit={save}>
          <div className="space-y-3">
            <Input2 label="الاسم" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
            <Input2 label="الهاتف" type="tel" inputMode="tel" value={form.phone} disabled={!!editing} dir="ltr" error={fieldErrors.phone} onChange={(e) => { const value=e.target.value; setForm((v) => ({ ...v, phone: value.trimStart().startsWith("+") ? `+${normalizeNumericInput(value,15)}` : normalizeNumericInput(value,15) })); setFieldErrors(current=>({...current,phone:undefined})); }} />
            <Input2 label="البريد الإلكتروني (اختياري)" type="email" value={form.email} dir="ltr" error={fieldErrors.email} onChange={(e) => { setForm((v) => ({ ...v, email: e.target.value })); setFieldErrors(current=>({...current,email:undefined})); }} />
            <Input2 label="المسمى الوظيفي" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
            {editing && <Select2 label="حالة الحساب" value={form.status} onChange={(e: any) => setForm((v) => ({ ...v, status: e.target.value as AssistantRecord["status"] }))} options={[{value:"active",label:"نشط"},{value:"suspended",label:"موقوف"},{value:"archived",label:"مؤرشف"}]} />}
            <Input2 label={editing ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور المؤقتة"} type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} />
            <Field label="الصلاحيات">
              <div className="grid sm:grid-cols-2 gap-2">
                {keys.map((key) => (
                  <label key={key} className="permission-choice text-xs flex gap-2">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(key)}
                      onChange={(e) =>
                        setForm((v) => ({
                          ...v,
                          permissions: e.target.checked ? [...v.permissions, key] : v.permissions.filter((x) => x !== key),
                        }))
                      }
                    />
                    {permissionLabels[key] || key}
                  </label>
                ))}
              </div>
            </Field>
            <Btn type="submit" className="w-full" disabled={!form.name.trim() || (!editing && (!form.phone.trim() || form.password.length < 8)) || (!!editing && form.password.length > 0 && form.password.length < 8)}>
              حفظ
            </Btn>
          </div>
        </Modal2>
      </div>
    </div>
  );
}
