/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Moon, Sun, Menu, X, ChevronRight, ChevronDown, ChevronLeft,
  Play, Lock, CheckCircle, XCircle, Clock, Award, BookOpen,
  Users, LogOut, Bell, Search, Plus, Edit2, Trash2, Eye, Download,
  AlertTriangle, Info, RotateCcw, Home, FileText, Video, Key, Shield,
  Activity, Star, UserCheck, UserX, Copy, Printer, RefreshCw, Check,
  AlertCircle, MessageCircle, Upload
} from "lucide-react";
import type { Role } from "../../app/routing/types";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Pager, Select2, StatCard, cn, notify } from "../../shared/ui";
import { ApiError } from "../../shared/api/client";
import {
  clearPendingRegistration,
  completeRegistration,
  loadPendingRegistration,
  loadRegistrationStatus,
  registerParent,
  registerStudent,
  resendRegistration,
  storePendingRegistration,
} from "../../shared/auth/registration";
import {
  clearPendingPasswordReset,
  completePasswordReset,
  loadPasswordResetStatus,
  loadPendingPasswordReset,
  requestPasswordReset,
  storePendingPasswordReset,
} from "../../shared/auth/password-reset";
import { loadFreeLectures, loadGrades, type FreeLecture, type PublicGrade } from "../../shared/public/api";
import { EGYPTIAN_GOVERNORATES } from "../../shared/public/registration-options";
// ============================================================
export function HomePage({ nav }: any) {
  const [lectures, setLectures] = useState<FreeLecture[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    loadFreeLectures()
      .then((response) => setLectures(response.lectures))
      .catch((error) => setContentError(error instanceof Error ? error.message : "تعذر تحميل المحتوى"))
      .finally(() => setLoadingContent(false));
  }, []);

  const branches = useMemo(() => {
    const grouped = new Map<number, { id: number; title: string; gradeNames: Set<string>; lectureCount: number; durationSeconds: number }>();
    lectures.forEach((lecture) => {
      const branch = grouped.get(lecture.branch.id) ?? {
        id: lecture.branch.id,
        title: lecture.branch.title,
        gradeNames: new Set<string>(),
        lectureCount: 0,
        durationSeconds: 0,
      };
      branch.gradeNames.add(lecture.grade.name);
      branch.lectureCount += 1;
      branch.durationSeconds += lecture.duration_seconds ?? 0;
      grouped.set(lecture.branch.id, branch);
    });
    return Array.from(grouped.values());
  }, [lectures]);

  const gradeCount = new Set(lectures.map((lecture) => lecture.grade.id)).size;
  const totalDurationHours = Math.round(lectures.reduce((total, lecture) => total + (lecture.duration_seconds ?? 0), 0) / 3600);
  const decorations = [
    { width: 84, height: 84, top: "12%", left: "8%" },
    { width: 52, height: 52, top: "68%", left: "18%" },
    { width: 112, height: 112, top: "20%", left: "78%" },
    { width: 66, height: 66, top: "72%", left: "88%" },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {decorations.map((style, index) => (
            <div key={index} className="absolute rounded-full bg-white opacity-30" style={style}/>
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
            { value: lectures.length, label: "محاضرة مجانية", icon: Video },
            { value: branches.length, label: "فرع دراسي", icon: BookOpen },
            { value: gradeCount, label: "صف دراسي", icon: Users },
            { value: totalDurationHours, label: "ساعة محتوى", icon: Clock },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon size={24} className="text-primary mx-auto mb-2"/>
              <div className="text-2xl font-black">{loadingContent ? "—" : stat.value.toLocaleString("ar-EG")}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
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
              أستاذ لغة عربية للمرحلة الثانوية، متخصص في تبسيط النحو والصرف والبلاغة وربط الشرح بالتطبيق العملي.
            </p>
            <ul className="space-y-2">
              {["شرح منظم للمرحلة الثانوية", "اختبارات لقياس الفهم", "متابعة النتائج والتقدم"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} className="text-primary shrink-0"/> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {branches.slice(0, 4).map((branch) => (
              <Card2 key={branch.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => nav("free-content")}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><BookOpen size={20}/></div>
                  <div className="flex-1">
                    <div className="font-bold">{branch.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">{Array.from(branch.gradeNames).join("، ")}</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge2 variant="primary">{branch.lectureCount} محاضرة مجانية</Badge2>
                      <Badge2>{formatLectureDuration(branch.durationSeconds)}</Badge2>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-muted-foreground shrink-0"/>
                </div>
              </Card2>
            ))}
            {!loadingContent && !contentError && branches.length === 0 && <Card2 className="text-center text-muted-foreground">سيظهر المحتوى هنا فور نشر أول محاضرة مجانية.</Card2>}
            {contentError && <Card2 className="text-center text-red-600">تعذر تحميل المحتوى حاليًا.</Card2>}
          </div>
        </div>
      </section>

      {/* Subjects grid */}
      <section className="py-14 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-8">المواد المتاحة</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {branches.map((branch) => (
              <Card2 key={branch.id}>
                <BookOpen className="text-primary mb-3" size={30}/>
                <h3 className="font-bold text-lg mb-1">{branch.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{Array.from(branch.gradeNames).join("، ")}</p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-muted rounded-xl p-2 text-center"><div className="font-black text-sm">{branch.lectureCount}</div><div className="text-muted-foreground">المحاضرات المجانية</div></div>
                  <div className="bg-muted rounded-xl p-2 text-center"><div className="font-black text-sm">{formatLectureDuration(branch.durationSeconds)}</div><div className="text-muted-foreground">إجمالي المدة</div></div>
                </div>
                <Btn variant="outline" className="w-full" onClick={() => nav("free-content")}>عرض المحاضرات</Btn>
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
        <p>© {new Date().getFullYear()} منصة المرضي — الأستاذ محمود عبدالمرضي. جميع الحقوق محفوظة.</p>
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
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "تعذر تسجيل الدخول. حاول مرة أخرى.");
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
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void doLogin(); }}>
            <Input2 label="رقم الهاتف" type="tel" inputMode="numeric" placeholder="01xxxxxxxxx" value={phone} onChange={(e:any)=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} dir="ltr"/>
            <Input2 label="كلمة المرور" type="password" placeholder="••••••••" value={pass} onChange={(e:any)=>setPass(e.target.value)}/>
            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={15}/> {err}
              </div>
            )}
            <Btn type="submit" className="w-full" disabled={loading}>
              {loading ? <><RefreshCw size={15} className="animate-spin"/> جارٍ الدخول…</> : "دخول"}
            </Btn>
            <div className="flex items-center justify-center text-sm">
              <button onClick={()=>nav("forgot")} className="text-primary hover:underline">نسيت كلمة المرور؟</button>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Btn variant="outline" onClick={()=>nav("register")}>إنشاء حساب طالب</Btn>
              <Btn variant="outline" onClick={()=>nav("parent-register")}>إنشاء حساب ولي أمر</Btn>
            </div>
          </form>
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
  const [grades, setGrades] = useState<PublicGrade[]>([]);
  const [form, setForm] = useState({ name:"",birthDate:"",phone:"",parentPhone:"",email:"",grade:"",governorate:"",school:"",password:"",confirm:"" });
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    loadGrades()
      .then((response) => setGrades(response.grades))
      .catch(() => setErrors((current: Record<string, string>) => ({ ...current, grades: "تعذر تحميل الصفوف الدراسية." })));
  }, []);

  const validate = () => {
    const e: any = {};
    if (!form.name.trim())                                  e.name="الاسم مطلوب";
    if (!form.birthDate)                                    e.birthDate="تاريخ الميلاد مطلوب";
    if (!form.phone.match(/^01[0125][0-9]{8}$/))           e.phone="رقم هاتف غير صحيح";
    if (!form.parentPhone.match(/^01[0125][0-9]{8}$/))     e.parentPhone="رقم ولي الأمر غير صحيح";
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
        email: form.email,
        school: form.school,
        gradeLevel: Number(form.grade),
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
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if(form.name&&form.birthDate&&form.phone&&form.parentPhone&&form.email&&form.phone!==form.parentPhone)setStep(2);else validate(); }}>
              <h3 className="font-bold">البيانات الشخصية</h3>
              <Input2 label="الاسم الكامل" placeholder="محمد أحمد علي" value={form.name} onChange={(e:any)=>set("name",e.target.value)} error={errors.name}/>
              <Input2 label="تاريخ الميلاد" type="date" value={form.birthDate} onInput={(e:any)=>set("birthDate",e.currentTarget.value)} error={errors.birthDate}/>
              <div className="grid grid-cols-2 gap-3">
                <Input2 label="هاتف الطالب" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e:any)=>set("phone",e.target.value)} error={errors.phone} dir="ltr"/>
                <Input2 label="هاتف ولي الأمر" placeholder="01xxxxxxxxx" value={form.parentPhone} onChange={(e:any)=>set("parentPhone",e.target.value)} error={errors.parentPhone} dir="ltr"/>
              </div>
              <Input2 label="البريد الإلكتروني (فريد)" type="email" placeholder="example@email.com" value={form.email} onChange={(e:any)=>set("email",e.target.value)} error={errors.email} dir="ltr"/>
              <Btn type="submit" className="w-full">التالي</Btn>
            </form>
          )}
          {step===2 && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if(form.grade&&form.governorate&&form.school)setStep(3);else validate(); }}>
              <h3 className="font-bold">البيانات الدراسية</h3>
              <Select2 label="الصف الدراسي" value={form.grade} onChange={(e:any)=>set("grade",e.target.value)}
                options={[{value:"",label:"اختر الصف"},...grades.map((grade)=>({value:grade.level,label:grade.name}))]}/>
              {errors.grade && <p className="text-xs text-red-500 -mt-2">{errors.grade}</p>}
              {errors.grades && <p className="text-xs text-red-500 -mt-2">{errors.grades}</p>}
              <Select2 label="المحافظة" value={form.governorate} onChange={(e:any)=>set("governorate",e.target.value)}
                options={[{value:"",label:"اختر المحافظة"},...EGYPTIAN_GOVERNORATES.map((governorate)=>({value:governorate,label:governorate}))]}/>
              {errors.governorate && <p className="text-xs text-red-500 -mt-2">{errors.governorate}</p>}
              <Input2 label="اسم المدرسة" placeholder="مدرسة القاهرة الثانوية" value={form.school} onChange={(e:any)=>set("school",e.target.value)} error={errors.school}/>
              <div className="flex gap-2">
                <Btn variant="outline" className="flex-1" onClick={()=>setStep(1)}>السابق</Btn>
                <Btn type="submit" className="flex-1">التالي</Btn>
              </div>
            </form>
          )}
          {step===3 && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
              <h3 className="font-bold">كلمة المرور</h3>
              <Input2 label="كلمة المرور" type="password" placeholder="8 أحرف على الأقل" value={form.password} onChange={(e:any)=>set("password",e.target.value)} error={errors.password}/>
              <Input2 label="تأكيد كلمة المرور" type="password" placeholder="أعد كتابة كلمة المرور" value={form.confirm} onChange={(e:any)=>set("confirm",e.target.value)} error={errors.confirm}/>
              <div className="flex gap-2">
                <Btn variant="outline" className="flex-1" onClick={()=>setStep(2)}>السابق</Btn>
                <Btn type="submit" className="flex-1" disabled={loading}>
                  {loading?<><RefreshCw size={15} className="animate-spin"/> جارٍ التسجيل…</>:"إنشاء الحساب"}
                </Btn>
              </div>
              {errors.submit && <div role="alert" className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{errors.submit}</div>}
            </form>
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
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            <Input2 label="الاسم الكامل" value={form.name} onChange={(e:any)=>setForm(current=>({...current,name:e.target.value}))}/>
            <Input2 label="رقم الهاتف" type="tel" inputMode="numeric" placeholder="01xxxxxxxxx" dir="ltr" value={form.phone} onChange={(e:any)=>setForm(current=>({...current,phone:e.target.value.replace(/\D/g,"").slice(0,11)}))}/>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
              بعد تأكيد الرقم سيتم ربط الحساب تلقائيًا بكل الطلاب الذين سجلوا هذا الرقم كولي أمر.
            </div>
            <Input2 label="كلمة المرور" type="password" value={form.password} onChange={(e:any)=>setForm(current=>({...current,password:e.target.value}))}/>
            <Input2 label="تأكيد كلمة المرور" type="password" value={form.confirm} onChange={(e:any)=>setForm(current=>({...current,confirm:e.target.value}))}/>
            {error && <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm"><AlertCircle size={15} className="inline ml-1"/>{error}</div>}
            <Btn type="submit" className="w-full" disabled={loading}>{loading?<><RefreshCw size={15} className="animate-spin"/> جارٍ التحقق…</>:"متابعة التحقق"}</Btn>
          </form>
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
  const [loading, setLoading] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(registration?.resendAfterSeconds ?? 0);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "expired" | "failed">("pending");
  const completingRef = useRef(false);

  useEffect(() => {
    if (resendRemaining <= 0) return;
    const timer = window.setInterval(() => setResendRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendRemaining]);

  const finishRegistration = useCallback(async () => {
    if (!registration || completingRef.current) return;

    completingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const user = await completeRegistration(registration);
      clearPendingRegistration();
      setAuthUser(user);
      setRole(user.role);
      nav(user.role === "parent" ? "parent-dashboard" : "student-dashboard", {}, user.role);
      notify(user.role === "parent" ? "تم التحقق وربط الطلاب بحسابك" : "تم التحقق بنجاح! مرحبًا بك", "success");
    } catch (requestError) {
      completingRef.current = false;
      setLoading(false);
      setError(requestError instanceof ApiError ? requestError.message : "تعذر إكمال تسجيل الحساب.");
    }
  }, [nav, registration, setAuthUser, setRole]);

  useEffect(() => {
    if (!registration) return;

    let active = true;
    let timer: number | undefined;
    const checkStatus = async () => {
      try {
        const result = await loadRegistrationStatus(registration);
        if (!active) return;

        setVerificationStatus(result.status);
        if (result.status === "verified") {
          await finishRegistration();
          return;
        }
        if (result.status === "expired" || result.status === "failed") {
          setError("انتهت صلاحية رابط التحقق. أنشئ رابطًا جديدًا للمتابعة.");
          return;
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof ApiError ? requestError.message : "تعذر متابعة حالة التحقق.");
      }

      if (active) timer = window.setTimeout(checkStatus, 2000);
    };

    void checkStatus();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [finishRegistration, registration]);

  const resend = async () => {
    if (!registration || resendRemaining > 0) return;

    setLoading(true);
    setError("");
    try {
      const nextRegistration = await resendRegistration(registration);
      storePendingRegistration(nextRegistration);
      setRegistration(nextRegistration);
      setResendRemaining(nextRegistration.resendAfterSeconds);
      setVerificationStatus("pending");
      completingRef.current = false;
      notify("تم إنشاء رابط تحقق جديد", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر إنشاء رابط تحقق جديد.");
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
          افتح واتساب وأرسل الرسالة الجاهزة من الرقم<br/>
          <span className="font-bold text-foreground" dir="ltr">{registration?.phone || params?.phone || "01xxxxxxxxx"}</span>
        </p>
        <Card2>
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-right">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <MessageCircle size={20} className="text-primary"/>
              خطوة واحدة للتأكيد
            </div>
            <p className="text-sm text-muted-foreground">
              اضغط الزر، ثم اضغط إرسال داخل واتساب. سيتم تأكيد حسابك تلقائيًا عند وصول الرسالة.
            </p>
          </div>
          {error && <div role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {registration?.whatsappUrl && (
            <a
              href={registration.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={20}/>
              فتح واتساب وإرسال رسالة التحقق
            </a>
          )}
          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <RefreshCw size={15} className={verificationStatus === "pending" ? "animate-spin" : ""}/>
            {loading ? "جارٍ فتح حسابك…" : "في انتظار وصول رسالة واتساب…"}
          </div>
          <button disabled={loading || resendRemaining > 0} onClick={resend} className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline">
            {resendRemaining > 0 ? `إنشاء رابط جديد خلال ${resendRemaining} ثانية` : "إنشاء رابط تحقق جديد"}
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
  const [phone, setPhone] = useState("");
  const [reset, setReset] = useState(() => loadPendingPasswordReset());
  const [status, setStatus] = useState<"request" | "pending" | "verified" | "success">(
    reset ? "pending" : "request",
  );
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reset || status !== "pending") return;

    let active = true;
    let timer: number | undefined;
    const checkStatus = async () => {
      try {
        const response = await loadPasswordResetStatus(reset);
        if (!active) return;
        if (response.status === "verified") {
          setStatus("verified");
          return;
        }
        if (response.status === "expired" || response.status === "failed") {
          clearPendingPasswordReset();
          setReset(null);
          setStatus("request");
          setError("انتهت صلاحية رابط الاستعادة. ابدأ من جديد.");
          return;
        }
        if (response.status === "consumed") {
          clearPendingPasswordReset();
          setStatus("success");
          return;
        }
      } catch (requestError) {
        if (active) setError(requestError instanceof ApiError ? requestError.message : "تعذر متابعة حالة التحقق.");
      }
      if (active) timer = window.setTimeout(checkStatus, 2000);
    };

    void checkStatus();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [reset, status]);

  const submitPhone = async () => {
    setLoading(true);
    setError("");
    try {
      const pendingReset = await requestPasswordReset(phone);
      storePendingPasswordReset(pendingReset);
      setReset(pendingReset);
      setStatus("pending");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر بدء استعادة كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async () => {
    if (!reset) return;
    if (password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await completePasswordReset(reset, password, passwordConfirmation);
      clearPendingPasswordReset();
      setReset(null);
      setStatus("success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر تغيير كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    clearPendingPasswordReset();
    setReset(null);
    setStatus("request");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black">استعادة كلمة المرور</h1>
          <p className="text-muted-foreground text-sm mt-1">تحقق من رقم حسابك عن طريق واتساب ثم اختر كلمة مرور جديدة</p>
        </div>
        <Card2>
          {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {status === "request" && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submitPhone(); }}>
              <Input2 label="رقم الهاتف" type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(event) => setPhone(event.target.value)} dir="ltr"/>
              <Btn type="submit" className="w-full" disabled={loading || phone.trim().length < 11}>
                {loading ? <><RefreshCw size={15} className="animate-spin"/> جارٍ التجهيز…</> : "متابعة عبر واتساب"}
              </Btn>
            </form>
          )}
          {status === "pending" && reset && (
            <div className="text-center py-2">
              <MessageCircle size={44} className="text-primary mx-auto mb-3"/>
              <p className="font-bold mb-2">أرسل رسالة التأكيد</p>
              <p className="text-sm text-muted-foreground mb-4">افتح واتساب من نفس رقم الحساب، ثم أرسل الرسالة الجاهزة. الصفحة ستنتقل تلقائيًا للخطوة التالية.</p>
              <a href={reset.whatsappUrl} target="_blank" rel="noreferrer" className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white hover:opacity-90"><MessageCircle size={20}/> فتح واتساب وإرسال الرسالة</a>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><RefreshCw size={15} className="animate-spin"/> في انتظار رسالة واتساب…</div>
              <button onClick={restart} className="mt-4 text-sm text-primary hover:underline">استخدام رقم آخر</button>
            </div>
          )}
          {status === "verified" && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submitPassword(); }}>
              <div className="text-center"><CheckCircle size={42} className="text-primary mx-auto mb-2"/><p className="font-bold">تم التحقق من الرقم</p></div>
              <Input2 label="كلمة المرور الجديدة" type="password" value={password} onChange={(event) => setPassword(event.target.value)} dir="ltr"/>
              <Input2 label="تأكيد كلمة المرور" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} dir="ltr"/>
              <Btn type="submit" className="w-full" disabled={loading || password.length < 8 || password !== passwordConfirmation}>{loading ? <><RefreshCw size={15} className="animate-spin"/> جارٍ الحفظ…</> : "حفظ كلمة المرور الجديدة"}</Btn>
            </form>
          )}
          {status === "success" && (
            <div className="text-center py-4">
              <CheckCircle size={44} className="text-primary mx-auto mb-3"/>
              <p className="font-bold mb-1">تم تغيير كلمة المرور</p>
              <p className="text-sm text-muted-foreground mb-4">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
              <Btn className="w-full" onClick={() => nav("login")}>تسجيل الدخول</Btn>
            </div>
          )}
        </Card2>
        <button onClick={() => nav("login")} className="block text-center text-sm text-primary mt-4 hover:underline">
          تذكرت كلمة المرور؟ سجّل الدخول
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ABOUT
// ============================================================
export function AboutPage({ nav }: any) {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-10">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black">م</div>
          <h1 className="mb-3 text-3xl font-black">عن منصة المرضي</h1>
          <p className="max-w-2xl text-base leading-8 opacity-90">
            منصة تعليمية متخصصة في اللغة العربية للمرحلة الثانوية، تساعد الطالب على فهم المنهج من خلال المحاضرات المسجلة والاختبارات والمتابعة المستمرة.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card2>
            <BookOpen className="mb-3 text-primary" />
            <h2 className="mb-2 font-black">شرح مبسّط</h2>
            <p className="text-sm leading-7 text-muted-foreground">محتوى منظم يشرح النحو والصرف والبلاغة بطريقة واضحة وتدريجية.</p>
          </Card2>
          <Card2>
            <Award className="mb-3 text-primary" />
            <h2 className="mb-2 font-black">تقييم مستمر</h2>
            <p className="text-sm leading-7 text-muted-foreground">اختبارات مرتبطة بالمحاضرات لقياس الفهم ومتابعة مستوى الطالب.</p>
          </Card2>
          <Card2>
            <Users className="mb-3 text-primary" />
            <h2 className="mb-2 font-black">متابعة الأسرة</h2>
            <p className="text-sm leading-7 text-muted-foreground">لوحة مخصصة لولي الأمر لمتابعة النتائج والمحاولات الفعلية للطالب.</p>
          </Card2>
        </div>

        <Card2 className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-1 text-xl font-black">الأستاذ محمود عبدالمرضي</h2>
            <p className="text-sm leading-7 text-muted-foreground">أستاذ اللغة العربية للمرحلة الثانوية، ومتخصص في تبسيط قواعد اللغة وربطها بالتطبيق العملي.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Btn variant="outline" onClick={() => nav("free-content")}>المحتوى المجاني</Btn>
            <Btn onClick={() => nav("register")}>إنشاء حساب</Btn>
          </div>
        </Card2>
      </div>
    </div>
  );
}

// ============================================================
// FREE CONTENT
// ============================================================
function formatLectureDuration(seconds?: number | null) {
  if (!seconds) return "المدة غير محددة";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} ساعة و${remainingMinutes} دقيقة` : `${hours} ساعة`;
}

export function FreeContentPage({ nav, role }: any) {
  const [lectures, setLectures] = useState<FreeLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFreeLectures()
      .then((response) => setLectures(response.lectures))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "تعذر تحميل المحتوى المجاني"))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const grouped = new Map<number, { title: string; grade: string; lectures: FreeLecture[] }>();
    lectures.forEach((lecture) => {
      const current = grouped.get(lecture.branch.id) ?? {
        title: lecture.branch.title,
        grade: lecture.grade.name,
        lectures: [],
      };
      current.lectures.push(lecture);
      grouped.set(lecture.branch.id, current);
    });
    return Array.from(grouped.entries());
  }, [lectures]);

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-2">المحتوى المجاني</h1>
        <p className="text-muted-foreground mb-6">محاضرات مجانية متاحة للجميع بدون اشتراك</p>

        {loading && <Card2 className="text-center text-muted-foreground">جارٍ تحميل المحاضرات…</Card2>}
        {!loading && error && <Card2 className="text-center text-red-600">{error}</Card2>}
        {!loading && !error && groups.length === 0 && (
          <Card2 className="text-center">
            <Video className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="mb-1 font-black">لا توجد محاضرات مجانية جاهزة حاليًا</h2>
            <p className="text-sm text-muted-foreground">ستظهر المحاضرات هنا فور نشرها وتجهيز الفيديو للمشاهدة.</p>
          </Card2>
        )}

        {groups.map(([branchId, group]) => (
            <div key={branchId} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="text-primary" />
                <div className="flex-1">
                  <div className="font-bold text-lg">{group.title}</div>
                  <div className="text-xs text-muted-foreground">{group.grade}</div>
                </div>
                <Badge2 variant="primary">{group.lectures.length} محاضرات مجانية</Badge2>
              </div>
              <div className="space-y-2">
                {group.lectures.map((lecture) => (
                  <Card2 key={lecture.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={()=>role==="student"?nav("video",{lessonId:lecture.id}):nav("login")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Play size={17} className="text-primary"/>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{lecture.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Clock size={11}/>{formatLectureDuration(lecture.duration_seconds)}
                          <Badge2 variant="info">مجاني</Badge2>
                        </div>
                      </div>
                      <ChevronLeft size={15} className="text-muted-foreground"/>
                    </div>
                  </Card2>
                ))}
              </div>
            </div>
        ))}
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
