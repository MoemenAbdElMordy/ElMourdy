export const GOVERNORATES = [
  "القاهرة","الجيزة","الإسكندرية","المنوفية","الشرقية",
  "القليوبية","الدقهلية","البحيرة","كفر الشيخ","الغربية",
  "الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان"
];
export const GRADES = [
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي"
];
export const FIRST = ["محمد","أحمد","عمر","علي","إبراهيم","خالد","يوسف","عبدالله","فاطمة","مريم","نور","سارة","هناء","ريم","دينا","منى","عبدالرحمن","حمزة","مصطفى","طارق","كريم","هشام","وليد","سامي"];
export const LAST  = ["محمود","إبراهيم","عبدالله","حسن","علي","أحمد","يوسف","السيد","عبدالعزيز","عبدالرحمن","الشيخ","النجار","البدوي","العربي"];

export function rn(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const STUDENTS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
  email: `student${i + 1}@school.eg`,
  phone: `01${[0,1,2][i%3]}${String(rn(10000000,99999999))}`,
  parentPhone: `01${[0,1,2][(i+1)%3]}${String(rn(10000000,99999999))}`,
  grade: GRADES[i % 3],
  governorate: GOVERNORATES[i % GOVERNORATES.length],
  school: `مدرسة ${GOVERNORATES[i % GOVERNORATES.length]} الثانوية`,
  score: rn(20, 100),
  attempts: rn(1, 3),
  status: (i % 7 === 0 ? "pending" : i % 5 === 0 ? "inactive" : "active") as "active"|"inactive"|"pending",
  lastActive: new Date(Date.now() - (i < 10 ? rn(1,5) : rn(30,65)) * 86400000).toISOString(),
  activationCode: `ALM-${String(1000 + i).padStart(4,"0")}`,
  activated: i % 4 !== 0,
  joinDate: new Date(Date.now() - rn(30,180) * 86400000).toISOString(),
}));

export const SUBJECTS = [
  { id:1, name:"اللغة العربية", icon:"📖", grade:"الصف الثالث الثانوي", description:"دراسة شاملة للقواعد والأدب والنصوص", chaptersCount:6, lessonsCount:24, studentsCount:1240, openLectures:3, price:250 },
  { id:2, name:"النحو والصرف",  icon:"✏️", grade:"الصف الثاني الثانوي", description:"قواعد النحو والصرف والإعراب التفصيلي",   chaptersCount:5, lessonsCount:18, studentsCount:890,  openLectures:2, price:200 },
  { id:3, name:"البلاغة",       icon:"🌟", grade:"الصف الأول الثانوي",  description:"علوم البيان والبديع والمعاني",            chaptersCount:4, lessonsCount:16, studentsCount:670,  openLectures:2, price:180 },
];

export const CHAPTERS = [
  { id:1, subjectId:1, order:1, title:"مقدمة في اللغة العربية وأهميتها", lessonsCount:4, status:"published" },
  { id:2, subjectId:1, order:2, title:"الأسماء وأنواعها",                  lessonsCount:5, status:"published" },
  { id:3, subjectId:1, order:3, title:"الأفعال وأزمنتها",                  lessonsCount:4, status:"published" },
  { id:4, subjectId:1, order:4, title:"الحروف ومعانيها",                   lessonsCount:3, status:"published" },
  { id:5, subjectId:1, order:5, title:"الجملة الاسمية والفعلية",           lessonsCount:4, status:"published" },
  { id:6, subjectId:1, order:6, title:"المراجعة النهائية الشاملة",          lessonsCount:4, status:"draft"    },
];

