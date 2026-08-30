import { useEffect, useRef, useState } from "react";
import { CheckCircle, Eye, Plus, Send, Trash2, Upload, XCircle } from "lucide-react";
import type { Navigate, Role, RouteParams } from "../../app/routing/types";
import { loadCurriculum } from "../../shared/curriculum/api";
import { loadAcademicYears, loadGrades, loadStudents, type AcademicYear, type Grade, type StudentRecord } from "../../shared/admin/day5";
import {
  createSupportRequest,
  answerExamQuestion,
  deleteAnnouncement,
  loadAnnouncements,
  loadAttempt,
  loadAttempts,
  loadExam,
  loadExams,
  loadSupportRequests,
  importExamDocx,
  reviewSupportRequest,
  saveAnnouncement,
  saveExam,
  startExam,
  submitExam,
  type Announcement,
  type Exam,
  type ExamAttempt,
  type SupportRequest,
} from "../../shared/learning/api";
import {
  Badge2,
  Btn,
  Card2,
  Input2,
  Select2,
  cn,
  notify,
} from "../../shared/ui";
import { emptyPagination, PaginationControls, type PaginationMeta } from "../../shared/pagination";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "تعذر إكمال العملية";
const statusLabel: Record<string, string> = {
  draft: "مسودة",
  published: "منشور",
  hidden: "مخفي",
  archived: "مؤرشف",
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  passed: "ناجح",
  risk: "يحتاج متابعة",
  failed: "راسب",
};
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const richTextHtml = (value: string) =>
  escapeHtml(value)
    .replace(/&lt;u&gt;/gi, "<u>")
    .replace(/&lt;\/u&gt;/gi, "</u>");
function RichText({ value, className = "" }: { value: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: richTextHtml(value) }} />;
}
function RichTextInput({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const underlineSelection = () => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start === end) {
      input.focus();
      return;
    }
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}<u>${selected}</u>${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + 3, start + 3 + selected.length);
    });
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-bold">{label}</label>
        <button
          type="button"
          onClick={underlineSelection}
          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-black underline transition hover:border-primary hover:text-primary"
          title="حدد كلمة أو جملة واضغط لوضع خط تحتها"
        >
          U
        </button>
      </div>
      <textarea
        ref={inputRef}
        required={required}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full min-w-0 max-w-full resize-y rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {value.includes("<u>") && (
        <div className="rounded-xl border border-border/70 bg-background/50 p-2 text-sm">
          <span className="ml-1 text-xs text-muted-foreground">معاينة:</span>
          <RichText value={value} />
        </div>
      )}
    </div>
  );
}

