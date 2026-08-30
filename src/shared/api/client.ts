export const API_BASE_URL = import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "https://api.mourdy.com/api" : "http://localhost:3000/api");
const TOKEN_KEY = "elmourdy-session-token";

const errorMessagesByCode: Record<string, string> = {
  unauthorized: "يجب تسجيل الدخول أولًا",
  forbidden: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
  not_found: "العنصر المطلوب غير موجود",
  bad_request: "البيانات المرسلة غير صحيحة",
  unprocessable_entity: "تعذر معالجة البيانات المدخلة",
  business_rule_violation: "لا يمكن تنفيذ هذا الإجراء حاليًا",
  dependency_conflict: "احذف المحتوى المرتبط أولًا قبل حذف هذا العنصر",
  invalid_credentials: "رقم الهاتف أو كلمة المرور غير صحيحة",
  invalid_password: "كلمة المرور الحالية غير صحيحة",
  invalid_parent_phone: "يجب أن يختلف رقم ولي الأمر عن رقم الطالب",
  student_profile_incomplete: "اكتب اسم السنتر أولًا للمتابعة",
  current_device: "لا يمكن إزالة الجهاز المستخدم حاليًا",
  video_not_ready: "الفيديو غير جاهز للمشاهدة حتى الآن",
};

function localizeApiError(message: string, status: number, code?: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("three active devices")) return "وصل الحساب إلى الحد الأقصى وهو ثلاثة أجهزة نشطة";
  if (normalized.includes("phone number or password")) return "رقم الهاتف أو كلمة المرور غير صحيحة";
  if (normalized.includes("already been taken")) return "هذه البيانات مستخدمة في حساب آخر";
  if (normalized.includes("too many verification codes")) return "تم إرسال عدد كبير من أكواد التفعيل؛ انتظر ساعة ثم حاول مرة أخرى";
  if (normalized.includes("wait before requesting another code")) return "انتظر دقيقة قبل طلب كود تفعيل جديد";
  if (normalized.includes("no active account uses this email address")) return "لا يوجد حساب نشط مسجل بهذا البريد الإلكتروني";
  if (normalized.includes("verification email could not be delivered")) return "تعذر إرسال رسالة التحقق إلى البريد الإلكتروني؛ حاول مرة أخرى بعد قليل";
  if (normalized.includes("verification code is invalid")) return "كود التحقق غير صحيح";
  if (normalized.includes("password") && normalized.includes("incorrect")) return "كلمة المرور غير صحيحة";
  if (normalized.includes("expired")) return "انتهت صلاحية الطلب، حاول مرة أخرى";
  if (normalized.includes("not found")) return "العنصر المطلوب غير موجود";
  if (normalized.includes("permission")) return "ليس لديك صلاحية لتنفيذ هذا الإجراء";
  if (normalized.includes("no multiple-choice questions")) return "لم يتم التعرف على أسئلة اختيار من متعدد داخل الملف؛ راجع تنسيق الأسئلة والاختيارات";
  if (normalized.includes("readable docx")) return "ملف Word غير صالح أو تالف؛ احفظه بصيغة DOCX ثم حاول مرة أخرى";
  if (normalized.includes("only docx and pdf")) return "يجب اختيار ملف Word بصيغة DOCX أو ملف PDF";
  if (normalized.includes("only docx")) return "يجب اختيار ملف Word بصيغة DOCX";
  if (normalized.includes("requires ocr")) return "ملف PDF عبارة عن صور ولا يحتوي نصًا قابلًا للقراءة؛ استخدم ملفًا نصيًا أو طبّق OCR أولًا";
  if (normalized.includes("readable pdf")) return "ملف PDF غير صالح أو مشفر أو تالف";

  if (code && errorMessagesByCode[code]) return errorMessagesByCode[code];

  if (status === 401) return "تعذر التحقق من بيانات الدخول";
  if (status === 403) return "ليس لديك صلاحية لتنفيذ هذا الإجراء";
  if (status === 404) return "العنصر المطلوب غير موجود";
  if (status === 409) return "يتعارض هذا الإجراء مع بيانات موجودة حاليًا";
  if (status === 422) return "راجع البيانات المدخلة وحاول مرة أخرى";
  if (status >= 500) return "حدث خطأ في الخادم، حاول مرة أخرى بعد قليل";
  return "تعذر إكمال الطلب، حاول مرة أخرى";
}

export class ApiError extends Error {
  public readonly rawMessage: string;

  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(localizeApiError(message, status, code));
    this.rawMessage = message;
  }
}

export function getSessionToken() {
  const persistentToken = localStorage.getItem(TOKEN_KEY);
  if (persistentToken) return persistentToken;

  const legacyToken = sessionStorage.getItem(TOKEN_KEY);
  if (legacyToken) {
    localStorage.setItem(TOKEN_KEY, legacyToken);
    sessionStorage.removeItem(TOKEN_KEY);
  }
  return legacyToken;
}

export function setSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSessionToken();
      window.dispatchEvent(new Event("elmourdy:session-expired"));
    }
    throw new ApiError(
      body.error?.details?.[0] ?? body.error?.message ?? "The server could not complete the request",
      response.status,
      body.error?.code,
    );
  }

  return body as T;
}

export async function apiRequestBlob(path: string) {
  const token = getSessionToken();
  const headers = new Headers({ Accept: "image/*" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) throw new ApiError("The requested image could not be loaded", response.status);
  return response.blob();
}

export async function downloadApiFile(path:string,filename:string){
  const token=getSessionToken();
  const response=await fetch(`${API_BASE_URL}${path}`,{headers:{Accept:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",...(token?{Authorization:`Bearer ${token}`}:{})}});
  if(!response.ok)throw new ApiError("The report could not be exported",response.status);
  const url=URL.createObjectURL(await response.blob());
  const link=document.createElement("a");link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1_000);
}