export const LESSONS = [
  { id:1, chapterId:1, order:1, title:"تعريف اللغة وخصائصها",   duration:"45 دقيقة", isOpen:true,  hasExam:true,  examPassed:true,  locked:false, status:"complete"     },
  { id:2, chapterId:1, order:2, title:"فروع اللغة العربية",      duration:"38 دقيقة", isOpen:false, hasExam:true,  examPassed:true,  locked:false, status:"complete"     },
  { id:3, chapterId:1, order:3, title:"مكانة اللغة العربية",     duration:"42 دقيقة", isOpen:false, hasExam:false, examPassed:false, locked:false, status:"in-progress"  },
  { id:4, chapterId:1, order:4, title:"اللغة في القرآن الكريم",  duration:"50 دقيقة", isOpen:false, hasExam:true,  examPassed:false, locked:true,  status:"locked"       },
  { id:5, chapterId:2, order:1, title:"الاسم المعرفة والنكرة",   duration:"40 دقيقة", isOpen:false, hasExam:true,  examPassed:false, locked:true,  status:"locked"       },
  { id:6, chapterId:2, order:2, title:"الضمائر وأنواعها",        duration:"35 دقيقة", isOpen:false, hasExam:true,  examPassed:false, locked:true,  status:"locked"       },
  { id:7, chapterId:2, order:3, title:"أسماء الإشارة",           duration:"32 دقيقة", isOpen:false, hasExam:false, examPassed:false, locked:true,  status:"locked"       },
  { id:8, chapterId:2, order:4, title:"الأسماء الموصولة",        duration:"38 دقيقة", isOpen:false, hasExam:true,  examPassed:false, locked:true,  status:"locked"       },
  { id:9, chapterId:2, order:5, title:"المصدر والمشتقات",        duration:"44 دقيقة", isOpen:false, hasExam:true,  examPassed:false, locked:true,  status:"locked"       },
];

export const EXAM_QS = [
  { id:1, text:"ما تعريف الاسم في اللغة العربية؟",      choices:["كلمة تدل على معنى مقترن بزمان","كلمة تدل على معنى في نفسها غير مقترن بزمان","كلمة تدل على معنى في غيرها","كلمة تدل على حدث"], correct:1, points:5 },
  { id:2, text:"أيٌّ من الكلمات التالية اسم؟",           choices:["يكتب","في","الطالب","ذهب"],                correct:2, points:5 },
  { id:3, text:"ما علامات الاسم؟",                       choices:["التنوين والإسناد والدخول على حروف الجر","الضمير المستتر والتاء المتحركة","حروف المضارعة والتأنيث","الجزم والنصب والرفع فقط"], correct:0, points:5 },
  { id:4, text:"الضمائر نوع من الاسم...",                choices:["النكرة","المعرفة","المصدر","المشتق"],      correct:1, points:5 },
  { id:5, text:"أيٌّ مما يلي من أسماء الإشارة؟",        choices:["الذي","إنَّ","هذا","كان"],                 correct:2, points:5 },
  { id:6, text:"المصدر هو...",                           choices:["اسم يدل على من وقع عليه الفعل","اسم يدل على الحدث مجردًا من الزمان","اسم يدل على من قام بالفعل","اسم يدل على المبالغة"], correct:1, points:5 },
  { id:7, text:"اسم الفاعل من الفعل (كتب) هو...",       choices:["مكتوب","كاتب","كتابة","مكتبة"],           correct:1, points:5 },
  { id:8, text:"اسم المفعول من الفعل (فتح) هو...",      choices:["فاتح","فتح","مفتوح","فتّاح"],             correct:2, points:5 },
  { id:9, text:"أيٌّ الكلمات تُعرَب بالحروف لا بالحركات؟", choices:["الكتاب","المدرسة","المثنى","الطالب"],  correct:2, points:5 },
  { id:10,text:"المعرَّف بـ(أل) هو...",                 choices:["نكرة","معرفة","مصدر","فعل"],              correct:1, points:5 },
];

export const ANNOUNCEMENTS = [
  { id:1, title:"بدء محاضرات الوحدة الثانية",     body:"يسعدنا الإعلان عن بدء تحميل محاضرات الوحدة الثانية «الأسماء وأنواعها» اعتبارًا من هذا الأسبوع. نتمنى للجميع التوفيق.",                           date:"2025-09-10", grade:"الصف الثالث الثانوي", pinned:true  },
  { id:2, title:"تنبيه بشأن الاختبارات المصاحبة", body:"يُرجى التنبه إلى ضرورة اجتياز الاختبار المصاحب لكل محاضرة قبل الانتقال للمحاضرة التالية. الاختبار إلزامي للتقدم في المنهج.",                  date:"2025-09-08", grade:null,                   pinned:false },
  { id:3, title:"تحديثات على منصة المرضي",         body:"تم إضافة خاصية مراجعة الأخطاء التفصيلية في نتائج الاختبارات. يمكنكم الآن مراجعة إجاباتكم والإجابات الصحيحة بالتفصيل.",                        date:"2025-09-05", grade:null,                   pinned:false },
  { id:4, title:"حصص المراجعة المباشرة",           body:"سيُقام حصص مراجعة مباشرة عبر الإنترنت كل يوم جمعة من الساعة 8 مساءً. الرابط سيُرسل في التطبيق قبل الحصة بساعة.",                              date:"2025-09-01", grade:"الصف الثاني الثانوي", pinned:false },
];