export function ConnectedExamManagePage({ assessmentType = "exam" }: { assessmentType?: "exam" | "homework" }) {
  const isHomework = assessmentType === "homework";
  const [exams, setExams] = useState<Exam[]>([]);
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  const [context, setContext] = useState<{
    yearId: number;
    gradeId: number;
    lessons: { id: number; title: string }[];
  } | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [busy, setBusy] = useState(false);
  const [importWarnings,setImportWarnings]=useState<string[]>([]);
  const blankQuestion = () => ({
    body: "",
    explanation: "",
    choices: ["", "", "", ""],
    correctIndex: null as number|null,
  });
  const blank = () => ({
    title: "",
    duration_minutes: 30,
    max_attempts: 3,
    pass_percent: 60,
    status: "draft",
    show_answers_after_submission: true,
    correct_after_each_answer: false,
    academic_year_id: "",
    grade_id: "",
    grade_ids: [] as string[],
    lesson_id: "",
    questions: [blankQuestion()],
  });
  const [form, setForm] = useState(blank);
  const refresh = () =>
    loadExams({page, assessmentType})
      .then((r) => {setExams(r.exams);setPagination(r.pagination);})
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => { refresh(); }, [page, assessmentType]);
  useEffect(() => {
    loadAcademicYears().then(({academic_years, grades: availableGrades}) => {
      setYears(academic_years);
      setGrades(availableGrades);
      const year = academic_years.find(item => item.status === "active") ?? academic_years[0];
      const grade = availableGrades[0];
      if (year && grade) setForm(current => ({...current, academic_year_id: String(year.id), grade_id: String(grade.id), grade_ids: [String(grade.id)]}));
    }).catch((e) => notify(errorMessage(e), "error"));
  }, []);
  useEffect(() => {
    if (!form.academic_year_id || !form.grade_id) { setContext(null); return; }
    loadCurriculum({academicYearId:Number(form.academic_year_id), gradeId:Number(form.grade_id)})
      .then(({ curriculum }) => {
        const lessons = curriculum.branches.flatMap((b) =>
          b.chapters.flatMap((c) =>
            c.lessons.map((l) => ({
              id: l.id,
              title: `${b.title} — ${c.title} — ${l.title}`,
            })),
          ),
        );
        if (curriculum.academic_year && curriculum.grade)
          setContext({
            yearId: curriculum.academic_year.id,
            gradeId: curriculum.grade.id,
            lessons,
          });
      })
      .catch((e) => notify(errorMessage(e), "error"));
  }, [form.academic_year_id, form.grade_id]);
  const edit = async (exam: Exam) => {
    const full = (await loadExam(exam.id)).exam;
    setEditing(full);
    setForm({
      title: full.title,
      duration_minutes: full.duration_minutes,
      max_attempts: full.max_attempts,
      pass_percent: full.pass_percent,
      status: full.status,
      show_answers_after_submission: full.show_answers_after_submission,
      correct_after_each_answer: full.correct_after_each_answer,
      academic_year_id: String(full.academic_year_id),
      grade_id: String(full.grade_id),
      grade_ids: (full.grade_ids?.length ? full.grade_ids : [full.grade_id]).map(String),
      lesson_id: String(full.lesson_id ?? ""),
      questions: (full.questions ?? []).map((question) => ({
        body: question.body,
        explanation: question.explanation ?? "",
        choices: question.choices.map(choice=>choice.body),
        correctIndex: question.choices.findIndex(choice=>choice.is_correct),
      })),
    });
  };
  const importDocument=async(file?:File)=>{if(!file)return;setBusy(true);try{const response=await importExamDocx(file,assessmentType);setForm(current=>({...current,questions:response.import.questions.map(question=>({body:question.body,explanation:question.explanation??"",choices:question.choices.map(choice=>choice.body),correctIndex:question.correct_choice_index}))}));setImportWarnings(response.import.warnings);notify(`تم استخراج ${response.import.stats.questions_count} سؤالًا للمراجعة`,"success");}catch(error){notify(errorMessage(error),"error");}finally{setBusy(false);}};
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedGradeIds = isHomework ? form.grade_ids : form.grade_id ? [form.grade_id] : [];
    if (!form.academic_year_id || selectedGradeIds.length === 0)
      return notify("اختر السنة الدراسية والصف", "error");
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        assessment_type: assessmentType,
        show_answers_after_submission: form.show_answers_after_submission,
        correct_after_each_answer: form.correct_after_each_answer,
        scope_type: form.lesson_id ? "lesson" : "comprehensive",
        lesson_id: form.lesson_id ? Number(form.lesson_id) : null,
        academic_year_id: Number(form.academic_year_id),
        grade_id: Number(selectedGradeIds[0]),
        grade_ids: selectedGradeIds.map(Number),
        duration_minutes: Number(form.duration_minutes),
        max_attempts: Number(form.max_attempts),
        pass_percent: Number(form.pass_percent),
        risk_from_percent: 50,
        risk_to_percent: 59,
        status: form.status,
        show_result_immediately: true,
        shuffle_questions: true,
        shuffle_choices: true,
        attempt_form_mode: "same_exam",
      };
      if (!editing?.attempts_count) {
        if(form.questions.some(question=>question.correctIndex===null||question.choices.length<2||question.choices.some(choice=>!choice.trim())))return notify("حدد الإجابة الصحيحة وتأكد من اكتمال اختيارين على الأقل لكل سؤال","error");
        payload.questions = form.questions.map((question) => ({
          body: question.body,
          explanation: question.explanation,
          points: 1,
          choices: question.choices.map((body,index)=>({body,is_correct:index===question.correctIndex})),
        }));
      }
      await saveExam(payload, editing?.id);
      notify(editing ? `تم تحديث ${isHomework ? "الواجب" : "الاختبار"}` : `تم إنشاء ${isHomework ? "الواجب" : "الاختبار"}`, "success");
      setEditing(null);
      setForm({...blank(), academic_year_id:form.academic_year_id, grade_id:form.grade_id, grade_ids:form.grade_ids});
      refresh();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      title={isHomework ? "إدارة الواجبات" : "إدارة الاختبارات"}
      subtitle={isHomework ? "إنشاء واجبات اختيارية وتحديد طريقة عرض التصحيح والإجابات" : "إنشاء الاختبارات وربطها بالدروس ومتابعة محاولات الطلاب"}
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <Card2>
          <h2 className="font-bold mb-4">
            {editing ? `تعديل ${isHomework ? "الواجب" : "الاختبار"}` : `${isHomework ? "واجب" : "اختبار"} جديد`}
          </h2>
          {!editing?.attempts_count&&<div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4"><label className="flex cursor-pointer items-center justify-center gap-2 font-bold text-primary"><Upload size={17}/> استيراد الأسئلة من ملف Word أو PDF<input type="file" accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" className="hidden" disabled={busy} onChange={event=>{void importDocument(event.target.files?.[0]);event.target.value="";}}/></label><p className="mt-2 text-center text-xs text-muted-foreground">سيتم استخراج الأسئلة والاختيارات إلى مسودة، ولن يُحفظ شيء قبل مراجعتك وتحديد الإجابات الصحيحة. ملفات PDF المصورة تحتاج إلى نص قابل للتحديد.</p>{importWarnings.length>0&&<div className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-900">راجع الأسئلة المستوردة بعناية؛ بعض أجزاء الملف احتاجت إلى استنتاج تلقائي.</div>}</div>}
          <div className="mb-4 rounded-2xl border border-border bg-background/50 p-3 text-xs text-muted-foreground">
            لتسطير كلمة: حددها داخل السؤال أو الاختيار ثم اضغط زر <span className="font-black underline">U</span>.
            وسيتم عرضها للطالب بخط تحتها.
          </div>
          <form className="space-y-3" onSubmit={submit}>
            <Input2
              label={isHomework ? "عنوان الواجب" : "عنوان الاختبار"}
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className={cn("grid gap-2", isHomework ? "grid-cols-1" : "grid-cols-2")}>
              <Select2
                label="السنة الدراسية"
                value={form.academic_year_id}
                onChange={(e) => setForm({ ...form, academic_year_id: e.target.value, lesson_id: "" })}
                options={[{value:"",label:"اختر السنة"},...years.map(year=>({value:String(year.id),label:year.name}))]}
              />
              {!isHomework && (
                <Select2
                  label="الصف"
                  value={form.grade_id}
                  onChange={(e) => setForm({ ...form, grade_id: e.target.value, grade_ids: e.target.value ? [e.target.value] : [], lesson_id: "" })}
                  options={[{value:"",label:"اختر الصف"},...grades.map(grade=>({value:String(grade.id),label:grade.level===1?"الصف الأول الثانوي":grade.level===2?"الصف الثاني الثانوي":grade.level===3?"الصف الثالث الثانوي":grade.name}))]}
                />
              )}
            </div>
            {isHomework && (
              <div className="rounded-2xl border border-border/80 bg-background/40 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-sm font-bold">الصفوف المستهدفة للواجب</label>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {form.grade_ids.length || 0} محدد
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {grades.map((grade) => {
                    const value = String(grade.id);
                    const checked = form.grade_ids.includes(value);
                    const label = grade.level===1?"الصف الأول الثانوي":grade.level===2?"الصف الثاني الثانوي":grade.level===3?"الصف الثالث الثانوي":grade.name;
                    const toggleGrade = () => {
                      const next = checked
                        ? form.grade_ids.filter((id) => id !== value)
                        : [...form.grade_ids, value];
                      const nextPrimaryGradeId = next[0] ?? "";
                      setForm({
                        ...form,
                        grade_ids: next,
                        grade_id: nextPrimaryGradeId,
                        lesson_id: form.grade_id === nextPrimaryGradeId ? form.lesson_id : "",
                      });
                    };
                    return (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={toggleGrade}
                        aria-pressed={checked}
                        className={cn(
                          "flex min-h-[64px] w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-start text-sm transition hover:border-primary/70 hover:bg-primary/5",
                          checked ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]" : "border-border bg-background/60 text-foreground",
                        )}
                      >
                        <span className="font-bold leading-relaxed">{label}</span>
                        <span className={cn("grid h-6 w-6 place-items-center rounded-full border text-xs", checked ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}>
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  اختر صفًا أو أكثر لنشر نفس الواجب لهم بدون إعادة إنشاء الأسئلة.
                </p>
              </div>
            )}
            <Select2
              label="الدرس المرتبط (اختياري)"
              value={form.lesson_id}
              onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}
              options={[
                { value: "", label: "غير مرتبط بدرس محدد" },
                ...(context?.lessons ?? []).map((l) => ({
                  value: l.id,
                  label: l.title,
                })),
              ]}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input2
                label="المدة بالدقائق"
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: Number(e.target.value) })
                }
              />
              <Input2
                label="المحاولات"
                type="number"
                min="1"
                value={form.max_attempts}
                onChange={(e) =>
                  setForm({ ...form, max_attempts: Number(e.target.value) })
                }
              />
              <Input2
                label="نسبة النجاح"
                type="number"
                min="0"
                max="100"
                value={form.pass_percent}
                onChange={(e) =>
                  setForm({ ...form, pass_percent: Number(e.target.value) })
                }
              />
            </div>
            <Select2
              label="الحالة"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: "draft", label: "مسودة" },
                { value: "published", label: "منشور" },
                { value: "hidden", label: "مخفي" },
              ]}
            />
            {isHomework && (
              <div className="space-y-2 rounded-xl border border-border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.correct_after_each_answer} onChange={(e) => setForm({ ...form, correct_after_each_answer: e.target.checked })}/>
                  تصحيح السؤال فور إجابته
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.show_answers_after_submission} onChange={(e) => setForm({ ...form, show_answers_after_submission: e.target.checked })}/>
                  إظهار الإجابات الصحيحة بعد تسليم الواجب
                </label>
                <p className="text-xs text-muted-foreground">عند تفعيل التصحيح الفوري تُحفظ أول إجابة للسؤال ولا يمكن تجربة الاختيارات حتى الوصول للإجابة الصحيحة.</p>
              </div>
            )}
            {editing?.attempts_count ? (
              <div className="rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800">
                بدأت محاولات الطلاب بالفعل، لذلك يمكن تعديل إعدادات الاختبار فقط
                مع الاحتفاظ بالأسئلة كما هي.
              </div>
            ) : (
              form.questions.map((question, index) => {
                const updateQuestion = (
                  field: "body"|"explanation",
                  value: string,
                ) => {
                  const questions = [...form.questions];
                  questions[index] = { ...question, [field]: value };
                  setForm({ ...form, questions });
                };
                return (
                  <div key={index} className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm">
                        السؤال {index + 1}
                      </div>
                      {form.questions.length > 1 && (
                        <button
                          type="button"
                          aria-label={`حذف السؤال ${index + 1}`}
                          className="text-red-500"
                          onClick={() =>
                            setForm({
                              ...form,
                              questions: form.questions.filter(
                                (_, questionIndex) => questionIndex !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <RichTextInput
                      label="نص السؤال"
                      required
                      value={question.body}
                      onChange={(value) => updateQuestion("body", value)}
                    />
                    <div className="space-y-2"><p className="text-xs font-bold text-muted-foreground">حدد الإجابة الصحيحة</p>{question.choices.map((choice,choiceIndex)=><div key={choiceIndex} className="flex items-start gap-2"><input type="radio" name={`correct-${index}`} aria-label={`الإجابة الصحيحة للسؤال ${index+1} الاختيار ${choiceIndex+1}`} checked={question.correctIndex===choiceIndex} onChange={()=>{const questions=[...form.questions];questions[index]={...question,correctIndex:choiceIndex};setForm({...form,questions});}} className="mt-9"/><div className="min-w-0 flex-1"><RichTextInput label={`الاختيار ${choiceIndex+1}`} required value={choice} onChange={value=>{const choices=[...question.choices];choices[choiceIndex]=value;const questions=[...form.questions];questions[index]={...question,choices};setForm({...form,questions});}} placeholder={`الاختيار ${choiceIndex+1}`} rows={1}/></div>{question.choices.length>2&&<button type="button" className="mt-8" aria-label={`حذف الاختيار ${choiceIndex+1}`} onClick={()=>{const choices=question.choices.filter((_,i)=>i!==choiceIndex);const correctIndex=question.correctIndex===choiceIndex?null:question.correctIndex!==null&&question.correctIndex>choiceIndex?question.correctIndex-1:question.correctIndex;const questions=[...form.questions];questions[index]={...question,choices,correctIndex};setForm({...form,questions});}}><Trash2 size={14} className="text-red-500"/></button>}</div>)}{question.choices.length<8&&<Btn type="button" size="sm" variant="outline" onClick={()=>{const questions=[...form.questions];questions[index]={...question,choices:[...question.choices,""]};setForm({...form,questions});}}><Plus size={13}/> إضافة اختيار</Btn>}</div>
                    <RichTextInput
                      label="شرح الإجابة"
                      value={question.explanation}
                      onChange={(value) => updateQuestion("explanation", value)}
                    />
                  </div>
                );
              })
            )}
            {!editing?.attempts_count && (
              <Btn
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    questions: [...form.questions, blankQuestion()],
                  })
                }
              >
                <Plus size={15} /> إضافة سؤال
              </Btn>
            )}
            <div className="flex gap-2">
              <Btn type="submit" disabled={busy}>
                {busy
                  ? "جاري الحفظ..."
                  : editing
                    ? "حفظ التعديل"
                    : `إنشاء ${isHomework ? "الواجب" : "الاختبار"}`}
              </Btn>
              {editing && (
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm(blank());
                  }}
                >
                  إلغاء
                </Btn>
              )}
            </div>
          </form>
        </Card2>
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card2 key={exam.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exam.duration_minutes} دقيقة • {exam.questions_count} سؤال
                    • {exam.attempts_count} محاولة
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge2
                    variant={
                      exam.status === "published" ? "success" : "warning"
                    }
                  >
                    {statusLabel[exam.status]}
                  </Badge2>
                  <Btn size="sm" variant="outline" onClick={() => edit(exam)}>
                    تعديل
                  </Btn>
                </div>
              </div>
            </Card2>
          ))}
        </div>
        <PaginationControls pagination={pagination} onPageChange={setPage}/>
      </div>
    </Page>
  );
}

