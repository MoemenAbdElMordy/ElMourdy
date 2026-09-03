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
import type { AppRoute, Role } from "../../app/routing/types";
import { Badge2, Btn, Card2, Field, Input2, Modal2, Pager, Select2, StatCard, cn, notify } from "../../shared/ui";
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
import {
  clearPendingPasswordReset,
  completePasswordReset,
  loadPasswordResetStatus,
  loadPendingPasswordReset,
  requestPasswordReset,
  storePendingPasswordReset,
  verifyPasswordReset,
} from "../../shared/auth/password-reset";
import { freeLectureThumbnailUrl, loadFreeLectures, loadGrades, type FreeLecture, type PublicGrade } from "../../shared/public/api";
import { EGYPTIAN_GOVERNORATES } from "../../shared/public/registration-options";

const ARABIC_GRADE_NAMES: Record<number, string> = {
  1: "الصف الأول الثانوي",
  2: "الصف الثاني الثانوي",
  3: "الصف الثالث الثانوي",
};

function arabicGradeName(grade: PublicGrade) {
  return ARABIC_GRADE_NAMES[grade.level] ?? `الصف الدراسي ${grade.level}`;
}

function freeLectureGradeName(lecture: FreeLecture) {
  return ARABIC_GRADE_NAMES[lecture.grade.level] ?? lecture.grade.name;
}

const PUBLIC_LEARNING_LINKS: { route: AppRoute; label: string }[] = [
  { route: "arabic-secondary", label: "اللغة العربية للثانوية" },
  { route: "arabic-first-secondary", label: "الصف الأول الثانوي" },
  { route: "arabic-second-secondary", label: "الصف الثاني الثانوي" },
  { route: "arabic-third-secondary", label: "الصف الثالث الثانوي" },
  { route: "nahw-secondary", label: "النحو للثانوية" },
  { route: "balagha-secondary", label: "البلاغة للثانوية" },
];

