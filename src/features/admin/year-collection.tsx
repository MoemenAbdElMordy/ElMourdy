import type { ReactNode } from 'react';
import { ArrowLeft, CalendarDays, BookOpen, Users } from 'lucide-react';
import type { AcademicYear } from '../../shared/admin/day5';
import { arabicNumber as n } from '../../shared/arabic';

export function YearCollection({years,onSelect,actions}:{years:AcademicYear[];onSelect:(id:number)=>void;actions?:(year:AcademicYear)=>ReactNode}){
  return <div className="year-collection">{years.length===0&&<p className="year-empty">لا توجد سنوات دراسية لعرضها بعد.</p>}{years.map(year=><article key={year.id} className="year-volume" data-active={year.status==='active'}><div className="year-volume-top"><CalendarDays size={24}/><span>{year.status==='active'?'السنة الحالية':year.status==='draft'?'مسودة':'الأرشيف'}</span></div><button type="button" className="year-open" onClick={()=>onSelect(year.id)}><span className="workspace-eyebrow">سجل العام الدراسي</span><h2>{n(year.name)}</h2><p>{n(year.starts_on)} — {n(year.ends_on)}</p><div className="year-volume-stats"><span><Users size={16}/>{n(year.students_count)} طالب</span><span><BookOpen size={16}/>{n(year.grades.length)} صفوف</span></div><strong>استعرض الصفوف والتقارير <ArrowLeft size={18}/></strong></button>{actions&&<div className="year-actions">{actions(year)}</div>}</article>)}</div>;
}

export function YearGradeCollection({year,onNavigate}:{year:AcademicYear;onNavigate:(route:string,params:{yearId:number;gradeId:number})=>void}){
  return <div className="year-grade-collection">{year.grades.map(grade=><article key={grade.id} className="year-grade"><span className="year-grade-index">{n(grade.level)}</span><h3>{grade.level===1?'الصف الأول الثانوي':grade.level===2?'الصف الثاني الثانوي':grade.level===3?'الصف الثالث الثانوي':grade.name}</h3><dl>{[[grade.students_count,'طالب'],[grade.branches_count,'فرع'],[grade.lessons_count,'درس'],[grade.lectures_count,'محاضرة']].map(([count,label])=><div key={label}><dd>{n(count)}</dd><dt>{label}</dt></div>)}</dl><button type="button" onClick={()=>onNavigate('management-reports',{yearId:year.id,gradeId:grade.id})}>عرض التقرير <ArrowLeft size={16}/></button><button type="button" onClick={()=>onNavigate('content-subjects',{yearId:year.id,gradeId:grade.id})}>إدارة المحتوى <BookOpen size={16}/></button></article>)}</div>;
}