export function ConnectedHomeworksPage({ nav }: { nav: Navigate }) {
  const [items,setItems]=useState<Exam[]>([]);
  const [page,setPage]=useState(1);
  const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  useEffect(()=>{loadExams({assessmentType:"homework",page}).then(response=>{setItems(response.exams);setPagination(response.pagination);}).catch(error=>notify(errorMessage(error),"error"));},[page]);
  return <Page title="واجباتي" subtitle="الواجبات المنشورة المرتبطة بصفك الدراسي">
    <div className="grid gap-4 md:grid-cols-2">{items.map(item=><Card2 key={item.id} className="flex flex-col justify-between gap-4">
      <div><h2 className="font-bold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{item.questions_count} سؤال • {item.duration_minutes} دقيقة • {item.max_attempts} محاولة</p></div>
      <Btn onClick={()=>nav("exam",{examId:item.id})}>فتح الواجب</Btn>
    </Card2>)}</div>
    {items.length===0&&<Card2><p className="py-8 text-center text-muted-foreground">لا توجد واجبات منشورة حاليًا.</p></Card2>}
    <PaginationControls pagination={pagination} onPageChange={setPage}/>
  </Page>;
}

export function ConnectedStudentExamPage({
  nav,
  params,
}: {
  nav: Navigate;
  params: RouteParams;
}) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, {is_correct?:boolean;correct_choice_id?:number;explanation?:string|null}>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const request = params.examId
      ? loadExam(params.examId)
      : loadExams({ lessonId: params.lessonId });
    request
      .then((r) => setExam("exam" in r ? r.exam : (r.exams[0] ?? null)))
      .catch((e) => notify(errorMessage(e), "error"));
  }, [params.examId, params.lessonId]);
  const begin = async () => {
    if (!exam) return;
    setBusy(true);
    try {
      setAttempt((await startExam(exam.id)).attempt);
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };
  const finish = async () => {
    if (!attempt) return;
    setBusy(true);
    try {
      const result = (
        await submitExam(
          attempt.id,
          Object.entries(answers).map(([question_id, choice_id]) => ({
            question_id: Number(question_id),
            choice_id,
          })),
        )
      ).attempt;
      nav("exam-result", { attemptId: result.id });
    } catch (e) {
      notify(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  };
  const choose = async (questionId:number, choiceId:number) => {
    if (!attempt || feedback[questionId]) return;
    setAnswers((current) => ({ ...current, [questionId]: choiceId }));
    if (!exam?.correct_after_each_answer) return;
    try {
      const response = await answerExamQuestion(attempt.id, questionId, choiceId);
      setFeedback((current) => ({ ...current, [questionId]: response.answer }));
    } catch (error) {
      notify(errorMessage(error), "error");
    }
  };
  if (!exam)
    return (
      <Page title="التقييم">
        <Card2>لا يوجد تقييم منشور مرتبط بهذا الدرس حاليًا.</Card2>
      </Page>
    );
  if (!attempt)
    return (
      <Page title={exam.title}>
        <Card2 className="max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-3 text-center mb-5">
            <Metric label="المدة" value={`${exam.duration_minutes} دقيقة`} />
            <Metric label="المحاولات" value={String(exam.max_attempts)} />
            <Metric label="النجاح" value={`${exam.pass_percent}%`} />
          </div>
          <Btn className="w-full" onClick={begin} disabled={busy}>
            {busy ? "جاري البدء..." : `ابدأ ${exam.assessment_type === "homework" ? "الواجب" : "الاختبار"}`}
          </Btn>
        </Card2>
      </Page>
    );
  return (
    <Page
      title={attempt.exam_title}
      subtitle={`المحاولة رقم ${attempt.attempt_number}`}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {attempt.questions?.map((q, index) => (
          <Card2 key={q.id}>
            <h3 className="font-bold mb-3">
              {index + 1}. <RichText value={q.body} />
            </h3>
            <div className="space-y-2">
              {q.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={cn(
                    "flex gap-2 p-3 rounded-xl border cursor-pointer",
                    answers[q.id] === choice.id &&
                      "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === choice.id}
                    disabled={Boolean(feedback[q.id])}
                    onChange={() => void choose(q.id, choice.id)}
                  />
                  <RichText value={choice.body} />
                </label>
              ))}
            </div>
            {feedback[q.id] && <div className={cn("mt-3 rounded-xl p-3 text-sm",feedback[q.id].is_correct?"bg-green-100 text-green-900":"bg-red-100 text-red-900")}>
              {feedback[q.id].is_correct ? "إجابة صحيحة" : "إجابة غير صحيحة"}
              {feedback[q.id].explanation && <p className="mt-1">{feedback[q.id].explanation}</p>}
            </div>}
          </Card2>
        ))}
        <Btn onClick={finish} disabled={busy}>
          <Send size={15} /> {busy ? "جاري التسليم..." : `تسليم ${exam.assessment_type === "homework" ? "الواجب" : "الاختبار"}`}
        </Btn>
      </div>
    </Page>
  );
}

export function ConnectedAttemptResultPage({
  params,
  role,
}: {
  params: RouteParams;
  role: Role;
}) {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  useEffect(() => {
    if (params.attemptId)
      loadAttempt(params.attemptId)
        .then((r) => setAttempt(r.attempt))
        .catch((e) => notify(errorMessage(e), "error"));
  }, [params.attemptId]);
  if (!attempt)
    return (
      <Page title="نتيجة التقييم">
        <Card2>جاري تحميل النتيجة...</Card2>
      </Page>
    );
  const isHomework = attempt.assessment_type === "homework";
  const requestExtra = () =>
    createSupportRequest({
      request_type: "extra_exam_attempt",
      reason: "The student requested an additional exam attempt.",
      payload: { exam_id: attempt.exam_id },
    })
      .then(() => notify("تم إرسال طلب المحاولة الإضافية", "success"))
      .catch((e) => notify(errorMessage(e), "error"));
  return (
    <Page title={isHomework ? "نتيجة الواجب" : "نتيجة الاختبار"} subtitle={attempt.exam_title}>
      <div className="max-w-3xl mx-auto space-y-4">
        <Card2 className="text-center">
          <div className="text-5xl font-black text-primary mb-2">
            {attempt.percent}%
          </div>
          <Badge2
            variant={
              attempt.result_status === "passed"
                ? "success"
                : attempt.result_status === "risk"
                  ? "warning"
                  : "danger"
            }
          >
            {statusLabel[attempt.result_status ?? ""]}
          </Badge2>
          <p className="text-sm text-muted-foreground mt-3">
            {attempt.score_points} من {attempt.max_points} • المحاولة{" "}
            {attempt.attempt_number}
          </p>
          {role === "student" && !isHomework && attempt.result_status !== "passed" && (
            <Btn className="mt-4" variant="outline" onClick={requestExtra}>
              طلب محاولة إضافية
            </Btn>
          )}
        </Card2>
        {attempt.questions?.some(q=>q.is_correct !== undefined) ? attempt.questions.map((q, index) => (
          <Card2
            key={q.id}
            className={q.is_correct ? "border-green-300" : "border-red-300"}
          >
            <div className="flex gap-2 font-bold mb-3">
              {q.is_correct ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
              {index + 1}. <RichText value={q.body} />
            </div>
            {q.choices.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "p-2 rounded-lg text-sm",
                  c.id === q.correct_choice_id && "bg-green-100 text-green-900",
                  c.id === q.selected_choice_id &&
                    !q.is_correct &&
                    "bg-red-100 text-red-900",
                )}
              >
                <RichText value={c.body} />
                {c.id === q.correct_choice_id ? " — الإجابة الصحيحة" : ""}
                {c.id === q.selected_choice_id ? " — إجابة الطالب" : ""}
              </div>
            ))}
            {q.explanation && (
              <p className="mt-3 text-sm text-muted-foreground">
                الشرح: {q.explanation}
              </p>
            )}
          </Card2>
        )) : <Card2><p className="text-center text-muted-foreground">تم تسجيل النتيجة، والإجابات التفصيلية مخفية حسب إعدادات المدرس.</p></Card2>}
      </div>
    </Page>
  );
}

