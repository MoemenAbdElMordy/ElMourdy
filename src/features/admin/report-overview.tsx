import type { ManagementReport } from '../../shared/admin/teacher-control';
import { arabicNumber as n } from '../../shared/arabic';
export function ReportOverview({data}:{data:ManagementReport['overview']}) {
  const rows=[{label:'ناجح',value:data.passed_count},{label:'يحتاج متابعة',value:data.risk_count},{label:'راسب',value:data.failed_count}];
  const max=Math.max(1,...rows.map(r=>r.value));
  return <section className="report-overview"><div className="report-score"><span>متوسط النتائج</span><strong>{data.average_score==null?'—':`${n(Math.round(data.average_score))}٪`}</strong><p>المؤشرات حسب السنة والصف المختارين، وليست مقتصرة على الطلاب الظاهرين في الصفحة الحالية.</p></div><div className="report-breakdown"><h2>قراءة سريعة للنتائج</h2><div className="report-bars">{rows.map(r=><div key={r.label}><span>{r.label}</span><span><i style={{width:`${r.value/max*100}%`}}/></span><b>{n(r.value)}</b></div>)}</div><div className="report-counts"><span><b>{n(data.students_count)}</b>طالب</span><span><b>{n(data.attempts_count)}</b>محاولة</span><span><b>{n(data.completed_lecture_events)}</b>إكمال محاضرة</span></div></div></section>;
}