function PublicLearningLinks({ nav }: { nav: any }) {
  return (
    <nav aria-label="دليل تعلم اللغة العربية" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {PUBLIC_LEARNING_LINKS.map((link) => (
        <a key={link.route} href={`/${link.route}`} onClick={(event) => { event.preventDefault(); nav(link.route); }} className="transition-colors hover:text-primary hover:underline">
          {link.label}
        </a>
      ))}
    </nav>
  );
}
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
      branch.gradeNames.add(freeLectureGradeName(lecture));
      branch.lectureCount += 1;
      branch.durationSeconds += lecture.duration_seconds ?? 0;
      grouped.set(lecture.branch.id, branch);
    });
    return Array.from(grouped.values());
  }, [lectures]);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative min-h-[680px] overflow-hidden bg-[#123d2e] text-primary-foreground md:min-h-[620px] lg:min-h-[656px]">
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(max-width: 767px)" srcSet="/images/teacher-hero-mobile.webp" type="image/webp" />
          <source media="(max-width: 767px)" srcSet="/images/teacher-hero-mobile.png" type="image/png" />
          <source srcSet="/images/teacher-hero-desktop.webp" type="image/webp" />
          <img
            src="/images/teacher-hero-desktop.png"
            alt="الأستاذ محمود عبدالمرضي مدرس اللغة العربية للمرحلة الثانوية"
            className="h-full w-full object-cover object-center"
            width="1920"
            height="720"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-[#071c15]/80 via-[#0a2d22]/20 to-transparent md:bg-gradient-to-r md:from-[#071c15]/70 md:via-[#071c15]/15 md:to-transparent" />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-start px-4 pb-6 pt-8 text-center md:min-h-[620px] md:items-center md:px-8 md:py-14 lg:min-h-[656px]">
          <div className="w-full md:mr-auto md:ml-0 md:w-[58%] lg:w-[56%]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0b2d22]/45 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm md:mb-5">
            <Star size={13}/> خادم لغة أهل الجنة
          </div>
          <h1 className="mb-3 text-3xl font-black leading-tight drop-shadow-sm sm:text-4xl md:mb-5 md:text-5xl lg:text-6xl">
            منصة الأستاذ<br className="hidden md:block"/> محمود عبدالمرضي
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-sm leading-7 opacity-95 drop-shadow-sm sm:text-base md:mb-8 md:text-lg md:leading-relaxed">
            منصة تعليمية متكاملة لتعليم اللغة العربية للمرحلة الثانوية — محاضرات، اختبارات تفاعلية، متابعة دقيقة
          </p>
          <div className="flex flex-row justify-center gap-2 sm:gap-3">
            <Btn size="lg" className="whitespace-nowrap !bg-white !px-3 !text-sm !text-primary font-black hover:!opacity-90 sm:!px-6 sm:!text-base" onClick={() => nav("register")}>
              ابدأ التعلم الآن
            </Btn>
            <Btn size="lg" className="whitespace-nowrap border-2 border-white/50 !px-3 !text-sm text-white hover:!bg-white/20 sm:!px-6 sm:!text-base" variant="ghost" onClick={() => nav("free-content")}>
              تصفّح المجاني
            </Btn>
          </div>
          </div>
        </div>
      </section>

      {/* Learning experience */}
      <section className="relative border-b border-border bg-card px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              تجربة تعليمية متكاملة
            </span>
            <h2 className="text-2xl font-black sm:text-3xl">كل ما تحتاجه لتتفوق في اللغة العربية</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "شرح واضح ومنظم", description: "تبسيط القواعد وربطها بأمثلة وتطبيقات تساعدك على الفهم الحقيقي.", icon: BookOpen },
              { title: "تدريب يقيس مستواك", description: "اختبارات وتدريبات تفاعلية تكشف نقاط القوة وما يحتاج إلى مراجعة.", icon: Award },
              { title: "متابعة مستمرة للتقدم", description: "لوحة شخصية تعرض تقدمك ونتائجك وتساعدك على استكمال رحلتك.", icon: Activity },
            ].map((feature) => (
              <article key={feature.title} className="group relative overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-125" />
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <feature.icon size={22} />
                </div>
                <h3 className="relative mb-2 text-lg font-black">{feature.title}</h3>
                <p className="relative text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <img src="/images/mourdy-logo-160.webp" alt="شعار منصة المرضي" className="mb-5 h-20 w-20 rounded-full object-cover shadow-md" width="80" height="80" loading="lazy" />
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

      {/* Secondary school learning guide */}
      <section className="border-y border-border bg-card px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="mb-3 text-2xl font-black sm:text-3xl">شرح اللغة العربية لكل صف في المرحلة الثانوية</h2>
            <p className="leading-8 text-muted-foreground">
              في منصة المرضي التعليمية هتلاقي المحتوى منظم حسب الصف والفرع، علشان توصل لشرح النحو والبلاغة والتدريبات المناسبة لمرحلتك بسهولة.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PUBLIC_LEARNING_LINKS.slice(1, 4).map((link, index) => (
              <a key={link.route} href={`/${link.route}`} onClick={(event) => { event.preventDefault(); nav(link.route); }} className="group rounded-3xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-black text-primary">{index + 1}</span>
                <h3 className="mb-2 text-lg font-black">شرح عربي {link.label}</h3>
                <p className="text-sm leading-7 text-muted-foreground">محاضرات منظمة وتدريبات واختبارات تساعدك على الفهم وقياس تقدمك خطوة بخطوة.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">اعرف تفاصيل الصف <ChevronLeft size={14}/></span>
              </a>
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
        <PublicLearningLinks nav={nav}/>
        <p className="mt-4">© {new Date().getFullYear()} منصة المرضي — الأستاذ محمود عبدالمرضي. جميع الحقوق محفوظة.</p>
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
          <img src="/images/mourdy-logo-160.webp" alt="شعار منصة المرضي" className="mx-auto mb-3 h-16 w-16 rounded-full object-cover shadow-md" width="64" height="64" />
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
              <button type="button" onClick={()=>nav("forgot")} className="text-primary hover:underline">نسيت كلمة المرور؟</button>
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
  const [form, setForm] = useState({ name:"",birthDate:"",phone:"",parentPhone:"",email:"",grade:"",governorate:"",school:"",centerName:"",password:"",confirm:"" });
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
    if (!form.centerName.trim())                            e.centerName="اسم السنتر مطلوب";
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
        centerName: form.centerName,
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
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if(form.grade&&form.governorate&&form.school&&form.centerName.trim())setStep(3);else validate(); }}>
              <h3 className="font-bold">البيانات الدراسية</h3>
              <Select2 label="الصف الدراسي" value={form.grade} onChange={(e:any)=>set("grade",e.target.value)}
                options={[{value:"",label:"اختر الصف"},...grades.map((grade)=>({value:grade.level,label:arabicGradeName(grade)}))]}/>
              {errors.grade && <p className="text-xs text-red-500 -mt-2">{errors.grade}</p>}
              {errors.grades && <p className="text-xs text-red-500 -mt-2">{errors.grades}</p>}
              <Select2 label="المحافظة" value={form.governorate} onChange={(e:any)=>set("governorate",e.target.value)}
                options={[{value:"",label:"اختر المحافظة"},...EGYPTIAN_GOVERNORATES.map((governorate)=>({value:governorate,label:governorate}))]}/>
              {errors.governorate && <p className="text-xs text-red-500 -mt-2">{errors.governorate}</p>}
              <Input2 label="اسم المدرسة" placeholder="مدرسة القاهرة الثانوية" value={form.school} onChange={(e:any)=>set("school",e.target.value)} error={errors.school}/>
              <Input2 label="اسم السنتر" placeholder="سنتر الأستاذ محمود عبدالمرضي" value={form.centerName} onChange={(e:any)=>set("centerName",e.target.value)} error={errors.centerName}/>
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
  const [form, setForm] = useState({name:"",phone:"",email:"",password:"",confirm:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validPhone = /^01[0125][0-9]{8}$/.test(form.phone);

  const submit = async () => {
    if (!form.name.trim() || !validPhone || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 8 || form.password !== form.confirm) {
      setError("راجع الاسم ورقم الهاتف وتطابق كلمة المرور (8 أحرف على الأقل).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const registration = await registerParent({
        name: form.name,
        phone: form.phone,
        email: form.email,
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
            <Input2 label="البريد الإلكتروني" type="email" dir="ltr" value={form.email} onChange={(e:any)=>setForm(current=>({...current,email:e.target.value}))}/>
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
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(registration?.resendAfterSeconds ?? 0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendRemaining <= 0) return;
    const timer = window.setInterval(() => setResendRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendRemaining]);

  const submit = async () => {
    if (!registration || code.length !== 6) {
      setError("أدخل كود التحقق المكون من 6 أرقام.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await verifyRegistration(registration, code);
      clearPendingRegistration();
      setAuthUser(user);
      setRole(user.role);
      nav(user.role === "parent" ? "parent-dashboard" : "student-dashboard", {}, user.role);
      notify("تم التحقق من البريد الإلكتروني بنجاح", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر التحقق من الكود.");
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
      notify("تم إرسال كود تحقق جديد إلى بريدك الإلكتروني", "success");
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
        <h1 className="text-2xl font-black mb-2">التحقق من البريد الإلكتروني</h1>
        <p className="text-muted-foreground text-sm mb-6">
          أرسلنا كودًا مكونًا من 6 أرقام إلى<br/>
          <span className="font-bold text-foreground" dir="ltr">{registration?.emailHint || "بريدك الإلكتروني"}</span>
        </p>
        <Card2>
          <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="space-y-4">
            <Input2 label="كود التحقق" inputMode="numeric" dir="ltr" maxLength={6} value={code} onChange={(event:any)=>setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}/>
            {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Btn type="submit" className="w-full" disabled={loading || code.length !== 6}>{loading ? "جارٍ التحقق…" : "تأكيد الكود"}</Btn>
          </form>
          <button disabled={loading || resendRemaining > 0} onClick={resend} className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline">
            {resendRemaining > 0 ? `إرسال كود جديد خلال ${resendRemaining} ثانية` : "إرسال كود جديد"}
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
  const [code, setCode] = useState("");
  const [reset, setReset] = useState(() => loadPendingPasswordReset());
  const [status, setStatus] = useState<"request" | "pending" | "verified" | "success">(
    reset ? "pending" : "request",
  );
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reset) return;
    void loadPasswordResetStatus(reset).then((response) => {
      if (response.status === "verified") setStatus("verified");
      if (response.status === "consumed") setStatus("success");
      if (response.status === "expired" || response.status === "failed") restart();
    }).catch(() => restart());
  // Only restore the persisted reset once when the page opens.
  }, []);

  const submitEmail = async () => {
    setLoading(true);
    setError("");
    try {
      const pendingReset = await requestPasswordReset(email.trim());
      storePendingPasswordReset(pendingReset);
      setReset(pendingReset);
      setStatus("pending");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر بدء استعادة كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!reset || code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyPasswordReset(reset, code);
      setStatus("verified");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "كود التحقق غير صحيح أو انتهت صلاحيته.");
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
          <p className="text-muted-foreground text-sm mt-1">سنرسل كود تحقق إلى بريدك الإلكتروني ثم تختار كلمة مرور جديدة</p>
        </div>
        <Card2>
          {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {status === "request" && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submitEmail(); }}>
              <Input2 label="البريد الإلكتروني" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" autoComplete="email"/>
              <Btn type="submit" className="w-full" disabled={loading || !email.includes("@")}>
                {loading ? <><RefreshCw size={15} className="animate-spin"/> جارٍ الإرسال…</> : "إرسال كود التحقق"}
              </Btn>
            </form>
          )}
          {status === "pending" && reset && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submitCode(); }}>
              <div className="text-center"><Shield size={44} className="text-primary mx-auto mb-3"/><p className="font-bold">أدخل كود التحقق</p><p className="mt-1 text-sm text-muted-foreground">أرسلنا كودًا من 6 أرقام إلى بريدك الإلكتروني.</p></div>
              <Input2 label="كود التحقق" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} dir="ltr" autoComplete="one-time-code"/>
              <Btn type="submit" className="w-full" disabled={loading || code.length !== 6}>{loading ? "جارٍ التحقق…" : "تأكيد الكود"}</Btn>
              <button type="button" onClick={restart} className="block w-full text-sm text-primary hover:underline">استخدام بريد إلكتروني آخر</button>
            </form>
          )}
          {status === "verified" && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submitPassword(); }}>
              <div className="text-center"><CheckCircle size={42} className="text-primary mx-auto mb-2"/><p className="font-bold">تم التحقق من البريد الإلكتروني</p></div>
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
          <img src="/images/mourdy-logo-160.webp" alt="شعار منصة المرضي" className="mb-5 h-16 w-16 rounded-full object-cover shadow-md" width="64" height="64" loading="lazy" />
          <h1 className="mb-3 text-3xl font-black">عن منصة المرضي والأستاذ محمود عبدالمرضي</h1>
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

        <Card2>
          <h2 className="mb-3 text-xl font-black">تعليم اللغة العربية للمرحلة الثانوية</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            تجمع المنصة بين شرح النحو والصرف والبلاغة، والتدريب على الأسئلة، وقياس مستوى الطالب بعد كل جزء؛ حتى يعرف الطالب وولي الأمر ما تم إنجازه وما يحتاج إلى مراجعة.
          </p>
        </Card2>
      </div>
    </div>
  );
}