export function ConnectedResultsPage({
  nav,
  role,
}: {
  nav: Navigate;
  role: Role;
}) {
  const [items, setItems] = useState<ExamAttempt[]>([]);
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  useEffect(() => {
    loadAttempts(undefined,page)
      .then((r) => {setItems(r.attempts);setPagination(r.pagination);})
      .catch((e) => notify(errorMessage(e), "error"));
  }, [page]);
  const submitted = items.filter((a) => a.status === "submitted");
  return (
    <Page title={role === "parent" ? "نتائج الأبناء" : "تقدمي ونتائجي"}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Metric label="المحاولات" value={String(submitted.length)} />
        <Metric
          label="الناجح"
          value={String(
            submitted.filter((a) => a.result_status === "passed").length,
          )}
        />
        <Metric
          label="المتوسط"
          value={`${submitted.length ? Math.round(submitted.reduce((sum, a) => sum + Number(a.percent), 0) / submitted.length) : 0}%`}
        />
      </div>
      <Card2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3">الطالب</th>
                <th className="text-right">الاختبار</th>
                <th>المحاولة</th>
                <th>النتيجة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submitted.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-3">{a.student_name}</td>
                  <td>{a.exam_title}</td>
                  <td className="text-center">{a.attempt_number}</td>
                  <td className="text-center">{a.percent}%</td>
                  <td>
                    <button
                      className="text-primary flex gap-1"
                      onClick={() =>
                        nav(
                          role === "parent" ? "parent-errors" : "exam-result",
                          { attemptId: a.id },
                        )
                      }
                    >
                      <Eye size={14} /> مراجعة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card2>
      <PaginationControls pagination={pagination} onPageChange={setPage}/>
    </Page>
  );
}