export const ACTIVATION_CODES = Array.from({ length: 20 }, (_, i) => ({
  id: i+1,
  code: `ALM-${String(2000 + i*13).padStart(6,"0")}`,
  packageName: i % 2 === 0 ? "باقة الفصل الدراسي الأول" : "محاضرة مفردة",
  grade: GRADES[i % 3],
  used: i < 12,
  usedBy: i < 12 ? STUDENTS[i].name : null,
  usedDate: i < 12 ? new Date(Date.now() - rn(1,30)*86400000).toISOString() : null,
  disabled: i === 3 || i === 7,
  createdDate: new Date(Date.now() - rn(5,60)*86400000).toISOString(),
}));

export const AUDIT_LOGS = [
  { id:1, user:"مصطفى حسن (مساعد)",         action:"منح محاولة إضافية",          target:"الطالب محمد أحمد",     reason:"عذر مقبول — نقص في الإنترنت",   date:"2025-09-10T14:30:00" },
  { id:2, user:"مصطفى حسن (مساعد)",         action:"إعادة تعيين كلمة المرور",    target:"الطالب خالد إبراهيم",   reason:"نسي كلمة المرور",                date:"2025-09-10T12:15:00" },
  { id:3, user:"محمود عبدالمرضي (أستاذ)",   action:"إنشاء حساب مساعد",           target:"مصطفى حسن",             reason:"",                               date:"2025-09-08T09:00:00" },
  { id:4, user:"مصطفى حسن (مساعد)",         action:"تفعيل كود يدوي",             target:"الطالبة فاطمة محمود",   reason:"طلب تفعيل يدوي",                 date:"2025-09-07T16:45:00" },
  { id:5, user:"مصطفى حسن (مساعد)",         action:"منح محاولة إضافية",          target:"الطالب علي عبدالله",    reason:"مشكلة تقنية في المنصة",          date:"2025-09-06T11:20:00" },
];

// ============================================================
// CONTENT SEED DATA — 4-level hierarchy: مادة > باب > درس > محاضرة
// ============================================================
export const ABWAB = [
  // المادة 1: اللغة العربية (4 أبواب)
  { id:1,  subjectId:1, order:1, title:"مقدمة في علم النحو",          description:"التعريف بعلم النحو وموضوعاته وفروعه الأساسية",           status:"published" },
  { id:2,  subjectId:1, order:2, title:"المعرب والمبني",               description:"دراسة الكلمات المعربة والمبنية وعلامات كل منهما",        status:"published" },
  { id:3,  subjectId:1, order:3, title:"المرفوعات من الأسماء",          description:"المبتدأ والخبر والفاعل ونائب الفاعل وأحكامهم",           status:"published" },
  { id:4,  subjectId:1, order:4, title:"المنصوبات من الأسماء",          description:"المفعول به والمطلق والحال والتمييز التفصيلي",            status:"draft"     },
  // المادة 2: النحو والصرف (3 أبواب)
  { id:5,  subjectId:2, order:1, title:"الميزان الصرفي",               description:"معرفة أوزان الكلمات العربية ومقاييسها الصرفية",          status:"published" },
  { id:6,  subjectId:2, order:2, title:"تصريف الأفعال",                description:"تصريف الأفعال المجردة والمزيدة بأوزانها",                status:"draft"     },
  { id:7,  subjectId:2, order:3, title:"المشتقات وعملها",              description:"اسم الفاعل واسم المفعول والصفة المشبهة وعملها",          status:"published" },
  // المادة 3: البلاغة (3 أبواب)
  { id:8,  subjectId:3, order:1, title:"علم البيان",                   description:"التشبيه والاستعارة والكناية والمجاز المرسل",             status:"published" },
  { id:9,  subjectId:3, order:2, title:"علم البديع",                   description:"المحسنات اللفظية والمعنوية وأثرها في النص",              status:"published" },
  { id:10, subjectId:3, order:3, title:"علم المعاني",                  description:"الخبر والإنشاء والقصر والفصل والوصل",                   status:"draft"     },
];

