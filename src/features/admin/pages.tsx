/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Moon, Sun, Menu, X, ChevronRight, ChevronDown, ChevronLeft,
  Play, Lock, CheckCircle, XCircle, Clock, Award, BookOpen,
  Users, LogOut, Bell, Search, Plus, Edit2, Trash2, Eye, Download,
  AlertTriangle, Info, RotateCcw, Home, FileText, Video, Key, Shield,
  Activity, Star, UserCheck, UserX, Copy, Printer, RefreshCw, Check,
  AlertCircle, Upload, Monitor, CalendarDays
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
export function AdminDashboard({ nav, role }: any) {
  const active   = STUDENTS.filter(s=>s.status==="active").length;
  const inactive = STUDENTS.filter(s=>new Date(s.lastActive)<new Date(Date.now()-30*86400000)).length;
  const failed   = STUDENTS.filter(s=>s.score<60&&s.score>0).length;
  const alert60  = STUDENTS.filter(s=>s.score>=50&&s.score<=60).length;
  const best     = [...STUDENTS].sort((a,b)=>b.score-a.score).slice(0,5);
  const adminLinks = [
    {l:"قائمة الطلاب",icon:Users,v:"students-list"},
    {l:"إدارة المحتوى",icon:BookOpen,v:"content-subjects"},
    {l:"الاختبارات",icon:FileText,v:"exam-manage"},
    ...(role==="teacher"?[
      {l:"أكواد التفعيل",icon:Key,v:"activation-codes"},
      {l:"الإعلانات",icon:Bell,v:"announcements-admin"},
      {l:"المساعدون",icon:Shield,v:"assistants"},
      {l:"سجل الأحداث",icon:Activity,v:"audit-log"},
    ]:[
      {l:"الإعلانات",icon:Bell,v:"announcements-admin"},
    ]),
  ];
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">{role==="teacher"?"لوحة قيادة الأستاذ":"لوحة المساعد"}</h1>
            <p className="text-muted-foreground text-sm">{role==="teacher"?"الأستاذ محمود عبدالمرضي":"مصطفى حسن — مساعد"}</p>
          </div>
          <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="إجمالي الطلاب" value={(3000).toLocaleString("ar-EG")} icon={Users} sub="مسجَّل في المنصة"/>
          <StatCard label="الطلاب النشطون" value={active} icon={UserCheck}/>
          <StatCard label="غير نشط 30 يومًا" value={inactive} icon={UserX}/>
          <StatCard label="تنبيهات 50-60%" value={alert60} icon={AlertTriangle}/>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><XCircle size={15} className="text-red-600"/><span className="font-bold text-sm text-red-800 dark:text-red-400">الراسبون</span></div>
            <div className="text-3xl font-black text-red-700 dark:text-red-300">{failed}</div>
            <button onClick={()=>nav("students-list",{filter:"failed"})} className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1">عرض القائمة</button>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} className="text-yellow-600"/><span className="font-bold text-sm text-yellow-800 dark:text-yellow-400">منطقة الخطر 50-60%</span></div>
            <div className="text-3xl font-black text-yellow-700 dark:text-yellow-300">{alert60}</div>
            <button onClick={()=>nav("students-list",{filter:"alert"})} className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline mt-1">عرض القائمة</button>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><Clock size={15} className="text-orange-600"/><span className="font-bold text-sm text-orange-800 dark:text-orange-400">غير نشطون شهرًا</span></div>
            <div className="text-3xl font-black text-orange-700 dark:text-orange-300">{inactive}</div>
            <button onClick={()=>nav("students-list",{filter:"inactive"})} className="text-xs text-orange-600 dark:text-orange-400 hover:underline mt-1">عرض القائمة</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <Card2>
            <h3 className="font-bold mb-4">أفضل الطلاب</h3>
            <div className="space-y-3">
              {best.map((s,i)=>(
                <div key={s.id} className="flex items-center gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                    i===0?"bg-yellow-100 text-yellow-700":i===1?"bg-gray-100 text-gray-600":i===2?"bg-orange-100 text-orange-700":"bg-muted text-muted-foreground")}>
                    {i===0?"1":i===1?"2":i===2?"3":i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.grade}</div>
                  </div>
                  <div className="text-primary font-black text-sm shrink-0">{s.score}%</div>
                </div>
              ))}
            </div>
          </Card2>
          <Card2>
            <h3 className="font-bold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 gap-2">
              {adminLinks.map((l,i)=>(
                <button key={i} onClick={()=>nav(l.v)}
                  className="flex items-center gap-2 p-3 bg-muted hover:bg-accent rounded-2xl text-sm font-semibold transition-colors text-right">
                  <l.icon size={15} className="text-primary shrink-0"/> {l.l}
                </button>
              ))}
            </div>
          </Card2>
        </div>

        {/* ── CONTENT OPERATIONS (teacher only) ── */}
        {role==="teacher" && (
          <div className="space-y-5">
            <h2 className="text-lg font-black border-b border-border pb-2">عمليات المحتوى</h2>

            {/* Content KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                {l:"بدون فيديو",v:4,  icon:Video,       warn:true },
                {l:"فيديو فشل",v:1,   icon:AlertTriangle,warn:true },
                {l:"قيد التحويل",v:2, icon:Activity,    warn:false},
                {l:"بدون اختبار",v:7, icon:FileText,    warn:true },
                {l:"مسودات",v:5,      icon:Edit2,       warn:false},
              ].map((k,i) => (
                <button key={i} onClick={() => nav("content-subjects")}
                  className={cn("p-3 rounded-2xl border text-right transition-colors hover:border-primary/50",
                    k.warn?"bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800":"bg-muted border-border")}>
                  <k.icon size={15} className={cn("mb-1",k.warn?"text-red-600":"text-primary")}/>
                  <div className={cn("text-xl font-black",k.warn?"text-red-700 dark:text-red-400":"text-foreground")}>{k.v}</div>
                  <div className="text-xs text-muted-foreground">{k.l}</div>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Recent modified */}
              <Card2>
                <h3 className="font-bold text-sm mb-3">آخر المعدَّل</h3>
                <div className="space-y-2.5">
                  {MAHADARAT.slice(0,5).map((m,i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"/>
                      <div className="flex-1 min-w-0 truncate">{m.title}</div>
                      <div className="text-muted-foreground shrink-0">منذ {i+1}د</div>
                    </div>
                  ))}
                </div>
              </Card2>

              {/* Most watched / least completed */}
              <Card2>
                <h3 className="font-bold text-sm mb-3">الأكثر مشاهدة</h3>
                <div className="space-y-2">
                  {[{t:"مفهوم النحو",v:340},{t:"الكلام وأقسامه",v:287},{t:"الاسم وعلاماته",v:265},{t:"علامات الرفع",v:198},{t:"الفعل وأنواعه",v:176}].map((x,i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 min-w-0 truncate">{x.t}</div>
                      <div className="font-semibold text-primary shrink-0">{x.v}</div>
                    </div>
                  ))}
                </div>
              </Card2>

              {/* Quick actions + activity feed */}
              <Card2>
                <h3 className="font-bold text-sm mb-3">إجراءات المحتوى</h3>
                <div className="space-y-1.5 mb-4">
                  {[
                    {l:"إضافة محاضرة",   icon:Plus,   v:"content-subjects", p:{}},
                    {l:"رفع فيديو",      icon:Upload, v:"content-subjects", p:{}},
                    {l:"إنشاء اختبار",   icon:FileText,v:"exam-manage",     p:{}},
                    {l:"Lecture Grid",   icon:BookOpen,v:"content-subjects", p:{jumpToLectures:true}},
                  ].map((a,i) => (
                    <button key={i} onClick={() => nav(a.v, a.p)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors text-right text-sm font-semibold">
                      <a.icon size={13} className="text-primary shrink-0"/> {a.l}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-muted-foreground mb-2">آخر النشاط</div>
                <div className="space-y-1.5">
                  {[{u:"مصطفى",a:"رفع فيديو",t:"10 د"},{u:"مصطفى",a:"نشر محاضرة",t:"1 س"},{u:"الأستاذ",a:"تعديل اختبار",t:"3 س"}].map((x,i) => (
                    <div key={i} className="text-xs text-muted-foreground flex gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">{x.u}</span>
                      <span>{x.a}</span>
                      <span>— {x.t}</span>
                    </div>
                  ))}
                </div>
              </Card2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STUDENTS LIST
// ============================================================
export function StudentsListPage({ nav, params }: any) {
  const [page, setPage] = useState(1);
  const [grade, setGrade] = useState("");
  const [gov, setGov] = useState("");
  const [search, setSearch] = useState("");
  const [ft, setFt] = useState(params?.filter || "all");
  const [extraModal, setExtraModal] = useState<any>(null);
  const [resetModal, setResetModal] = useState<any>(null);
  const [reason, setReason] = useState("");
  const PER = 10;

  const filtered = useMemo(()=>{
    let s = STUDENTS;
    if (grade)            s = s.filter(x=>x.grade===grade);
    if (gov)              s = s.filter(x=>x.governorate===gov);
    if (search)           s = s.filter(x=>x.name.includes(search)||x.phone.includes(search)||x.email.includes(search));
    if (ft==="failed")    s = s.filter(x=>x.score<60&&x.score>0);
    if (ft==="alert")     s = s.filter(x=>x.score>=50&&x.score<=60);
    if (ft==="inactive")  s = s.filter(x=>new Date(x.lastActive)<new Date(Date.now()-30*86400000));
    return s;
  },[grade,gov,search,ft]);

  const paged = filtered.slice((page-1)*PER, page*PER);
  const totalPages = Math.ceil(filtered.length/PER);

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-2xl font-black">قائمة الطلاب</h1>
          <Badge2 variant="primary">{filtered.length.toLocaleString("ar-EG")} طالب</Badge2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[{id:"all",l:"الكل"},{id:"failed",l:"الراسبون"},{id:"alert",l:"50-60% تنبيه"},{id:"inactive",l:"غير نشط شهر"}].map(f=>(
            <button key={f.id} onClick={()=>{ setFt(f.id); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors",
                ft===f.id?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-accent")}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Filters: grade first (mandatory order) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Select2 label="الصف (أولًا)" value={grade} onChange={(e:any)=>{ setGrade(e.target.value); setPage(1); }}
            options={[{value:"",label:"كل الصفوف"},...GRADES.map(g=>({value:g,label:g}))]}/>
          <Select2 label="المحافظة" value={gov} onChange={(e:any)=>{ setGov(e.target.value); setPage(1); }}
            options={[{value:"",label:"كل المحافظات"},...GOVERNORATES.map(g=>({value:g,label:g}))]}/>
          <div className="col-span-2">
            <label className="text-sm font-semibold block mb-1.5">بحث</label>
            <div className="relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder="اسم، هاتف، أو بريد..."
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"/>
            </div>
          </div>
        </div>

        <Card2 className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-muted-foreground text-xs">
                  <th className="text-right py-3 px-4">الطالب</th>
                  <th className="text-right py-3 px-2">الصف</th>
                  <th className="text-right py-3 px-2">المحافظة</th>
                  <th className="text-center py-3 px-2">أعلى درجة</th>
                  <th className="text-center py-3 px-2">المحاولات</th>
                  <th className="text-center py-3 px-2">الحالة</th>
                  <th className="text-center py-3 px-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(s=>(
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.phone}</div>
                    </td>
                    <td className="py-3 px-2 text-xs whitespace-nowrap">{s.grade.replace("الصف ","")}</td>
                    <td className="py-3 px-2 text-xs">{s.governorate}</td>
                    <td className="py-3 px-2 text-center font-black text-sm">
                      <span className={s.score>=60?"text-green-600":s.score>=50?"text-yellow-600":"text-red-600"}>
                        {s.score}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs">{s.attempts}/3</td>
                    <td className="py-3 px-2 text-center">
                      <Badge2 variant={s.status==="active"?"success":s.status==="inactive"?"danger":"warning"}>
                        {s.status==="active"?"نشط":s.status==="inactive"?"غير نشط":"معلق"}
                      </Badge2>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 justify-center">
                        <button onClick={()=>nav("student-detail",{studentId:s.id})} className="p-1.5 hover:bg-accent rounded-lg" title="عرض"><Eye size={13}/></button>
                        <button onClick={()=>{ setExtraModal(s); setReason(""); }} className="p-1.5 hover:bg-accent rounded-lg text-primary" title="محاولة إضافية"><Plus size={13}/></button>
                        <button onClick={()=>{ setResetModal(s); setReason(""); }} className="p-1.5 hover:bg-accent rounded-lg text-orange-600" title="إعادة كلمة المرور"><Key size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paged.length===0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Users size={32} className="mx-auto mb-2 opacity-40"/><p>لا توجد نتائج مطابقة</p>
            </div>
          )}
        </Card2>
        <Pager page={page} total={totalPages} onChange={setPage}/>
      </div>

      <Modal2 open={!!extraModal} onClose={()=>setExtraModal(null)} title="منح محاولة إضافية">
        {extraModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl"><div className="font-semibold">{extraModal.name}</div><div className="text-sm text-muted-foreground">{extraModal.grade}</div></div>
            <Input2 label="سبب المحاولة الإضافية (مطلوب)" placeholder="مثال: مشكلة تقنية، عذر مقبول..." value={reason} onChange={(e:any)=>setReason(e.target.value)}/>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={()=>setExtraModal(null)}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!reason} onClick={()=>{ notify(`تم منح محاولة إضافية للطالب ${extraModal.name}`,"success"); setExtraModal(null); }}>تأكيد</Btn>
            </div>
          </div>
        )}
      </Modal2>

      <Modal2 open={!!resetModal} onClose={()=>setResetModal(null)} title="إعادة تعيين كلمة المرور">
        {resetModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl"><div className="font-semibold">{resetModal.name}</div><div className="text-sm text-muted-foreground">{resetModal.email}</div></div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
              <AlertTriangle size={14}/> سيُسجَّل هذا الإجراء في سجل الأحداث
            </div>
            <Input2 label="سبب إعادة التعيين (مطلوب)" placeholder="نسي كلمة المرور..." value={reason} onChange={(e:any)=>setReason(e.target.value)}/>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={()=>setResetModal(null)}>إلغاء</Btn>
              <Btn variant="danger" className="flex-1" disabled={!reason} onClick={()=>{ notify(`تم إرسال رابط إعادة التعيين إلى ${resetModal.email}`,"success"); setResetModal(null); }}>إعادة التعيين</Btn>
            </div>
          </div>
        )}
      </Modal2>
    </div>
  );
}

// ============================================================
// STUDENT DETAIL
// ============================================================
export function StudentDetailPage({ nav, params }: any) {
  const s = STUDENTS.find(x=>x.id===params?.studentId)||STUDENTS[0];
  const [parentPhoneModal,setParentPhoneModal] = useState(false);
  const [devicesModal,setDevicesModal] = useState(false);
  const [newParentPhone,setNewParentPhone] = useState("");
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={()=>nav("students-list")} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground">
          <ChevronRight size={15}/> العودة للقائمة
        </button>
        <div className="grid md:grid-cols-3 gap-5">
          <Card2>
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary mx-auto mb-3">{s.name.charAt(0)}</div>
              <h1 className="font-bold">{s.name}</h1>
              <Badge2 variant={s.status==="active"?"success":"warning"} className="mt-1.5">
                {s.status==="active"?"نشط":"غير نشط"}
              </Badge2>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["الصف",s.grade],["المحافظة",s.governorate],["المدرسة",s.school],
                ["هاتف الطالب",s.phone],["هاتف ولي الأمر",s.parentPhone],["البريد",s.email],
                ["تاريخ التسجيل",new Date(s.joinDate).toLocaleDateString("ar-EG")],
                ["آخر نشاط",new Date(s.lastActive).toLocaleDateString("ar-EG")],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between border-b border-border/50 pb-1.5 gap-2">
                  <span className="text-muted-foreground shrink-0">{k}</span>
                  <span className="font-medium text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </Card2>
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="أعلى درجة" value={`${s.score}%`} icon={Star}/>
              <StatCard label="المحاولات" value={`${s.attempts}/3`} icon={RotateCcw}/>
              <StatCard label="التفعيل" value={s.activated?"مفعَّل":"معلق"} icon={Key}/>
            </div>
            <Card2>
              <h3 className="font-bold mb-3 text-sm">إجراءات</h3>
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="outline" onClick={()=>notify("تم منح محاولة إضافية","success")}><Plus size={13}/> محاولة إضافية</Btn>
                <Btn size="sm" variant="outline" onClick={()=>notify("تم إرسال رابط إعادة التعيين","success")}><Key size={13}/> إعادة كلمة المرور</Btn>
                <Btn size="sm" variant="outline" onClick={()=>notify("تم التفعيل اليدوي","success")}><CheckCircle size={13}/> تفعيل يدوي</Btn>
                <Btn size="sm" variant="outline" onClick={()=>setParentPhoneModal(true)}><Users size={13}/> تغيير رقم ولي الأمر</Btn>
                <Btn size="sm" variant="outline" onClick={()=>setDevicesModal(true)}><Monitor size={13}/> الأجهزة والجلسات</Btn>
                <Btn size="sm" variant="outline" onClick={()=>notify(`بدأت مشاهدة المنصة كطالب: ${s.name} — وضع القراءة فقط`,"info")}><Eye size={13}/> عرض كطالب</Btn>
              </div>
            </Card2>
            <Card2>
              <h3 className="font-bold mb-3 text-sm">سجل محاولات الاختبارات</h3>
              <div className="space-y-2">
                {[
                  {lesson:"تعريف الاسم وعلاماته",score:35,total:50,passed:true,date:"2025-09-08",attempt:1},
                  {lesson:"فروع اللغة العربية",score:42,total:50,passed:true,date:"2025-09-05",attempt:1},
                  {lesson:"فروع اللغة العربية",score:28,total:50,passed:false,date:"2025-09-03",attempt:2},
                ].map((a,i)=>(
                  <div key={i} className="flex items-center justify-between p-2.5 bg-muted rounded-xl text-sm">
                    <div>
                      <div className="font-semibold text-xs">{a.lesson}</div>
                      <div className="text-xs text-muted-foreground">{a.date} • المحاولة {a.attempt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black">{a.score}/{a.total}</span>
                      <Badge2 variant={a.passed?"success":"danger"}>{a.passed?"ناجح":"راسب"}</Badge2>
                    </div>
                  </div>
                ))}
              </div>
            </Card2>
          </div>
        </div>
      </div>
      <Modal2 open={parentPhoneModal} onClose={()=>setParentPhoneModal(false)} title="تغيير رقم ولي الأمر"><div className="space-y-4"><Input2 label="الرقم الحالي" value={s.parentPhone} disabled dir="ltr"/><Input2 label="الرقم الجديد" placeholder="01xxxxxxxxx" value={newParentPhone} onChange={e=>setNewParentPhone(e.target.value.replace(/\D/g,"").slice(0,11))} dir="ltr"/><div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">لن يتغير الرقم الحالي إلا بعد تأكيد OTP المرسل عبر WhatsApp إلى الرقم الجديد.</div><div className="flex gap-2"><Btn variant="outline" className="flex-1" onClick={()=>setParentPhoneModal(false)}>إلغاء</Btn><Btn className="flex-1" disabled={!/^01[0125][0-9]{8}$/.test(newParentPhone)} onClick={()=>{setParentPhoneModal(false);setNewParentPhone("");notify("تم إرسال OTP والطلب بانتظار التحقق","success");}}>إرسال رمز التحقق</Btn></div></div></Modal2>
      <Modal2 open={devicesModal} onClose={()=>setDevicesModal(false)} title={`أجهزة ${s.name}`} size="lg"><div className="space-y-3">{[{name:"Samsung Galaxy A54",info:"Android 14 • Chrome • متصل الآن",current:true},{name:"Lenovo IdeaPad",info:"Windows 11 • Chrome • منذ يومين",current:false},{name:"iPad",info:"iPadOS 18 • Safari • منذ 6 أيام",current:false}].map((device,index)=><div key={device.name} className="flex items-center gap-3 p-3 rounded-xl border border-border"><Monitor size={18} className="text-primary"/><div className="flex-1"><div className="text-sm font-bold">{device.name}</div><div className="text-xs text-muted-foreground">{device.info}</div></div>{device.current?<Badge2 variant="success">الجلسة الحالية</Badge2>:<Btn size="sm" variant="ghost" onClick={()=>notify("تم إلغاء الجهاز وإنهاء جلسته","success")}>إلغاء الجهاز</Btn>}</div>)}</div></Modal2>
    </div>
  );
}

// ============================================================
// VIDEO UPLOAD MODAL — complete state machine
// ============================================================
type VidState = "none"|"selected"|"uploading"|"cancelled"|"uploaded"|"transcoding"|"ready"|"failed";
export function VidUploadModal({ item, onClose }: { item: any; onClose: () => void }) {
  const [mode,     setMode]     = useState<"youtube"|"upload">("upload");
  const [ytUrl,    setYtUrl]    = useState("");
  const [state,    setState]    = useState<VidState>(
    item.videoStatus==="ready" ? "ready" : item.videoStatus==="uploading" ? "uploading" : "none"
  );
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const timerRef = useRef<any>(null);

  const simulateUpload = () => {
    setState("uploading"); setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += rn(3, 9);
      if (p >= 100) {
        clearInterval(timerRef.current);
        setProgress(100);
        setState("transcoding");
        setTimeout(() => {
          // 80% chance success, 20% failure for demo
          setState(Math.random() > 0.2 ? "ready" : "failed");
        }, 1800);
      } else { setProgress(p); }
    }, 200);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const stateUi: Record<VidState, { label: string; color: string; icon: React.ReactNode }> = {
    none:         { label:"لا يوجد فيديو",        color:"text-muted-foreground", icon:<Video size={14}/> },
    selected:     { label:"تم اختيار الملف",      color:"text-primary",          icon:<FileText size={14}/> },
    uploading:    { label:"جارٍ الرفع…",           color:"text-primary",          icon:<Upload size={14}/> },
    cancelled:    { label:"تم الإلغاء",            color:"text-muted-foreground", icon:<X size={14}/> },
    uploaded:     { label:"تم الرفع — بانتظار المعالجة", color:"text-primary",   icon:<Check size={14}/> },
    transcoding:  { label:"جارٍ المعالجة والترميز",color:"text-primary",          icon:<RefreshCw size={14} className="animate-spin"/> },
    ready:        { label:"الفيديو جاهز",           color:"text-green-600",        icon:<CheckCircle size={14}/> },
    failed:       { label:"فشل الرفع",              color:"text-red-600",          icon:<AlertTriangle size={14}/> },
  };
  const { label: stLabel, color: stColor, icon: stIcon } = stateUi[state];

  return (
    <Modal2 open onClose={onClose} title="رفع فيديو المحاضرة" size="md">
      <div className="space-y-4">
        {/* Lecture name */}
        <div className="p-3 bg-muted rounded-xl text-sm font-semibold truncate">{item.title}</div>

        {/* Status badge */}
        <div className={cn("flex items-center gap-2 text-sm font-semibold", stColor)}>
          {stIcon} {stLabel}
          {fileName && state !== "none" && (
            <span className="text-xs text-muted-foreground font-normal truncate max-w-[160px]">{fileName}</span>
          )}
        </div>

        {/* Upload progress bar */}
        {(state==="uploading" || state==="transcoding") && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{state==="uploading"?"جارٍ الرفع…":"جارٍ الترميز…"}</span>
              {state==="uploading" && <span>{progress}%</span>}
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className={cn("h-2 rounded-full transition-all duration-200",
                state==="transcoding"?"bg-primary/50 animate-pulse":"bg-primary")}
                style={{ width: state==="uploading" ? `${progress}%` : "70%" }}/>
            </div>
            {state==="uploading" && (
              <button onClick={() => { clearInterval(timerRef.current); setState("cancelled"); }}
                className="text-xs text-red-600 hover:underline">إلغاء الرفع</button>
            )}
          </div>
        )}

        {/* Failure retry */}
        {state==="failed" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
            <AlertTriangle size={14} className="text-red-600 shrink-0"/>
            <span className="text-sm text-red-700 dark:text-red-400 flex-1">فشل الرفع — يرجى المحاولة مجدداً.</span>
            <Btn size="sm" onClick={simulateUpload}><RotateCcw size={12}/> إعادة المحاولة</Btn>
          </div>
        )}

        {/* Ready — replace option */}
        {state==="ready" && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <CheckCircle size={14} className="text-green-600 shrink-0"/>
            <span className="text-sm flex-1 text-green-700 dark:text-green-400">الفيديو جاهز للمشاهدة.</span>
            <Btn size="sm" variant="outline" onClick={() => setState("none")}><RefreshCw size={12}/> استبدال</Btn>
          </div>
        )}

        {/* Input area — only when not uploading/transcoding */}
        {(state==="none"||state==="selected"||state==="cancelled") && (
          <>
            <div className="flex gap-1 bg-muted p-1 rounded-xl">
              {(["upload"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-colors",
                    mode===m?"bg-card shadow text-foreground":"text-muted-foreground hover:text-foreground")}>
                  رفع فيديو على المنصة
                </button>
              ))}
            </div>

            {mode==="youtube" ? (
              <div className="space-y-3">
                <Input2 label="رابط YouTube" value={ytUrl} onChange={(e:any)=>{ setYtUrl(e.target.value); if(e.target.value) setState("selected"); else setState("none"); }} placeholder="https://youtube.com/watch?v=…"/>
                {ytUrl && (
                  <div className="flex gap-2">
                    <Btn variant="outline" className="flex-1" onClick={onClose}>إلغاء</Btn>
                    <Btn className="flex-1" onClick={() => { onClose(); notify("تم حفظ رابط YouTube بنجاح","success"); }}>حفظ الرابط</Btn>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => { setFileName("lecture_video.mp4"); setProgress(0); setState("selected"); }}>
                  <Upload size={28} className="mx-auto mb-2 text-muted-foreground/50"/>
                  <div className="text-sm font-semibold mb-1">{state==="selected" ? fileName : "اسحب الملف هنا أو"}</div>
                  {state!=="selected" && <div className="text-xs text-primary font-medium">اختر ملف فيديو</div>}
                  <div className="text-xs text-muted-foreground mt-2">MP4, MOV, AVI — بحد أقصى 2 GB</div>
                </div>
                {state==="selected" && (
                  <div className="flex gap-2">
                    <Btn variant="outline" className="flex-1" onClick={() => { setState("none"); setFileName(""); }}>إزالة</Btn>
                    <Btn className="flex-1" onClick={simulateUpload}><Upload size={13}/> ابدأ الرفع</Btn>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {(state==="none"||state==="cancelled") && (
          <Btn variant="outline" className="w-full" onClick={onClose}>إغلاق</Btn>
        )}
      </div>
    </Modal2>
  );
}

// ============================================================
// CONTENT MANAGEMENT — 4-level hierarchical: مادة > باب > درس > محاضرة
// ============================================================
export function ContentManagePage({ role: _role, nav, params }: any) {
  type Lvl = "subjects"|"abwab"|"durus"|"mahadarat";

  // If arriving with jumpToLectures, pre-select first available chain
  const jumpInit = !!params?.jumpToLectures;
  const initSubj = jumpInit ? SUBJECTS[0] : null;
  const initBab  = jumpInit ? ABWAB.find(b=>b.subjectId===SUBJECTS[0]?.id) || null : null;
  const initDars = jumpInit ? DURUS.find(d=>d.babId===initBab?.id) || null : null;

  const [selSubject, setSelSubject] = useState<any>(initSubj);
  const [selBab,     setSelBab]     = useState<any>(initBab);
  const [selDars,    setSelDars]    = useState<any>(initDars);

  const [fGrade,  setFGrade]  = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSearch, setFSearch] = useState("");

  const [addModal,      setAddModal]      = useState(false);
  const [addForm,       setAddForm]       = useState({title:"",description:"",status:"draft",duration:"",isOpen:false});
  const [editModal,     setEditModal]     = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [skelLoading,   setSkelLoading]   = useState(false);
  const [gridView,      setGridView]      = useState(true);
  const [vidUploadModal,setVidUploadModal]= useState<any>(null);
  const [editorTab,     setEditorTab]     = useState("data");
  const [editorVidMode, setEditorVidMode] = useState<"youtube"|"upload">("upload");
  // Controlled editor form — populated when editModal opens
  const [editorTitle,   setEditorTitle]   = useState("");
  const [editorShortDesc,setEditorShortDesc]=useState("");
  const [editorDesc,    setEditorDesc]    = useState("");
  const [editorStatus,  setEditorStatus]  = useState("draft");
  const [editorAccess,  setEditorAccess]  = useState("paid");
  const [editorOrder,   setEditorOrder]   = useState("1");
  const [editorGrade,   setEditorGrade]   = useState("");
  const [editorSubject, setEditorSubject] = useState("");
  const [editorBab,     setEditorBab]     = useState("");
  const [editorDars,    setEditorDars]    = useState("");
  const [editorDirty,   setEditorDirty]   = useState(false);
  const [titleError,    setTitleError]    = useState(false);

  // Local order overrides (temporary, resets on refresh — real would hit API)
  const [orderMap, setOrderMap] = useState<Record<string,Record<number,number>>>({});

  const level: Lvl = selDars ? "mahadarat" : selBab ? "durus" : selSubject ? "abwab" : "subjects";

  const drillIn = (type: "subject"|"bab"|"dars", item: any) => {
    setSkelLoading(true);
    setTimeout(() => setSkelLoading(false), 380);
    setFStatus(""); setFSearch("");
    if (type==="subject") { setSelSubject(item); setSelBab(null); setSelDars(null); }
    else if (type==="bab") { setSelBab(item); setSelDars(null); }
    else setSelDars(item);
  };

  const crumbTo = (to: "top"|"subject"|"bab") => {
    setSkelLoading(true);
    setTimeout(() => setSkelLoading(false), 280);
    setFStatus(""); setFSearch("");
    if (to==="top")     { setSelSubject(null); setSelBab(null); setSelDars(null); }
    else if (to==="subject") { setSelBab(null); setSelDars(null); }
    else setSelDars(null);
  };

  const getOrd = (ns: string, id: number, fb: number) => orderMap[ns]?.[id] ?? fb;

  const move = (ns: string, items: any[], id: number, dir: 1|-1) => {
    const sorted = [...items].sort((a,b)=>getOrd(ns,a.id,a.order)-getOrd(ns,b.id,b.order));
    const idx = sorted.findIndex(i=>i.id===id);
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= sorted.length) return;
    const ao = getOrd(ns,sorted[idx].id,sorted[idx].order);
    const bo = getOrd(ns,sorted[tgt].id,sorted[tgt].order);
    setOrderMap(m=>({...m,[ns]:{...m[ns],[sorted[idx].id]:bo,[sorted[tgt].id]:ao}}));
  };

  // Summary helpers
  const subSum  = (s: any) => { const bs=ABWAB.filter(b=>b.subjectId===s.id); const ds=DURUS.filter(d=>bs.some(b=>b.id===d.babId)); const ms=MAHADARAT.filter(m=>ds.some(d=>d.id===m.darsId)); return {abwab:bs.length,durus:ds.length,mahadarat:ms.length,pub:ms.filter(m=>m.status==="published").length,draft:ms.filter(m=>m.status==="draft").length}; };
  const babSum  = (b: any) => { const ds=DURUS.filter(d=>d.babId===b.id); const ms=MAHADARAT.filter(m=>ds.some(d=>d.id===m.darsId)); return {durus:ds.length,mahadarat:ms.length,pub:ms.filter(m=>m.status==="published").length,draft:ms.filter(m=>m.status==="draft").length}; };
  const darsSum = (d: any) => { const ms=MAHADARAT.filter(m=>m.darsId===d.id); return {mahadarat:ms.length,pub:ms.filter(m=>m.status==="published").length,draft:ms.filter(m=>m.status==="draft").length,open:ms.filter(m=>m.isOpen).length}; };

  // Filtered + sorted lists for current level
  const subjects = useMemo(()=>{ let s=SUBJECTS; if(fGrade)s=s.filter(x=>x.grade===fGrade); if(fSearch)s=s.filter(x=>x.name.includes(fSearch)||x.description.includes(fSearch)); return s; },[fGrade,fSearch]);

  const abwab = useMemo(()=>{ if(!selSubject)return[]; let s=ABWAB.filter(b=>b.subjectId===selSubject.id); if(fStatus)s=s.filter(b=>b.status===fStatus); if(fSearch)s=s.filter(b=>b.title.includes(fSearch)); return [...s].sort((a,b)=>getOrd("abwab",a.id,a.order)-getOrd("abwab",b.id,b.order)); },[selSubject,fStatus,fSearch,orderMap]);

  const durus = useMemo(()=>{ if(!selBab)return[]; let s=DURUS.filter(d=>d.babId===selBab.id); if(fStatus)s=s.filter(d=>d.status===fStatus); if(fSearch)s=s.filter(d=>d.title.includes(fSearch)); return [...s].sort((a,b)=>getOrd("durus",a.id,a.order)-getOrd("durus",b.id,b.order)); },[selBab,fStatus,fSearch,orderMap]);

  const mahadarat = useMemo(()=>{ if(!selDars)return[]; let s=MAHADARAT.filter(m=>m.darsId===selDars.id); if(fStatus)s=s.filter(m=>m.status===fStatus); if(fSearch)s=s.filter(m=>m.title.includes(fSearch)); return [...s].sort((a,b)=>getOrd("mahadarat",a.id,a.order)-getOrd("mahadarat",b.id,b.order)); },[selDars,fStatus,fSearch,orderMap]);

  const statusMeta: Record<string,{label:string;variant:string}> = {
    published:{label:"منشور",variant:"success"},
    draft:    {label:"مسودة", variant:"warning"},
    hidden:   {label:"مخفي",  variant:"default"},
    archive:  {label:"مؤرشف",variant:"default"},
  };
  const vidMeta: Record<string,{label:string;variant:string}> = {
    ready:   {label:"جاهز",      variant:"success"},
    pending: {label:"في الانتظار",variant:"warning"},
    uploading:{label:"جارٍ الرفع",variant:"info"},
    failed:  {label:"فشل الرفع", variant:"danger"},
  };

  const addLabels: Record<Lvl,string> = { subjects:"إضافة مادة", abwab:"إضافة باب", durus:"إضافة درس", mahadarat:"إضافة محاضرة" };

  // Shared order buttons (inline to avoid nested component hook issues)
  const OrdBtns = ({ns,items,id}:{ns:string;items:any[];id:number}) => {
    const sorted=[...items].sort((a,b)=>getOrd(ns,a.id,a.order)-getOrd(ns,b.id,b.order));
    const idx=sorted.findIndex(i=>i.id===id);
    return (
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={e=>{e.stopPropagation();move(ns,items,id,-1);}} disabled={idx===0}
          className="w-6 h-5 flex items-center justify-center hover:bg-accent rounded disabled:opacity-25 text-muted-foreground">
          <ChevronDown size={11} className="rotate-180"/>
        </button>
        <button onClick={e=>{e.stopPropagation();move(ns,items,id,1);}} disabled={idx===sorted.length-1}
          className="w-6 h-5 flex items-center justify-center hover:bg-accent rounded disabled:opacity-25 text-muted-foreground">
          <ChevronDown size={11}/>
        </button>
      </div>
    );
  };

  // Skeleton rows
  const SkelRows = ({cols=5,n=4}:{cols?:number;n?:number}) => (
    <>
      {Array.from({length:n},(_,i)=>(
        <tr key={i} className="border-b border-border/30">
          {Array.from({length:cols},(_,j)=>(
            <td key={j} className="py-3 px-4">
              <div className={cn("animate-pulse bg-muted rounded h-4",j===1?"w-40":j===0?"w-8":"w-16 mx-auto")}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  // Empty state
  const Empty = ({label}:{label:string}) => (
    <tr><td colSpan={10} className="py-16 text-center text-muted-foreground">
      <BookOpen size={32} className="mx-auto mb-2 opacity-30"/>
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs mt-1 opacity-70">اضغط «{addLabels[level]}» للبدء</p>
    </td></tr>
  );

  const previewLecture = buildPreviewNav(nav);

  const doStatusToggle = (item: any) =>
    notify(item.status==="published"?`تم إخفاء: ${item.title}`:`تم نشر: ${item.title}`,"success");

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h1 className="text-2xl font-black">إدارة المحتوى</h1>
          <Btn size="sm" onClick={()=>{ setAddForm({title:"",description:"",status:"draft",duration:"",isOpen:false}); setAddModal(true); }}>
            <Plus size={14}/> {addLabels[level]}
          </Btn>
        </div>

        {/* Breadcrumb RTL */}
        <nav className="flex items-center gap-1.5 text-sm mb-5 flex-wrap" aria-label="مسار التنقل">
          <button onClick={()=>crumbTo("top")}
            className={cn("font-medium transition-colors hover:text-primary",level==="subjects"?"text-foreground font-bold":"text-muted-foreground")}>
            إدارة المحتوى
          </button>
          {selSubject && <>
            <ChevronLeft size={13} className="text-muted-foreground shrink-0"/>
            <button onClick={()=>crumbTo("subject")}
              className={cn("font-medium transition-colors hover:text-primary",level==="abwab"?"text-foreground font-bold":"text-muted-foreground")}>
              {selSubject.name}
            </button>
          </>}
          {selBab && <>
            <ChevronLeft size={13} className="text-muted-foreground shrink-0"/>
            <button onClick={()=>crumbTo("bab")}
              className={cn("font-medium transition-colors hover:text-primary",level==="durus"?"text-foreground font-bold":"text-muted-foreground")}>
              {selBab.title}
            </button>
          </>}
          {selDars && <>
            <ChevronLeft size={13} className="text-muted-foreground shrink-0"/>
            <span className="text-foreground font-bold">{selDars.title}</span>
          </>}
        </nav>

        {/* Level subtitle + summary chips */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="font-bold text-base">{level==="subjects"?"المواد الدراسية":level==="abwab"?`أبواب: ${selSubject?.name}`:level==="durus"?`دروس الباب: ${selBab?.title}`:`محاضرات الدرس: ${selDars?.title}`}</span>
        </div>

        {/* Summary chips for parent level */}
        {level==="abwab" && selSubject && (()=>{ const sm=subSum(selSubject); return (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge2 variant="primary">{sm.abwab} أبواب</Badge2>
            <Badge2>{sm.durus} درس</Badge2>
            <Badge2>{sm.mahadarat} محاضرة</Badge2>
            <Badge2 variant="success">{sm.pub} منشور</Badge2>
            {sm.draft>0&&<Badge2 variant="warning">{sm.draft} مسودة</Badge2>}
          </div>
        ); })()}
        {level==="durus" && selBab && (()=>{ const sm=babSum(selBab); return (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge2 variant="primary">{sm.durus} درس</Badge2>
            <Badge2>{sm.mahadarat} محاضرة</Badge2>
            <Badge2 variant="success">{sm.pub} منشور</Badge2>
            {sm.draft>0&&<Badge2 variant="warning">{sm.draft} مسودة</Badge2>}
          </div>
        ); })()}
        {level==="mahadarat" && selDars && (()=>{ const sm=darsSum(selDars); return (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge2 variant="primary">{sm.mahadarat} محاضرة</Badge2>
            <Badge2 variant="success">{sm.pub} منشور</Badge2>
            {sm.draft>0&&<Badge2 variant="warning">{sm.draft} مسودة</Badge2>}
            {sm.open>0&&<Badge2 variant="info">{sm.open} مجاني</Badge2>}
          </div>
        ); })()}

        {/* Filter bar — cascading, grade first */}
        <div className="flex flex-wrap gap-3 mb-5 items-end p-3 bg-card border border-border rounded-2xl">
          {level==="subjects" && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">الصف (أولًا)</label>
              <select aria-label="تصفية المواد حسب الصف" value={fGrade} onChange={e=>{setFGrade(e.target.value);}}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">كل الصفوف</option>
                {GRADES.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          {level!=="subjects" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">المادة</label>
                <div className="px-3 py-2 rounded-xl border border-border bg-muted text-sm min-h-[40px] flex items-center text-muted-foreground">
                  {selSubject?.name||"—"}
                </div>
              </div>
              {(level==="durus"||level==="mahadarat") && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">الباب</label>
                  <div className="px-3 py-2 rounded-xl border border-border bg-muted text-sm min-h-[40px] flex items-center text-muted-foreground max-w-[160px] truncate">
                    {selBab?.title||"—"}
                  </div>
                </div>
              )}
              {level==="mahadarat" && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">الدرس</label>
                  <div className="px-3 py-2 rounded-xl border border-border bg-muted text-sm min-h-[40px] flex items-center text-muted-foreground max-w-[160px] truncate">
                    {selDars?.title||"—"}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">حالة النشر</label>
                <select aria-label="تصفية المحتوى حسب حالة النشر" value={fStatus} onChange={e=>setFStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">كل الحالات</option>
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                  <option value="hidden">مخفي</option>
                  <option value="archive">مؤرشف</option>
                </select>
              </div>
            </>
          )}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-muted-foreground block mb-1">بحث</label>
            <div className="relative">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
              <input aria-label="البحث في المحتوى" value={fSearch} onChange={e=>setFSearch(e.target.value)} placeholder="ابحث بالعنوان…"
                className="w-full pr-8 pl-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[40px]"/>
            </div>
          </div>
          {(fGrade||fStatus||fSearch) && (
            <div className="self-end pb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black">
                {[fGrade,fStatus,fSearch].filter(Boolean).length}
              </span>
              <button onClick={()=>{setFGrade("");setFStatus("");setFSearch("");}}
                className="text-xs text-primary hover:underline">مسح الفلاتر</button>
            </div>
          )}
        </div>

        {/* ── SUBJECTS LEVEL ── card grid */}
        {level==="subjects" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skelLoading
              ? Array.from({length:3},(_,i)=>(
                  <Card2 key={i}><div className="space-y-3">
                    <div className="animate-pulse bg-muted h-9 w-16 rounded-xl"/>
                    <div className="animate-pulse bg-muted h-5 rounded w-36"/>
                    <div className="animate-pulse bg-muted h-3 rounded w-full"/>
                    <div className="animate-pulse bg-muted h-3 rounded w-3/4"/>
                    <div className="grid grid-cols-3 gap-2">{[0,1,2].map(j=><div key={j} className="animate-pulse bg-muted h-12 rounded-xl"/>)}</div>
                  </div></Card2>
                ))
              : subjects.length===0
                ? <div className="col-span-3 py-16 text-center text-muted-foreground"><p className="text-3xl mb-2">📭</p><p>لا توجد مواد مطابقة</p></div>
                : subjects.map(s=>{ const sm=subSum(s); return (
                    <Card2 key={s.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors group"
                      role="button" tabIndex={0} aria-label={`فتح أبواب مادة ${s.name}`}
                      onKeyDown={(event:any) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); drillIn("subject",s); } }}
                      onClick={()=>drillIn("subject",s)}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{s.icon}</span>
                        <div className="flex gap-1.5">
                          <Badge2 variant="success">منشور</Badge2>
                          <button aria-label={`تعديل مادة ${s.name}`} onClick={e=>{e.stopPropagation();setEditModal({item:s,type:"subject"});}}
                            className="p-1.5 hover:bg-accent rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity">
                            <Edit2 size={12}/>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-base mb-0.5">{s.name}</h3>
                      <p className="text-xs text-primary font-semibold mb-2">{s.grade}</p>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">{s.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                        <div className="bg-muted rounded-xl p-2"><div className="font-black text-sm">{sm.abwab}</div><div className="text-muted-foreground">أبواب</div></div>
                        <div className="bg-muted rounded-xl p-2"><div className="font-black text-sm">{sm.durus}</div><div className="text-muted-foreground">دروس</div></div>
                        <div className="bg-muted rounded-xl p-2"><div className="font-black text-sm">{sm.mahadarat}</div><div className="text-muted-foreground">محاضرات</div></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <Badge2 variant="success">{sm.pub} منشور</Badge2>
                          {sm.draft>0&&<Badge2 variant="warning">{sm.draft} مسودة</Badge2>}
                        </div>
                        <div className="flex items-center gap-1 text-primary text-xs font-semibold">
                          فتح الأبواب <ChevronLeft size={13}/>
                        </div>
                      </div>
                    </Card2>
                  ); })
            }
          </div>
        )}

        {/* ── ABWAB LEVEL ── */}
        {level==="abwab" && (
          <Card2 className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-muted-foreground text-xs">
                    <th className="py-3 px-3 w-8 text-center">↕</th>
                    <th className="text-right py-3 px-4">عنوان الباب</th>
                    <th className="text-center py-3 px-3 hidden md:table-cell">الدروس</th>
                    <th className="text-center py-3 px-3 hidden md:table-cell">المحاضرات</th>
                    <th className="text-center py-3 px-3">الحالة</th>
                    <th className="text-center py-3 px-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {skelLoading ? <SkelRows cols={6} n={4}/> :
                   abwab.length===0 ? <Empty label="لا توجد أبواب بعد"/> :
                   abwab.map(b=>{ const sm=babSum(b); return (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-2 px-3">
                        <OrdBtns ns="abwab" items={ABWAB.filter(x=>x.subjectId===selSubject?.id)} id={b.id}/>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{b.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-xs line-clamp-1">{b.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <span className="font-bold">{sm.durus}</span>
                      </td>
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <div className="font-bold">{sm.mahadarat}</div>
                        <div className="text-[10px] text-muted-foreground">{sm.pub} منشور</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge2 variant={statusMeta[b.status]?.variant as any}>{statusMeta[b.status]?.label}</Badge2>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={()=>drillIn("bab",b)} className="p-1.5 hover:bg-primary/10 rounded-xl text-primary" title="فتح الدروس"><ChevronLeft size={13}/></button>
                          <button onClick={e=>{e.stopPropagation();setEditModal({item:b,type:"bab"});}} className="p-1.5 hover:bg-accent rounded-xl" title="تعديل"><Edit2 size={13}/></button>
                          <button onClick={()=>doStatusToggle(b)} className="p-1.5 hover:bg-accent rounded-xl" title={b.status==="published"?"إخفاء":"نشر"}>
                            {b.status==="published"?<Eye size={13}/>:<CheckCircle size={13} className="text-primary"/>}
                          </button>
                          <button onClick={()=>setDeleteConfirm({item:b,type:"bab"})} className="p-1.5 hover:bg-accent rounded-xl text-red-500" title="حذف"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </Card2>
        )}

        {/* ── DURUS LEVEL ── */}
        {level==="durus" && (
          <Card2 className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-muted-foreground text-xs">
                    <th className="py-3 px-3 w-8 text-center">↕</th>
                    <th className="text-right py-3 px-4">عنوان الدرس</th>
                    <th className="text-center py-3 px-3 hidden md:table-cell">المحاضرات</th>
                    <th className="text-center py-3 px-3">الحالة</th>
                    <th className="text-center py-3 px-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {skelLoading ? <SkelRows cols={5} n={3}/> :
                   durus.length===0 ? <Empty label="لا توجد دروس بعد"/> :
                   durus.map(d=>{ const sm=darsSum(d); return (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-2 px-3">
                        <OrdBtns ns="durus" items={DURUS.filter(x=>x.babId===selBab?.id)} id={d.id}/>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{d.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-sm line-clamp-1 leading-relaxed">{d.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <div className="font-bold">{sm.mahadarat}</div>
                        <div className="text-[10px] text-muted-foreground">{sm.pub} منشور</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge2 variant={statusMeta[d.status]?.variant as any}>{statusMeta[d.status]?.label}</Badge2>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={()=>drillIn("dars",d)} className="p-1.5 hover:bg-primary/10 rounded-xl text-primary" title="فتح المحاضرات"><ChevronLeft size={13}/></button>
                          <button onClick={e=>{e.stopPropagation();setEditModal({item:d,type:"dars"});}} className="p-1.5 hover:bg-accent rounded-xl" title="تعديل"><Edit2 size={13}/></button>
                          <button onClick={()=>doStatusToggle(d)} className="p-1.5 hover:bg-accent rounded-xl" title={d.status==="published"?"إخفاء":"نشر"}>
                            {d.status==="published"?<Eye size={13}/>:<CheckCircle size={13} className="text-primary"/>}
                          </button>
                          <button onClick={()=>setDeleteConfirm({item:d,type:"dars"})} className="p-1.5 hover:bg-accent rounded-xl text-red-500" title="حذف"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </Card2>
        )}

        {/* ── MAHADARAT LEVEL — Lecture Grid/List ── */}
        {level==="mahadarat" && (
          <>
            {/* Toolbar: grid/list toggle */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                <button onClick={() => setGridView(true)}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                    gridView?"bg-card shadow text-foreground":"text-muted-foreground hover:text-foreground")}>
                  شبكة
                </button>
                <button onClick={() => setGridView(false)}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                    !gridView?"bg-card shadow text-foreground":"text-muted-foreground hover:text-foreground")}>
                  جدول
                </button>
              </div>
              <Badge2 variant="primary">{mahadarat.length} محاضرة</Badge2>
            </div>

            {/* Skeletons */}
            {skelLoading && gridView && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({length:6},(_,i)=>(
                  <Card2 key={i}><div className="space-y-3">
                    <div className="animate-pulse bg-muted rounded-xl aspect-video"/>
                    <div className="animate-pulse bg-muted h-4 rounded w-3/4"/>
                    <div className="animate-pulse bg-muted h-3 rounded"/>
                  </div></Card2>
                ))}
              </div>
            )}
            {skelLoading && !gridView && (
              <Card2 className="!p-0 overflow-hidden"><table className="w-full"><tbody>
                {Array.from({length:4},(_,i)=>(
                  <tr key={i} className="border-b border-border/30">
                    {[1,2,3,4].map(j=><td key={j} className="py-3 px-4"><div className="animate-pulse bg-muted rounded h-4"/></td>)}
                  </tr>
                ))}
              </tbody></table></Card2>
            )}

            {/* Empty */}
            {!skelLoading && mahadarat.length===0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Video size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="font-semibold">لا توجد محاضرات بعد</p>
                <p className="text-sm mt-1">اضغط «إضافة محاضرة» للبدء</p>
              </div>
            )}

            {/* GRID */}
            {!skelLoading && mahadarat.length>0 && gridView && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mahadarat.map(m => {
                  const thumbBg = ["bg-primary/15","bg-muted","bg-accent/60"][m.id%3];
                  return (
                    <Card2 key={m.id} className="!p-0 overflow-hidden group hover:border-primary/40 transition-colors">
                      <div className={cn("relative aspect-video flex items-center justify-center", thumbBg)}>
                        <Video size={32} className="text-primary/30"/>
                        <div className="absolute inset-0 flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <Badge2 variant={statusMeta[m.status]?.variant as any} className="text-[10px]">{statusMeta[m.status]?.label}</Badge2>
                            <Badge2 variant={vidMeta[m.videoStatus]?.variant as any} className="text-[10px]">{vidMeta[m.videoStatus]?.label}</Badge2>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="flex gap-1">
                              {m.isOpen && <span className="text-[9px] bg-primary/15 text-primary dark:bg-primary/25 px-1.5 py-0.5 rounded-full font-semibold">مجاني</span>}
                              {m.hasExam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">اختبار</span>}
                            </div>
                            <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">{m.duration}</span>
                          </div>
                        </div>
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <OrdBtns ns="mahadarat" items={MAHADARAT.filter(x=>x.darsId===selDars?.id)} id={m.id}/>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-sm leading-snug mb-1 line-clamp-2">{m.title}</div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2.5">
                          <span>#{m.order} • منذ يومين</span>
                          <span>120 مشاهدة • 68% إكمال</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Btn size="sm" variant="outline" className="!px-2 !py-1 !min-h-0 text-xs flex-1"
                            onClick={() => previewLecture(m.id)}>
                            <Eye size={11}/> معاينة
                          </Btn>
                          <Btn size="sm" variant="outline" className="!px-2 !py-1 !min-h-0 text-xs flex-1"
                            onClick={() => { setEditorTab("data"); setEditModal({item:m,type:"mahadara"}); setEditorTitle(m.title||""); setEditorShortDesc(""); setEditorDesc(""); setEditorStatus(m.status||"draft"); setEditorAccess(m.isOpen?"free":"paid"); setEditorOrder(String(m.order||1)); setEditorDirty(false); setTitleError(false); }}>
                            <Edit2 size={11}/> تعديل
                          </Btn>
                          <Btn size="sm" variant="secondary" className="!px-2 !py-1 !min-h-0 text-xs flex-1"
                            onClick={() => setVidUploadModal(m)}>
                            <Upload size={11}/> فيديو
                          </Btn>
                          <button onClick={() => setDeleteConfirm({item:m,type:"mahadara"})}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500">
                            <Trash2 size={11}/>
                          </button>
                        </div>
                      </div>
                    </Card2>
                  );
                })}
              </div>
            )}

            {/* LIST */}
            {!skelLoading && mahadarat.length>0 && !gridView && (
              <Card2 className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr className="text-muted-foreground text-xs">
                        <th className="py-3 px-3 w-8">↕</th>
                        <th className="text-right py-3 px-4">المحاضرة</th>
                        <th className="text-center py-3 px-3 hidden sm:table-cell">المدة</th>
                        <th className="text-center py-3 px-3 hidden md:table-cell">مجاني</th>
                        <th className="text-center py-3 px-3 hidden md:table-cell">اختبار</th>
                        <th className="text-center py-3 px-3 hidden lg:table-cell">الفيديو</th>
                        <th className="text-center py-3 px-3">الحالة</th>
                        <th className="text-center py-3 px-3">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mahadarat.map(m => (
                        <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="py-2 px-3"><OrdBtns ns="mahadarat" items={MAHADARAT.filter(x=>x.darsId===selDars?.id)} id={m.id}/></td>
                          <td className="py-3 px-4">
                            <div className="font-semibold">{m.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">120 مشاهدة • إكمال 68%</div>
                          </td>
                          <td className="py-3 px-3 text-center text-xs hidden sm:table-cell">{m.duration}</td>
                          <td className="py-3 px-3 text-center hidden md:table-cell">
                            {m.isOpen?<CheckCircle size={13} className="text-green-500 mx-auto"/>:<span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-3 px-3 text-center hidden md:table-cell">
                            {m.hasExam?<CheckCircle size={13} className="text-green-500 mx-auto"/>:<span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-3 px-3 text-center hidden lg:table-cell">
                            <Badge2 variant={vidMeta[m.videoStatus]?.variant as any}>{vidMeta[m.videoStatus]?.label}</Badge2>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge2 variant={statusMeta[m.status]?.variant as any}>{statusMeta[m.status]?.label}</Badge2>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 justify-center">
                              <button onClick={() => previewLecture(m.id)} className="p-1.5 hover:bg-accent rounded-xl text-primary" title="معاينة"><Eye size={13}/></button>
                              <button onClick={() => { setEditorTab("data"); setEditModal({item:m,type:"mahadara"}); setEditorTitle(m.title||""); setEditorShortDesc(""); setEditorDesc(""); setEditorStatus(m.status||"draft"); setEditorAccess(m.isOpen?"free":"paid"); setEditorOrder(String(m.order||1)); setEditorDirty(false); setTitleError(false); }} className="p-1.5 hover:bg-accent rounded-xl" title="تعديل"><Edit2 size={13}/></button>
                              <button onClick={() => setVidUploadModal(m)} className="p-1.5 hover:bg-accent rounded-xl" title="رفع فيديو"><Upload size={13}/></button>
                              <button onClick={() => doStatusToggle(m)} className="p-1.5 hover:bg-accent rounded-xl" title={m.status==="published"?"إخفاء":"نشر"}>
                                {m.status==="published"?<CheckCircle size={13} className="text-primary"/>:<CheckCircle size={13} className="text-muted-foreground"/>}
                              </button>
                              <button onClick={() => setDeleteConfirm({item:m,type:"mahadara"})} className="p-1.5 hover:bg-accent rounded-xl text-red-500" title="حذف"><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card2>
            )}
          </>
        )}
      </div>

      {/* ── ADD MODAL ── */}
      <Modal2 open={addModal} onClose={()=>setAddModal(false)} title={addLabels[level]}>
        <div className="space-y-4">
          <Input2 label="العنوان" placeholder="أدخل العنوان…" value={addForm.title} onChange={(e:any)=>setAddForm(f=>({...f,title:e.target.value}))}/>
          {level!=="mahadarat" && (
            <Field label="الوصف">
              <textarea value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))}
                rows={3} placeholder="وصف مختصر للمحتوى…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
            </Field>
          )}
          {level==="mahadarat" && (
            <div className="grid grid-cols-2 gap-3">
              <Input2 label="المدة" placeholder="مثال: 40 دقيقة" value={addForm.duration} onChange={(e:any)=>setAddForm(f=>({...f,duration:e.target.value}))}/>
              <Select2 label="نوع الوصول" value={addForm.isOpen?"free":"paid"} onChange={(e:any)=>setAddForm(f=>({...f,isOpen:e.target.value==="free"}))}
                options={[{value:"paid",label:"مدفوع"},{value:"free",label:"مجاني"}]}/>
            </div>
          )}
          {level==="subjects" && (
            <Select2 label="الصف" value="" onChange={()=>{}} options={[{value:"",label:"اختر الصف"},...GRADES.map(g=>({value:g,label:g}))]}/>
          )}
          <Select2 label="الحالة" value={addForm.status} onChange={(e:any)=>setAddForm(f=>({...f,status:e.target.value}))}
            options={[{value:"draft",label:"مسودة"},{value:"published",label:"منشور"},{value:"hidden",label:"مخفي"}]}/>
          <div className="flex gap-2">
            <Btn variant="outline" className="flex-1" onClick={()=>setAddModal(false)}>إلغاء</Btn>
            <Btn className="flex-1" disabled={!addForm.title.trim()}
              onClick={()=>{ setAddModal(false); notify(`تمت إضافة ${addLabels[level].replace("إضافة ","")} بنجاح`,"success"); }}>
              حفظ
            </Btn>
          </div>
        </div>
      </Modal2>

      {/* ── EDIT MODAL — multi-section for lectures ── */}
      <Modal2 open={!!editModal} onClose={()=>{ if (editorDirty && !window.confirm("لديك تعديلات غير محفوظة. هل تريد المغادرة؟")) return; setEditModal(null); }}
        title={editModal?.type==="mahadara"?"محرر المحاضرة":"تعديل"}
        size={editModal?.type==="mahadara"?"lg":"md"}>
        {editModal?.type==="mahadara" ? (
          <div>
            {/* Section tabs */}
            <div role="tablist" aria-label="أقسام محرر المحاضرة" className="flex gap-0 border-b border-border mb-4 overflow-x-auto -mx-1 px-1">
              {[
                {id:"data",  l:"البيانات"},
                {id:"place", l:"التوضع"},
                {id:"video", l:"الفيديو"},
                {id:"access",l:"الوصول"},
                {id:"exam",  l:"الاختبار"},
                {id:"pub",   l:"النشر"},
              ].map(t => (
                <button key={t.id} role="tab" aria-selected={editorTab===t.id}
                  onClick={() => setEditorTab(t.id)}
                  className={cn("px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors -mb-px",
                    editorTab===t.id?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground")}>
                  {t.l}
                </button>
              ))}
            </div>

            {editorTab==="data" && (
              <div className="space-y-4">
                <Field label="عنوان المحاضرة *">
                  <input value={editorTitle}
                    onChange={e=>{ setEditorTitle(e.target.value); setEditorDirty(true); setTitleError(!e.target.value.trim()); }}
                    placeholder="أدخل العنوان…"
                    className={cn("w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground min-h-[44px]",
                      titleError?"border-red-500":"border-border")}/>
                  {titleError && <p className="text-xs text-red-600 mt-1">العنوان مطلوب ولا يمكن تركه فارغًا</p>}
                </Field>
                <Field label="وصف مختصر (يظهر في الكارت)">
                  <textarea rows={2} value={editorShortDesc}
                    onChange={e=>{ setEditorShortDesc(e.target.value); setEditorDirty(true); }}
                    placeholder="سطر أو سطران فقط…"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
                </Field>
                <Field label="وصف تفصيلي (يظهر في صفحة المشاهدة)">
                  <textarea rows={4} value={editorDesc}
                    onChange={e=>{ setEditorDesc(e.target.value); setEditorDirty(true); }}
                    placeholder="شرح مفصّل للمحاضرة وأهدافها…"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
                </Field>
                <Field label="الصورة المصغرة">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Video size={20} className="text-muted-foreground/50"/>
                    </div>
                    <Btn variant="outline" size="sm" onClick={() => { setEditorDirty(true); notify("يمكنك رفع صورة مصغرة","info"); }}>
                      <Upload size={13}/> رفع صورة
                    </Btn>
                  </div>
                </Field>
              </div>
            )}

            {editorTab==="place" && (() => {
              // Cascading: grade → subjects → abwab → durus
              const filtSubjects = editorGrade ? SUBJECTS.filter(s=>s.grade===editorGrade) : SUBJECTS;
              const filtAbwab    = editorSubject ? ABWAB.filter(b=>b.subjectId===Number(editorSubject)) : [];
              const filtDurus    = editorBab ? DURUS.filter(d=>d.babId===Number(editorBab)) : [];
              return (
                <div className="space-y-4">
                  <Select2 label="الصف الدراسي" value={editorGrade}
                    onChange={(e:any)=>{ setEditorGrade(e.target.value); setEditorSubject(""); setEditorBab(""); setEditorDars(""); setEditorDirty(true); }}
                    options={[{value:"",label:"اختر الصف"},...GRADES.map(g=>({value:g,label:g}))]}/>
                  <Select2 label="المادة" value={editorSubject}
                    onChange={(e:any)=>{ setEditorSubject(e.target.value); setEditorBab(""); setEditorDars(""); setEditorDirty(true); }}
                    options={[{value:"",label:"اختر المادة"},...filtSubjects.map(s=>({value:String(s.id),label:s.name}))]}/>
                  <Select2 label="الباب" value={editorBab}
                    onChange={(e:any)=>{ setEditorBab(e.target.value); setEditorDars(""); setEditorDirty(true); }}
                    options={[{value:"",label:editorSubject?"اختر الباب":"اختر المادة أولاً"},...filtAbwab.map(b=>({value:String(b.id),label:b.title}))]}/>
                  <Select2 label="الدرس" value={editorDars}
                    onChange={(e:any)=>{ setEditorDars(e.target.value); setEditorDirty(true); }}
                    options={[{value:"",label:editorBab?"اختر الدرس":"اختر الباب أولاً"},...filtDurus.map(d=>({value:String(d.id),label:d.title}))]}/>
                  <Input2 label="رقم الترتيب" value={editorOrder}
                    onChange={(e:any)=>{ setEditorOrder(e.target.value); setEditorDirty(true); }}
                    placeholder="1"/>
                  {(editorGrade||editorSubject||editorBab||editorDars) && (
                    <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground">
                      <span className="font-bold">الموضع: </span>
                      {[editorGrade, filtSubjects.find(s=>String(s.id)===editorSubject)?.name, filtAbwab.find(b=>String(b.id)===editorBab)?.title, filtDurus.find(d=>String(d.id)===editorDars)?.title].filter(Boolean).join(" ← ")}
                    </div>
                  )}
                </div>
              );
            })()}

            {editorTab==="video" && (
              <div className="space-y-4">
                <div className="flex gap-1 bg-muted p-1 rounded-xl mb-1">
                  {(["upload"] as const).map(m => (
                    <button key={m} onClick={() => setEditorVidMode(m)}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-colors",
                        editorVidMode===m?"bg-card shadow text-foreground":"text-muted-foreground hover:text-foreground")}>
                      رفع فيديو على المنصة
                    </button>
                  ))}
                </div>
                {editorVidMode==="youtube" ? (
                  <Input2 label="رابط YouTube" placeholder="https://youtube.com/…"/>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => notify("سيفتح مربع اختيار الملف — استخدم نافذة الرفع الكاملة","info")}>
                    <Upload size={22} className="mx-auto mb-2 text-muted-foreground/50"/>
                    <div className="text-xs text-muted-foreground">انقر هنا للرفع — أو استخدم زر «فيديو» في الشبكة</div>
                  </div>
                )}
                <Input2 label="مدة الفيديو" defaultValue={editModal?.item?.duration} placeholder="مثال: 40 دقيقة"/>
                <div className="grid grid-cols-3 gap-2">
                  {["360p","480p","720p"].map(quality=><div key={quality} className="p-2.5 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 text-center"><CheckCircle size={13} className="mx-auto mb-1 text-green-600"/><span className="text-xs font-bold">{quality}</span></div>)}
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">سيظهر Watermark متحرك باسم الطالب وجزء من رقم هاتفه أثناء المشاهدة، وتخضع المشاهدة لحد الأجهزة والجلسة الواحدة.</div>
                <div className="p-3 bg-muted rounded-xl">
                  <div className="text-xs font-bold mb-2">حالة الفيديو الحالية</div>
                  <div className="flex items-center gap-2">
                    <Badge2 variant={vidMeta[editModal?.item?.videoStatus]?.variant as any}>
                      {vidMeta[editModal?.item?.videoStatus]?.label||"—"}
                    </Badge2>
                    {editModal?.item?.videoStatus==="ready" && (
                      <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={11}/> جاهز للمشاهدة</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {editorTab==="access" && (
              <div className="space-y-4">
                <Select2 label="نوع الوصول" value={editorAccess}
                  onChange={(e:any)=>{ setEditorAccess(e.target.value); setEditorDirty(true); }}
                  options={[{value:"paid",label:"يستلزم تفعيل كود"},{value:"free",label:"مجاني للجميع"}]}/>
                <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground leading-relaxed">
                  المحاضرات المجانية تظهر للطلاب غير المفعّلين ضمن المحتوى المتاح للاطلاع.
                  المحاضرات المدفوعة تتطلب كود تفعيل ساري.
                </div>
              </div>
            )}

            {editorTab==="exam" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <span className="text-sm font-semibold">اختبار مرتبط</span>
                  <button onClick={() => notify(editModal?.item?.hasExam?"تم إلغاء ربط الاختبار":"تم ربط اختبار جديد","success")}
                    className={cn("w-10 h-5 rounded-full transition-colors",editModal?.item?.hasExam?"bg-primary":"bg-muted-foreground/30")}>
                    <div className={cn("w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform",editModal?.item?.hasExam?"translate-x-5":"translate-x-0")}/>
                  </button>
                </div>
                {editModal?.item?.hasExam && (
                  <>
                    <Input2 label="نسبة النجاح %" placeholder="60" defaultValue="60"/>
                    <Input2 label="عدد المحاولات المسموحة" placeholder="3" defaultValue="3"/>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-sm">
                      <input type="checkbox" id="unlock-next" className="rounded"/>
                      <label htmlFor="unlock-next" className="text-sm cursor-pointer">إجباري لفتح المحاضرة التالية</label>
                    </div>
                  </>
                )}
              </div>
            )}

            {editorTab==="pub" && (
              <div className="space-y-4">
                <Select2 label="حالة النشر" value={editorStatus}
                  onChange={(e:any)=>{ setEditorStatus(e.target.value); setEditorDirty(true); }}
                  options={[{value:"published",label:"منشور — مرئي للطلاب"},{value:"draft",label:"مسودة — غير مرئي"},{value:"hidden",label:"مخفي مؤقتًا"},{value:"archive",label:"مؤرشف"}]}/>
                <Input2 label="موعد النشر (اختياري)" type="datetime-local" onChange={()=>setEditorDirty(true)}/>
                <div className="p-3 rounded-xl bg-muted text-xs text-muted-foreground">إخفاء المحاضرة يمنع مشاهدتها فورًا حتى للطلاب الذين فعّلوا الدرس. يمكن إعادة نشرها في أي وقت.</div>
                {(() => { const id = editModal?.item?.id; return (
                  <Btn variant="outline" size="sm" className="w-full"
                    onClick={() => { setEditModal(null); previewLecture(id); }}>
                    <Eye size={13}/> معاينة كطالب
                  </Btn>
                ); })()}
              </div>
            )}

            <div className="flex gap-2 mt-5 pt-4 border-t border-border">
              <Btn variant="outline" className="flex-1" onClick={() => {
                if (editorDirty && !window.confirm("لديك تعديلات غير محفوظة. هل تريد المغادرة؟")) return;
                setEditModal(null);
              }}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!!titleError || !editorTitle.trim()} onClick={() => {
                if (!editorTitle.trim()) { setTitleError(true); setEditorTab("data"); return; }
                setEditModal(null);
                setEditorDirty(false);
                notify("تم حفظ المحاضرة بنجاح","success");
              }}>حفظ التعديلات</Btn>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input2 label="العنوان" defaultValue={editModal?.item?.title||editModal?.item?.name}/>
            <Field label="الوصف">
              <textarea defaultValue={editModal?.item?.description} rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
            </Field>
            <Select2 label="الحالة" value={editModal?.item?.status||"draft"} onChange={()=>{}}
              options={[{value:"published",label:"منشور"},{value:"draft",label:"مسودة"},{value:"hidden",label:"مخفي"},{value:"archive",label:"مؤرشف"}]}/>
            <Field label="سياسة الإزالة"><div className="grid grid-cols-2 gap-2"><button className="p-3 rounded-xl border border-border hover:border-primary text-sm" onClick={()=>notify("سيتم نقل العنصر إلى الأرشيف مع الاحتفاظ بالنتائج","info")}>أرشفة</button><button className="p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm" onClick={()=>notify("الحذف النهائي متاح فقط إذا لم توجد نتائج أو أكواد مرتبطة","info")}>حذف نهائي</button></div></Field>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={() => setEditModal(null)}>إلغاء</Btn>
              <Btn className="flex-1" onClick={() => { setEditModal(null); notify("تم حفظ التعديلات","success"); }}>حفظ التعديلات</Btn>
            </div>
          </div>
        )}
      </Modal2>

      {/* ── VIDEO UPLOAD MODAL — full state machine ── */}
      {vidUploadModal && <VidUploadModal item={vidUploadModal} onClose={() => setVidUploadModal(null)}/>}

      {/* ── DELETE CONFIRM ── */}
      <Modal2 open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
            <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0"/>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-400">هذا الإجراء لا يمكن التراجع عنه</p>
              <p className="text-xs text-red-700 dark:text-red-500 mt-0.5 break-words">{deleteConfirm?.item?.title||deleteConfirm?.item?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" className="flex-1" onClick={()=>setDeleteConfirm(null)}>إلغاء</Btn>
            <Btn variant="danger" className="flex-1" onClick={()=>{ setDeleteConfirm(null); notify("تم الحذف","success"); }}>
              نعم، احذف
            </Btn>
          </div>
        </div>
      </Modal2>
    </div>
  );
}

// ============================================================
// ASSISTANT DASHBOARD
// ============================================================
export function AssistantDashboard({ nav }: any) {
  const [extraModal, setExtraModal]   = useState<any>(null);
  const [resetModal, setResetModal]   = useState<any>(null);
  const [reason,     setReason]       = useState("");
  const [actFilter,  setActFilter]    = useState("all");

  const tasks = [
    {id:"no-vid",   label:"بدون فيديو",         count:4, icon:Video,       urgent:true },
    {id:"vid-fail", label:"فيديو فشل الرفع",     count:1, icon:AlertTriangle,urgent:true },
    {id:"no-exam",  label:"بدون اختبار",          count:7, icon:FileText,    urgent:false},
    {id:"failed",   label:"راسبون في الاختبار",   count:failed_count(), icon:XCircle,  urgent:true },
    {id:"exhaust",  label:"استنفدوا المحاولات",   count:3, icon:Lock,        urgent:true },
    {id:"inactive", label:"غير نشط 30 يومًا",    count:inactive_count(), icon:Clock, urgent:false},
    {id:"alert60",  label:"50–60% في خطر",        count:alert60_count(), icon:AlertTriangle,urgent:false},
  ];

  function failed_count()   { return STUDENTS.filter(s=>s.score<60&&s.score>0).length; }
  function inactive_count() { return STUDENTS.filter(s=>new Date(s.lastActive)<new Date(Date.now()-30*86400000)).length; }
  function alert60_count()  { return STUDENTS.filter(s=>s.score>=50&&s.score<=60).length; }

  const auditLog = [
    {actor:"مصطفى حسن",action:"منح محاولة إضافية",target:"أحمد محمد",time:"منذ 10 د"},
    {actor:"مصطفى حسن",action:"إعادة تعيين كلمة مرور",target:"سارة خالد",time:"منذ 45 د"},
    {actor:"مصطفى حسن",action:"رفع فيديو",target:"مفهوم النحو",time:"منذ 1 س"},
    {actor:"مصطفى حسن",action:"نشر محاضرة",target:"الكلام وأقسامه",time:"منذ 2 س"},
    {actor:"مصطفى حسن",action:"منح محاولة إضافية",target:"خالد عبدالله",time:"منذ 3 س"},
  ];

  const exhaustedStudents = STUDENTS.filter((_,i)=>i<3);
  const failedStudents    = STUDENTS.filter(s=>s.score<60&&s.score>0).slice(0,3);

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">لوحة المساعد</h1>
            <p className="text-muted-foreground text-sm">مصطفى حسن — مساعد الأستاذ محمود</p>
          </div>
          <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>

        {/* Task counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-6">
          {tasks.map(t => (
            <button key={t.id} onClick={() => setActFilter(t.id===actFilter?"all":t.id)}
              className={cn("p-3 rounded-2xl border text-right transition-colors",
                actFilter===t.id?"border-primary bg-primary/5":
                t.urgent?"bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-400":
                "bg-muted border-border hover:border-primary/50")}>
              <t.icon size={14} className={cn("mb-1",t.urgent&&actFilter!==t.id?"text-red-600":"text-primary")}/>
              <div className={cn("text-xl font-black",t.urgent&&actFilter!==t.id?"text-red-700 dark:text-red-400":"text-foreground")}>{t.count}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{t.label}</div>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {/* Exhausted attempts */}
          <Card2>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Lock size={13} className="text-red-500"/> استنفدوا المحاولات</h3>
            <div className="space-y-2">
              {exhaustedStudents.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="text-muted-foreground">{s.grade}</div>
                  </div>
                  <Btn size="sm" variant="outline" className="!px-2 !py-1 !min-h-0 text-xs shrink-0"
                    onClick={() => setExtraModal(s)}>
                    <Plus size={10}/> منح
                  </Btn>
                </div>
              ))}
            </div>
          </Card2>

          {/* Failed students */}
          <Card2>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><XCircle size={13} className="text-red-500"/> الراسبون</h3>
            <div className="space-y-2">
              {failedStudents.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="text-muted-foreground">{s.score}%</div>
                  </div>
                  <Btn size="sm" variant="outline" className="!px-2 !py-1 !min-h-0 text-xs shrink-0"
                    onClick={() => setResetModal(s)}>
                    <Key size={10}/> كلمة مرور
                  </Btn>
                </div>
              ))}
            </div>
          </Card2>

          {/* Quick actions */}
          <Card2>
            <h3 className="font-bold text-sm mb-3">إجراءات سريعة</h3>
            <div className="space-y-1.5">
              {[
                {l:"Lecture Grid",         icon:BookOpen, v:"content-subjects", p:{jumpToLectures:true}},
                {l:"رفع فيديو محاضرة",    icon:Upload,   v:"content-subjects", p:{jumpToLectures:true}},
                {l:"قائمة الطلاب",         icon:Users,    v:"students-list",    p:{}},
                {l:"إدارة الاختبارات",    icon:FileText, v:"exam-manage",      p:{}},
              ].map((a,i) => (
                <button key={i} onClick={() => nav(a.v, a.p || {})}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors text-right text-sm font-semibold">
                  <a.icon size={13} className="text-primary shrink-0"/> {a.l}
                </button>
              ))}
            </div>
          </Card2>
        </div>

        {/* Audit log */}
        <Card2>
          <h3 className="font-bold text-sm mb-3">سجل أنشطتي</h3>
          <div className="space-y-2">
            {auditLog.map((x,i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity size={11} className="text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{x.action}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-muted-foreground">{x.target}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{x.time}</span>
              </div>
            ))}
          </div>
        </Card2>
      </div>

      {/* Extra attempt modal */}
      <Modal2 open={!!extraModal} onClose={() => { setExtraModal(null); setReason(""); }} title="منح محاولة إضافية" size="sm">
        {extraModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl text-sm font-semibold">{extraModal.name}</div>
            <Field label="سبب المنح *">
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="اذكر سبب منح المحاولة الإضافية…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
            </Field>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={() => { setExtraModal(null); setReason(""); }}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!reason.trim()}
                onClick={() => { setExtraModal(null); setReason(""); notify(`تم منح محاولة إضافية لـ ${extraModal.name}`,"success"); }}>
                تأكيد المنح
              </Btn>
            </div>
          </div>
        )}
      </Modal2>

      {/* Password reset modal */}
      <Modal2 open={!!resetModal} onClose={() => { setResetModal(null); setReason(""); }} title="إعادة تعيين كلمة المرور" size="sm">
        {resetModal && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl text-sm font-semibold">{resetModal.name}</div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-xs text-yellow-800 dark:text-yellow-300">
              سيتم إرسال رابط إعادة التعيين لهاتف الطالب المسجّل. هذا الإجراء مسجَّل في سجل التدقيق.
            </div>
            <Field label="سبب إعادة التعيين *">
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="اذكر سبب إعادة تعيين كلمة المرور…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
            </Field>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={() => { setResetModal(null); setReason(""); }}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!reason.trim()}
                onClick={() => { setResetModal(null); setReason(""); notify(`تم إعادة تعيين كلمة مرور ${resetModal.name}`,"success"); }}>
                تأكيد الإعادة
              </Btn>
            </div>
          </div>
        )}
      </Modal2>
    </div>
  );
}

// ============================================================
// EXAM MANAGEMENT
// ============================================================
export function ExamManagePage() {
  const [qModal, setQModal] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [questions, setQuestions] = useState(EXAM_QS);
  const [draft, setDraft] = useState({text:"", choices:["","","",""], correct:0, points:5});
  const [examSettings,setExamSettings] = useState({scope:"lesson",shuffleQuestions:true,shuffleChoices:true,attemptMode:"fixed",resultMode:"instant"});
  const openQuestionEditor = (question: any = null) => {
    setEditQ(question);
    setDraft(question ? {text:question.text, choices:[...question.choices], correct:question.correct, points:question.points} : {text:"",choices:["","","",""],correct:0,points:5});
    setQModal(true);
  };
  const saveQuestion = () => {
    if (!draft.text.trim() || draft.choices.some(choice => !choice.trim())) return;
    if (editQ) setQuestions(current => current.map(question => question.id === editQ.id ? {...question, ...draft} : question));
    else setQuestions(current => [...current, {id:Math.max(0,...current.map(question=>question.id))+1, ...draft}]);
    setQModal(false);
    notify(editQ ? "تم تحديث السؤال" : "تم إضافة السؤال", "success");
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black mb-6">إدارة الاختبارات</h1>
        <Card2 className="mb-5">
          <h3 className="font-bold mb-4">إعدادات الاختبار: تعريف الاسم وعلاماته</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input2 label="نسبة النجاح (%)" type="number" value="50" readOnly/>
            <Input2 label="الوقت (دقيقة)" type="number" defaultValue="20"/>
            <Input2 label="عدد المحاولات" type="number" defaultValue="3"/>
            <Select2 label="نوع التوقيت" value="exam" onChange={()=>{}} options={[{value:"exam",label:"بالاختبار كله"},{value:"question",label:"بالسؤال"}]}/>
            <Select2 label="نطاق الاختبار" value={examSettings.scope} onChange={(e:any)=>setExamSettings(current=>({...current,scope:e.target.value}))} options={[{value:"lesson",label:"درس"},{value:"chapter",label:"باب"},{value:"branch",label:"فرع"},{value:"comprehensive",label:"شامل اللغة العربية"}]}/>
            <Select2 label="نماذج المحاولات" value={examSettings.attemptMode} onChange={(e:any)=>setExamSettings(current=>({...current,attemptMode:e.target.value}))} options={[{value:"fixed",label:"نفس الامتحان للمحاولات الثلاث"},{value:"per_attempt",label:"نموذج مختلف لكل محاولة"}]}/>
            <Select2 label="إظهار النتيجة" value={examSettings.resultMode} onChange={(e:any)=>setExamSettings(current=>({...current,resultMode:e.target.value}))} options={[{value:"instant",label:"فور التسليم مع مراجعة الأخطاء"}]}/>
            <div className="space-y-2 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={examSettings.shuffleQuestions} onChange={e=>setExamSettings(current=>({...current,shuffleQuestions:e.target.checked}))}/>ترتيب الأسئلة عشوائي</label><label className="flex items-center gap-2"><input type="checkbox" checked={examSettings.shuffleChoices} onChange={e=>setExamSettings(current=>({...current,shuffleChoices:e.target.checked}))}/>ترتيب الاختيارات عشوائي</label></div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-xs text-yellow-800 dark:text-yellow-300"><strong>تنبيه المتابعة:</strong> الطلاب الحاصلون على نتيجة من 50% إلى 60% يظهرون ضمن قائمة الخطر للمساعد والمدرس.</div>
          <Btn size="sm" className="mt-4" onClick={()=>notify("تم حفظ الإعدادات","success")}>حفظ الإعدادات</Btn>
        </Card2>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">الأسئلة ({questions.length})</h3>
          <Btn size="sm" onClick={()=>openQuestionEditor()}><Plus size={15}/> إضافة سؤال</Btn>
        </div>
        <div className="space-y-3">
          {questions.map((q,i)=>(
            <Card2 key={q.id}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0">{i+1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">{q.text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.choices.map((c,ci)=>(
                      <div key={ci} className={cn("text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1",
                        ci===q.correct?"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400":"bg-muted text-muted-foreground")}>
                        {ci===q.correct && <CheckCircle size={10} className="shrink-0"/>}
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">{q.points} نقاط</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button aria-label="تعديل السؤال" onClick={()=>openQuestionEditor(q)} className="p-1.5 hover:bg-accent rounded-xl"><Edit2 size={13}/></button>
                  <button aria-label="حذف السؤال" onClick={()=>{ if(window.confirm("هل تريد حذف هذا السؤال؟")){ setQuestions(current=>current.filter(question=>question.id!==q.id)); notify("تم حذف السؤال","success"); } }} className="p-1.5 hover:bg-accent rounded-xl text-red-500"><Trash2 size={13}/></button>
                </div>
              </div>
            </Card2>
          ))}
        </div>
        <Modal2 open={qModal} onClose={()=>setQModal(false)} title={editQ?"تعديل سؤال":"إضافة سؤال"} size="lg">
          <div className="space-y-4">
            <Input2 label="نص السؤال" placeholder="اكتب السؤال..." value={draft.text} onChange={(event:any)=>setDraft(current=>({...current,text:event.target.value}))}/>
            <div className="grid grid-cols-2 gap-3">
              {draft.choices.map((c:string,i:number)=>(
                <Input2 key={i} label={`الاختيار ${i+1}`} value={c} onChange={(event:any)=>setDraft(current=>({...current,choices:current.choices.map((choice,index)=>index===i?event.target.value:choice)}))} placeholder={`الاختيار ${i+1}`}/>
              ))}
            </div>
            <Select2 label="الإجابة الصحيحة" value={String(draft.correct)} onChange={(event:any)=>setDraft(current=>({...current,correct:Number(event.target.value)}))}
              options={[0,1,2,3].map(i=>({value:String(i),label:`الاختيار ${i+1}`}))}/>
            <Input2 label="النقاط" type="number" min="1" value={draft.points} onChange={(event:any)=>setDraft(current=>({...current,points:Math.max(1,Number(event.target.value)||1)}))}/>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={()=>setQModal(false)}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!draft.text.trim() || draft.choices.some(choice=>!choice.trim())} onClick={saveQuestion}>حفظ</Btn>
            </div>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

// ============================================================
// ACTIVATION CODES
// ============================================================
export function ActivationCodesPage() {
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [genModal, setGenModal] = useState(false);
  const [codes, setCodes] = useState(ACTIVATION_CODES);
  const [generateCount, setGenerateCount] = useState(10);
  const filtered = codes.filter(c=>{
    const ms = !search || c.code.includes(search) || (c.usedBy?.includes(search));
    const mf = fStatus==="all" || (fStatus==="used"&&c.used) || (fStatus==="unused"&&!c.used&&!c.disabled) || (fStatus==="disabled"&&c.disabled);
    return ms && mf;
  });
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black">أكواد التفعيل</h1>
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" onClick={()=>notify("تم تجهيز ملف Excel لدفعات الأكواد","success")}><Download size={14}/> تصدير Excel</Btn>
            <Btn size="sm" variant="secondary" onClick={()=>notify("جارٍ الطباعة…","info")}><Printer size={14}/> طباعة</Btn>
            <Btn size="sm" onClick={()=>setGenModal(true)}><Plus size={14}/> توليد أكواد</Btn>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl text-center">
            <div className="text-2xl font-black text-green-700 dark:text-green-300">{codes.filter(c=>c.used).length}</div>
            <div className="text-xs text-green-600 dark:text-green-400">مستخدم</div>
          </div>
          <div className="p-4 bg-muted border border-border rounded-2xl text-center">
            <div className="text-2xl font-black">{codes.filter(c=>!c.used&&!c.disabled).length}</div>
            <div className="text-xs text-muted-foreground">غير مستخدم</div>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl text-center">
            <div className="text-2xl font-black text-red-700 dark:text-red-300">{codes.filter(c=>c.disabled).length}</div>
            <div className="text-xs text-red-600 dark:text-red-400">معطَّل</div>
          </div>
        </div>
        <div className="mb-4 p-3 bg-muted rounded-xl border border-dashed border-border flex items-center gap-2 text-sm text-muted-foreground">
          <Info size={14}/>
          <span><strong>المرحلة الثانية:</strong> رمز QR وتكامل فودافون كاش — قيد التطوير</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="col-span-2 md:col-span-2">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input aria-label="البحث في أكواد التفعيل" value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث بالكود أو اسم الطالب…"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"/>
            </div>
          </div>
          <select aria-label="تصفية أكواد التفعيل حسب الحالة" value={fStatus} onChange={e=>setFStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm min-h-[44px]">
            <option value="all">كل الحالات</option>
            <option value="used">مستخدم</option>
            <option value="unused">غير مستخدم</option>
            <option value="disabled">معطَّل</option>
          </select>
        </div>
        <Card2 className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-muted-foreground text-xs">
                  <th className="text-right py-3 px-4">الكود</th>
                  <th className="text-right py-3 px-2">الباقة</th>
                  <th className="text-right py-3 px-2">مستخدم بواسطة</th>
                  <th className="text-center py-3 px-2">تاريخ الاستخدام</th>
                  <th className="text-center py-3 px-2">الحالة</th>
                  <th className="text-center py-3 px-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 px-4 font-mono font-bold text-xs">{c.code}</td>
                    <td className="py-3 px-2 text-xs">{c.packageName}</td>
                    <td className="py-3 px-2 text-xs">{c.usedBy||"—"}</td>
                    <td className="py-3 px-2 text-center text-xs">{c.usedDate?new Date(c.usedDate).toLocaleDateString("ar-EG"):"—"}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge2 variant={c.disabled?"danger":c.used?"success":"default"}>
                        {c.disabled?"معطَّل":c.used?"مستخدم":"متاح"}
                      </Badge2>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1 justify-center">
                        <button aria-label={`نسخ الكود ${c.code}`} onClick={()=>{ navigator.clipboard?.writeText(c.code); notify("تم نسخ الكود","success"); }} className="p-1.5 hover:bg-accent rounded-lg"><Copy size={12}/></button>
                        {!c.used&&!c.disabled && <button aria-label={`تعطيل الكود ${c.code}`} onClick={()=>{ if(window.confirm(`هل تريد تعطيل الكود ${c.code}؟`)){ setCodes(current=>current.map(code=>code.id===c.id?{...code,disabled:true}:code)); notify("تم تعطيل الكود","success"); } }} className="p-1.5 hover:bg-accent rounded-lg text-red-500"><XCircle size={12}/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div className="py-8 text-center text-muted-foreground text-sm">لا توجد أكواد مطابقة</div>}
        </Card2>
        <Modal2 open={genModal} onClose={()=>setGenModal(false)} title="توليد أكواد جديدة">
          <div className="space-y-4">
            <Input2 label="عدد الأكواد" type="number" min="1" max="100" value={generateCount} onChange={(event:any)=>setGenerateCount(Math.min(100,Math.max(1,Number(event.target.value)||1)))}/>
            <Select2 label="السنة الدراسية" value="2026" onChange={()=>{}} options={[{value:"2026",label:"2026 / 2027"}]}/>
            <Select2 label="الصف" value={GRADES[0]} onChange={()=>{}} options={GRADES.map(g=>({value:g,label:g}))}/>
            <Select2 label="الفرع" value="1" onChange={()=>{}} options={SUBJECTS.map(s=>({value:String(s.id),label:s.name}))}/>
            <Select2 label="الباب" value="1" onChange={()=>{}} options={ABWAB.slice(0,4).map(b=>({value:String(b.id),label:b.title}))}/>
            <Select2 label="الدرس الذي سيفتحه الكود" value="1" onChange={()=>{}} options={DURUS.slice(0,6).map(d=>({value:String(d.id),label:d.title}))}/>
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">الكود يستخدم مرة واحدة ويفتح الدرس بالكامل، بما فيه أي محاضرات تضاف إليه لاحقًا، حتى نهاية السنة الدراسية.</div>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={()=>setGenModal(false)}>إلغاء</Btn>
              <Btn className="flex-1" onClick={()=>{
                const start = Math.max(2000,...codes.map(code=>Number(code.code.replace(/\D/g,""))||0)) + 1;
                const created = Array.from({length:generateCount},(_,index)=>({id:Date.now()+index,code:`ALM-${String(start+index).padStart(6,"0")}`,packageName:"كود درس — مقدمة في علم النحو",grade:GRADES[0],used:false,usedBy:null,usedDate:null,disabled:false,createdDate:new Date().toISOString()}));
                setCodes(current=>[...created,...current]); setGenModal(false); notify(`تم توليد ${generateCount} كود`,"success");
              }}>توليد</Btn>
            </div>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

// ============================================================
// ANNOUNCEMENTS ADMIN
// ============================================================
export function AnnouncementsAdminPage() {
  const [addModal, setAddModal] = useState(false);
  const [items, setItems] = useState(ANNOUNCEMENTS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({title:"",body:"",grade:"",gov:""});
  const closeEditor = () => {
    setAddModal(false);
    setEditingId(null);
    setForm({title:"",body:"",grade:"",gov:""});
  };
  const saveAnnouncement = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    if (editingId) {
      setItems(current => current.map(item => item.id === editingId ? {...item, title:form.title.trim(), body:form.body.trim(), grade:form.grade || null} : item));
    } else {
      setItems(current => [{id:Date.now(), title:form.title.trim(), body:form.body.trim(), grade:form.grade || null, pinned:false, date:new Date().toISOString().slice(0,10)}, ...current]);
    }
    notify(editingId ? "تم تحديث الإعلان" : "تم نشر الإعلان", "success");
    closeEditor();
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black">الإعلانات</h1>
          <Btn size="sm" onClick={()=>{ setEditingId(null); setForm({title:"",body:"",grade:"",gov:""}); setAddModal(true); }}><Plus size={15}/> إعلان جديد</Btn>
        </div>
        <div className="space-y-3">
          {items.map(a=>(
            <Card2 key={a.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold">{a.title}</h3>
                    {a.pinned && <Badge2 variant="primary">مثبَّت</Badge2>}
                    {a.grade  && <Badge2 variant="info">{a.grade}</Badge2>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1.5 leading-relaxed">{a.body}</p>
                  <div className="text-xs text-muted-foreground">{a.date}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button aria-label={`تعديل الإعلان ${a.title}`} onClick={()=>{ setEditingId(a.id); setForm({title:a.title,body:a.body,grade:a.grade || "",gov:""}); setAddModal(true); }} className="p-1.5 hover:bg-accent rounded-xl"><Edit2 size={13}/></button>
                  <button aria-label={`حذف الإعلان ${a.title}`} onClick={()=>{ setItems(current=>current.filter(item=>item.id!==a.id)); notify("تم حذف الإعلان","success"); }} className="p-1.5 hover:bg-accent rounded-xl text-red-500"><Trash2 size={13}/></button>
                </div>
              </div>
            </Card2>
          ))}
        </div>
        <Modal2 open={addModal} onClose={closeEditor} title={editingId ? "تعديل الإعلان" : "إضافة إعلان"} size="lg">
          <div className="space-y-4">
            <Input2 label="عنوان الإعلان" placeholder="عنوان واضح ومختصر" value={form.title} onChange={(e:any)=>setForm(f=>({...f,title:e.target.value}))}/>
            <Field label="محتوى الإعلان">
              <textarea aria-label="محتوى الإعلان" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="اكتب نص الإعلان…" rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Select2 label="الصف (اختياري)" value={form.grade} onChange={(e:any)=>setForm(f=>({...f,grade:e.target.value}))}
                options={[{value:"",label:"كل الصفوف"},...GRADES.map(g=>({value:g,label:g}))]}/>
              <Select2 label="نوع الاستهداف" value={form.gov} onChange={(e:any)=>setForm(f=>({...f,gov:e.target.value}))}
                options={[{value:"",label:"كل طلاب الصف المحدد"},{value:"students",label:"طلاب محددون"}]}/>
            </div>
            {form.gov==="students"&&<Field label="اختر الطلاب"><div className="max-h-40 overflow-y-auto rounded-xl border border-border p-2 space-y-1">{STUDENTS.slice(0,8).map(student=><label key={student.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-xs"><input type="checkbox"/>{student.name}<span className="text-muted-foreground mr-auto">{student.grade}</span></label>)}</div></Field>}
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={closeEditor}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!form.title.trim() || !form.body.trim()} onClick={saveAnnouncement}>{editingId ? "حفظ التعديلات" : "نشر"}</Btn>
            </div>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

// ============================================================
// ASSISTANTS
// ============================================================
export function AssistantsPage() {
  const [addModal, setAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number|null>(null);
  const permissionOptions = [
    {id:"students.view",label:"عرض بيانات الطلاب"},{id:"students.parent_phone",label:"تغيير رقم ولي الأمر"},
    {id:"students.devices",label:"إدارة الأجهزة والجلسات"},{id:"attempts.review",label:"مراجعة طلبات المحاولات"},
    {id:"content.manage",label:"إدارة المحتوى"},{id:"video.upload",label:"رفع ونشر الفيديو"},
    {id:"exams.manage",label:"إنشاء وإدارة الاختبارات"},{id:"announcements.manage",label:"إدارة الإعلانات"},
  ];
  const defaultPermissions = permissionOptions.slice(0,6).map(item=>item.id);
  const [form, setForm] = useState({name:"",email:"",phone:"",password:"",permissions:defaultPermissions});
  const [assistants, setAssistants] = useState([
    {id:1,name:"مصطفى حسن",email:"mostafa@school.eg",phone:"01012345678",active:true,created:"2025-09-01",actions:12,permissions:defaultPermissions},
    {id:2,name:"أميرة محمود",email:"amira@school.eg",phone:"01098765432",active:false,created:"2025-08-15",actions:5,permissions:["students.view","attempts.review"]},
  ]);
  const closeAssistantEditor = () => { setAddModal(false); setEditingId(null); setForm({name:"",email:"",phone:"",password:"",permissions:defaultPermissions}); };
  const saveAssistant = () => {
    if(!form.name.trim() || !form.email.trim() || !form.phone.trim() || (!editingId && form.password.length < 8)) return;
    if(editingId) setAssistants(current=>current.map(item=>item.id===editingId?{...item,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim(),permissions:form.permissions}:item));
    else setAssistants(current=>[...current,{id:Date.now(),name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim(),active:true,created:new Date().toISOString().slice(0,10),actions:0,permissions:form.permissions}]);
    notify(editingId?"تم تحديث بيانات المساعد":"تم إنشاء حساب المساعد","success"); closeAssistantEditor();
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black">المساعدون</h1>
          <Btn size="sm" onClick={()=>{ setEditingId(null); setForm({name:"",email:"",phone:"",password:"",permissions:defaultPermissions}); setAddModal(true); }}><Plus size={15}/> إضافة مساعد</Btn>
        </div>
        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <span className="font-bold">صلاحيات المساعد:</span> إدارة المحتوى — متابعة الطلاب — منح المحاولات — إعادة تعيين كلمات المرور — تفعيل يدوي. <span className="text-muted-foreground">لا يمكنه مشاهدة المحاضرات أو أداء الاختبارات.</span>
        </div>
        <div className="space-y-3">
          {assistants.map(a=>(
            <Card2 key={a.id}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-lg font-black shrink-0">{a.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold">{a.name}</span>
                    <Badge2 variant={a.active?"success":"default"}>{a.active?"نشط":"غير نشط"}</Badge2>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.email} • {a.phone}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">أُنشئ: {a.created} • الإجراءات: {a.actions} • الصلاحيات: {a.permissions.length}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button aria-label={`تعديل المساعد ${a.name}`} onClick={()=>{setEditingId(a.id);setForm({name:a.name,email:a.email,phone:a.phone,password:"",permissions:a.permissions});setAddModal(true);}} className="p-2 hover:bg-accent rounded-xl"><Edit2 size={13}/></button>
                  <button aria-label={`حذف المساعد ${a.name}`} onClick={()=>{if(window.confirm(`هل تريد حذف المساعد ${a.name}؟`)){setAssistants(current=>current.filter(item=>item.id!==a.id));notify("تم حذف المساعد","success");}}} className="p-2 hover:bg-accent rounded-xl text-red-500"><Trash2 size={13}/></button>
                </div>
              </div>
            </Card2>
          ))}
        </div>
        <Modal2 open={addModal} onClose={closeAssistantEditor} title={editingId?"تعديل بيانات المساعد":"إضافة مساعد جديد"}>
          <div className="space-y-4">
            <Input2 label="الاسم الكامل" placeholder="اسم المساعد" value={form.name} onChange={(event:any)=>setForm(current=>({...current,name:event.target.value}))}/>
            <Input2 label="البريد الإلكتروني" type="email" placeholder="email@example.com" dir="ltr" value={form.email} onChange={(event:any)=>setForm(current=>({...current,email:event.target.value}))}/>
            <Input2 label="رقم الهاتف" placeholder="01xxxxxxxxx" dir="ltr" value={form.phone} onChange={(event:any)=>setForm(current=>({...current,phone:event.target.value}))}/>
            {!editingId&&<Input2 label="كلمة المرور المؤقتة" type="password" placeholder="8 أحرف على الأقل" value={form.password} onChange={(event:any)=>setForm(current=>({...current,password:event.target.value}))}/>} 
            <Field label="الصلاحيات الممنوحة">
              <div className="grid sm:grid-cols-2 gap-2 rounded-xl border border-border p-3">
                {permissionOptions.map(permission=><label key={permission.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-xs cursor-pointer"><input type="checkbox" checked={form.permissions.includes(permission.id)} onChange={event=>setForm(current=>({...current,permissions:event.target.checked?[...current.permissions,permission.id]:current.permissions.filter(id=>id!==permission.id)}))}/><span>{permission.label}</span></label>)}
              </div>
            </Field>
            <div className="flex gap-2">
              <Btn variant="outline" className="flex-1" onClick={closeAssistantEditor}>إلغاء</Btn>
              <Btn className="flex-1" disabled={!form.name.trim()||!form.email.trim()||!form.phone.trim()||(!editingId&&form.password.length<8)} onClick={saveAssistant}>{editingId?"حفظ التعديلات":"إنشاء الحساب"}</Btn>
            </div>
          </div>
        </Modal2>
      </div>
    </div>
  );
}

// ============================================================
// ACADEMIC YEARS
// ============================================================
export function AcademicYearsPage() {
  const [years,setYears] = useState([
    {id:1,name:"2026 / 2027",start:"2026-09-01",end:"2027-07-31",status:"active",students:1240,content:68},
    {id:2,name:"2025 / 2026",start:"2025-09-01",end:"2026-07-31",status:"archived",students:1085,content:61},
  ]);
  const [modal,setModal] = useState(false);
  const [copyContent,setCopyContent] = useState(true);
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-5xl mx-auto">
    <div className="flex items-center justify-between gap-3 mb-6"><div><h1 className="text-2xl font-black">السنوات الدراسية</h1><p className="text-sm text-muted-foreground mt-1">إدارة المحتوى والتسجيلات والنتائج لكل سنة</p></div><Btn size="sm" onClick={()=>setModal(true)}><Plus size={14}/> سنة جديدة</Btn></div>
    <div className="space-y-4">{years.map(year=><Card2 key={year.id}><div className="flex items-start gap-4 flex-wrap"><div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><CalendarDays size={21}/></div><div className="flex-1"><div className="flex gap-2 items-center"><h2 className="font-black">{year.name}</h2><Badge2 variant={year.status==="active"?"success":"default"}>{year.status==="active"?"السنة الحالية":"مؤرشفة"}</Badge2></div><p className="text-xs text-muted-foreground mt-1">{new Date(year.start).toLocaleDateString("ar-EG")} — {new Date(year.end).toLocaleDateString("ar-EG")}</p><div className="flex gap-4 mt-3 text-xs"><span><strong>{year.students}</strong> طالب</span><span><strong>{year.content}</strong> عنصر محتوى</span></div></div><div className="flex gap-2"><Btn size="sm" variant="secondary" onClick={()=>notify("تم فتح محتوى السنة","info")}>عرض المحتوى</Btn>{year.status==="active"&&<Btn size="sm" variant="outline" onClick={()=>{setYears(current=>current.map(item=>item.id===year.id?{...item,status:"archived"}:item));notify("تمت أرشفة السنة والنتائج","success");}}>إنهاء وأرشفة</Btn>}</div></div></Card2>)}</div>
    <Card2 className="mt-4 bg-primary/5 border-primary/20"><div className="flex gap-3"><Info size={18} className="text-primary shrink-0"/><p className="text-xs text-muted-foreground leading-relaxed">عند إنشاء سنة جديدة يمكن نسخ هيكل ومحتوى السنة السابقة. النسخة القديمة تظل محفوظة كما هي، وأي تعديل يتم على السنة الجديدة فقط. نتائج الطلاب القديمة تبقى في الأرشيف.</p></div></Card2>
    <Modal2 open={modal} onClose={()=>setModal(false)} title="إنشاء سنة دراسية"><div className="space-y-4"><Input2 label="اسم السنة" defaultValue="2027 / 2028"/><div className="grid grid-cols-2 gap-3"><Input2 label="تاريخ البداية" type="date" defaultValue="2027-09-01"/><Input2 label="تاريخ النهاية" type="date" defaultValue="2028-07-31"/></div><label className="flex items-start gap-2 p-3 rounded-xl bg-muted text-sm"><input type="checkbox" checked={copyContent} onChange={e=>setCopyContent(e.target.checked)} className="mt-1"/><span><strong>نسخ محتوى السنة الحالية</strong><span className="block text-xs text-muted-foreground mt-1">نسخ الفروع والأبواب والدروس والمحاضرات كنسخة مستقلة قابلة للتعديل.</span></span></label><div className="flex gap-2"><Btn variant="outline" className="flex-1" onClick={()=>setModal(false)}>إلغاء</Btn><Btn className="flex-1" onClick={()=>{setYears(current=>[{id:Date.now(),name:"2027 / 2028",start:"2027-09-01",end:"2028-07-31",status:"active",students:0,content:copyContent?68:0},...current.map(year=>({...year,status:"archived"}))]);setModal(false);notify("تم إنشاء السنة الدراسية","success");}}>إنشاء السنة</Btn></div></div></Modal2>
  </div></div>;
}

// ============================================================
// SUPPORT REQUESTS
// ============================================================
export function SupportRequestsPage() {
  const [filter,setFilter] = useState<"all"|"device"|"attempt"|"parent">("all");
  const [requests,setRequests] = useState([
    {id:1,type:"device",student:"محمد محمود",title:"طلب إزالة جهاز",detail:"هاتف قديم تم بيعه — Samsung Galaxy A32",date:"منذ 12 دقيقة",status:"pending"},
    {id:2,type:"attempt",student:"أحمد إبراهيم",title:"طلب محاولة إضافية",detail:"انقطع الإنترنت أثناء المحاولة الثالثة",date:"منذ ساعة",status:"pending"},
    {id:3,type:"parent",student:"فاطمة عبدالله",title:"تغيير رقم ولي الأمر",detail:"01012345678 ← 01123456789 — بانتظار OTP",date:"منذ ساعتين",status:"verifying"},
    {id:4,type:"device",student:"عمر حسن",title:"طلب إزالة جهاز",detail:"تم فقدان جهاز iPad",date:"أمس",status:"approved"},
  ]);
  const visible = requests.filter(request=>filter==="all"||request.type===filter);
  const approve = (id:number) => {setRequests(current=>current.map(item=>item.id===id?{...item,status:"approved"}:item));notify("تمت الموافقة على الطلب وتسجيل العملية","success");};
  const reject = (id:number) => {setRequests(current=>current.map(item=>item.id===id?{...item,status:"rejected"}:item));notify("تم رفض الطلب","info");};
  const typeMeta:Record<string,{label:string;icon:React.ElementType}> = {device:{label:"الأجهزة",icon:Monitor},attempt:{label:"المحاولات",icon:RotateCcw},parent:{label:"رقم ولي الأمر",icon:Users}};
  return <div className="min-h-screen bg-background py-6 px-4"><div className="max-w-5xl mx-auto">
    <div className="flex items-start justify-between gap-3 flex-wrap mb-6"><div><h1 className="text-2xl font-black">طلبات الدعم</h1><p className="text-sm text-muted-foreground mt-1">طلبات الأجهزة والمحاولات وتغيير رقم ولي الأمر</p></div><Badge2 variant="warning">{requests.filter(r=>r.status==="pending"||r.status==="verifying").length} تحتاج إجراء</Badge2></div>
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">{[{id:"all",label:"الكل"},{id:"device",label:"الأجهزة"},{id:"attempt",label:"المحاولات"},{id:"parent",label:"ولي الأمر"}].map(item=><button key={item.id} onClick={()=>setFilter(item.id as typeof filter)} className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap",filter===item.id?"bg-primary text-primary-foreground":"bg-card border border-border hover:bg-accent")}>{item.label}</button>)}</div>
    <div className="space-y-3">{visible.map(request=>{const meta=typeMeta[request.type];const Icon=meta.icon;return <Card2 key={request.id}><div className="flex items-start gap-4"><div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={19}/></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{request.title}</h3><Badge2 variant={request.status==="approved"?"success":request.status==="rejected"?"danger":request.status==="verifying"?"info":"warning"}>{request.status==="approved"?"تمت الموافقة":request.status==="rejected"?"مرفوض":request.status==="verifying"?"بانتظار التحقق":"قيد المراجعة"}</Badge2></div><p className="text-sm mt-1">{request.student}</p><p className="text-xs text-muted-foreground mt-1">{request.detail}</p><p className="text-[11px] text-muted-foreground mt-2">{request.date} • {meta.label}</p></div>{request.status==="pending"&&<div className="flex gap-1.5 shrink-0"><Btn size="sm" onClick={()=>approve(request.id)}>موافقة</Btn><Btn size="sm" variant="ghost" onClick={()=>reject(request.id)}>رفض</Btn></div>}</div></Card2>;})}</div>
  </div></div>;
}

// ============================================================
// AUDIT LOG
// ============================================================
export function AuditLogPage() {
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black mb-6">سجل الأحداث</h1>
        <Card2 className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-muted-foreground text-xs">
                  <th className="text-right py-3 px-4">المستخدم</th>
                  <th className="text-right py-3 px-3">الإجراء</th>
                  <th className="text-right py-3 px-3">الهدف</th>
                  <th className="text-right py-3 px-3">السبب</th>
                  <th className="text-right py-3 px-3">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOGS.map(l=>(
                  <tr key={l.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 px-4 font-semibold text-xs">{l.user}</td>
                    <td className="py-3 px-3 text-xs"><Badge2 variant="primary">{l.action}</Badge2></td>
                    <td className="py-3 px-3 text-xs">{l.target}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{l.reason||"—"}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(l.date).toLocaleString("ar-EG")}</td>
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
