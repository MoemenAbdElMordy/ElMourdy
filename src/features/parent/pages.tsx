/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Moon, Sun, Menu, X, ChevronRight, ChevronDown, ChevronLeft,
  Play, Lock, CheckCircle, XCircle, Clock, Award, BookOpen,
  Users, LogOut, Bell, Search, Plus, Edit2, Trash2, Eye, Download,
  AlertTriangle, Info, RotateCcw, Home, FileText, Video, Key, Shield,
  Activity, Star, UserCheck, UserX, Copy, Printer, RefreshCw, Check,
  AlertCircle, Upload
} from "lucide-react";
import type { Role } from "../../app/routing/types";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Pager, Select2, StatCard, cn, notify } from "../../shared/ui";
import {
  GOVERNORATES, GRADES, STUDENTS, SUBJECTS, CHAPTERS, LESSONS,
  EXAM_QS, ANNOUNCEMENTS, ACTIVATION_CODES, AUDIT_LOGS,
  ABWAB, DURUS, MAHADARAT, rn,
} from "../../data/mock-data";
import { buildPreviewNav } from "../platform/preview-navigation";
// ============================================================
export function ParentDashboard({ nav }: any) {
  const linkedStudents = [STUDENTS[2], STUDENTS[7], STUDENTS[11]];
  const [selectedStudentId,setSelectedStudentId] = useState(linkedStudents[0].id);
  const s = linkedStudents.find(student=>student.id===selectedStudentId) || linkedStudents[0];
  const attempts = [
    {id:1,lesson:"تعريف الاسم وعلاماته",date:"2025-09-08",score:35,total:50,pct:70,passed:true,attempt:1},
    {id:2,lesson:"فروع اللغة العربية",date:"2025-09-05",score:25,total:50,pct:50,passed:false,attempt:1},
    {id:3,lesson:"فروع اللغة العربية",date:"2025-09-06",score:42,total:50,pct:84,passed:true,attempt:2},
  ];
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">لوحة ولي الأمر</h1>
            <p className="text-muted-foreground text-sm">متابعة الطالب: {s.name}</p>
          </div>
          <div className="flex items-center gap-2"><Select2 aria-label="اختيار الطالب" value={selectedStudentId} onChange={event=>setSelectedStudentId(Number(event.target.value))} options={linkedStudents.map(student=>({value:student.id,label:student.name}))}/><Badge2 variant={s.status==="active"?"success":"warning"}>{s.status==="active"?"نشط":"غير نشط"}</Badge2></div>
        </div>

        <Card2 className="mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shrink-0">{s.name.charAt(0)}</div>
            <div className="flex-1">
              <div className="font-bold text-lg">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.grade} • {s.governorate}</div>
              <div className="text-sm text-muted-foreground">{s.school}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground mb-1">آخر نشاط</div>
              <div className="text-sm font-semibold">{new Date(s.lastActive).toLocaleDateString("ar-EG")}</div>
            </div>
          </div>
        </Card2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="أعلى درجة" value="84%" icon={Star}/>
          <StatCard label="إجمالي المحاولات" value={attempts.length} icon={RotateCcw}/>
          <StatCard label="ناجح" value={attempts.filter(a=>a.passed).length} icon={CheckCircle}/>
          <StatCard label="راسب" value={attempts.filter(a=>!a.passed).length} icon={XCircle}/>
        </div>

        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2 text-sm text-primary">
          <Info size={15}/>
          <span>يمكنك مراجعة النتائج والأخطاء فقط. تشغيل الفيديو والاختبار متاح للطالب فقط.</span>
        </div>

        <Card2>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">سجل المحاولات والنتائج</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-right py-2 pr-3">المحاضرة</th>
                  <th className="text-center py-2">التاريخ</th>
                  <th className="text-center py-2">الدرجة</th>
                  <th className="text-center py-2">المحاولة</th>
                  <th className="text-center py-2">النتيجة</th>
                  <th className="text-center py-2">مراجعة الأخطاء</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a=>(
                  <tr key={a.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 pr-3 font-medium">{a.lesson}</td>
                    <td className="py-3 text-center text-muted-foreground text-xs">{a.date}</td>
                    <td className="py-3 text-center font-black">{a.score}/{a.total}</td>
                    <td className="py-3 text-center">{a.attempt}</td>
                    <td className="py-3 text-center"><Badge2 variant={a.passed?"success":"danger"}>{a.passed?"ناجح":"راسب"}</Badge2></td>
                    <td className="py-3 text-center">
                      <button onClick={()=>nav("parent-errors",{attemptId:a.id})} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                        <Eye size={11}/> مراجعة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card2>
      </div>
    </div>
  );
}

// ============================================================
// PARENT ERROR REVIEW
// ============================================================
export function ParentErrorsPage({ nav }: any) {
  const fakeAns = {0:0, 2:3, 4:1};
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={()=>nav("parent-dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground">
          <ChevronRight size={15}/> العودة
        </button>
        <h1 className="text-2xl font-black mb-2">مراجعة إجابات الطالب</h1>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-sm text-muted-foreground mb-5">
          <Eye size={14}/> وضع عرض فقط — لا يمكن تعديل أي شيء
        </div>
        <div className="space-y-4">
          {EXAM_QS.slice(0,5).map((q,i)=>{
            const sa = (fakeAns as any)[i];
            const ok = sa === q.correct;
            return (
              <Card2 key={q.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                    sa===undefined?"bg-muted text-muted-foreground":ok?"bg-green-100 text-green-700 dark:bg-green-900/30":"bg-red-100 text-red-700 dark:bg-red-900/30")}>
                    {sa===undefined?"?":ok?"✓":"✗"}
                  </div>
                  <p className="font-semibold text-sm leading-snug">{q.text}</p>
                </div>
                <div className="space-y-2 pr-11">
                  {q.choices.map((c,ci)=>(
                    <div key={ci} className={cn("p-2.5 rounded-xl text-xs flex items-center gap-2",
                      ci===q.correct?"bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300":
                      ci===sa&&!ok?"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300":"bg-muted text-muted-foreground")}>
                      {ci===q.correct && <CheckCircle size={11} className="text-green-600 shrink-0"/>}
                      {ci===sa&&!ok && <XCircle size={11} className="text-red-600 shrink-0"/>}
                      <span className="flex-1">{c}</span>
                      {ci===q.correct && <span className="font-bold text-green-700 dark:text-green-400 shrink-0">صحيح</span>}
                      {ci===sa&&!ok && <span className="font-bold text-red-700 dark:text-red-400 shrink-0">إجابة الطالب</span>}
                    </div>
                  ))}
                </div>
              </Card2>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
