import { useEffect, useState } from "react";
import type { Navigate } from "../../app/routing/types";
import { loadProfile, type LinkedStudent } from "../../shared/auth/profile";
import { loadAttempts, type ExamAttempt } from "../../shared/learning/api";
import { Card2, notify } from "../../shared/ui";
import { ParentWorkspace } from "./parent-workspace";

export function ParentDashboard({ nav }: { nav: Navigate }) {
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([loadProfile(), loadAttempts()]).then(([profile, results]) => {
      setStudents(profile.linked_students);
      setSelected(profile.linked_students[0]?.id ?? null);
      setAttempts(results.attempts);
    }).catch(() => notify("تعذر تحميل بيانات ولي الأمر", "error")).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="p-6"><Card2>جارٍ تحميل بيانات ولي الأمر…</Card2></div>;
  const student = students.find(s => s.id === selected) ?? students[0];
  if (!student) return <div className="p-6"><Card2>لا يوجد طلاب مرتبطون بهذا الحساب.</Card2></div>;
  return <ParentWorkspace students={students} student={student} attempts={attempts.filter(a => a.student_profile_id === student.id && a.status === "submitted")} onSelect={setSelected} nav={nav}/>;
}
