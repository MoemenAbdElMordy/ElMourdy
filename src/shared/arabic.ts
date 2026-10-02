/** Display formatting only. Never apply to submitted identifiers or API payloads. */
export const arabicNumber = (value: string | number) => String(value).replace(/[0-9]/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]).replace(/%/g, '٪');
const words: Record<string, string> = {
  'First Secondary': 'الصف الأول الثانوي', 'Second Secondary': 'الصف الثاني الثانوي', 'Third Secondary': 'الصف الثالث الثانوي',
  draft:'مسودة', published:'منشور', hidden:'مخفي', archived:'مؤرشف', active:'نشط', inactive:'غير نشط', pending:'قيد الانتظار',
  approved:'مقبول', rejected:'مرفوض', passed:'ناجح', failed:'لم يكتمل بنجاح', risk:'يحتاج متابعة', submitted:'تم التسليم', in_progress:'جارٍ الحل',
  ready:'جاهز', processing:'قيد المعالجة', queued:'في الانتظار', uploaded:'تم الرفع', uploading:'جارٍ الرفع', completed:'مكتمل',
  teacher:'مدرس', assistant:'مساعد', student:'طالب', parent:'ولي أمر', youtube:'يوتيوب', Cloudflare:'كلاودفلير', YouTube:'يوتيوب',
  PDF:'بي دي إف', Word:'وورد', CSV:'جدول بيانات', MP4:'فيديو', HLS:'بث الفيديو', MB:'ميجابايت', GB:'جيجابايت', KB:'كيلوبايت',
};
export function arabicLabel(value: string | number): string {
  const text = String(value);
  // Preserve addresses and redeemable codes exactly so they remain usable.
  if (/\S+@\S+|https?:\/\//.test(text) || (/^[A-Za-z0-9_-]{6,}$/.test(text) && /[A-Za-z]/.test(text) && /[0-9]/.test(text))) return text;
  if (words[text]) return arabicNumber(words[text]);
  return arabicNumber(Object.entries(words).reduce((result,[key,label]) => result.replace(new RegExp(`\\b${key}\\b`, 'g'), label),text));
}
