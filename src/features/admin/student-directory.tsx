import { ArrowUpLeft, GraduationCap, MapPin } from 'lucide-react';
import type { StudentRecord } from '../../shared/admin/day5';
import { arabicLabel, arabicNumber as n } from '../../shared/arabic';
export function StudentDirectory({students,onOpen}:{students:StudentRecord[];onOpen:(id:number)=>void}) {
  return <div className="student-directory">{students.map(s=><article className="directory-card" key={s.id}><div className="directory-person"><span>{Array.from(s.name)[0] || 'ط'}</span><div><h2>{s.name}</h2><p>{n(s.phone)}</p></div><i className={s.status==='active'?'is-active':'is-inactive'} title={s.status==='active'?'نشط':'موقوف'}/></div><div className="directory-details"><p><GraduationCap size={15}/>{arabicLabel(s.grade||'الصف غير مسجل')}</p><p><MapPin size={15}/>{s.center_name||'السنتر غير مسجل'} · {s.governorate||'المحافظة غير مسجلة'}</p></div><div className="directory-footer"><span>{n(s.academic_year||'السنة غير مسجلة')}</span><button aria-label={`عرض ${s.name}`} onClick={()=>onOpen(s.id)}>ملف الطالب <ArrowUpLeft size={16}/></button></div></article>)}</div>;
}
