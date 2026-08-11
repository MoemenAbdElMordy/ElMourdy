import { useEffect, useState } from "react";
import { CheckCircle, Eye, Plus, Send, Trash2, XCircle } from "lucide-react";
import type { Navigate, Role, RouteParams } from "../../app/routing/types";
import { loadCurriculum } from "../../shared/curriculum/api";
import { loadGrades, loadStudents, type Grade, type StudentRecord } from "../../shared/admin/day5";
import {
  createSupportRequest,
  deleteAnnouncement,
  loadAnnouncements,
  loadAttempt,
  loadAttempts,
  loadExam,
  loadExams,
  loadSupportRequests,
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

export function ConnectedExamManagePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [context, setContext] = useState<{
    yearId: number;
    gradeId: number;
    lessons: { id: number; title: string }[];
  } | null>(null);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [busy, setBusy] = useState(false);
  const blankQuestion = () => ({
    body: "",
    explanation: "",
    correct: "",
    wrong1: "",
    wrong2: "",
  });
  const blank = () => ({
    title: "",
    duration_minutes: 30,
    max_attempts: 3,
    pass_percent: 60,
    status: "draft",
    lesson_id: "",
    questions: [blankQuestion()],
  });
  const [form, setForm] = useState(blank);
  const refresh = () =>
    loadExams()
      .then((r) => setExams(r.exams))
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => {
    refresh();
    loadCurriculum()
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
  }, []);
  const edit = async (exam: Exam) => {
    const full = (await loadExam(exam.id)).exam;
    setEditing(full);
    setForm({
      title: full.title,
      duration_minutes: full.duration_minutes,
      max_attempts: full.max_attempts,
      pass_percent: full.pass_percent,
      status: full.status,
      lesson_id: String(full.lesson_id ?? ""),
      questions: (full.questions ?? []).map((question) => ({
        body: question.body,
        explanation: question.explanation ?? "",
        correct:
          question.choices.find((choice) => choice.is_correct)?.body ?? "",
        wrong1:
          question.choices.filter((choice) => !choice.is_correct)[0]?.body ??
          "",
        wrong2:
          question.choices.filter((choice) => !choice.is_correct)[1]?.body ??
          "",
      })),
    });
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context || !form.lesson_id)
      return notify("اختر درسًا للاختبار", "error");
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        scope_type: "lesson",
        lesson_id: Number(form.lesson_id),
        academic_year_id: context.yearId,
        grade_id: context.gradeId,
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
        payload.questions = form.questions.map((question) => ({
          body: question.body,
          explanation: question.explanation,
          points: 1,
          choices: [
            { body: question.correct, is_correct: true },
            { body: question.wrong1, is_correct: false },
            { body: question.wrong2, is_correct: false },
          ],
        }));
      }
      await saveExam(payload, editing?.id);
      notify(editing ? "تم تحديث الاختبار" : "تم إنشاء الاختبار", "success");
      setEditing(null);
      setForm(blank());
      refresh();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      title="إدارة الاختبارات"
      subtitle="إنشاء الاختبارات وربطها بالدروس ومتابعة محاولات الطلاب"
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <Card2>
          <h2 className="font-bold mb-4">
            {editing ? "تعديل الاختبار" : "اختبار جديد"}
          </h2>
          <form className="space-y-3" onSubmit={submit}>
            <Input2
              label="عنوان الاختبار"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select2
              label="الدرس المرتبط"
              value={form.lesson_id}
              onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}
              options={[
                { value: "", label: "اختر الدرس" },
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
            {editing?.attempts_count ? (
              <div className="rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800">
                بدأت محاولات الطلاب بالفعل، لذلك يمكن تعديل إعدادات الاختبار فقط
                مع الاحتفاظ بالأسئلة كما هي.
              </div>
            ) : (
              form.questions.map((question, index) => {
                const updateQuestion = (
                  field: keyof typeof question,
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
                    <Input2
                      label="نص السؤال"
                      required
                      value={question.body}
                      onChange={(e) => updateQuestion("body", e.target.value)}
                    />
                    <Input2
                      label="الإجابة الصحيحة"
                      required
                      value={question.correct}
                      onChange={(e) =>
                        updateQuestion("correct", e.target.value)
                      }
                    />
                    <Input2
                      label="اختيار خاطئ"
                      required
                      value={question.wrong1}
                      onChange={(e) => updateQuestion("wrong1", e.target.value)}
                    />
                    <Input2
                      label="اختيار خاطئ آخر"
                      required
                      value={question.wrong2}
                      onChange={(e) => updateQuestion("wrong2", e.target.value)}
                    />
                    <Input2
                      label="شرح الإجابة"
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion("explanation", e.target.value)
                      }
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
                    : "إنشاء الاختبار"}
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
      </div>
    </Page>
  );
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
  if (!exam)
    return (
      <Page title="الاختبار">
        <Card2>لا يوجد اختبار منشور مرتبط بهذا الدرس حاليًا.</Card2>
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
            {busy ? "جاري البدء..." : "ابدأ الاختبار"}
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
              {index + 1}. {q.body}
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
                    onChange={() =>
                      setAnswers({ ...answers, [q.id]: choice.id })
                    }
                  />
                  {choice.body}
                </label>
              ))}
            </div>
          </Card2>
        ))}
        <Btn onClick={finish} disabled={busy}>
          <Send size={15} /> {busy ? "جاري التسليم..." : "تسليم الاختبار"}
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
      <Page title="نتيجة الاختبار">
        <Card2>جاري تحميل النتيجة...</Card2>
      </Page>
    );
  const requestExtra = () =>
    createSupportRequest({
      request_type: "extra_exam_attempt",
      reason: "The student requested an additional exam attempt.",
      payload: { exam_id: attempt.exam_id },
    })
      .then(() => notify("تم إرسال طلب المحاولة الإضافية", "success"))
      .catch((e) => notify(errorMessage(e), "error"));
  return (
    <Page title="نتيجة الاختبار" subtitle={attempt.exam_title}>
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
          {role === "student" && attempt.result_status !== "passed" && (
            <Btn className="mt-4" variant="outline" onClick={requestExtra}>
              طلب محاولة إضافية
            </Btn>
          )}
        </Card2>
        {attempt.questions?.map((q, index) => (
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
              {index + 1}. {q.body}
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
                {c.body}
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
        ))}
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
  useEffect(() => {
    loadAttempts()
      .then((r) => setItems(r.attempts))
      .catch((e) => notify(errorMessage(e), "error"));
  }, []);
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
    </Page>
  );
}

export function ConnectedAnnouncementsPage({
  manage = false,
}: {
  manage?: boolean;
}) {
  const [items, setItems] = useState<Announcement[]>([]);
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
    loadAnnouncements()
      .then((r) => setItems(r.announcements))
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => {
    void refresh();
    if (manage) {
      void loadGrades().then((response) => setGrades(response.grades));
      void loadStudents().then((response) => setStudents(response.students));
    }
  }, [manage]);
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
    </Page>
  );
}

export function ConnectedSupportRequestsPage() {
  const [items, setItems] = useState<SupportRequest[]>([]);
  const refresh = () =>
    loadSupportRequests()
      .then((r) => setItems(r.support_requests))
      .catch((e) => notify(errorMessage(e), "error"));
  useEffect(() => {
    void refresh();
  }, []);
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