type SecondaryLandingRoute =
  | "arabic-secondary"
  | "arabic-first-secondary"
  | "arabic-second-secondary"
  | "arabic-third-secondary"
  | "nahw-secondary"
  | "balagha-secondary";

const SECONDARY_LANDING_CONTENT: Record<SecondaryLandingRoute, {
  eyebrow: string;
  title: string;
  description: string;
  sections: { title: string; body: string }[];
  questions: { question: string; answer: string }[];
}> = {
  "arabic-secondary": {
    eyebrow: "دليل المرحلة الثانوية",
    title: "شرح اللغة العربية للمرحلة الثانوية",
    description: "منصة المرضي التعليمية مع الأستاذ محمود عبدالمرضي بتنظم شرح العربي للثانوية حسب الصف والفرع، مع محاضرات وتدريبات وواجبات واختبارات ومتابعة للتقدم.",
    sections: [
      { title: "منهج منظم بدل التشتت", body: "المحتوى مترتب داخل سنوات وصفوف وفروع وأبواب ودروس، علشان الطالب يعرف يبدأ منين ويرجع لآخر جزء وصل له." },
      { title: "فهم وتطبيق وقياس", body: "الشرح مرتبط بالتدريب والواجبات والاختبارات، فتقدر تعرف مستوى فهمك وتراجع الأجزاء اللي محتاجة تركيز." },
      { title: "متابعة للطالب وولي الأمر", body: "تقدم مشاهدة المحاضرات والنتائج والمحاولات بيظهروا بصورة واضحة تساعد على متابعة الالتزام والتحسن." },
    ],
    questions: [
      { question: "المنصة مناسبة لأنهي صفوف؟", answer: "منصة المرضي مخصصة لطلاب الصف الأول والثاني والثالث الثانوي." },
      { question: "هل فيه محاضرات مجانية؟", answer: "أيوه، المحاضرات المنشورة كمحتوى مجاني بتظهر في صفحة المحتوى المجاني، وتسجيل الحساب بيحفظ تقدم المشاهدة." },
    ],
  },
  "arabic-first-secondary": {
    eyebrow: "الصف الأول الثانوي",
    title: "شرح اللغة العربية للصف الأول الثانوي",
    description: "ابدأ تأسيس العربي أولى ثانوي بخطة منظمة تساعدك تفهم القواعد وتطبق عليها، وتتابع محاضراتك وواجباتك واختباراتك من مكان واحد.",
    sections: [
      { title: "تأسيس قوي من البداية", body: "الصف الأول الثانوي محتاج فهم للمفاهيم الأساسية قبل حفظ الإجابات، لذلك ترتيب الدروس والتدرج في الشرح بيفرق في النتيجة." },
      { title: "تدريب بعد كل جزء", body: "حل الأسئلة بعد الشرح بيثبت القاعدة ويوضح الأخطاء المتكررة قبل ما تتراكم مع أجزاء المنهج التالية." },
      { title: "متابعة التقدم", body: "حساب الطالب بيحفظ آخر نقطة مشاهدة ويعرض الواجبات والاختبارات المخصصة لصفه خلال السنة الدراسية." },
    ],
    questions: [
      { question: "إزاي أبدأ عربي أولى ثانوي على المنصة؟", answer: "أنشئ حساب طالب، اختار الصف الأول الثانوي والسنة الدراسية، وبعد التفعيل هتظهر المواد والمحاضرات المخصصة ليك." },
      { question: "هل أقدر أجرب قبل الاشتراك؟", answer: "تقدر تشوف المحاضرات المجانية المنشورة من صفحة المحتوى المجاني." },
    ],
  },
  "arabic-second-secondary": {
    eyebrow: "الصف الثاني الثانوي",
    title: "شرح اللغة العربية للصف الثاني الثانوي",
    description: "راجع وافهم عربي تانية ثانوي من خلال محتوى مرتب حسب فروع المنهج، مع تدريبات وواجبات واختبارات تساعدك تثبت المعلومة وتقيس مستواك.",
    sections: [
      { title: "ربط الجديد بالأساسيات", body: "شرح تانية ثانوي يبني على اللي درسته قبل كده، مع مراجعة النقاط الأساسية وقت احتياجها أثناء الدرس." },
      { title: "واجبات واختبارات مخصصة للصف", body: "كل واجب أو اختبار بيظهر للصفوف اللي حددها المدرس، وممكن يكون مرتبط بدرس معين أو تدريب عام مستقل." },
      { title: "اعرف اللي خلصته واللي باقي", body: "تقدم الفيديوهات والنتائج بيساعدك تنظم وقتك وتشوف المحاضرات اللي بدأت فيها واللي لسه محتاجة مشاهدة." },
    ],
    questions: [
      { question: "هل المحتوى متقسم حسب الفروع؟", answer: "أيوه، المحتوى الدراسي بيتنظم داخل الصف حسب فروع اللغة العربية ثم الأبواب والدروس والمحاضرات." },
      { question: "هل الواجبات بتظهر لتانية ثانوي فقط؟", answer: "المدرس يقدر يخصص الواجب لصف واحد أو أكتر، والطالب بيشوف الواجبات المنشورة والمخصصة لصفه." },
    ],
  },
  "arabic-third-secondary": {
    eyebrow: "الصف الثالث الثانوي",
    title: "شرح اللغة العربية للصف الثالث الثانوي",
    description: "نظم مذاكرة عربي تالتة ثانوي بين المحاضرات والتدريب والواجبات والاختبارات، وتابع تقدمك الفعلي بدل الاعتماد على المشاهدة من غير قياس.",
    sections: [
      { title: "خطة واضحة للمذاكرة", body: "تقسيم المحتوى لأبواب ودروس يخليك تراجع الجزء المطلوب بسرعة وتكمل من آخر نقطة وصلت لها." },
      { title: "تدريب قريب من طريقة الامتحان", body: "الاختبارات والواجبات بتقيس الفهم، مع إمكانية إظهار النتيجة أو التصحيح حسب إعدادات المدرس لكل تدريب." },
      { title: "تقرير كامل عن مستواك", body: "نتائج المحاولات ونسبة التقدم في الفيديوهات والأجزاء غير المشاهدة بتظهر في تقارير تساعد على اتخاذ قرار المراجعة." },
    ],
    questions: [
      { question: "هل المنصة تحفظ وقت المشاهدة؟", answer: "أيوه، بتسجل المشاهدة الفعلية وتحفظ آخر نقطة وصلت لها علشان تكمل منها بعدين." },
      { question: "هل ولي الأمر يقدر يتابع؟", answer: "حساب ولي الأمر المرتبط بالطالب يقدر يتابع النتائج والمحاولات والتقدم المتاح داخل المنصة." },
    ],
  },
  "nahw-secondary": {
    eyebrow: "فرع النحو",
    title: "شرح النحو للمرحلة الثانوية",
    description: "تعلم نحو الثانوية بطريقة تعتمد على فهم القاعدة، رؤية أمثلة واضحة، ثم التطبيق بالأسئلة والتدريبات بدل الحفظ المؤقت.",
    sections: [
      { title: "افهم وظيفة الكلمة", body: "الفهم يبدأ من معنى الجملة وعلاقة الكلمات ببعضها، وبعدها تحديد الحكم والإعراب بيكون أسهل وأكثر ثباتًا." },
      { title: "طبق على أمثلة متنوعة", body: "تنوع الأمثلة بيمنع حفظ شكل سؤال واحد، ويدربك على اكتشاف القاعدة حتى لو اتغير تركيب الجملة." },
      { title: "راجع أخطاءك", body: "نتائج الواجبات والاختبارات بتوضح الأسئلة اللي أخطأت فيها، فتقدر ترجع للشرح المناسب وتعيد التدريب بوعي." },
    ],
    questions: [
      { question: "إيه أفضل طريقة لمذاكرة النحو؟", answer: "افهم القاعدة في سياق جملة، حل أمثلة متدرجة، وسجل أخطاءك علشان تراجع سبب الخطأ مش الإجابة بس." },
      { question: "هل شرح النحو متاح لكل صفوف الثانوية؟", answer: "تنظيم المنصة بيسمح بعرض فروع ودروس ومحاضرات النحو حسب كل صف والسنة الدراسية المخصصة له." },
    ],
  },
  "balagha-secondary": {
    eyebrow: "فرع البلاغة",
    title: "شرح البلاغة للمرحلة الثانوية",
    description: "افهم بلاغة الثانوية من خلال المعنى والسياق والصورة الفنية، مع تطبيقات وأسئلة تساعدك تفرق بين المصطلحات وتختار الإجابة بدقة.",
    sections: [
      { title: "المعنى قبل المصطلح", body: "فهم المعنى المقصود في النص بيسهل تحديد الصورة والجمال، وبيخلي المصطلح نتيجة للفهم مش معلومة منفصلة للحفظ." },
      { title: "مقارنة بين الأفكار المتشابهة", body: "الأمثلة المقارنة بتوضح الفروق الدقيقة بين الأساليب والصور، وبتقلل الحيرة بين الاختيارات القريبة." },
      { title: "تدريب ومراجعة مستمرة", body: "التدريب المنتظم مع مراجعة سبب الإجابة الصحيحة بيثبت طريقة التفكير المطلوبة في أسئلة البلاغة." },
    ],
    questions: [
      { question: "هل البلاغة محتاجة حفظ؟", answer: "المصطلحات مهمة، لكن الأساس هو فهم المعنى والسياق والتطبيق على أمثلة متنوعة." },
      { question: "فين ألاقي المحتوى المتاح؟", answer: "أنشئ حساب بالصف الصحيح لتظهر لك المواد المخصصة، وراجع صفحة المحتوى المجاني للمحاضرات المتاحة للجميع." },
    ],
  },
};

