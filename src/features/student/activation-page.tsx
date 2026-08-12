import { useState } from "react";
import { CheckCircle, Key } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { redeemCode, type AccessGrant } from "../../shared/activation-codes/api";
import { Btn, Card2, Input2, notify } from "../../shared/ui";

export function ConnectedActivationPage({nav}:any){
  const [code,setCode]=useState("");const [grant,setGrant]=useState<AccessGrant|null>(null);const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const localizedError=(message:string)=>{const normalized=message.toLowerCase();return normalized.includes("expired")?"انتهت صلاحية هذا الكود":normalized.includes("grade")?"هذا الكود غير مخصص لصفك الدراسي":normalized.includes("already has access")?"لديك صلاحية الوصول لهذا الدرس بالفعل":normalized.includes("not redeemable")?"هذا الكود مستخدم أو معطل":normalized.includes("invalid")?"كود التفعيل غير صحيح":"تعذر تفعيل الكود";};
  const redeem=async()=>{setLoading(true);setError("");try{const response=await redeemCode(code);setGrant(response.access_grant);notify("تم تفعيل الدرس بنجاح","success");}catch(reason){setError(reason instanceof ApiError?(localizedError(reason.rawMessage)==="تعذر تفعيل الكود"&&reason.status===422?"هذا الكود مستخدم أو معطل أو غير صالح":localizedError(reason.rawMessage)):"تعذر تفعيل الكود");}finally{setLoading(false);}};
  return <div className="min-h-screen bg-background flex items-center justify-center p-4"><Card2 className="w-full max-w-sm text-center">{grant?<><CheckCircle size={48} className="text-primary mx-auto mb-3"/><h1 className="text-xl font-black">تم التفعيل بنجاح</h1><p className="text-sm text-muted-foreground my-3">تم فتح درس: {grant.lesson}</p><Btn className="w-full" onClick={()=>nav("subjects")}>عرض المنهج</Btn></>:<><Key size={42} className="text-primary mx-auto mb-3"/><h1 className="text-xl font-black mb-1">تفعيل درس</h1><p className="text-sm text-muted-foreground mb-4">أدخل الكود الذي حصلت عليه</p><form className="space-y-3 text-right" onSubmit={(event)=>{event.preventDefault();void redeem();}}><Input2 label="كود التفعيل" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ELM-XXXX-XXXX" dir="ltr"/>{error&&<p className="text-sm text-red-600">{error}</p>}<Btn type="submit" className="w-full" disabled={!code.trim()||loading}>{loading?"جارٍ التحقق…":"تفعيل"}</Btn></form></>}</Card2></div>;
}
