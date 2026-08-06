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
import { ApiError } from "../../shared/api/client";
import {
  clearPendingRegistration,
  loadPendingRegistration,
  registerParent,
  registerStudent,
  resendRegistration,
  storePendingRegistration,
  verifyRegistration,
} from "../../shared/auth/registration";
// ============================================================
export function HomePage({ nav }: any) {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({length:20},(_,i)=>(
            <div key={i} className="absolute rounded-full bg-white" style={{
              width: `${rn(40,120)}px`, height: `${rn(40,120)}px`,
              top: `${rn(0,100)}%`, left: `${rn(0,100)}%`, opacity: 0.3
            }}/>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Star size={13}/> خادم لغة أهل الجنة
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
            منصة الأستاذ<br className="hidden md:block"/> محمود عبدالمرضي
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
            منصة تعليمية متكاملة لتعليم اللغة العربية للمرحلة الثانوية — محاضرات، اختبارات تفاعلية، متابعة دقيقة
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Btn size="lg" className="!bg-white !text-primary font-black hover:!opacity-90" onClick={() => nav("register")}>
              ابدأ التعلم الآن
            </Btn>
            <Btn size="lg" className="border-2 border-white/50 text-white hover:!bg-white/20" variant="ghost" onClick={() => nav("free-content")}>
              تصفّح المجاني
            </Btn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v:"+3,000", l:"طالب مسجَّل",      icon:Users     },
            { v:"+120",   l:"محاضرة متاحة",      icon:Video     },
            { v:"+90",    l:"اختبار تفاعلي",     icon:FileText  },
            { v:"15",     l:"سنة خبرة تدريسية",  icon:Award     },
          ].map((s,i)=>(
            <div key={i}>
              <s.icon size={24} className="text-primary mx-auto mb-2"/>
              <div className="text-2xl font-black">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Teacher */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-4xl font-black mb-5">م</div>
            <h2 className="text-2xl font-black mb-3">الأستاذ محمود عبدالمرضي</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              أستاذ اللغة العربية للمرحلة الثانوية، ذو خبرة تزيد عن 15 عامًا في التدريس. متخصص في تبسيط قواعد النحو والصرف وتحبيب اللغة إلى قلوب الطلاب.
            </p>
            <ul className="space-y-2">
              {["ليسانس آداب — قسم اللغة العربية","دبلوم التربية التعليمية","أكثر من 3000 طالب عبر مختلف المحافظات"].map((t,i)=>(
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} className="text-primary shrink-0"/> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {SUBJECTS.map(s => (
              <Card2 key={s.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => nav("login")}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl shrink-0">{s.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-muted-foreground mb-1">{s.grade}</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge2 variant="primary">{s.openLectures} مجانية</Badge2>
                      <Badge2>{s.lessonsCount} محاضرة</Badge2>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-muted-foreground shrink-0"/>
                </div>
              </Card2>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects grid */}
      <section className="py-14 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-8">المواد المتاحة</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {SUBJECTS.map(s => (
              <Card2 key={s.id}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  {[["الفصول",s.chaptersCount],["المحاضرات",s.lessonsCount],["المجانية",s.openLectures],["الطلاب",s.studentsCount.toLocaleString("ar-EG")]].map(([k,v])=>(
                    <div key={k as string} className="bg-muted rounded-xl p-2 text-center">
                      <div className="font-black text-sm">{v}</div>
                      <div className="text-muted-foreground">{k}</div>
                    </div>
                  ))}
                </div>
                <Btn variant="outline" className="w-full" onClick={() => nav("register")}>
                  اشترك بـ {s.price} جنيه / شهر
                </Btn>
              </Card2>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-3">جاهز للبدء؟</h2>
          <p className="text-muted-foreground mb-6">سجّل الآن وابدأ رحلتك مع اللغة العربية تحت إشراف الأستاذ محمود</p>
          <div className="flex gap-3 justify-center">
            <Btn size="lg" onClick={() => nav("register")}>التسجيل الآن</Btn>
            <Btn size="lg" variant="outline" onClick={() => nav("login")}>تسجيل الدخول</Btn>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground">
        <p>© 2025 منصة المرضي — الأستاذ محمود عبدالمرضي. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
export function LoginPage({ nav, setRole, onLogin }: any) {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const doLogin = async () => {
    if (!phone.match(/^01[0125][0-9]{8}$/) || !pass) { setErr("يرجى إدخال رقم هاتف صحيح وكلمة المرور"); return; }
    setLoading(true); setErr("");
    try {
      const user = await onLogin(phone, pass);
      const nextRole = user.role;
      setRole(nextRole);
      nav(nextRole === "student" ? "student-dashboard" : nextRole === "parent" ? "parent-dashboard" : "admin-dashboard", {}, nextRole);
      notify("مرحبًا! تم تسجيل دخولك بنجاح", "success");
    } catch {
      setErr("رقم الهاتف أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black mx-auto mb-3">م</div>
          <h1 className="text-2xl font-black">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-sm mt-1">منصة الأستاذ محمود عبدالمرضي</p>
        </div>
        <Card2>
          <div className="space-y-4">
            <Input2 label="رقم الهاتف" type="tel" inputMode="numeric" placeholder="01xxxxxxxxx" value={phone} onChange={(e:any)=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} dir="ltr"/>
            <Input2 label="كلمة المرور" type="password" placeholder="••••••••" value={pass} onChange={(e:any)=>setPass(e.target.value)}/>
            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={15}/> {err}
              </div>
            )}
            <Btn className="w-full" onClick={doLogin} disabled={loading}>
              {loading ? <><RefreshCw size={15} className="animate-spin"/> جارٍ الدخول…</> : "دخول"}
            </Btn>
            <div className="flex items-center justify-center text-sm">
              <button onClick={()=>nav("forgot")} className="text-primary hover:underline">نسيت كلمة المرور؟</button>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Btn variant="outline" onClick={()=>nav("register")}>إنشاء حساب طالب</Btn>
              <Btn variant="outline" onClick={()=>nav("parent-register")}>إنشاء حساب ولي أمر</Btn>
            </div>
          </div>
        </Card2>
      </div>
    </div>
  );
}

// ============================================================
// REGISTER
// ============================================================
export function RegisterPage({ nav }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [form, setForm] = useState({ name:"",birthDate:"",phone:"",parentPhone:"",email:"",grade:"",governorate:"",school:"",password:"",confirm:"" });
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e: any = {};
    if (!form.name.trim())                                  e.name="الاسم مطلوب";
    if (!form.birthDate)                                    e.birthDate="تاريخ الميلاد مطلوب";
    if (!form.phone.match(/^01[0-2][0-9]{8}$/))            e.phone="رقم هاتف غير صحيح";
    if (!form.parentPhone.match(/^01[0-2][0-9]{8}$/))      e.parentPhone="رقم ولي الأمر غير صحيح";
    if (form.phone === form.parentPhone && form.phone)      e.parentPhone="رقم ولي الأمر يجب أن يختلف عن رقم الطالب";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))   e.email="بريد إلكتروني غير صحيح";
    if (!form.grade)                                        e.grade="يرجى اختيار الصف";
    if (!form.governorate)                                  e.governorate="يرجى اختيار المحافظة";
    if (!form.school.trim())                                e.school="اسم المدرسة مطلوب";
    if (form.password.length < 8)                          e.password="كلمة المرور يجب ألا تقل عن 8 أحرف";
    if (form.password !== form.confirm)                    e.confirm="كلمات المرور غير متطابقة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const registration = await registerStudent({
        name: form.name,
        phone: form.phone,
        parentPhone: form.parentPhone,
        birthDate: form.birthDate,
        governorate: form.governorate,
        password: form.password,
        passwordConfirmation: form.confirm,
      });
      storePendingRegistration(registration);
      nav("otp", { phone: form.phone, verificationRole: "student" });
    } catch (error) {
      setErrors({ submit: error instanceof ApiError ? error.message : "تعذر إنشاء الحساب. حاول مرة أخرى." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black">تسجيل طالب جديد</h1>
          <p className="text-muted-foreground text-sm mt-1">أنشئ حسابك للوصول إلى المحاضرات</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            {[1,2,3].map(s=>(
              <div key={s} className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                s<step?"bg-primary text-white border-primary":s===step?"border-primary text-primary":"border-muted text-muted-foreground")}>
                {s<step?<Check size={14}/>:s}
              </div>
            ))}
          </div>
        </div>
        <Card2>
          {step===1 && (
            <div className="space-y-4">
              <h3 className="font-bold">البيانات الشخصية</h3>
              <Input2 label="الاسم الكامل" placeholder="محمد أحمد علي" value={form.name} onChange={(e:any)=>set("name",e.target.value)} error={errors.name}/>
              <Input2 label="تاريخ الميلاد" type="date" value={form.birthDate} onInput={(e:any)=>set("birthDate",e.currentTarget.value)} error={errors.birthDate}/>
              <div className="grid grid-cols-2 gap-3">
                <Input2 label="هاتف الطالب" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e:any)=>set("phone",e.target.value)} error={errors.phone} dir="ltr"/>
                <Input2 label="هاتف ولي الأمر" placeholder="01xxxxxxxxx" value={form.parentPhone} onChange={(e:any)=>set("parentPhone",e.target.value)} error={errors.parentPhone} dir="ltr"/>
              </div>
              <Input2 label="البريد الإلكتروني (فريد)" type="email" placeholder="example@email.com" value={form.email} onChange={(e:any)=>set("email",e.target.value)} error={errors.email} dir="ltr"/>
              <Btn className="w-full" onClick={()=>{ if(form.name&&form.birthDate&&form.phone&&form.parentPhone&&form.email&&form.phone!==form.parentPhone)setStep(2);else validate(); }}>التالي</Btn>
            </div>
          )}
          {step===2 && (
            <div className="space-y-4">
              <h3 className="font-bold">البيانات الدراسية</h3>
              <Select2 label="الصف الدراسي" value={form.grade} onChange={(e:any)=>set("grade",e.target.value)}
                options={[{value:"",label:"اختر الصف"},...GRADES.map(g=>({value:g,label:g}))]}/>
              {errors.grade && <p className="text-xs text-red-500 -mt-2">{errors.grade}</p>}
              <Select2 label="المحافظة" value={form.governorate} onChange={(e:any)=>set("governorate",e.target.value)}
                options={[{value:"",label:"اختر المحافظة"},...GOVERNORATES.map(g=>({value:g,label:g}))]}/>
              {errors.governorate && <p className="text-xs text-red-500 -mt-2">{errors.governorate}</p>}
              <Input2 label="اسم المدرسة" placeholder="مدرسة القاهرة الثانوية" value={form.school} onChange={(e:any)=>set("school",e.target.value)} error={errors.school}/>
              <div className="flex gap-2">
                <Btn variant="outline" className="flex-1" onClick={()=>setStep(1)}>السابق</Btn>
                <Btn className="flex-1" onClick={()=>{ if(form.grade&&form.governorate&&form.school)setStep(3);else validate(); }}>التالي</Btn>
              </div>
            </div>
          )}
          {step===3 && (
            <div className="space-y-4">
              <h3 className="font-bold">كلمة المرور</h3>
              <Input2 label="كلمة المرور" type="password" placeholder="8 أحرف على الأقل" value={form.password} onChange={(e:any)=>set("password",e.target.value)} error={errors.password}/>
              <Input2 label="تأكيد كلمة المرور" type="password" placeholder="أعد كتابة كلمة المرور" value={form.confirm} onChange={(e:any)=>set("confirm",e.target.value)} error={errors.confirm}/>
              <div className="flex gap-2">
                <Btn variant="outline" className="flex-1" onClick={()=>setStep(2)}>السابق</Btn>
                <Btn className="flex-1" onClick={submit} disabled={loading}>
                  {loading?<><RefreshCw size={15} className="animate-spin"/> جارٍ التسجيل…</>:"إنشاء الحساب"}
                </Btn>
              </div>
              {errors.submit && <div role="alert" className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{errors.submit}</div>}
            </div>
          )}
        </Card2>
        <p className="text-center text-sm mt-4">
          لديك حساب؟ <button onClick={()=>nav("login")} className="text-primary font-semibold hover:underline">سجّل الدخول</button>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PARENT REGISTER
// ============================================================
export function ParentRegisterPage({ nav }: any) {
  const [form, setForm] = useState({name:"",phone:"",password:"",confirm:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validPhone = /^01[0125][0-9]{8}$/.test(form.phone);

  const submit = async () => {
    if (!form.name.trim() || !validPhone || form.password.length < 8 || form.password !== form.confirm) {
      setError("راجع الاسم ورقم الهاتف وتطابق كلمة المرور (8 أحرف على الأقل).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const registration = await registerParent({
        name: form.name,
        phone: form.phone,
        password: form.password,
        passwordConfirmation: form.confirm,
      });
      storePendingRegistration(registration);
      nav("otp", {phone: form.phone, verificationRole:"parent"});
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "تعذر إنشاء الحساب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black">تسجيل ولي أمر</h1>
          <p className="text-sm text-muted-foreground mt-1">استخدم نفس الرقم الذي سجله الطالب في خانة رقم ولي الأمر</p>
        </div>
        <Card2>
          <div className="space-y-4">
            <Input2 label="الاسم الكامل" value={form.name} onChange={(e:any)=>setForm(current=>({...current,name:e.target.value}))}/>
            <Input2 label="رقم الهاتف" type="tel" inputMode="numeric" placeholder="01xxxxxxxxx" dir="ltr" value={form.phone} onChange={(e:any)=>setForm(current=>({...current,phone:e.target.value.replace(/\D/g,"").slice(0,11)}))}/>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
              بعد تأكيد الرقم سيتم ربط الحساب تلقائيًا بكل الطلاب الذين سجلوا هذا الرقم كولي أمر.
            </div>
            <Input2 label="كلمة المرور" type="password" value={form.password} onChange={(e:any)=>setForm(current=>({...current,password:e.target.value}))}/>
            <Input2 label="تأكيد كلمة المرور" type="password" value={form.confirm} onChange={(e:any)=>setForm(current=>({...current,confirm:e.target.value}))}/>
            {error && <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm"><AlertCircle size={15} className="inline ml-1"/>{error}</div>}
            <Btn className="w-full" onClick={submit} disabled={loading}>{loading?<><RefreshCw size={15} className="animate-spin"/> جارٍ التحقق…</>:"متابعة التحقق"}</Btn>
          </div>
        </Card2>
        <button onClick={()=>nav("login")} className="block mx-auto mt-4 text-sm text-primary hover:underline">العودة لتسجيل الدخول</button>
      </div>
    </div>
  );
}

// ============================================================
// OTP
// ============================================================
export function OTPPage({ nav, params, setRole, setAuthUser }: any) {
  const [registration, setRegistration] = useState(() => loadPendingRegistration());
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(registration?.resendAfterSeconds ?? 0);
  const refs = useRef<any[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (resendRemaining <= 0) return;
    const timer = window.setInterval(() => setResendRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendRemaining]);
  const chg = (i:number,v:string) => {
    if (!/^\d?$/.test(v)) return;
    const n=[...otp]; n[i]=v; setOtp(n);
    if (v && i<5) refs.current[i+1]?.focus();
  };
  const verify = async () => {
    if (!registration) {
      setError("انتهت بيانات التسجيل. ابدأ التسجيل مرة أخرى.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const user = await verifyRegistration(registration, otp.join(""));
      clearPendingRegistration();
      setAuthUser(user);
      setRole(user.role);
      nav(user.role === "parent" ? "parent-dashboard" : "student-dashboard", {}, user.role);
      notify(user.role === "parent" ? "تم التحقق وربط الطلاب بحسابك" : "تم التحقق بنجاح! مرحبًا بك", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر التحقق من الرمز.");
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    if (!registration || resendRemaining > 0) return;

    setLoading(true);
    setError("");
    try {
      const nextRegistration = await resendRegistration(registration);
      storePendingRegistration(nextRegistration);
      setRegistration(nextRegistration);
      setResendRemaining(nextRegistration.resendAfterSeconds);
      setOtp(["","","","","",""]);
      refs.current[0]?.focus();
      notify("تم إرسال رمز تحقق جديد", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر إعادة إرسال الرمز.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-primary"/>
        </div>
        <h1 className="text-2xl font-black mb-2">التحقق من الهاتف</h1>
        <p className="text-muted-foreground text-sm mb-6">
          أرسلنا رمز التحقق إلى<br/>
          <span className="font-bold text-foreground" dir="ltr">{registration?.phone || params?.phone || "01xxxxxxxxx"}</span>
        </p>
        <Card2>
          <div className="flex gap-2 justify-center mb-5 flex-row-reverse">
            {otp.map((v,i)=>(
              <input key={i} ref={el=>refs.current[i]=el} value={v} onChange={e=>chg(i,e.target.value)}
                aria-label={`الرقم ${i + 1} من رمز التحقق`} autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} inputMode="numeric"
                className="w-11 h-14 text-center text-xl font-black rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background transition-colors"/>
            ))}
          </div>
          {registration?.developmentCode && (
            <div className="mb-3 rounded-xl bg-muted p-3 text-sm">
              رمز التطوير: <strong dir="ltr">{registration.developmentCode}</strong>
            </div>
          )}
          {error && <div role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Btn className="w-full mb-3" onClick={verify} disabled={loading||otp.some(v=>!v)}>
            {loading?<><RefreshCw size={15} className="animate-spin"/> جارٍ التحقق…</>:"تحقق"}
          </Btn>
          <button disabled={loading || resendRemaining > 0} onClick={resend} className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline">
            {resendRemaining > 0 ? `إعادة الإرسال خلال ${resendRemaining} ثانية` : "إعادة إرسال الرمز"}
          </button>
        </Card2>
      </div>
    </div>
  );
}

// ============================================================
// FORGOT PASSWORD
// ============================================================
export function ForgotPage({ nav }: any) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black">استعادة كلمة المرور</h1>
          <p className="text-muted-foreground text-sm mt-1">أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</p>
        </div>
        <Card2>
          {!sent ? (
            <div className="space-y-4">
              <Input2 label="البريد الإلكتروني" type="email" placeholder="example@email.com" value={email} onChange={(e:any)=>setEmail(e.target.value)} dir="ltr"/>
              <Btn className="w-full" onClick={()=>{ setLoading(true); setTimeout(()=>{ setLoading(false); setSent(true); },1100); }} disabled={loading||!email}>
                {loading?<><RefreshCw size={15} className="animate-spin"/> إرسال…</>:"إرسال رابط الاستعادة"}
              </Btn>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={44} className="text-primary mx-auto mb-3"/>
              <p className="font-bold mb-1">تم الإرسال!</p>
              <p className="text-sm text-muted-foreground mb-4">تحقق من بريدك الإلكتروني للحصول على رابط الاستعادة</p>
              <Btn variant="outline" className="w-full" onClick={()=>nav("login")}>العودة لتسجيل الدخول</Btn>
            </div>
          )}
        </Card2>
        <button onClick={()=>nav("login")} className="block text-center text-sm text-primary mt-4 hover:underline">
          تذكرت كلمة المرور؟ سجّل الدخول
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FREE CONTENT
// ============================================================
export function FreeContentPage({ nav, role }: any) {
  const free = LESSONS.filter(l=>l.isOpen);
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-2">المحتوى المجاني</h1>
        <p className="text-muted-foreground mb-6">محاضرات مجانية متاحة للجميع بدون اشتراك</p>
        {SUBJECTS.map(s=>{
          const sl = free.filter(l=>{ const ch=CHAPTERS.find(c=>c.id===l.chapterId); return ch?.subjectId===s.id; });
          if (!sl.length) return null;
          return (
            <div key={s.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-bold text-lg">{s.name}</span>
                <Badge2 variant="primary">{sl.length} محاضرات مجانية</Badge2>
              </div>
              <div className="space-y-2">
                {sl.map(l=>(
                  <Card2 key={l.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={()=>role==="student"?nav("video",{lessonId:l.id}):nav("login")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Play size={17} className="text-primary"/>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{l.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Clock size={11}/>{l.duration}
                          <Badge2 variant="info">مجاني</Badge2>
                        </div>
                      </div>
                      <ChevronLeft size={15} className="text-muted-foreground"/>
                    </div>
                  </Card2>
                ))}
              </div>
            </div>
          );
        })}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground mb-4">المحاضرات مجانية ولا تحتاج كودًا، لكن يلزم تسجيل حساب طالب للمشاهدة وحفظ التقدم.</p>
          <Btn onClick={()=>nav(role==="student"?"student-dashboard":"register")}>{role==="student"?"العودة للوحة الطالب":"التسجيل الآن"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STUDENT DASHBOARD