export function ConnectedAnnouncementsPage({
  manage = false,
}: {
  manage?: boolean;
}) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [form, setForm] = useState({
    title: "",
    body: "",
    status: "published",
    grade_id: "",
    user_id: "",
  });
  const refresh = () =>
    loadAnnouncements(page)
      .then((r) => {setItems(r.announcements);setPagination(r.pagination);})
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => {
    void refresh();
    if (manage) {
      void loadGrades().then((response) => setGrades(response.grades));
      void loadStudents().then((response) => setStudents(response.students));
    }
  }, [manage,page]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAnnouncement(
        {
          title: form.title,
          body: form.body,
          status: form.status,
          grade_ids: form.grade_id ? [Number(form.grade_id)] : [],
          user_ids: form.user_id ? [Number(form.user_id)] : [],
        },
        editingId,
      );
      setForm({ title: "", body: "", status: "published", grade_id: "", user_id: "" });
      setEditingId(undefined);
      refresh();
      notify("تم نشر الإعلان", "success");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };
  return (
    <Page title="الإعلانات">
      {manage && (
        <Card2 className="mb-5">
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
            <Input2
              label="عنوان الإعلان"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select2
              label="الحالة"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: "published", label: "منشور" },
                { value: "draft", label: "مسودة" },
              ]}
            />
            <Select2
              label="الفئة المستهدفة"
              value={form.grade_id}
              onChange={(e) => setForm({ ...form, grade_id: e.target.value })}
              options={[
                { value: "", label: "جميع الصفوف" },
                ...grades.map((grade) => ({
                  value: grade.id,
                  label: grade.level === 1 ? "الصف الأول الثانوي" : grade.level === 2 ? "الصف الثاني الثانوي" : grade.level === 3 ? "الصف الثالث الثانوي" : grade.name,
                })),
              ]}
            />
            <Select2
              label="طالب محدد (اختياري)"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              options={[
                { value: "", label: "لا يوجد طالب محدد" },
                ...students.map((student) => ({ value: student.id, label: `${student.name} — ${student.phone}` })),
              ]}
            />
            <textarea
              aria-label="محتوى الإعلان"
              required
              className="md:col-span-2 input min-h-24 p-3 rounded-xl border bg-background"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <Btn type="submit">
              <Plus size={15} /> {editingId ? "حفظ الإعلان" : "إضافة الإعلان"}
            </Btn>
          </form>
        </Card2>
      )}
      <div className="space-y-3">
        {items.map((a) => (
          <Card2 key={a.id}>
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                  {a.body}
                </p>
                <div className="text-xs text-muted-foreground mt-3">
                  {new Date(a.publish_at ?? a.created_at).toLocaleString(
                    "ar-EG",
                  )}
                </div>
              </div>
              {manage && (
                <div className="flex items-start gap-2">
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(a.id);
                      setForm({
                        title: a.title,
                        body: a.body,
                        status: a.status,
                        grade_id: String(a.grade_ids[0] ?? ""),
                        user_id: String(a.user_ids[0] ?? ""),
                      });
                    }}
                  >
                    تعديل
                  </Btn>
                  <button
                    aria-label="حذف الإعلان"
                    className="text-red-500 p-2"
                    onClick={() => deleteAnnouncement(a.id).then(refresh)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              )}
            </div>
          </Card2>
        ))}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage}/>
    </Page>
  );
}

