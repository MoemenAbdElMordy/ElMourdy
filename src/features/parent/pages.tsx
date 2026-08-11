import { useEffect, useState } from "react";
import { CheckCircle, Eye, Info, RotateCcw, Star, XCircle } from "lucide-react";
import type { Navigate } from "../../app/routing/types";
import { loadProfile, type LinkedStudent } from "../../shared/auth/profile";
import { loadAttempts, type ExamAttempt } from "../../shared/learning/api";
import { Badge2, Card2, Select2, StatCard, notify } from "../../shared/ui";

type ParentStudent = LinkedStudent & {
  displayGrade: string;
};

export function ParentDashboard({ nav }: { nav: Navigate }) {
  const [linkedStudents, setLinkedStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadProfile(), loadAttempts()]).then(([response, attemptsResponse]) => {
      const students = response.linked_students.map((student) => ({
        ...student,
        displayGrade: student.grade ?? gradeName(student.grade_level),
      }));
      setLinkedStudents(students);
      setSelectedStudentId(students[0]?.id ?? null);
      setAttempts(attemptsResponse.attempts);
    }).catch(() => notify("تعذر تحميل بيانات ولي الأمر", "error"))
      .finally(() => setLoading(false));
  }, []);

  const student = linkedStudents.find((item) => item.id === selectedStudentId) ?? linkedStudents[0];
  const submittedAttempts = attempts.filter((attempt) =>
    attempt.student_profile_id === selectedStudentId && attempt.status === "submitted"
  );
  const highestScore = submittedAttempts.length
    ? Math.max(...submittedAttempts.map((attempt) => Number(attempt.percent ?? 0)))
    : 0;

  if (loading) {
    return <div className="min-h-screen bg-background p-6"><Card2>جارٍ تحميل بيانات ولي الأمر…</Card2></div>;
  }
  if (!student) {
    return <div className="min-h-screen bg-background p-6"><Card2>لا يوجد طلاب مرتبطون بهذا الحساب.</Card2></div>;
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">لوحة ولي الأمر</h1>
            <p className="text-muted-foreground text-sm">متابعة الطالب: {student.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select2 aria-label="اختيار الطالب" value={selectedStudentId ?? ""} onChange={(event) => setSelectedStudentId(Number(event.target.value))} options={linkedStudents.map((item) => ({ value: item.id, label: item.name }))}/>
            <Badge2 variant={student.status === "active" ? "success" : "warning"}>{student.status === "active" ? "نشط" : "غير نشط"}</Badge2>
          </div>
        </div>

        <Card2 className="mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shrink-0">{student.name.charAt(0)}</div>
            <div className="flex-1">
              <div className="font-bold text-lg">{student.name}</div>
              <div className="text-sm text-muted-foreground">{student.displayGrade} • {student.governorate || "—"}</div>
              <div className="text-sm text-muted-foreground">{student.school || "—"}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground mb-1">آخر نشاط</div>
              <div className="text-sm font-semibold">{student.last_active_at ? new Date(student.last_active_at).toLocaleDateString("ar-EG") : "—"}</div>
            </div>
          </div>
        </Card2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="أعلى درجة" value={`${Math.round(highestScore)}%`} icon={Star}/>
          <StatCard label="إجمالي المحاولات" value={submittedAttempts.length} icon={RotateCcw}/>
          <StatCard label="ناجح" value={submittedAttempts.filter((attempt) => attempt.result_status === "passed").length} icon={CheckCircle}/>
          <StatCard label="راسب" value={submittedAttempts.filter((attempt) => attempt.result_status === "failed").length} icon={XCircle}/>
        </div>

        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2 text-sm text-primary">
          <Info size={15}/>
          <span>يمكنك مراجعة النتائج والأخطاء فقط. تشغيل الفيديو والاختبار متاح للطالب فقط.</span>
        </div>

        <Card2>
          <h3 className="font-bold mb-4">سجل المحاولات والنتائج</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-right py-2 pr-3">الاختبار</th>
                  <th className="text-center py-2">التاريخ</th>
                  <th className="text-center py-2">الدرجة</th>
                  <th className="text-center py-2">المحاولة</th>
                  <th className="text-center py-2">النتيجة</th>
                  <th className="text-center py-2">مراجعة الأخطاء</th>
                </tr>
              </thead>
              <tbody>
                {submittedAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 pr-3 font-medium">{attempt.exam_title}</td>
                    <td className="py-3 text-center text-muted-foreground text-xs">{new Date(attempt.submitted_at ?? attempt.started_at).toLocaleDateString("ar-EG")}</td>
                    <td className="py-3 text-center font-black">{attempt.score_points ?? 0}/{attempt.max_points ?? 0}</td>
                    <td className="py-3 text-center">{attempt.attempt_number}</td>
                    <td className="py-3 text-center"><Badge2 variant={attempt.result_status === "passed" ? "success" : attempt.result_status === "risk" ? "warning" : "danger"}>{attempt.result_status === "passed" ? "ناجح" : attempt.result_status === "risk" ? "يحتاج متابعة" : "راسب"}</Badge2></td>
                    <td className="py-3 text-center">
                      <button onClick={() => nav("parent-errors", { attemptId: attempt.id })} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"><Eye size={11}/> مراجعة</button>
                    </td>
                  </tr>
                ))}
                {submittedAttempts.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">لا توجد محاولات مكتملة لهذا الطالب حتى الآن.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card2>
      </div>
    </div>
  );
}

function gradeName(level?: number) {
  if (level === 1) return "الصف الأول الثانوي";
  if (level === 2) return "الصف الثاني الثانوي";
  if (level === 3) return "الصف الثالث الثانوي";
  return "—";
}
