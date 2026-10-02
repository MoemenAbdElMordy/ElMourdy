import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { ReportOverview } from './report-overview';
import { WorkspaceHeading } from '../dashboard/workspace-views';
import { exportManagementReport, loadManagementReport, type ManagementReport } from "../../shared/admin/teacher-control";
import { loadAcademicYears, loadGrades, type AcademicYear, type Grade } from "../../shared/admin/day5";
import { Btn, Card2, Select2, notify } from "../../shared/ui";
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
  return <div className="workspace reports-workspace"><div className="mx-auto max-w-7xl">
    <WorkspaceHeading eyebrow="قراءة في رحلة الطلاب" title="من الأرقام، لخطوة واضحة." description="حدد السنة والصف، وقارن النتائج ثم افتح ملف أي طالب لمتابعة التفاصيل."><Btn variant="outline" onClick={()=>exportManagementReport(yearId||undefined,gradeId||undefined).catch(()=>notify("تعذر تصدير التقرير","error"))}><Download size={15}/> تنزيل تقرير وورد</Btn></WorkspaceHeading>
    <Card2 className="mb-4"><div className="grid gap-3 sm:grid-cols-2"><Select2 label="السنة الدراسية" value={String(yearId)} onChange={(event:any)=>setYearId(Number(event.target.value))} options={[{value:"0",label:"كل السنوات"},...years.map(year=>({value:String(year.id),label:year.name}))]}/><Select2 label="الصف" value={String(gradeId)} onChange={(event:any)=>setGradeId(Number(event.target.value))} options={[{value:"0",label:"كل الصفوف"},...grades.map(grade=>({value:String(grade.id),label:gradeName(grade.level,grade.name)}))]}/></div></Card2>
    <ReportOverview data={overview}/>
    <Card2 className="mt-4 !p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-3 text-right">الطالب</th><th className="p-3 text-right">الصف</th><th className="p-3 text-right">السنتر</th><th className="p-3 text-center">متوسط النتيجة</th><th className="p-3 text-center">المحاولات</th><th className="p-3 text-center">المحاضرات المكتملة</th><th className="p-3 text-center">آخر نشاط</th></tr></thead><tbody>{report.students.map(student=><tr key={student.id} className="border-t border-border cursor-pointer hover:bg-muted/50" onClick={()=>nav("student-detail",{studentId:student.id})}><td className="p-3 font-bold">{student.name}</td><td className="p-3">{gradeName(grades.find(grade=>grade.name===student.grade)?.level,student.grade)}</td><td className="p-3">{student.center_name || "—"}</td><td className="p-3 text-center">{student.average_score==null?"—":`${Math.round(student.average_score)}%`}</td><td className="p-3 text-center">{student.attempts_count}</td><td className="p-3 text-center">{student.completed_lectures}</td><td className="p-3 text-center">{date(student.last_active_at)}</td></tr>)}</tbody></table></div></Card2>
    <PaginationControls pagination={pagination} onPageChange={setPage}/>
  </div></div>;
}