export function ConnectedSupportRequestsPage() {
  const [items, setItems] = useState<SupportRequest[]>([]);
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  const refresh = () =>
    loadSupportRequests(page)
      .then((r) => {setItems(r.support_requests);setPagination(r.pagination);})
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => {
    void refresh();
  }, [page]);
  const review = (id: number, decision: "approve" | "reject") =>
    reviewSupportRequest(id, decision)
      .then(() => {
        notify(
          decision === "approve" ? "تم قبول الطلب" : "تم رفض الطلب",
          "success",
        );
        refresh();
      })
      .catch((e) => notify(errorMessage(e), "error"));
  return (
    <Page
      title="طلبات الدعم"
      subtitle="طلبات الأجهزة والمحاولات الإضافية وتغيير رقم ولي الأمر"
    >
      <div className="space-y-3">
        {items.map((r) => (
          <Card2 key={r.id}>
            <div className="flex justify-between gap-4 flex-wrap">
              <div>
                <div className="font-bold">{r.requester.name}</div>
                <div className="text-sm mt-1">
                  {r.request_type === "extra_exam_attempt"
                    ? "محاولة اختبار إضافية"
                    : r.request_type === "device_removal"
                      ? "إزالة جهاز"
                      : "تغيير رقم ولي الأمر"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                {r.actions.at(-1) && <p className="text-xs text-muted-foreground mt-2">راجعه {r.actions.at(-1)?.reviewer_name} في {new Date(r.actions.at(-1)!.created_at).toLocaleString("ar-EG")}</p>}
              </div>
              <div className="flex gap-2 items-center">
                <Badge2
                  variant={
                    r.status === "approved"
                      ? "success"
                      : r.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {statusLabel[r.status]}
                </Badge2>
                {r.status === "pending" && (
                  <>
                    <Btn size="sm" onClick={() => review(r.id, "approve")}>
                      قبول
                    </Btn>
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() => review(r.id, "reject")}
                    >
                      رفض
                    </Btn>
                  </>
                )}
              </div>
            </div>
          </Card2>
        ))}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage}/>
    </Page>
  );
}

function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card2 className="text-center">
      <div className="text-2xl font-black text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card2>
  );
}