export function SecondaryArabicLandingPage({ nav, route }: { nav: any; route: SecondaryLandingRoute }) {
  const page = SECONDARY_LANDING_CONTENT[route];
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-b from-primary/15 to-background px-4 py-14 text-center md:py-20">
        <div className="mx-auto max-w-4xl">
          <span className="mb-4 inline-flex rounded-full border border-primary/20 bg-card px-4 py-1.5 text-sm font-bold text-primary">{page.eyebrow}</span>
          <h1 className="mb-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{page.title}</h1>
          <p className="mx-auto max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{page.description}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Btn size="lg" onClick={() => nav("register")}>إنشاء حساب طالب</Btn>
            <Btn size="lg" variant="outline" onClick={() => nav("free-content")}>شاهد المحتوى المجاني</Btn>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {page.sections.map((section, index) => (
            <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 font-black text-primary">{index + 1}</span>
              <h2 className="mb-3 text-xl font-black">{section.title}</h2>
              <p className="text-sm leading-8 text-muted-foreground">{section.body}</p>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="mb-5 text-center text-2xl font-black">أسئلة شائعة</h2>
          <div className="space-y-3">
            {page.questions.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer list-none font-black">{item.question}</summary>
                <p className="mt-3 border-t border-border pt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-primary p-7 text-center text-primary-foreground md:p-10">
          <h2 className="mb-3 text-2xl font-black">ابدأ مع منصة المرضي التعليمية</h2>
          <p className="mx-auto mb-6 max-w-2xl leading-8 opacity-90">اختار صفك وشوف المحتوى المنظم مع الأستاذ محمود عبدالمرضي، وابدأ بالمحاضرات المجانية المتاحة.</p>
          <Btn className="!bg-white !text-primary" onClick={() => nav("free-content")}>تصفح المحاضرات المجانية</Btn>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-7 text-center text-xs text-muted-foreground">
        <PublicLearningLinks nav={nav}/>
        <p className="mt-4">منصة المرضي التعليمية — شرح اللغة العربية للمرحلة الثانوية مع الأستاذ محمود عبدالمرضي.</p>
      </footer>
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
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  useEffect(() => {
    loadFreeLectures()
      .then((response) => setLectures(response.lectures))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "تعذر تحميل المحتوى المجاني"))
      .finally(() => setLoading(false));
  }, []);

  const grades = useMemo(() => Array.from(new Map(lectures.map((lecture) => [lecture.grade.id, lecture.grade])).values()), [lectures]);
  const visibleLectures = useMemo(() => lectures.filter((lecture) => {
    const matchesGrade = gradeFilter === "all" || String(lecture.grade.id) === gradeFilter;
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    const matchesQuery = !normalizedQuery || [lecture.title, lecture.description, lecture.branch.title, lecture.grade.name]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase("ar").includes(normalizedQuery));
    return matchesGrade && matchesQuery;
  }), [gradeFilter, lectures, query]);

  const groups = useMemo(() => {
    const grouped = new Map<number, { title: string; grade: string; lectures: FreeLecture[] }>();
    visibleLectures.forEach((lecture) => {
      const current = grouped.get(lecture.branch.id) ?? {
        title: lecture.branch.title,
        grade: freeLectureGradeName(lecture),
        lectures: [],
      };
      current.lectures.push(lecture);
      grouped.set(lecture.branch.id, current);
    });
    return Array.from(grouped.entries());
  }, [visibleLectures]);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-b from-primary/15 to-background px-4 py-10 md:py-14">
        <div className="mx-auto max-w-7xl text-center">
          <Badge2 variant="primary">ابدأ التعلم مجانًا</Badge2>
          <h1 className="mt-4 text-3xl font-black md:text-4xl">محاضرات لغة عربية مجانية للمرحلة الثانوية</h1>
          <p className="mx-auto mt-3 max-w-2xl leading-8 text-muted-foreground">شرح مجاني في النحو والصرف والبلاغة مع الأستاذ محمود عبدالمرضي، مرتب حسب الصف والفرع علشان توصل للمحاضرة المناسبة بسرعة.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {!loading && !error && lectures.length > 0 && (
          <section aria-label="البحث في المحاضرات المجانية" className="mb-9 grid gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_260px]">
            <label className="relative block">
              <span className="sr-only">ابحث باسم المحاضرة أو الفرع</span>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18}/>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم المحاضرة أو الفرع" className="h-12 w-full rounded-2xl border border-border bg-background pr-12 pl-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"/>
            </label>
            <label>
              <span className="sr-only">اختر الصف الدراسي</span>
              <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)} className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="all">كل الصفوف الثانوية</option>
                {grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
              </select>
            </label>
          </section>
        )}

        {loading && <Card2 className="text-center text-muted-foreground">جارٍ تحميل المحاضرات…</Card2>}
        {!loading && error && <Card2 className="text-center text-red-600">{error}</Card2>}
        {!loading && !error && groups.length === 0 && (
          <Card2 className="text-center">
            <Video className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="mb-1 font-black">لا توجد محاضرات مجانية جاهزة حاليًا</h2>
            <p className="text-sm text-muted-foreground">ستظهر المحاضرات هنا فور نشرها وتجهيز الفيديو للمشاهدة.</p>
          </Card2>
        )}

        {!loading && !error && lectures.length > 0 && groups.length === 0 && (
          <Card2 className="text-center">
            <Search className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="font-black">مفيش محاضرات مطابقة للبحث</h2>
            <button type="button" className="mt-2 text-sm font-bold text-primary hover:underline" onClick={() => { setQuery(""); setGradeFilter("all"); }}>عرض كل المحاضرات</button>
          </Card2>
        )}

        {groups.map(([branchId, group]) => (
            <section key={branchId} className="mb-10" aria-labelledby={`free-branch-${branchId}`}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpen size={21}/></span>
                <div className="flex-1">
                  <h2 id={`free-branch-${branchId}`} className="text-xl font-black">{group.title}</h2>
                  <div className="mt-0.5 text-sm text-muted-foreground">{group.grade}</div>
                </div>
                <Badge2 variant="primary">{group.lectures.length} محاضرات مجانية</Badge2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.lectures.map((lecture) => (
                  <a key={lecture.id} href={role === "student" ? `/video/${lecture.id}` : "/login"} onClick={(event) => { event.preventDefault(); if (role === "student") nav("video", { lessonId: lecture.id }); else nav("login"); }} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-primary">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#123d2e] via-[#245b43] to-primary">
                      {lecture.has_thumbnail ? (
                        <img src={freeLectureThumbnailUrl(lecture.id)} alt={`صورة محاضرة ${lecture.title}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <BookOpen size={46} className="text-white/80"/>
                        </div>
                      )}
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow">مجاني</span>
                      <span className="absolute inset-0 grid place-items-center bg-black/5 transition group-hover:bg-black/15">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary shadow-xl transition group-hover:scale-110"><Play size={22} fill="currentColor"/></span>
                      </span>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white"><Clock size={12}/>{formatLectureDuration(lecture.duration_seconds)}</span>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-primary"><BookOpen size={13}/>{lecture.branch.title}</div>
                      <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7">{lecture.title}</h3>
                      {lecture.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{lecture.description}</p>}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">{freeLectureGradeName(lecture)}</span>
                        <span className="inline-flex items-center gap-1 font-black text-primary">ابدأ المشاهدة <ChevronLeft size={14}/></span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
        ))}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">المحاضرات مجانية ولا تحتاج كودًا، لكن يلزم تسجيل حساب طالب للمشاهدة وحفظ التقدم.</p>
          <Btn onClick={()=>nav(role==="student"?"student-dashboard":"register")}>{role==="student"?"العودة للوحة الطالب":"التسجيل الآن"}</Btn>
        </div>
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 text-lg font-black">ابدأ التعلم مجانًا واحفظ تقدمك</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            المحاضرات المجانية مرتبة حسب الصف والفرع. أنشئ حساب طالب لتكمل المشاهدة من آخر نقطة وصلت إليها وتتابع المحتوى الجديد عند نشره.
          </p>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-7 text-center text-xs text-muted-foreground">
        <PublicLearningLinks nav={nav}/>
        <p className="mt-4">محاضرات مجانية في اللغة العربية للمرحلة الثانوية على منصة المرضي التعليمية.</p>
      </footer>
    </div>
  );
}

// ============================================================
// STUDENT DASHBOARD
