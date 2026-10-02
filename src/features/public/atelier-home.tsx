import { useEffect, useState } from 'react';
import { arabicLabel } from '../../shared/arabic';
import { ArrowUpLeft, ArrowLeft, BookOpen, Play, MoveUpLeft, Check, Sparkles } from 'lucide-react';
import type { Navigate } from '../../app/routing/types';
import { loadFreeLectures, freeLectureThumbnailUrl, type FreeLecture } from '../../shared/public/api';

const grades = [
  { number: '٠١', title: 'الأول الثانوي', caption: 'أساس قوي. بداية مختلفة.', route: 'arabic-first-secondary' },
  { number: '٠٢', title: 'الثاني الثانوي', caption: 'فهم أعمق. ثقة أكبر.', route: 'arabic-second-secondary' },
  { number: '٠٣', title: 'الثالث الثانوي', caption: 'خطوة بخطوة نحو هدفك.', route: 'arabic-third-secondary' },
] as const;

export function AtelierHome({ nav }: { nav: Navigate }) {
  const [lectures, setLectures] = useState<FreeLecture[]>([]);
  const [state, setState] = useState<'loading'|'ready'|'error'>('loading');
  useEffect(() => { loadFreeLectures().then(r => { setLectures(r.lectures); setState('ready'); }).catch(() => setState('error')); }, []);
  return <div className="atelier-home">
    <section className="atelier-hero">
      <div className="atelier-hero-copy">
        <div className="atelier-eyebrow"><span/> منصة الأستاذ محمود عبدالمرضي <i>للمرحلة الثانوية</i></div>
        <h1>للعربية جمال.<br/>وللتفوّق <em>حكاية.</em></h1>
        <p className="atelier-intro">نفهم القاعدة، نتذوّق المعنى، ونطبّق بثقة.<br/>رحلتك في اللغة العربية تبدأ هنا، مع الأستاذ محمود عبدالمرضي.</p>
        <div className="atelier-actions"><a href="/register" onClick={e=>{e.preventDefault();nav('register');}} className="atelier-primary">ابدأ حكايتك <ArrowUpLeft size={21}/></a><a href="/free-content" onClick={e=>{e.preventDefault();nav('free-content');}} className="atelier-watch"><span><Play size={15}/></span> جرّب محاضرة مجانية</a></div>
        <div className="atelier-hero-note"><span>فهمٌ يبقى معك</span><div/><small>شرح واضح · تدريب عملي · متابعة مستمرة</small></div>
      </div>
      <div className="atelier-portrait">
        <div className="atelier-portrait-frame"><img src="/images/teacher-hero-mobile.webp" alt="الأستاذ محمود عبدالمرضي مدرس اللغة العربية للمرحلة الثانوية" width="1080" height="1350" loading="eager"/><span className="atelier-calligraphy" aria-hidden="true">ض</span><div className="atelier-portrait-caption"><small>خادم لغة أهل الجنة</small><strong>محمود عبدالمرضي</strong><span>اللغة العربية، كما تستحق أن تُفهم.</span></div></div>
        <div className="atelier-seal"><BookOpen size={22}/><span>علمٌ يُفهم<br/>وأثرٌ يبقى</span></div>
        <span className="atelier-side-note">رحلة تعلّم، بطابع عربي أصيل</span>
      </div>
    </section>
    <div className="atelier-ribbon"><span>لغة نفهمها. <b>وثقة نبنيها.</b></span><i/><span>النحو والصرف</span><span className="atelier-star">✳</span><span>البلاغة والأدب</span><span className="atelier-star">✳</span><span>قراءة وتعبير</span><BookOpen size={22}/></div>
    <section className="atelier-section atelier-grades"><div className="atelier-section-title"><div><span className="atelier-kicker">٠١ / اختر خطوتك</span><h2>لكل مرحلة،<br/><em>طريقها للتفوّق.</em></h2></div><p>محتوى مرتب على مقاس صفّك.<br/>من أول قاعدة، لآخر مراجعة.</p></div><div className="atelier-grade-grid">{grades.map(g=><a key={g.route} href={'/'+g.route} onClick={e=>{e.preventDefault();nav(g.route);}} className="atelier-grade"><span className="atelier-grade-top">المرحلة الثانوية <ArrowUpLeft size={21}/></span><span className="atelier-grade-number">{g.number}</span><h3>الصف {g.title}</h3><p>{g.caption}</p><div className="atelier-grade-bottom"><span>اكتشف مسارك</span><ArrowLeft size={19}/></div></a>)}</div></section>
    <section className="atelier-method"><div className="atelier-method-heading"><span className="atelier-kicker">٠٢ / طريقة تفرق</span><h2>مش مجرد درس.<br/>دي رحلة <em>فهم.</em></h2><p>كل جزء في المنصة بيكمّل اللي قبله.<br/>عشان المعرفة تتحول لمهارة تقدر تعتمد عليها.</p><a href="/about" onClick={e=>{e.preventDefault();nav('about');}}>اعرف أكثر عن المنصة <ArrowUpLeft size={19}/></a></div><div className="atelier-method-steps">{[{n:'١',t:'اسمع وافهم',d:'محاضرات منظمة، وأمثلة تقرّب لك الفكرة. ارجع لأي جزء وقت ما تحتاج.',icon:Play},{n:'٢',t:'جرّب وطبّق',d:'واجبات واختبارات تساعدك تعرف مستواك، وتحول الشرح لفهم حقيقي.',icon:BookOpen},{n:'٣',t:'شوف تقدّمك',d:'تابع مشاهداتك ونتائجك من مكان واحد، وخلي خطوتك الجاية واضحة.',icon:Check}].map(s=><article key={s.n}><span className="atelier-step-number">{s.n}</span><div><h3>{s.t}</h3><p>{s.d}</p></div><s.icon size={22}/></article>)}</div></section>
    <section className="atelier-section"><div className="atelier-section-title"><div><span className="atelier-kicker">٠٣ / البداية علينا</span><h2>شاهد. افهم. <em>ثم قرّر.</em></h2></div><a className="atelier-text-link" href="/free-content" onClick={e=>{e.preventDefault();nav('free-content');}}>كل المحاضرات المجانية <ArrowUpLeft size={19}/></a></div><div className="atelier-lecture-grid">{lectures.slice(0,3).map(l=><a href="/free-content" className="atelier-lecture" key={l.id} onClick={e=>{e.preventDefault();nav('free-content');}}><div className="atelier-lecture-image">{l.has_thumbnail?<img src={freeLectureThumbnailUrl(l.id)} alt={arabicLabel(l.title)} loading="lazy"/>:<span className="atelier-lecture-letter" aria-hidden="true">ض</span>}<span className="atelier-free">محاضرة مجانية</span><span className="atelier-play"><Play size={22}/></span></div><div className="atelier-lecture-copy"><small>{arabicLabel(l.branch.title)}</small><h3>{arabicLabel(l.title)}</h3><span>شاهد المحاضرة <ArrowLeft size={17}/></span></div></a>)}{state==='loading'&&<p role="status">جارٍ تحميل المحاضرات…</p>}{state==='error'&&<p role="alert">تعذر تحميل المحاضرات حاليًا. يمكنك المحاولة من صفحة المحتوى المجاني.</p>}{state==='ready'&&!lectures.length&&<p>المحاضرات المجانية الجديدة هتظهر هنا فور نشرها.</p>}</div></section>
    <section className="atelier-invitation"><Sparkles size={29}/><span className="atelier-kicker">صفحة جديدة في حكايتك</span><h2>مستقبلك يستحق<br/>بداية <em>تليق بيك.</em></h2><a href="/register" className="atelier-primary" onClick={e=>{e.preventDefault();nav('register');}}>أنشئ حسابك الآن <MoveUpLeft size={20}/></a><p>عندك حساب بالفعل؟ <a href="/login" onClick={e=>{e.preventDefault();nav('login');}}>سجّل دخولك</a></p></section>
    <footer className="atelier-footer"><div><img src="/images/mourdy-logo-160.webp" alt="شعار منصة المرضي" width="52" height="52"/><strong>المرضي<span>العربية، بفهم مختلف.</span></strong></div><nav aria-label="روابط دليل اللغة العربية"><a href="/arabic-secondary">المرحلة الثانوية</a><a href="/nahw-secondary">النحو</a><a href="/balagha-secondary">البلاغة</a><a href="/free-content">المحتوى المجاني</a><a href="/about">عن المنصة</a></nav><small>© {new Date().toLocaleDateString('ar-EG',{year:'numeric'})} منصة الأستاذ محمود عبدالمرضي</small></footer>
  </div>;
}