export const DURUS = [
  // باب 1
  { id:1,  babId:1, order:1, title:"تعريف النحو وفائدته",              description:"مفهوم علم النحو وأهميته ونشأته التاريخية",               status:"published" },
  { id:2,  babId:1, order:2, title:"الكلام وأقسامه الثلاثة",           description:"الاسم والفعل والحرف وعلامات التمييز بينهما",             status:"published" },
  // باب 2
  { id:3,  babId:2, order:1, title:"الإعراب وعلاماته الأصلية",         description:"الرفع والنصب والجر والجزم وعلاماتهم",                    status:"published" },
  { id:4,  babId:2, order:2, title:"البناء وأنواعه",                   description:"المبني على الضم والفتح والكسر والسكون",                  status:"published" },
  // باب 3
  { id:5,  babId:3, order:1, title:"المبتدأ والخبر",                   description:"تعريف المبتدأ والخبر وأنواع الخبر وأحكامهما",             status:"published" },
  { id:6,  babId:3, order:2, title:"الفاعل ونائبه",                    description:"تعريف الفاعل وأحكامه ونائب الفاعل وإعرابه",              status:"published" },
  { id:7,  babId:3, order:3, title:"كان وأخواتها وإن وأخواتها",        description:"عمل كان وأخواتها وعمل إن وأخواتها في الجملة",           status:"draft"     },
  // باب 4
  { id:8,  babId:4, order:1, title:"المفعول به والمطلق",               description:"تعريف المفعول به وأنواعه والمفعول المطلق وصوره",          status:"draft"     },
  { id:9,  babId:4, order:2, title:"الحال والتمييز",                   description:"تعريف الحال والتمييز وشروطهما وإعرابهما",               status:"draft"     },
  // باب 5
  { id:10, babId:5, order:1, title:"الميزان الصرفي للأسماء",           description:"وزن الأسماء المجردة والمزيدة على الميزان الصرفي",        status:"published" },
  { id:11, babId:5, order:2, title:"الميزان الصرفي للأفعال",           description:"وزن الأفعال الثلاثية والرباعية مجردةً ومزيدةً",         status:"published" },
  // باب 6
  { id:12, babId:6, order:1, title:"الفعل الثلاثي المجرد",             description:"أوزان الفعل الثلاثي المجرد وأبنيته الستة",               status:"draft"     },
  { id:13, babId:6, order:2, title:"الفعل المزيد بحرف وحرفين",         description:"أوزان الفعل المزيد بحرف وحرفين ومعانيه",                status:"draft"     },
  // باب 7
  { id:14, babId:7, order:1, title:"اسم الفاعل واسم المفعول",          description:"اشتقاق اسم الفاعل واسم المفعول وعملهما وإعرابهما",       status:"published" },
  { id:15, babId:7, order:2, title:"الصفة المشبهة وصيغة المبالغة",     description:"اشتقاق الصفة المشبهة وصيغ المبالغة وأوزانهما",          status:"published" },
  // باب 8
  { id:16, babId:8, order:1, title:"التشبيه أركانه وأنواعه",           description:"أركان التشبيه وأنواعه التفصيلية وأغراضه",               status:"published" },
  { id:17, babId:8, order:2, title:"الاستعارة والكناية",               description:"أنواع الاستعارة والكناية وأغراضهما البلاغية",            status:"published" },
  // باب 9
  { id:18, babId:9, order:1, title:"الجناس والطباق والمقابلة",         description:"الجناس بأنواعه والطباق والمقابلة وأمثلتها",              status:"published" },
  { id:19, babId:9, order:2, title:"التورية والالتفات",                description:"التورية وأنواعها والالتفات وأغراضه",                    status:"draft"     },
  // باب 10
  { id:20, babId:10, order:1, title:"الخبر والإنشاء",                  description:"الجمل الخبرية والإنشائية الطلبية وغير الطلبية",          status:"draft"     },
  { id:21, babId:10, order:2, title:"القصر والفصل والوصل",             description:"أساليب القصر وطرقه والفصل والوصل ومواضعهما",            status:"hidden"    },
];

