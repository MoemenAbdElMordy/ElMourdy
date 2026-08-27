import { useEffect, useState } from "react";
import { BarChart3, Download, Eye, ShieldCheck, Users } from "lucide-react";
import { exportManagementReport, loadManagementReport, type ManagementReport } from "../../shared/admin/teacher-control";
import { loadAcademicYears, loadGrades, type AcademicYear, type Grade } from "../../shared/admin/day5";
import { Btn, Card2, Select2, StatCard, notify } from "../../shared/ui";
import { emptyPagination, PaginationControls, type PaginationMeta } from "../../shared/pagination";

const gradeName=(level?:number,name?:string)=>level===1?"الصف الأول الثانوي":level===2?"الصف الثاني الثانوي":level===3?"الصف الثالث الثانوي":name||"—";
const date=(value?:string|null)=>value?new Date(value).toLocaleString("ar-EG"):"—";

export function ManagementReportsPage({nav,params}:any){
  const [report,setReport]=useState<ManagementReport|null>(null);
  const [years,setYears]=useState<AcademicYear[]>([]);const [grades,setGrades]=useState<Grade[]>([]);
  const [yearId,setYearId]=useState(Number(params?.yearId)||0);const [gradeId,setGradeId]=useState(Number(params?.gradeId)||0);
  const [page,setPage]=useState(1);const [pagination,setPagination]=useState<PaginationMeta>(emptyPagination);
  useEffect(()=>{Promise.all([loadAcademicYears(),loadGrades()]).then(([y,g])=>{setYears(y.academic_years);setGrades(g.grades);});},[]);
  useEffect(()=>{setPage(1);},[yearId,gradeId]);
  useEffect(()=>{loadManagementReport(yearId||undefined,gradeId||undefined,page).then(r=>{setReport(r.report);setPagination(r.pagination);}).catch(()=>notify("تعذر تحميل التقارير","error"));},[yearId,gradeId,page]);
  if(!report)return <p className="p-8 text-center">جارٍ تحميل التقارير…</p>;
  const overview=report.overview;
  return <div className="min-h-screen bg-background p-4 sm:p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black">التقارير التفصيلية</h1><Btn variant="outline" onClick={()=>exportManagementReport(yearId||undefined,gradeId||undefined).catch(()=>notify("تعذر تصدير التقرير","error"))}><Download size={15}/> تنزيل Word</Btn></div>
    <Card2 className="mb-4"><div className="grid gap-3 sm:grid-cols-2"><Select2 label="السنة الدراسية" value={String(yearId)} onChange={(event:any)=>setYearId(Number(event.target.value))} options={[{value:"0",label:"كل السنوات"},...years.map(year=>({value:String(year.id),label:year.name}))]}/><Select2 label="الصف" value={String(gradeId)} onChange={(event:any)=>setGradeId(Number(event.target.value))} options={[{value:"0",label:"كل الصفوف"},...grades.map(grade=>({value:String(grade.id),label:gradeName(grade.level,grade.name)}))]}/></div></Card2>
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><StatCard label="الطلاب" value={overview.students_count} icon={Users}/><StatCard label="المحاولات" value={overview.attempts_count} icon={BarChart3}/><StatCard label="متوسط النتائج" value={overview.average_score==null?"—":`${Math.round(overview.average_score)}%`} icon={BarChart3}/><StatCard label="ناجح" value={overview.passed_count} icon={ShieldCheck}/><StatCard label="في خطر" value={overview.risk_count} icon={Eye}/><StatCard label="راسب" value={overview.failed_count} icon={Eye}/></div>
    <Card2 className="mt-4 !p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-3 text-right">الطالب</th><th className="p-3 text-right">الصف</th><th className="p-3 text-right">السنتر</th><th className="p-3 text-center">متوسط النتيجة</th><th className="p-3 text-center">المحاولات</th><th className="p-3 text-center">المحاضرات المكتملة</th><th className="p-3 text-center">آخر نشاط</th></tr></thead><tbody>{report.students.map(student=><tr key={student.id} className="border-t border-border cursor-pointer hover:bg-muted/50" onClick={()=>nav("student-detail",{studentId:student.id})}><td className="p-3 font-bold">{student.name}</td><td className="p-3">{gradeName(grades.find(grade=>grade.name===student.grade)?.level,student.grade)}</td><td className="p-3">{student.center_name || "—"}</td><td className="p-3 text-center">{student.average_score==null?"—":`${Math.round(student.average_score)}%`}</td><td className="p-3 text-center">{student.attempts_count}</td><td className="p-3 text-center">{student.completed_lectures}</td><td className="p-3 text-center">{date(student.last_active_at)}</td></tr>)}</tbody></table></div></Card2>
    <PaginationControls pagination={pagination} onPageChange={setPage}/>
  </div></div>;
}
