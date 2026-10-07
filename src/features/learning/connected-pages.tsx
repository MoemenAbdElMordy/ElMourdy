import { SupportInbox, ResultsJournal } from './followup-views';
import { useEffect, useId, useRef, useState } from "react";
import { AssessmentIntro, AssessmentSheet, ResultHero } from "./assessment-layout";
import { WorkspaceHeading } from "../dashboard/workspace-views";
import { arabicNumber as n } from "../../shared/arabic";
import { CheckCircle, Eye, Plus, Send, Trash2, Upload, XCircle } from "lucide-react";
import type { Navigate, Role, RouteParams } from "../../app/routing/types";
import { loadCurriculum } from "../../shared/curriculum/api";
import { loadGrades, loadStudents, type Grade, type StudentRecord } from "../../shared/admin/day5";
import { loadAcademicChoices, type AcademicYearChoice } from "../../shared/admin/academic-choices";
import {
  createSupportRequest,
  answerExamQuestion,
  deleteAnnouncement,
  loadAnnouncements,
  loadAttempt,
  loadAttempts,
  loadExam,
  loadExamAttempts,
  loadExamProgress,
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
  type ExamStudentProgress,
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
  const inputId = useId();
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
        <label htmlFor={inputId} className="text-sm font-bold">{n(label)}</label>
        <button
          type="button"
          onClick={underlineSelection}
          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-black underline transition hover:border-primary hover:text-primary"
          title="حدد كلمة أو جملة واضغط لوضع خط تحتها"
        >
          تسطير
        </button>
      </div>
      <textarea
        id={inputId}
        ref={inputRef}
        required={required}
        value={value}
        placeholder={placeholder ? n(placeholder) : undefined}
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
  const [years, setYears] = useState<AcademicYearChoice[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultsExam, setResultsExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamAttempt[]>([]);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsPagination, setResultsPagination] = useState<PaginationMeta>(emptyPagination);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [progress, setProgress] = useState<ExamStudentProgress[]>([]);
  const [progressPage, setProgressPage] = useState(1);
  const [progressPagination, setProgressPagination] = useState<PaginationMeta>(emptyPagination);
  const [progressLoading, setProgressLoading] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [expandedProgressStudent, setExpandedProgressStudent] = useState<number | null>(null);
  useEffect(() => {
    if (!resultsExam) return;
    let current = true;
    setResultsLoading(true);
    const timer = setTimeout(() => loadExamAttempts(resultsExam.id, resultsPage, studentQuery)
      .then(({ attempts, pagination }) => { if (current) { setResults(attempts); setResultsPagination(pagination); } })
      .catch((error) => { if (current) notify(errorMessage(error), "error"); })
      .finally(() => { if (current) setResultsLoading(false); }), studentQuery ? 250 : 0);
    return () => { current = false; clearTimeout(timer); };
  }, [resultsExam, resultsPage, studentQuery]);
  useEffect(() => {
    if (!resultsExam) return;
    let current = true;
    setProgressLoading(true);
    const timer = setTimeout(() => loadExamProgress(resultsExam.id, progressPage, studentQuery)
      .then(({ students, pagination }) => { if (current) { setProgress(students); setProgressPagination(pagination); } })
      .catch((error) => { if (current) notify(errorMessage(error), "error"); })
      .finally(() => { if (current) setProgressLoading(false); }), studentQuery ? 250 : 0);
    return () => { current = false; clearTimeout(timer); };
  }, [resultsExam, progressPage, studentQuery]);
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
    loadAcademicChoices().then(({academic_years, grades: availableGrades}) => {
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
      <div className="assessment-studio">
        <Card2 className="assessment-editor">
          <h2 className="font-bold mb-4">
            {editing ? `تعديل ${isHomework ? "الواجب" : "الاختبار"}` : `${isHomework ? "واجب" : "اختبار"} جديد`}
          </h2>
          {!editing?.attempts_count&&<div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4"><label className="flex cursor-pointer items-center justify-center gap-2 font-bold text-primary"><Upload size={17}/> استيراد الأسئلة من ملف وورد أو بي دي إف<input type="file" accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" className="hidden" disabled={busy} onChange={event=>{void importDocument(event.target.files?.[0]);event.target.value="";}}/></label><p className="mt-2 text-center text-xs text-muted-foreground">سيتم استخراج الأسئلة والاختيارات إلى مسودة، ولن يُحفظ شيء قبل مراجعتك وتحديد الإجابات الصحيحة. ملفات بي دي إف المصورة تحتاج إلى نص قابل للتحديد.</p>{importWarnings.length>0&&<div className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-900">راجع الأسئلة المستوردة بعناية؛ بعض أجزاء الملف احتاجت إلى استنتاج تلقائي.</div>}</div>}
          <div className="mb-4 rounded-2xl border border-border bg-background/50 p-3 text-xs text-muted-foreground">
            لتسطير كلمة: حددها داخل السؤال أو الاختيار ثم اضغط زر <span className="font-black underline">تسطير</span>.
            وسيتم عرضها للطالب بخط تحتها.
          </div>
          <form className="space-y-3" onSubmit={submit}>
            <fieldset className="editor-section"><legend><span>١</span> العنوان والجمهور</legend>
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
            </fieldset><fieldset className="editor-section"><legend><span>٢</span> قواعد الحل والتصحيح</legend>
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
            </fieldset><fieldset className="editor-section"><legend><span>٣</span> الأسئلة والإجابات</legend>
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
                  <div key={index} className="editor-question space-y-3">
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
            </fieldset><div className="editor-savebar flex gap-2">
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
        <div className="assessment-library space-y-3">
          <div className="assessment-library-heading"><span className="workspace-eyebrow">مكتبتك التعليمية</span><h2>{isHomework ? "الواجبات المحفوظة" : "الاختبارات المحفوظة"}</h2><p>اختر عنصرًا لمراجعة تفاصيله أو تعديل إعداداته.</p></div>
          {!exams.length && <p className="p-5 text-sm text-muted-foreground">لا توجد عناصر لعرضها هنا بعد.</p>}
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
                  <Btn size="sm" variant="outline" onClick={() => { setResultsExam(exam); setResultsPage(1); setProgressPage(1); setStudentQuery(""); setExpandedProgressStudent(null); }}>
                    متابعة الطلاب
                  </Btn>
                </div>
              </div>
            </Card2>
          ))}
        </div>
        <PaginationControls pagination={pagination} onPageChange={setPage}/>
      </div>
      {resultsExam && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResultsExam(null); }}>
        <div role="dialog" aria-modal="true" aria-label={`متابعة ${resultsExam.title}`} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">متابعة {resultsExam.assessment_type === "homework" ? "الواجب" : "الاختبار"}: {resultsExam.title}</h2><p className="text-sm text-muted-foreground">كل الطلاب المستهدفين، بما فيهم من لم يبدأ، ثم تفاصيل المحاولات والدرجات.</p></div><Btn variant="outline" size="sm" onClick={() => setResultsExam(null)}>إغلاق</Btn></div>
          <input aria-label="ابحث عن طالب في متابعة الواجب أو الاختبار" value={studentQuery} onChange={event => { setStudentQuery(event.target.value); setProgressPage(1); setResultsPage(1); setExpandedProgressStudent(null); }} placeholder="ابحث بالاسم أو رقم الهاتف أو السنتر" className="mb-4 w-full rounded-xl border border-border bg-background px-3 py-2.5" />
          <h3 className="mb-2 font-black">حالة الطلاب</h3>
          {progressLoading ? <p>جارٍ تحميل الطلاب...</p> : progress.length === 0 ? <p className="rounded-xl border border-border p-4 text-sm">{studentQuery ? "لا يوجد طالب مطابق في هذا الواجب أو الاختبار." : "لا يوجد طلاب في الصفوف المستهدفة."}</p> : <div className="space-y-2">{progress.map((student) => <div key={student.student_id} className="rounded-xl border border-border p-3 text-sm"><div className="flex flex-wrap items-start justify-between gap-2"><div><strong>{student.name}</strong><p dir="ltr" className="text-xs text-muted-foreground">{student.phone}</p><p className="text-xs text-muted-foreground">{student.center_name || "السنتر غير مسجل"}</p></div><Btn size="sm" variant="outline" aria-expanded={expandedProgressStudent === student.student_id} onClick={() => setExpandedProgressStudent(expandedProgressStudent === student.student_id ? null : student.student_id)}>تفاصيل التقدم</Btn></div><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground"><span>{student.status === "not_started" ? "لم يبدأ" : student.status === "submitted" ? "سلّم" : "قيد الحل"}</span><span>المحاولات: {n(student.attempts_count)}</span><span>أفضل نتيجة: {student.best_percent == null ? "—" : `${n(Math.round(student.best_percent))}٪`}</span><span>آخر نتيجة: {student.latest_percent == null ? "—" : `${n(Math.round(student.latest_percent))}٪`}</span></div>{expandedProgressStudent === student.student_id && <div className="mt-3 space-y-2 rounded-xl bg-muted p-3"><p>آخر نشاط: {student.last_activity_at ? new Date(student.last_activity_at).toLocaleString("ar-EG") : "لم يبدأ بعد"}</p>{student.attempts.length ? student.attempts.map(attempt => <p key={attempt.id}>المحاولة {n(attempt.attempt_number)}: {attempt.status === "submitted" ? "تم التسليم" : attempt.status === "in_progress" ? "قيد الحل" : "انتهت"} · {attempt.percent == null ? "النتيجة لم تُحدد" : `${n(Math.round(attempt.percent))}٪`}</p>) : <p>لم يبدأ الطالب هذا التكليف بعد.</p>}</div>}</div>)}</div>}
          <PaginationControls pagination={progressPagination} onPageChange={setProgressPage}/>
          <h3 className="mb-2 mt-5 border-t border-border pt-4 font-black">تفاصيل المحاولات</h3>
          {resultsLoading ? <p>جارٍ تحميل النتائج...</p> : results.length === 0 ? <p className="rounded-xl border border-border p-4 text-sm">لا توجد محاولات مطابقة حتى الآن.</p> : <div className="space-y-2">{results.map((attempt) => <div key={attempt.id} className="rounded-xl border border-border p-3 text-sm"><strong>{attempt.student_name}</strong><p dir="ltr" className="text-xs text-muted-foreground">{attempt.student_phone}</p><p className="text-xs text-muted-foreground">{attempt.center_name || "السنتر غير مسجل"}</p><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground"><span>المحاولة {n(attempt.attempt_number)}</span><span>{attempt.status === "submitted" ? "تم التسليم" : attempt.status === "in_progress" ? "قيد الحل" : "انتهت"}</span><span>النتيجة: {attempt.percent == null ? "لم تُحدد بعد" : `${n(Math.round(Number(attempt.percent)))}٪`}</span><span>{attempt.result_status ? statusLabel[attempt.result_status] : ""}</span></div></div>)}</div>}
          <PaginationControls pagination={resultsPagination} onPageChange={setResultsPage}/>
        </div>
      </div>}
    </Page>
  );
}

export function ConnectedHomeworksPage({ nav }: { nav: Navigate }) {
  const [items,setItems]=useState<Exam[]>([]);
  const [page,setPage]=useState(1);
  const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  useEffect(()=>{loadExams({assessmentType:"homework",page}).then(response=>{setItems(response.exams);setPagination(response.pagination);}).catch(error=>notify(errorMessage(error),"error"));},[page]);
  return <Page title="واجباتي" subtitle="الواجبات المنشورة المرتبطة بصفك الدراسي">
    <div className="homework-grid">{items.map((item,index)=><article key={item.id} className="homework-sheet">
      <span className="sheet-number">{n(index+1)}</span><span className="workspace-eyebrow">ورقة تدريب · واجب منزلي</span><h2>{item.title}</h2>
      <dl><div><dt>الأسئلة</dt><dd>{n(item.questions_count??0)}</dd></div><div><dt>المدة بالدقائق</dt><dd>{n(item.duration_minutes)}</dd></div><div><dt>المحاولات المسموحة</dt><dd>{n(item.max_attempts)}</dd></div></dl>
      <button onClick={()=>nav("exam",{examId:item.id})}>افتح الواجب وابدأ التدريب <Eye size={18}/></button>
    </article>)}</div>
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
        <AssessmentIntro title={exam.title} homework={exam.assessment_type==="homework"} duration={exam.duration_minutes} attempts={exam.max_attempts} pass={exam.pass_percent} busy={busy} onBegin={begin}/>
      </Page>
    );
  return (
    <Page
      title={attempt.exam_title}
      subtitle={`المحاولة رقم ${attempt.attempt_number}`}
    >
      <AssessmentSheet questions={attempt.questions??[]} answered={answers}>
        {attempt.questions?.map((q, index) => (
          <Card2 key={q.id} id={`question-${q.id}`} className="question-paper">
            <h3 className="font-bold mb-3">
              <span className="question-index">{n(index + 1)}</span> <RichText value={q.body} />
            </h3>
            <div className="space-y-2">
              {q.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={cn(
                    "answer-option flex gap-2 p-3 rounded-xl border cursor-pointer",
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
      </AssessmentSheet>
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
        <ResultHero percent={attempt.percent} points={attempt.score_points} max={attempt.max_points} attempt={attempt.attempt_number} label={statusLabel[attempt.result_status??""]}>
          {role === "student" && !isHomework && attempt.result_status !== "passed" && (
            <Btn className="mt-4" variant="outline" onClick={requestExtra}>
              طلب محاولة إضافية
            </Btn>
          )}
        </ResultHero>
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
        <Metric label="المحاولات في هذه الصفحة" value={String(submitted.length)} />
        <Metric
          label="الناجح في هذه الصفحة"
          value={String(
            submitted.filter((a) => a.result_status === "passed").length,
          )}
        />
        <Metric
          label="متوسط الصفحة"
          value={`${submitted.length ? Math.round(submitted.reduce((sum, a) => sum + Number(a.percent), 0) / submitted.length) : 0}%`}
        />
      </div>
      <ResultsJournal attempts={submitted} onOpen={attemptId=>nav(role==="parent"?"parent-errors":"exam-result",{attemptId})}/>
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
      <div className="announcement-workspace" data-manage={manage}>
      {manage && (
        <Card2 className="announcement-composer mb-5">
          <h2>{editingId ? "تعديل الإعلان" : "رسالة جديدة"}</h2>
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
      <div className="announcement-board">
        {!items.length && <p className="followup-empty">لا توجد إعلانات في هذه الصفحة.</p>}
        {items.map((a) => (
          <Card2 key={a.id} className="announcement-post">
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
      <SupportInbox items={items} onReview={review}/>
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
    <div className="workspace detail-workspace">
      <div className="max-w-6xl mx-auto">
        <WorkspaceHeading eyebrow="مساحة التعلّم والمتابعة" title={title} description={subtitle??"كل التفاصيل اللي تحتاجها، في مكان واحد."}/>
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