export const MAHADARAT = [
  { id:1,  darsId:1,  order:1, title:"مفهوم النحو وأهميته",              duration:"35 دقيقة", isOpen:true,  status:"published", videoStatus:"ready",   hasExam:true  },
  { id:2,  darsId:1,  order:2, title:"نشأة علم النحو وتطوره التاريخي",  duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:3,  darsId:2,  order:1, title:"الاسم وعلاماته التفصيلية",         duration:"45 دقيقة", isOpen:true,  status:"published", videoStatus:"ready",   hasExam:true  },
  { id:4,  darsId:2,  order:2, title:"الفعل وأنواعه الثلاثة",            duration:"42 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:5,  darsId:2,  order:3, title:"الحرف ودلالاته ومعانيه",           duration:"30 دقيقة", isOpen:false, status:"draft",     videoStatus:"pending", hasExam:false },
  { id:6,  darsId:3,  order:1, title:"علامات الرفع الأصلية والفرعية",    duration:"38 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:7,  darsId:3,  order:2, title:"علامات النصب وجمع المذكر السالم",  duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:8,  darsId:3,  order:3, title:"علامات الجر والجزم وموانعها",      duration:"35 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:9,  darsId:4,  order:1, title:"المبني على الضم والفتح",           duration:"33 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:10, darsId:4,  order:2, title:"المبني على الكسر والسكون",          duration:"36 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:11, darsId:5,  order:1, title:"المبتدأ وشروطه وأنواعه",           duration:"44 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:12, darsId:5,  order:2, title:"الخبر المفرد والجملة وشبه الجملة", duration:"48 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:13, darsId:6,  order:1, title:"الفاعل وأحكامه التفصيلية",         duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:14, darsId:6,  order:2, title:"نائب الفاعل وبناء الفعل للمجهول",  duration:"38 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:15, darsId:7,  order:1, title:"المفعول به الصريح وغير الصريح",    duration:"42 دقيقة", isOpen:false, status:"draft",     videoStatus:"pending", hasExam:false },
  { id:16, darsId:7,  order:2, title:"المفعول المطلق توكيدًا ونوعًا",    duration:"35 دقيقة", isOpen:false, status:"draft",     videoStatus:"pending", hasExam:false },
  { id:17, darsId:10, order:1, title:"الميزان الصرفي التطبيقي للأسماء",  duration:"38 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:18, darsId:10, order:2, title:"الأسماء الثلاثية والرباعية على الميزان",duration:"35 دقيقة",isOpen:false,status:"published",videoStatus:"ready",  hasExam:false },
  { id:19, darsId:11, order:1, title:"الفعل الثلاثي على الميزان الصرفي", duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:20, darsId:11, order:2, title:"الفعل الرباعي وميزانه الصرفي",     duration:"36 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:21, darsId:14, order:1, title:"اسم الفاعل للثلاثي وغير الثلاثي", duration:"42 دقيقة", isOpen:true,  status:"published", videoStatus:"ready",   hasExam:true  },
  { id:22, darsId:14, order:2, title:"اسم المفعول وعمله وإعرابه",        duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:23, darsId:15, order:1, title:"الصفة المشبهة وأوزانها",           duration:"35 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:24, darsId:15, order:2, title:"صيغ المبالغة وأوزانها الخمسة",     duration:"38 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:25, darsId:16, order:1, title:"التشبيه التام والمرسل والمؤكد",     duration:"45 دقيقة", isOpen:true,  status:"published", videoStatus:"ready",   hasExam:true  },
  { id:26, darsId:16, order:2, title:"التشبيه التمثيلي والبليغ",          duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:27, darsId:17, order:1, title:"الاستعارة التصريحية والمكنية",      duration:"42 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:28, darsId:17, order:2, title:"الكناية عن صفة وموصوف ونسبة",      duration:"38 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
  { id:29, darsId:18, order:1, title:"الجناس التام والناقص وأنواعه",      duration:"40 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:false },
  { id:30, darsId:18, order:2, title:"الطباق والمقابلة والفرق بينهما",    duration:"36 دقيقة", isOpen:false, status:"published", videoStatus:"ready",   hasExam:true  },
];
