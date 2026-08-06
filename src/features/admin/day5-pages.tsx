import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Edit2, Eye, Plus, Search, Shield } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import {
  createAcademicYear, createAssistant, loadAcademicYears, loadAssistants, loadGrades,
  loadStudent, loadStudents, updateAcademicYear, updateAssistant, updateStudentStatus,
  type AcademicYear, type AssistantRecord, type Grade, type StudentRecord,
} from "../../shared/admin/day5";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Select2, notify } from "../../shared/ui";

const permissionLabels:Record<string,string> = {
  manage_students:"إدارة الطلاب", manage_parent_phone:"تغيير رقم ولي الأمر", manage_devices:"إدارة الأجهزة",
  manage_support_requests:"طلبات الدعم", manage_content:"إدارة المحتوى", upload_videos:"رفع الفيديو",
  manage_exams:"إدارة الاختبارات", manage_codes:"إدارة الأكواد", manage_announcements:"إدارة الإعلانات",
  view_reports:"عرض التقارير", manage_academic_years:"إدارة السنوات الدراسية",
};
const gradeLabel=(level?:number,name?:string)=>level===1?"الصف الأول الثانوي":level===2?"الصف الثاني الثانوي":level===3?"الصف الثالث الثانوي":name||"—";

export function Day5StudentsListPage({nav}:any) {
  const [students,setStudents]=useState<StudentRecord[]>([]);
  const [grades,setGrades]=useState<Grade[]>([]);
  const [query,setQuery]=useState("");
  const [gradeId,setGradeId]=useState("");
  const [status,setStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const refresh=()=>{setLoading(true);loadStudents({query,gradeId,status}).then(r=>setStudents(r.students)).catch(e=>notify(e instanceof ApiError?e.message:"تعذر تحميل الطلاب","error")).finally(()=>setLoading(false));};
  useEffect(()=>{loadGrades().then(r=>setGrades(r.grades));},[]);
  useEffect(()=>{const timer=setTimeout(refresh,250);return()=>clearTimeout(timer);},[query,gradeId,status]);
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-5"><h1 className="text-2xl font-black">قائمة الطلاب</h1><Badge2 variant="primary">{students.length} طالب</Badge2></div>
    <Card2 className="mb-4"><div className="grid md:grid-cols-3 gap-3">
      <Field label="بحث"><div className="relative"><Search size={15} className="absolute right-3 top-3 text-muted-foreground"/><input aria-label="بحث" value={query} onChange={e=>setQuery(e.target.value)} placeholder="الاسم أو رقم الهاتف" className="w-full pr-9 px-3 py-2.5 rounded-xl border border-border bg-background"/></div></Field>
      <Select2 label="الصف" value={gradeId} onChange={(e:any)=>setGradeId(e.target.value)} options={[{value:"",label:"كل الصفوف"},...grades.map(g=>({value:String(g.id),label:gradeLabel(g.level,g.name)}))]}/>
      <Select2 label="الحالة" value={status} onChange={(e:any)=>setStatus(e.target.value)} options={[{value:"",label:"كل الحالات"},{value:"active",label:"نشط"},{value:"suspended",label:"موقوف"}]}/>
    </div></Card2>
    <Card2 className="!p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-right p-3">الطالب</th><th className="text-right p-3">الصف</th><th className="text-right p-3">المحافظة</th><th className="text-right p-3">السنة</th><th className="text-center p-3">الحالة</th><th className="p-3"/></tr></thead><tbody>
      {students.map(student=><tr key={student.id} className="border-t border-border"><td className="p-3"><strong>{student.name}</strong><div className="text-xs text-muted-foreground" dir="ltr">{student.phone}</div></td><td className="p-3">{student.grade||"—"}</td><td className="p-3">{student.governorate||"—"}</td><td className="p-3">{student.academic_year||"—"}</td><td className="p-3 text-center"><Badge2 variant={student.status==="active"?"success":"danger"}>{student.status==="active"?"نشط":"موقوف"}</Badge2></td><td className="p-3"><button aria-label={`عرض ${student.name}`} onClick={()=>nav("student-detail",{studentId:student.id})}><Eye size={16}/></button></td></tr>)}
    </tbody></table></div>{!loading&&students.length===0&&<p className="p-8 text-center text-muted-foreground">لا توجد نتائج مطابقة</p>}{loading&&<p className="p-8 text-center text-muted-foreground">جارٍ التحميل…</p>}</Card2>
  </div></div>;
}

export function Day5StudentDetailPage({nav,params}:any) {
  const [student,setStudent]=useState<StudentRecord|null>(null);
  const refresh=()=>loadStudent(Number(params?.studentId)).then(r=>setStudent(r.student)).catch(e=>notify(e instanceof ApiError?e.message:"تعذر تحميل الطالب","error"));
  useEffect(()=>{void refresh();},[params?.studentId]);
  if(!student)return <div className="p-8 text-center">جارٍ تحميل بيانات الطالب…</div>;
  const toggle=async()=>{const next=student.status==="active"?"suspended":"active";const response=await updateStudentStatus(student.id,next);setStudent(response.student);notify(next==="active"?"تمت إعادة تفعيل الطالب":"تم إيقاف الطالب وإنهاء جلساته","success");};
  const rows:Array<[string,string|undefined]>=[["الصف",student.grade],["السنة الدراسية",student.academic_year],["المحافظة",student.governorate],["المدرسة",student.school],["هاتف الطالب",student.phone],["هاتف ولي الأمر",student.parent_phone],["البريد",student.email],["عدد الأجهزة",String(student.devices_count??0)]];
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-3xl mx-auto"><button onClick={()=>nav("students-list")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4"><ChevronRight size={15}/> العودة للقائمة</button><Card2><div className="flex justify-between gap-3 mb-5"><div><h1 className="text-xl font-black">{student.name}</h1><Badge2 variant={student.status==="active"?"success":"danger"}>{student.status==="active"?"نشط":"موقوف"}</Badge2></div><Btn variant={student.status==="active"?"danger":"primary"} onClick={toggle}>{student.status==="active"?"إيقاف الحساب":"إعادة التفعيل"}</Btn></div><div className="grid sm:grid-cols-2 gap-3">{rows.map(([label,value])=><div key={label} className="p-3 rounded-xl bg-muted"><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold mt-1" dir={label.includes("هاتف")||label==="البريد"?"ltr":undefined}>{value||"—"}</div></div>)}</div></Card2></div></div>;
}

export function Day5AcademicYearsPage() {
  const [years,setYears]=useState<AcademicYear[]>([]);const [modal,setModal]=useState(false);const [form,setForm]=useState({name:"",starts_on:"",ends_on:"",status:"active"});
  const refresh=()=>loadAcademicYears().then(r=>setYears(r.academic_years)).catch(e=>notify(e instanceof ApiError?e.message:"تعذر تحميل السنوات","error"));
  useEffect(()=>{void refresh();},[]);
  const save=async()=>{await createAcademicYear(form);setModal(false);setForm({name:"",starts_on:"",ends_on:"",status:"active"});await refresh();notify("تم إنشاء السنة الدراسية","success");};
  const archive=async(year:AcademicYear)=>{await updateAcademicYear(year.id,{status:"archived"});await refresh();notify("تمت أرشفة السنة الدراسية","success");};
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-4xl mx-auto"><div className="flex justify-between mb-5"><h1 className="text-2xl font-black">السنوات الدراسية</h1><Btn onClick={()=>setModal(true)}><Plus size={15}/> سنة جديدة</Btn></div><div className="space-y-3">{years.map(year=><Card2 key={year.id}><div className="flex gap-3 items-start"><CalendarDays className="text-primary"/><div className="flex-1"><div className="flex gap-2"><h2 className="font-black">{year.name}</h2><Badge2 variant={year.status==="active"?"success":"default"}>{year.status==="active"?"الحالية":year.status==="draft"?"مسودة":"مؤرشفة"}</Badge2></div><p className="text-xs text-muted-foreground mt-1">{year.starts_on} — {year.ends_on}</p><p className="text-sm mt-2">{year.students_count} طالب</p></div>{year.status==="active"&&<Btn size="sm" variant="outline" onClick={()=>archive(year)}>أرشفة</Btn>}</div></Card2>)}</div>
    <Modal2 open={modal} onClose={()=>setModal(false)} title="إنشاء سنة دراسية"><div className="space-y-3"><Input2 label="اسم السنة" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/><Input2 label="تاريخ البداية" type="date" value={form.starts_on} onInput={(e:any)=>{const value=e.currentTarget.value;setForm(v=>({...v,starts_on:value}));}}/><Input2 label="تاريخ النهاية" type="date" value={form.ends_on} onInput={(e:any)=>{const value=e.currentTarget.value;setForm(v=>({...v,ends_on:value}));}}/><Btn className="w-full" disabled={!form.name||!form.starts_on||!form.ends_on} onClick={save}>إنشاء السنة</Btn></div></Modal2>
  </div></div>;
}

export function Day5AssistantsPage() {
  const [assistants,setAssistants]=useState<AssistantRecord[]>([]);const [keys,setKeys]=useState<string[]>([]);const [modal,setModal]=useState(false);const [editing,setEditing]=useState<AssistantRecord|null>(null);const empty={name:"",phone:"",email:"",title:"",password:"",permissions:[] as string[]};const [form,setForm]=useState(empty);
  const refresh=()=>loadAssistants().then(r=>{setAssistants(r.assistants);setKeys(r.permission_keys);}).catch(e=>notify(e instanceof ApiError?e.message:"تعذر تحميل المساعدين","error"));useEffect(()=>{void refresh();},[]);
  const open=(assistant?:AssistantRecord)=>{setEditing(assistant||null);setForm(assistant?{name:assistant.name,phone:assistant.phone,email:assistant.email||"",title:assistant.title||"",password:"",permissions:assistant.permissions}:empty);setModal(true);};
  const save=async()=>{if(editing)await updateAssistant(editing.id,{name:form.name,email:form.email,title:form.title,permissions:form.permissions});else await createAssistant({...form,password_confirmation:form.password});setModal(false);await refresh();notify(editing?"تم تحديث المساعد":"تم إنشاء حساب المساعد","success");};
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-4xl mx-auto"><div className="flex justify-between mb-5"><h1 className="text-2xl font-black">المساعدون</h1><Btn onClick={()=>open()}><Plus size={15}/> إضافة مساعد</Btn></div><div className="space-y-3">{assistants.map(a=><Card2 key={a.id}><div className="flex gap-3"><Shield className="text-primary"/><div className="flex-1"><div className="flex gap-2"><strong>{a.name}</strong><Badge2 variant={a.status==="active"?"success":"default"}>{a.status==="active"?"نشط":"غير نشط"}</Badge2></div><p className="text-xs text-muted-foreground" dir="ltr">{a.phone} • {a.email||"—"}</p><p className="text-xs mt-2">{a.permissions.map(k=>permissionLabels[k]||k).join("، ")||"لا توجد صلاحيات"}</p></div><button aria-label={`تعديل ${a.name}`} onClick={()=>open(a)}><Edit2 size={16}/></button></div></Card2>)}</div>
    <Modal2 open={modal} onClose={()=>setModal(false)} title={editing?"تعديل المساعد":"إضافة مساعد"}><div className="space-y-3"><Input2 label="الاسم" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/><Input2 label="الهاتف" value={form.phone} disabled={!!editing} dir="ltr" onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/><Input2 label="البريد" value={form.email} dir="ltr" onChange={e=>setForm(v=>({...v,email:e.target.value}))}/><Input2 label="المسمى الوظيفي" value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))}/>{!editing&&<Input2 label="كلمة المرور المؤقتة" type="password" value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))}/>}<Field label="الصلاحيات"><div className="grid sm:grid-cols-2 gap-2">{keys.map(key=><label key={key} className="text-xs flex gap-2"><input type="checkbox" checked={form.permissions.includes(key)} onChange={e=>setForm(v=>({...v,permissions:e.target.checked?[...v.permissions,key]:v.permissions.filter(x=>x!==key)}))}/>{permissionLabels[key]||key}</label>)}</div></Field><Btn className="w-full" disabled={!form.name||(!editing&&form.password.length<8)} onClick={save}>حفظ</Btn></div></Modal2>
  </div></div>;
}
