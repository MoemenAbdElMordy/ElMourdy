/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Moon, Sun, Menu, X, ChevronRight, ChevronDown, ChevronLeft,
  Play, Lock, CheckCircle, XCircle, Clock, Award, BookOpen,
  Users, LogOut, Bell, Search, Plus, Edit2, Trash2, Eye, Download,
  AlertTriangle, Info, RotateCcw, Home, FileText, Video, Key, Shield,
  Activity, Star, UserCheck, UserX, Copy, Printer, RefreshCw, Check,
  AlertCircle, Upload, Monitor, Smartphone, Laptop, MapPin, Wifi, Settings, CalendarDays
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
export function StudentDashboard({ nav }: any) {
  const s = STUDENTS[0];
  const done = LESSONS.filter(l=>l.status==="complete").length;
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">أهلًا، {s.name.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground text-sm">{s.grade} • {s.governorate}</p>
          </div>
          <Badge2 variant={s.activated?"success":"warning"}>{s.activated?"الحساب مفعَّل":"يحتاج تفعيل"}</Badge2>
        </div>

        {!s.activated && (
          <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={17} className="text-yellow-600 mt-0.5 shrink-0"/>
            <div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">يحتاج حسابك إلى تفعيل</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">أدخل كود التفعيل للوصول إلى المحاضرات المدفوعة</p>
              <button onClick={()=>nav("activation")} className="text-xs text-yellow-800 dark:text-yellow-300 font-bold underline mt-1">أدخل الكود الآن</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="المحاضرات المكتملة" value={`${done}/${LESSONS.length}`} icon={Video}/>
          <StatCard label="أعلى درجة" value="85%" icon={Star}/>
          <StatCard label="مواد مسجَّل بها" value={SUBJECTS.length} icon={BookOpen}/>
          <StatCard label="المحاولات المتبقية" value="2/3" icon={RotateCcw}/>
        </div>

        <Card2 className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">التقدم الإجمالي</span>
            <span className="text-primary font-black text-sm">{Math.round((done/LESSONS.length)*100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div className="bg-primary h-3 rounded-full transition-all duration-700" style={{width:`${Math.round((done/LESSONS.length)*100)}%`}}/>
          </div>
        </Card2>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">موادي</h2>
              <button onClick={()=>nav("subjects")} className="text-sm text-primary hover:underline">عرض الكل</button>
            </div>
            <div className="space-y-3">
              {SUBJECTS.map(sub=>(
                <Card2 key={sub.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={()=>nav("chapters",{subjectId:sub.id})}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{sub.name}</div>
                      <div className="text-xs text-muted-foreground">{sub.chaptersCount} فصول • {sub.lessonsCount} محاضرة</div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-xs text-muted-foreground mb-1 text-right">اكتمل</div>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width:sub.id===1?"40%":"0%"}}/>
                      </div>
                    </div>
                    <ChevronLeft size={15} className="text-muted-foreground shrink-0"/>
                  </div>
                </Card2>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">الإعلانات</h2>
              <button onClick={()=>nav("announcements")} className="text-sm text-primary hover:underline">الكل</button>
            </div>
            <div className="space-y-2">
              {ANNOUNCEMENTS.slice(0,3).map(a=>(
                <Card2 key={a.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={()=>nav("announcements")}>
                  {a.pinned && <Badge2 variant="primary" className="mb-1.5">مثبَّت</Badge2>}
                  <div className="font-semibold text-sm leading-snug">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.date}</div>
                </Card2>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUBJECTS PAGE
// ============================================================
export function SubjectsPage({ nav }: any) {
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-6">موادي الدراسية</h1>
        <div className="grid md:grid-cols-3 gap-5">
          {SUBJECTS.map(s=>(
            <Card2 key={s.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={()=>nav("chapters",{subjectId:s.id})}>
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-lg mb-1">{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-muted rounded-xl p-2 text-center"><div className="font-black">{s.chaptersCount}</div><div className="text-muted-foreground">فصول</div></div>
                <div className="bg-muted rounded-xl p-2 text-center"><div className="font-black">{s.lessonsCount}</div><div className="text-muted-foreground">محاضرات</div></div>
              </div>
              <div className="flex items-center justify-between">
                <Badge2 variant="success">مشترك</Badge2>
                <ChevronLeft size={15} className="text-muted-foreground"/>
              </div>
            </Card2>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAPTERS PAGE
// ============================================================
export function ChaptersPage({ nav, params }: any) {
  const sub = SUBJECTS.find(s=>s.id===params?.subjectId)||SUBJECTS[0];
  const chs = CHAPTERS.filter(c=>c.subjectId===sub.id);
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={()=>nav("subjects")} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground">
          <ChevronRight size={15}/> العودة للمواد
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{sub.icon}</span>
          <div>
            <h1 className="text-2xl font-black">{sub.name}</h1>
            <p className="text-muted-foreground text-sm">{sub.grade}</p>
          </div>
        </div>
        <div className="space-y-3">
          {chs.map((ch,i)=>(
            <Card2 key={ch.id}
              className={cn("transition-colors",ch.status==="published"?"cursor-pointer hover:border-primary/50":"opacity-60")}
              onClick={()=>ch.status==="published"&&nav("lessons",{chapterId:ch.id,subjectId:sub.id})}>
              <div className="flex items-center gap-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                  i<2?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground")}>
                  {ch.order}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{ch.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ch.lessonsCount} محاضرات</div>
                </div>
                {ch.status==="draft"
                  ? <Badge2 variant="warning">قريبًا</Badge2>
                  : i<2
                    ? <Badge2 variant="success">مكتمل جزئيًا</Badge2>
                    : <Badge2>لم يبدأ</Badge2>
                }
                {ch.status==="published"
                  ? <ChevronLeft size={15} className="text-muted-foreground"/>
                  : <Lock size={14} className="text-muted-foreground"/>
                }
              </div>
            </Card2>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LESSONS PAGE
// ============================================================
export function LessonsPage({ nav, params }: any) {
  const ch = CHAPTERS.find(c=>c.id===params?.chapterId)||CHAPTERS[0];
  const lessons = LESSONS.filter(l=>l.chapterId===ch.id);
  const statusIcon = (l:any) => {
    if (l.status==="complete") return <CheckCircle size={17} className="text-green-500"/>;
    if (l.locked)              return <Lock size={17} className="text-muted-foreground"/>;
    if (l.status==="in-progress") return <Play size={17} className="text-primary"/>;
    return <Play size={17} className="text-muted-foreground"/>;
  };
  const statusBadge = (l:any) => {
    if (l.status==="complete")    return <Badge2 variant="success">مكتمل</Badge2>;
    if (l.locked)                 return <Badge2>مقفول</Badge2>;
    if (l.status==="in-progress") return <Badge2 variant="primary">جارٍ</Badge2>;
    return <Badge2>لم يبدأ</Badge2>;
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={()=>nav("chapters",{subjectId:params?.subjectId})} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground">
          <ChevronRight size={15}/> العودة للفصول
        </button>
        <h1 className="text-xl font-black mb-1">{ch.title}</h1>
        <p className="text-muted-foreground text-sm mb-6">{lessons.length} محاضرات</p>
        <div className="space-y-3">
          {lessons.map(l=>(
            <Card2 key={l.id}
              className={cn("transition-colors",!l.locked?"cursor-pointer hover:border-primary/50":"opacity-70")}
              onClick={()=>!l.locked&&nav("video",{lessonId:l.id})}>
              <div className="flex items-center gap-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  l.status==="complete"?"bg-green-100 dark:bg-green-900/30":l.locked?"bg-muted":"bg-primary/10")}>
                  {statusIcon(l)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{l.title}</span>
                    {l.isOpen && <Badge2 variant="info">مجاني</Badge2>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={11}/>{l.duration}</span>
                    {l.hasExam && (
                      <span className="flex items-center gap-1">
                        <FileText size={11}/> اختبار مصاحب
                        {l.examPassed && <CheckCircle size={11} className="text-green-500"/>}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(l)}
                  {!l.locked && <ChevronLeft size={15} className="text-muted-foreground"/>}
                </div>
              </div>
            </Card2>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIDEO PLAYER — Udemy-like RTL split layout
// ============================================================
export function VideoPage({ nav, params, role }: any) {
  // Compute initial lesson BEFORE hooks (not a hook call — just a derivation)
  const initialLesson = LESSONS.find(x => x.id === params?.lessonId) || LESSONS[0];

  // All hooks BEFORE any conditional return (React Rules of Hooks)
  const [playing,      setPlaying]      = useState(false);
  const [prog,         setProg]         = useState(35);
  const [activeTab,    setActiveTab]    = useState<"overview"|"files"|"questions"|"notes">("overview");
  const [mobSidebar,   setMobSidebar]   = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set([initialLesson.chapterId]));
  const [sessionNotes, setSessionNotes] = useState("");
  const [newQuestion,  setNewQuestion]  = useState("");
  const [quality, setQuality] = useState("720p");
  const [questions,    setQuestions]    = useState([
    {q:"هل الحرف يدخل على الاسم والفعل؟",a:"بعض الحروف تدخل على الاسم فقط كحروف الجر، وبعضها على الفعل فقط كلم ولن.",u:"أحمد محمد",t:"منذ يومين"},
    {q:"ما الفرق بين النكرة والمعرفة؟",a:"النكرة تقبل التنوين. المعرفة لا تقبله كالضمائر والأعلام.",u:"فاطمة علي",t:"منذ 5 أيام"}
  ]);

  // Parent-role guard — rendered AFTER hooks
  if (role === "parent") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card2 className="max-w-sm w-full text-center p-8">
          <Shield size={40} className="text-muted-foreground mx-auto mb-3"/>
          <h2 className="font-bold mb-2">صفحة محظورة على ولي الأمر</h2>
          <p className="text-sm text-muted-foreground mb-4">تشغيل الفيديو وأداء الاختبارات متاح للطالب فقط.</p>
          <Btn onClick={() => nav("parent-dashboard")}>العودة للوحة</Btn>
        </Card2>
      </div>
    );
  }

  // If a specific lessonId was requested but not found → show not-found screen
  const requestedId = params?.lessonId;
  const foundLesson = requestedId ? LESSONS.find(x => x.id === requestedId) : null;
  if (requestedId && !foundLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card2 className="max-w-sm w-full text-center p-8">
          <FileText size={40} className="text-muted-foreground mx-auto mb-3"/>
          <h2 className="font-bold mb-2">المحاضرة غير موجودة</h2>
          <p className="text-sm text-muted-foreground mb-4">لم يتم العثور على المحاضرة المطلوبة (رقم {requestedId}).</p>
          <Btn onClick={() => nav("subjects")} className="w-full">العودة إلى المواد</Btn>
        </Card2>
      </div>
    );
  }

  const l       = foundLesson || LESSONS[0];
  const chapter = CHAPTERS.find(c => c.id === l.chapterId)     || CHAPTERS[0];
  const subject = SUBJECTS.find(s => s.id === chapter.subjectId)|| SUBJECTS[0];

  const allLessons     = LESSONS;
  const completedCount = allLessons.filter(x => x.status === "complete").length;
  const totalCount     = allLessons.length;
  const progressPct    = Math.round((completedCount / totalCount) * 100);

  const unlocked  = allLessons.filter(x => !x.locked);
  const curIdx    = unlocked.findIndex(x => x.id === l.id);
  const prevL     = curIdx > 0 ? unlocked[curIdx - 1] : null;
  const nextL     = curIdx < unlocked.length - 1 ? unlocked[curIdx + 1] : null;

  const R = 20, CIRC = 2 * Math.PI * R;
  const strokeOff = CIRC - (progressPct / 100) * CIRC;

  const lessonItems: Record<number,Array<{id:string;type:"video"|"topic"|"pdf"|"quiz";title:string;meta:string;done:boolean}>> = {
    1:[{id:"1v1",type:"video",title:"مفهوم النحو وأهميته",meta:"35 د",done:true},{id:"1v2",type:"video",title:"نشأة علم النحو",meta:"40 د",done:true},{id:"1p1",type:"pdf",title:"ملخص الوحدة الأولى",meta:"PDF 2.4 MB",done:true},{id:"1q1",type:"quiz",title:"اختبار الوحدة الأولى",meta:"10 أسئلة",done:false}],
    2:[{id:"2v1",type:"video",title:"الاسم وعلاماته",meta:"45 د",done:true},{id:"2v2",type:"video",title:"الفعل وأنواعه",meta:"42 د",done:false},{id:"2t1",type:"topic",title:"ملاحظات إضافية",meta:"شرح نصي",done:false},{id:"2q1",type:"quiz",title:"اختبار سريع",meta:"5 أسئلة",done:false}],
    3:[{id:"3v1",type:"video",title:"علامات الرفع",meta:"38 د",done:false},{id:"3v2",type:"video",title:"علامات النصب",meta:"40 د",done:false},{id:"3v3",type:"video",title:"علامات الجر والجزم",meta:"35 د",done:false},{id:"3q1",type:"quiz",title:"اختبار الإعراب",meta:"10 أسئلة",done:false}],
  };
  const defItems = [{id:"dv",type:"video" as const,title:l.title,meta:l.duration,done:l.status==="complete"}];

  const typeIcon = (t: string) => t==="video"?<Play size={11}/>:t==="pdf"?<Download size={11}/>:t==="quiz"?<FileText size={11}/>:<BookOpen size={11}/>;

  const toggleChap = (id: number) => setOpenChapters(p => {
    const next = new Set(p);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const files = [{name:"ملخص الوحدة",ext:"PDF",size:"2.4 MB"},{name:"تمارين تطبيقية",ext:"DOCX",size:"1.1 MB"},{name:"خريطة ذهنية",ext:"PDF",size:"0.8 MB"}];

  const CurriculumContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-[52px] h-[52px] shrink-0">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r={R} fill="none" stroke="var(--muted)" strokeWidth="4"/>
              <circle cx="26" cy="26" r={R} fill="none" stroke="var(--primary)" strokeWidth="4"
                strokeDasharray={`${CIRC}`} strokeDashoffset={strokeOff}
                strokeLinecap="round" transform="rotate(-90 26 26)" style={{transition:"stroke-dashoffset .5s"}}/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-primary">{progressPct}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">{subject.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{completedCount}/{totalCount} عنصر مكتمل</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{width:`${progressPct}%`}}/>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CHAPTERS.map(ch => {
          const chL    = LESSONS.filter(x => x.chapterId === ch.id);
          const chDone = chL.filter(x => x.status==="complete").length;
          const isOpen = openChapters.has(ch.id);
          return (
            <div key={ch.id} className="border-b border-border/50 last:border-0">
              <button onClick={() => toggleChap(ch.id)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent/40 text-right">
                <div className={cn("w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-bold",
                  chDone===chL.length&&chL.length>0?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground")}>
                  {chDone===chL.length&&chL.length>0?<Check size={10}/>:ch.order}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs font-semibold leading-snug">{ch.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{chDone}/{chL.length} مكتمل</div>
                </div>
                <ChevronDown size={13} className={cn("text-muted-foreground shrink-0 transition-transform",isOpen&&"rotate-180")}/>
              </button>
              {isOpen && (
                <div>
                  {chL.map(lesson => {
                    const isCurrent = lesson.id === l.id;
                    const items = lessonItems[lesson.id] || defItems;
                    return (
                      <div key={lesson.id} className={cn("border-r-2",isCurrent?"border-primary":"border-transparent")}>
                        <div className={cn("px-5 py-1.5 text-[11px] font-bold uppercase tracking-wide",isCurrent?"text-primary":"text-muted-foreground")}>
                          {lesson.title}
                        </div>
                        {items.map(item => {
                          const isActiveItem = isCurrent && item.type==="video" && !item.done;
                          return (
                            <button key={item.id}
                              onClick={() => !lesson.locked && item.type==="video" && nav("video",{lessonId:lesson.id})}
                              disabled={lesson.locked}
                              className={cn("w-full flex items-center gap-2.5 px-5 py-2 text-right transition-colors text-xs",
                                isActiveItem?"bg-primary text-primary-foreground":
                                lesson.locked?"opacity-40 cursor-not-allowed text-muted-foreground":
                                item.done?"text-muted-foreground hover:bg-accent/60":"hover:bg-accent/60 text-foreground")}>
                              <div className="shrink-0 w-4 flex items-center">
                                {lesson.locked?<Lock size={10}/>:
                                 item.done?<div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center"><Check size={8} className="text-primary-foreground"/></div>:
                                 typeIcon(item.type)}
                              </div>
                              <span className="flex-1 truncate">{item.title}</span>
                              <span className="text-[10px] opacity-60 shrink-0">{item.meta}</span>
                              {lesson.isOpen && item.type==="video" && !isActiveItem && (
                                <span className="text-[9px] bg-primary/10 text-primary dark:bg-primary/20 px-1.5 py-0.5 rounded-full shrink-0">مجاني</span>
                              )}
                            </button>
                          );
                        })}
                        {lesson.locked && (
                          <div className="px-5 py-1 text-[10px] text-muted-foreground flex items-center gap-1 pb-2">
                            <Lock size={9}/> اجتز الاختبار السابق للفتح
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-border bg-card sticky top-16 z-30">
        <button aria-label="العودة إلى قائمة الدروس" onClick={() => nav("lessons",{chapterId:l.chapterId,subjectId:chapter.subjectId})} className="p-2 hover:bg-accent rounded-xl shrink-0">
          <ChevronRight size={16}/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-muted-foreground truncate">{subject.name} • {chapter.title}</div>
          <div className="text-sm font-bold truncate">{l.title}</div>
        </div>
        <button aria-label="فتح محتوى المنهج" onClick={() => setMobSidebar(true)} className="p-2 hover:bg-accent rounded-xl shrink-0 flex items-center gap-1 text-xs font-semibold">
          <BookOpen size={14}/><span className="hidden sm:inline">المنهج</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 lg:h-[calc(100vh-64px)] lg:overflow-hidden">
        {/* Main column */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {/* Video */}
          <div className="bg-black w-full aspect-video relative group">
            <div className="absolute top-[18%] left-[14%] z-10 pointer-events-none select-none rotate-[-12deg] text-white/25 text-xs font-bold border border-white/15 rounded-lg px-3 py-1.5">{STUDENTS[0].name} • {STUDENTS[0].phone.slice(0,5)}***</div>
            <div className="absolute top-3 left-3 z-20"><select aria-label="جودة الفيديو" value={quality} onChange={e=>setQuality(e.target.value)} className="bg-black/60 text-white border border-white/20 rounded-lg px-2 py-1 text-xs"><option>360p</option><option>480p</option><option>720p</option></select></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={() => setPlaying(!playing)}
                className={cn("w-16 h-16 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105",
                  playing&&"opacity-0 group-hover:opacity-100")}>
                {playing
                  ? <div className="flex gap-1.5"><div className="w-1.5 h-6 bg-white rounded-sm"/><div className="w-1.5 h-6 bg-white rounded-sm"/></div>
                  : <Play size={26} fill="white"/>}
              </button>
            </div>
            {!playing && (
              <div className="absolute bottom-0 inset-x-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)] p-5">
                <div className="text-white font-bold">{l.title}</div>
                <div className="text-white/60 text-xs mt-0.5">{subject.name} • {chapter.title}</div>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 cursor-pointer"
              onClick={e=>{ const r=(e.target as HTMLElement).getBoundingClientRect(); setProg(Math.round(((e.clientX-r.left)/r.width)*100)); }}>
              <div className="bg-primary h-1" style={{width:`${prog}%`}}/>
            </div>
          </div>

          {/* Prev/Next */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80">
            <Btn variant="outline" size="sm" disabled={!prevL} onClick={() => prevL&&nav("video",{lessonId:prevL.id})}>
              <ChevronRight size={14}/> السابقة
            </Btn>
            <div className="flex-1 text-center text-xs text-muted-foreground font-medium truncate px-2">{l.title}</div>
            <Btn size="sm" disabled={!nextL} onClick={() => nextL&&nav("video",{lessonId:nextL.id})}>
              التالية <ChevronLeft size={14}/>
            </Btn>
          </div>

          {/* Meta + tabs */}
          <div className="px-5 md:px-7 py-5">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 flex-wrap">
              <button onClick={() => nav("subjects")} className="hover:text-primary transition-colors">المواد</button>
              <ChevronLeft size={10}/>
              <button onClick={() => nav("chapters",{subjectId:chapter.subjectId})} className="hover:text-primary transition-colors">{subject.name}</button>
              <ChevronLeft size={10}/>
              <button onClick={() => nav("lessons",{chapterId:l.chapterId,subjectId:chapter.subjectId})} className="hover:text-primary transition-colors">{chapter.title}</button>
              <ChevronLeft size={10}/>
              <span className="text-foreground">{l.title}</span>
            </nav>

            <h1 className="text-xl font-black mb-2">{l.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mb-4">
              <span className="flex items-center gap-1"><Clock size={13}/>{l.duration}</span>
              <span>الأستاذ محمود عبدالمرضي</span>
              <span className="hidden sm:inline">آخر تحديث: سبتمبر 2025</span>
              {l.isOpen && <Badge2 variant="info">مجانية</Badge2>}
            </div>

            {l.hasExam && (
              <div className={cn("rounded-2xl p-4 mb-5 border",l.examPassed?"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700":"bg-primary/5 border-primary/20")}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      <FileText size={14} className={l.examPassed?"text-green-600":"text-primary"}/>
                      {l.examPassed?"اجتزت الاختبار المرتبط":"اختبار مرتبط بهذه المحاضرة"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {l.examPassed?"المحاضرة التالية متاحة":"نسبة النجاح 60% • 3 محاولات • إلزامي للمتابعة"}
                    </div>
                  </div>
                  {l.examPassed
                    ? <Badge2 variant="success">ناجح</Badge2>
                    : <Btn size="sm" onClick={() => nav("exam",{lessonId:l.id})}><Play size={12}/> ابدأ الاختبار</Btn>}
                </div>
              </div>
            )}

            <div role="tablist" aria-label="تبويبات المحاضرة" className="flex gap-0 border-b border-border mb-5 overflow-x-auto">
              {([
                {id:"overview",l:"نظرة عامة"},
                {id:"files",l:"الملفات"},
                {id:"questions",l:"الأسئلة"},
                {id:"notes",l:"ملاحظاتي"}
              ] as {id:"overview"|"files"|"questions"|"notes";l:string}[]).map(t => (
                <button key={t.id}
                  role="tab"
                  aria-selected={activeTab===t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn("px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px",
                    activeTab===t.id?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground")}>
                  {t.l}
                </button>
              ))}
            </div>

            {activeTab==="overview" ? (
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground leading-loose">في هذه المحاضرة نتناول {l.title} بشكل تفصيلي مع أمثلة تطبيقية. مناسبة لطلاب {subject.grade}.</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={12}/>{l.duration}</span>
                  <span>الأستاذ محمود عبدالمرضي</span>
                  <span>آخر تحديث: سبتمبر 2025</span>
                  {l.isOpen && <Badge2 variant="info">محاضرة مجانية</Badge2>}
                </div>
                <div>
                  <h3 className="font-bold mb-2">أهداف المحاضرة</h3>
                  <ul className="space-y-1.5">
                    {["فهم المفهوم من أساسياته","التطبيق على أمثلة متنوعة","الاستعداد للاختبار المرتبط"].map((x,i) => (
                      <li key={i} className="flex items-center gap-2"><CheckCircle size={13} className="text-primary shrink-0"/>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : activeTab==="files" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {files.map((f,i) => (
                  <button key={i} onClick={() => notify(`جارٍ تحميل: ${f.name}`,"info")}
                    className="flex items-center gap-3 p-3 bg-muted rounded-2xl hover:bg-accent transition-colors text-right w-full">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                      f.ext==="PDF"?"bg-primary/10 text-primary":"bg-muted-foreground/20 text-muted-foreground")}>
                      {f.ext}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="font-semibold text-sm truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.size}</div>
                    </div>
                    <Download size={14} className="text-muted-foreground shrink-0"/>
                  </button>
                ))}
              </div>
            ) : activeTab==="questions" ? (
              <div className="space-y-3">
                {questions.map((item,i) => (
                  <Card2 key={i}>
                    <div className="font-semibold text-sm mb-1">{item.q}</div>
                    <div className="text-muted-foreground text-xs mb-2 leading-relaxed">{item.a}</div>
                    <div className="text-xs text-muted-foreground/60">{item.u} • {item.t}</div>
                  </Card2>
                ))}
                <div className="flex gap-2 mt-2">
                  <input aria-label="سؤالك عن المحاضرة" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                    placeholder="اكتب سؤالك هنا…"
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                  <Btn size="sm" onClick={() => {
                    if (!newQuestion.trim()) { notify("الرجاء كتابة سؤال أولاً","error"); return; }
                    setQuestions(q => [...q, {q:newQuestion.trim(),a:"سيتم الرد قريباً من الأستاذ.",u:"أنت",t:"الآن"}]);
                    setNewQuestion("");
                    notify("تم إرسال سؤالك","success");
                  }}><Plus size={13}/> إرسال</Btn>
                </div>
              </div>
            ) : (
              <div>
                <Field label="ملاحظاتي الشخصية">
                  <textarea rows={5} value={sessionNotes} onChange={e => setSessionNotes(e.target.value)}
                    placeholder="اكتب ملاحظاتك هنا… (تُحفظ طوال الجلسة)"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"/>
                </Field>
                <Btn size="sm" className="mt-2" onClick={() => notify("تم حفظ الملاحظات","success")}>حفظ</Btn>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex flex-col w-[360px] xl:w-[400px] shrink-0 border-r border-border bg-card overflow-hidden">
          <CurriculumContent/>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobSidebar(false)}/>
          <div className="absolute inset-y-0 right-0 w-[85vw] max-w-[360px] bg-card shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="font-bold text-sm">محتوى الكورس</span>
              <button aria-label="إغلاق محتوى المنهج" onClick={() => setMobSidebar(false)} className="p-2 hover:bg-accent rounded-xl"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto"><CurriculumContent/></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXAM
// ============================================================
export function ExamPage({ nav, params }: any) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState<Record<number,number>>({});
  const [time, setTime] = useState(20*60);
  const [confirm, setConfirm] = useState(false);

  const submit = useCallback(() => {
    setConfirm(false);
    const score = Object.entries(ans).reduce((acc,[qi,ai])=>{
      const q=EXAM_QS[parseInt(qi)];
      return acc+(q?.correct===ai?q.points:0);
    },0);
    nav("exam-result",{score,total:EXAM_QS.length*5,lessonId:params?.lessonId,answers:ans});
  },[ans,nav,params]);

  useEffect(()=>{
    const t = setInterval(()=>setTime(s=>{ if(s<=1){ submit(); return 0; } return s-1; }),1000);
    return ()=>clearInterval(t);
  },[submit]);

  const mm = Math.floor(time/60);
  const ss = time%60;
  const q = EXAM_QS[cur];
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-2xl">
          <div>
            <h1 className="font-bold text-sm">اختبار: تعريف الاسم وعلاماته</h1>
            <div className="text-xs text-muted-foreground">{EXAM_QS.length} أسئلة • {EXAM_QS.length*5} درجة • نسبة النجاح 60%</div>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-black",
            time<300?"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300":"bg-primary/10 text-primary")}>
            <Clock size={17}/>
            {String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {EXAM_QS.map((_,i)=>(
            <button key={i} onClick={()=>setCur(i)}
              className={cn("w-9 h-9 rounded-xl text-sm font-bold transition-colors",
                i===cur?"bg-primary text-primary-foreground":
                ans[i]!==undefined?"bg-green-100 text-green-700 dark:bg-green-900/30":
                "bg-muted text-muted-foreground hover:bg-accent")}>
              {i+1}
            </button>
          ))}
        </div>

        <Card2 className="mb-4">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-black shrink-0">{cur+1}</div>
            <p className="text-base font-semibold leading-relaxed">{q.text}</p>
          </div>
          <div className="space-y-3">
            {q.choices.map((c,ci)=>(
              <button key={ci} onClick={()=>setAns(a=>({...a,[cur]:ci}))}
                className={cn("w-full text-right p-4 rounded-2xl border-2 transition-all text-sm font-medium",
                  ans[cur]===ci?"border-primary bg-primary/10 text-primary":"border-border hover:border-primary/40 hover:bg-accent")}>
                <span className="flex items-center gap-3">
                  <span className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0",
                    ans[cur]===ci?"border-primary bg-primary text-white":"border-muted-foreground")}>
                    {ans[cur]===ci && <Check size={11}/>}
                  </span>
                  {c}
                </span>
              </button>
            ))}
          </div>
        </Card2>

        <div className="flex items-center justify-between">
          <Btn variant="outline" onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0}>
            <ChevronRight size={15}/> السابق
          </Btn>
          <span className="text-sm text-muted-foreground font-medium">{cur+1} / {EXAM_QS.length}</span>
          {cur<EXAM_QS.length-1
            ? <Btn onClick={()=>setCur(c=>Math.min(EXAM_QS.length-1,c+1))}>التالي <ChevronLeft size={15}/></Btn>
            : <Btn onClick={()=>setConfirm(true)}>تسليم الاختبار</Btn>
          }
        </div>
        <p className="text-center mt-3 text-xs text-muted-foreground">
          تم الإجابة على {Object.keys(ans).length} من {EXAM_QS.length}
        </p>
      </div>

      <Modal2 open={confirm} onClose={()=>setConfirm(false)} title="تأكيد تسليم الاختبار">
        <p className="text-muted-foreground mb-4">
          لقد أجبت على {Object.keys(ans).length} من {EXAM_QS.length} أسئلة. هل أنت متأكد؟
        </p>
        {Object.keys(ans).length < EXAM_QS.length && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm mb-4">
            <AlertTriangle size={15}/>
            لم تجب على {EXAM_QS.length - Object.keys(ans).length} أسئلة
          </div>
        )}
        <div className="flex gap-2">
          <Btn variant="outline" className="flex-1" onClick={()=>setConfirm(false)}>مراجعة</Btn>
          <Btn className="flex-1" onClick={submit}>تأكيد التسليم</Btn>
        </div>
      </Modal2>
    </div>
  );
}

// ============================================================
// EXAM RESULT
// ============================================================
export function ExamResultPage({ nav, params }: any) {
  const score   = params?.score ?? 35;
  const total   = params?.total ?? 50;
  const pct     = Math.round((score/total)*100);
  const passed  = pct >= 50;
  const attempt = params?.attempt ?? 1;
  const maxAttempts = 3;
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto text-center">
        <div className={cn("w-28 h-28 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-5 border-4",
          passed?"border-green-400 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300":"border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300")}>
          {pct}%
        </div>
        <h1 className={cn("text-2xl font-black mb-2",passed?"text-green-700 dark:text-green-400":"text-red-700 dark:text-red-400")}>
          {passed?"🎉 أحسنت! اجتزت الاختبار":"😔 لم تجتز الاختبار"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {passed?"يمكنك الآن الانتقال للمحاضرة التالية":"راجع المحاضرة وأعد المحاولة"}
        </p>
        {pct>=50&&pct<=60&&<div className="mb-5 p-3 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-300"><AlertTriangle size={15} className="inline ml-1"/>نجحت، لكن نتيجتك ضمن نطاق المتابعة من 50% إلى 60% وسيظهر تنبيه للمساعد والمدرس.</div>}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card2 className="text-center"><div className="text-2xl font-black text-primary">{score}</div><div className="text-xs text-muted-foreground">درجتك</div></Card2>
          <Card2 className="text-center"><div className="text-2xl font-black">{total}</div><div className="text-xs text-muted-foreground">الكلية</div></Card2>
          <Card2 className="text-center"><div className="text-2xl font-black">{attempt}/{maxAttempts}</div><div className="text-xs text-muted-foreground">المحاولة</div></Card2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Btn onClick={()=>nav("error-review",{lessonId:params?.lessonId,answers:params?.answers})}>
            <Eye size={15}/> مراجعة الأخطاء
          </Btn>
          {!passed && attempt<maxAttempts && (
            <Btn variant="outline" onClick={()=>nav("exam",{lessonId:params?.lessonId})}>
              <RotateCcw size={15}/> إعادة ({maxAttempts-attempt} متبقية)
            </Btn>
          )}
          <Btn variant="secondary" onClick={()=>nav("student-dashboard")}>
            <Home size={15}/> لوحتي
          </Btn>
        </div>
        {!passed && attempt>=maxAttempts && (
          <div className="mt-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-2xl text-sm text-yellow-800 dark:text-yellow-400">
            <AlertTriangle size={15} className="inline ml-2"/>
            نفدت المحاولات. يمكنك طلب محاولة إضافية من المساعد أو الأستاذ.
            <Btn size="sm" className="mt-3 w-full" onClick={()=>notify("تم إرسال طلب محاولة إضافية ويمكنك متابعة حالته من الإعدادات","success")}>طلب محاولة إضافية</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ERROR REVIEW
// ============================================================
export function ErrorReviewPage({ nav, params }: any) {
  const answers = params?.answers || {1:0, 3:2, 5:1};
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-2">مراجعة الأخطاء</h1>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-sm text-muted-foreground mb-6">
          <Eye size={14}/> عرض إجاباتك والإجابات الصحيحة
        </div>
        <div className="space-y-4">
          {EXAM_QS.map((q,i)=>{
            const sa  = answers[i];
            const ok  = sa === q.correct;
            const ans = sa !== undefined;
            return (
              <Card2 key={q.id} className={cn("border-2",
                !ans?"border-yellow-300 dark:border-yellow-700":ok?"border-green-300 dark:border-green-700":"border-red-300 dark:border-red-700")}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                    !ans?"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30":ok?"bg-green-100 text-green-700 dark:bg-green-900/30":"bg-red-100 text-red-700 dark:bg-red-900/30")}>
                    {!ans?"—":ok?"✓":"✗"}
                  </div>
                  <p className="font-semibold leading-snug">{q.text}</p>
                </div>
                <div className="space-y-2 pr-11">
                  {q.choices.map((c,ci)=>(
                    <div key={ci} className={cn("p-2.5 rounded-xl text-sm flex items-center gap-2",
                      ci===q.correct?"bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300":
                      ci===sa&&!ok?"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300":
                      "bg-muted text-muted-foreground")}>
                      {ci===q.correct && <CheckCircle size={13} className="text-green-600 shrink-0"/>}
                      {ci===sa&&!ok && <XCircle size={13} className="text-red-600 shrink-0"/>}
                      <span className="flex-1">{c}</span>
                      {ci===q.correct && <span className="text-xs font-bold text-green-700 dark:text-green-400 shrink-0">صحيح</span>}
                      {ci===sa&&!ok && <span className="text-xs font-bold text-red-700 dark:text-red-400 shrink-0">إجابتك</span>}
                    </div>
                  ))}
                </div>
              </Card2>
            );
          })}
        </div>
        <div className="mt-6">
          <Btn variant="outline" onClick={()=>nav("student-dashboard")}><Home size={15}/> العودة للوحة</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROGRESS
// ============================================================
export function ProgressPage({ nav: _nav }: any) {
  const spData = SUBJECTS.map((s,i)=>({...s,progress:[40,10,0][i],avgScore:[72,65,0][i]}));
  const attempts = [
    {id:1,lesson:"تعريف الاسم وعلاماته",date:"2025-09-08",score:35,total:50,pct:70,passed:true,attempt:1},
    {id:2,lesson:"فروع اللغة العربية",date:"2025-09-05",score:42,total:50,pct:84,passed:true,attempt:1},
    {id:3,lesson:"تعريف الاسم وعلاماته",date:"2025-09-01",score:25,total:50,pct:50,passed:false,attempt:2},
  ];
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-6">تقدمي الدراسي</h1>
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <Card2>
            <h3 className="font-bold mb-4">التقدم في المواد</h3>
            <div className="space-y-4">
              {spData.map(s=>(
                <div key={s.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-primary font-black">{s.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{width:`${s.progress}%`}}/>
                  </div>
                  {s.avgScore > 0 && <div className="text-xs text-muted-foreground mt-1">متوسط الدرجات: {s.avgScore}%</div>}
                </div>
              ))}
            </div>
          </Card2>
          <div className="space-y-3">
            <StatCard label="إجمالي المحاولات" value="3" icon={RotateCcw}/>
            <StatCard label="أعلى درجة" value="84%" icon={Star}/>
            <StatCard label="الوقت الإجمالي" value="4.5 ساعات" icon={Clock}/>
          </div>
        </div>
        <Card2>
          <h3 className="font-bold mb-4">سجل المحاولات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-right py-2 pr-3">المحاضرة</th>
                  <th className="text-center py-2">التاريخ</th>
                  <th className="text-center py-2">الدرجة</th>
                  <th className="text-center py-2">المحاولة</th>
                  <th className="text-center py-2">النتيجة</th>
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
// ANNOUNCEMENTS (student view)
// ============================================================
export function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-6">الإعلانات</h1>
        <div className="space-y-4">
          {ANNOUNCEMENTS.map(a=>(
            <Card2 key={a.id} className={a.pinned?"border-primary/40 bg-primary/5":""}>
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <h3 className="font-bold">{a.title}</h3>
                <div className="flex gap-2">
                  {a.pinned && <Badge2 variant="primary">مثبَّت</Badge2>}
                  {a.grade  && <Badge2 variant="info">{a.grade}</Badge2>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{a.body}</p>
              <div className="text-xs text-muted-foreground">{a.date}</div>
            </Card2>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ACTIVATION
// ============================================================
export function ActivationPage({ nav }: any) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Key size={28} className="text-primary"/>
          </div>
          <h1 className="text-2xl font-black">تفعيل الحساب</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل كود التفعيل الذي حصلت عليه</p>
        </div>
        <Card2>
          {status !== "success" ? (
            <div className="space-y-4">
              <Input2 label="كود التفعيل" placeholder="ALM-XXXXXX" value={code} onChange={(e:any)=>setCode(e.target.value)} dir="ltr" className="text-center text-lg tracking-widest font-mono"/>
              {status==="error" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  <XCircle size={15}/> الكود غير صحيح أو منتهي الصلاحية
                </div>
              )}
              <Btn className="w-full" onClick={()=>{ setStatus("loading"); setTimeout(()=>{ setStatus(code.toUpperCase().startsWith("ALM-")?"success":"error"); if(code.toUpperCase().startsWith("ALM-")) notify("تم التفعيل بنجاح!","success"); },1200); }} disabled={!code||status==="loading"}>
                {status==="loading"?<><RefreshCw size={15} className="animate-spin"/> جارٍ التحقق…</>:"تفعيل"}
              </Btn>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-primary mx-auto mb-3"/>
              <h3 className="font-bold mb-1">تم التفعيل بنجاح!</h3>
              <p className="text-sm text-muted-foreground mb-4">يمكنك الآن الوصول لجميع المحاضرات</p>
              <Btn className="w-full" onClick={()=>nav("student-dashboard")}>الذهاب للوحتي</Btn>
            </div>
          )}
        </Card2>
      </div>
    </div>
  );
}

// ============================================================
// STUDENT SETTINGS
// ============================================================
type StudentDevice = {
  id:number; name:string; kind:"phone"|"laptop"|"tablet"; browser:string; os:string;
  location:string; ip:string; lastSeen:string; current:boolean; addedAt:string;
};

export function StudentSettingsPage() {
  const student = STUDENTS[0];
  const [tab,setTab] = useState<"profile"|"security"|"devices">("devices");
  const [devices,setDevices] = useState<StudentDevice[]>([
    {id:1,name:"هاتف Samsung Galaxy A54",kind:"phone",browser:"Chrome 126",os:"Android 14",location:"القاهرة، مصر",ip:"102.44.18.21",lastSeen:"متصل الآن",current:true,addedAt:"2026-07-12"},
    {id:2,name:"لابتوب Lenovo IdeaPad",kind:"laptop",browser:"Chrome 126",os:"Windows 11",location:"الجيزة، مصر",ip:"156.201.33.8",lastSeen:"منذ يومين",current:false,addedAt:"2026-06-03"},
    {id:3,name:"iPad",kind:"tablet",browser:"Safari",os:"iPadOS 18",location:"القاهرة، مصر",ip:"41.232.10.4",lastSeen:"منذ 6 أيام",current:false,addedAt:"2026-05-20"},
  ]);
  const [requestDevice,setRequestDevice] = useState<StudentDevice|null>(null);
  const [requestReason,setRequestReason] = useState("");
  const [passwords,setPasswords] = useState({current:"",next:"",confirm:""});
  const tabs = [
    {id:"profile",label:"البيانات الشخصية",icon:UserCheck},
    {id:"security",label:"كلمة المرور",icon:Shield},
    {id:"devices",label:"الأجهزة والجلسات",icon:Monitor},
  ] as const;
  const DeviceIcon = ({kind}:{kind:StudentDevice["kind"]}) => kind==="phone"?<Smartphone size={20}/>:kind==="laptop"?<Laptop size={20}/>:<Monitor size={20}/>;
  const removeDevice = (device:StudentDevice) => {
    if (device.current) { notify("لا يمكن إزالة الجهاز المستخدم حاليًا", "error"); return; }
    setRequestDevice(device);
  };
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black">إعدادات الحساب</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة بياناتك وكلمة المرور والأجهزة المسجلة</p>
        </div>
        <div className="grid lg:grid-cols-[240px_1fr] gap-5">
          <Card2 className="h-fit !p-2">
            {tabs.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setTab(item.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-right",tab===item.id?"bg-primary text-primary-foreground":"hover:bg-accent text-muted-foreground")}><Icon size={16}/>{item.label}</button>;})}
          </Card2>
          <div>
            {tab==="profile"&&<Card2>
              <h2 className="font-bold mb-5">البيانات الشخصية والدراسية</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input2 label="الاسم الكامل" defaultValue={student.name}/>
                <Input2 label="رقم الهاتف" defaultValue={student.phone} dir="ltr" disabled/>
                <Input2 label="تاريخ الميلاد" type="date" defaultValue="2008-04-16"/>
                <Input2 label="رقم ولي الأمر" defaultValue={student.parentPhone} dir="ltr" disabled/>
                <Input2 label="الصف الدراسي" defaultValue={student.grade} disabled/>
                <Input2 label="المدرسة" defaultValue={student.school}/>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted text-xs text-muted-foreground">لتغيير رقم الهاتف أو رقم ولي الأمر تواصل مع خدمة العملاء.</div>
              <Btn className="mt-5" onClick={()=>notify("تم حفظ البيانات","success")}>حفظ التعديلات</Btn>
            </Card2>}
            {tab==="security"&&<Card2>
              <h2 className="font-bold mb-1">تغيير كلمة المرور</h2>
              <p className="text-sm text-muted-foreground mb-5">سيتم إنهاء كل الجلسات الأخرى بعد تغيير كلمة المرور.</p>
              <div className="space-y-4 max-w-lg">
                <Input2 label="كلمة المرور الحالية" type="password" value={passwords.current} onChange={e=>setPasswords(v=>({...v,current:e.target.value}))}/>
                <Input2 label="كلمة المرور الجديدة" type="password" value={passwords.next} onChange={e=>setPasswords(v=>({...v,next:e.target.value}))}/>
                <Input2 label="تأكيد كلمة المرور" type="password" value={passwords.confirm} onChange={e=>setPasswords(v=>({...v,confirm:e.target.value}))}/>
                <Btn disabled={!passwords.current||passwords.next.length<8||passwords.next!==passwords.confirm} onClick={()=>{setPasswords({current:"",next:"",confirm:""});notify("تم تغيير كلمة المرور وإنهاء الجلسات الأخرى","success");}}>تحديث كلمة المرور</Btn>
              </div>
            </Card2>}
            {tab==="devices"&&<div className="space-y-4">
              <Card2>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div><h2 className="font-bold">الأجهزة المسجلة</h2><p className="text-sm text-muted-foreground mt-1">يمكنك استخدام 3 أجهزة بحد أقصى، وحسابك يعمل على جهاز واحد في نفس الوقت.</p></div>
                  <Badge2 variant={devices.length>=3?"warning":"success"}>{devices.length} من 3 أجهزة</Badge2>
                </div>
              </Card2>
              {devices.map(device=><Card2 key={device.id}>
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",device.current?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground")}><DeviceIcon kind={device.kind}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{device.name}</h3>{device.current&&<Badge2 variant="success">الجهاز الحالي</Badge2>}</div>
                    <div className="grid sm:grid-cols-2 gap-x-5 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Monitor size={12}/>{device.os} • {device.browser}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/>{device.location}</span>
                      <span className="flex items-center gap-1"><Wifi size={12}/>{device.ip}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/>{device.lastSeen}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={12}/>أضيف {new Date(device.addedAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                  {!device.current&&<Btn size="sm" variant="ghost" onClick={()=>removeDevice(device)}>إزالة</Btn>}
                </div>
              </Card2>)}
              <Card2 className="border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3"><Shield size={18} className="text-primary mt-0.5"/><div><h3 className="font-bold text-sm">سياسة إزالة الأجهزة</h3><p className="text-xs text-muted-foreground mt-1 leading-relaxed">يمكن إزالة جهاز ذاتيًا مرة كل 7 أيام. إذا كنت تحتاج إزالته قبل الموعد، أرسل طلبًا للمساعد من نافذة الإزالة.</p></div></div>
              </Card2>
            </div>}
          </div>
        </div>
      </div>
      <Modal2 open={Boolean(requestDevice)} onClose={()=>{setRequestDevice(null);setRequestReason("");}} title="إزالة الجهاز">
        {requestDevice&&<div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted"><div className="font-bold text-sm">{requestDevice.name}</div><div className="text-xs text-muted-foreground mt-1">آخر نشاط: {requestDevice.lastSeen}</div></div>
          <div className="p-3 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-300">لم يمر 7 أيام على آخر إزالة ذاتية. سيتم إرسال طلب للمساعد.</div>
          <Field label="سبب الطلب (اختياري)"><textarea rows={3} value={requestReason} onChange={e=>setRequestReason(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: الجهاز ضاع أو تم بيعه"/></Field>
          <div className="flex gap-2"><Btn variant="outline" className="flex-1" onClick={()=>setRequestDevice(null)}>إلغاء</Btn><Btn className="flex-1" onClick={()=>{setRequestDevice(null);setRequestReason("");notify("تم إرسال طلب إزالة الجهاز للمساعد","success");}}>إرسال الطلب</Btn></div>
        </div>}
      </Modal2>
    </div>
  );
}

// ============================================================
// PARENT DASHBOARD
