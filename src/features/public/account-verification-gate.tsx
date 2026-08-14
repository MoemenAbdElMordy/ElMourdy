import { useEffect, useState } from "react";
import { LogOut, Mail, RefreshCw, Shield } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { requestAccountVerification, verifyAccount, type AccountVerification } from "../../shared/auth/account-verification";
import type { AuthUser } from "../../shared/auth/session";
import { Btn, Card2, Input2, notify } from "../../shared/ui";

export function AccountVerificationGate({
  user,
  onVerified,
  onLogout,
}: {
  user: AuthUser;
  onVerified: (user: AuthUser) => void;
  onLogout: () => Promise<void>;
}) {
  const [verification, setVerification] = useState<AccountVerification | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  const sendCode = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestAccountVerification();
      setVerification(result);
      setRemaining(result.resendAfterSeconds);
      notify("تم إرسال كود التفعيل إلى بريدك الإلكتروني", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر إرسال كود التفعيل.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!verification || code.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const response = await verifyAccount(verification.verificationId, code);
      onVerified(response.user);
      notify("تم تفعيل حسابك بنجاح", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "كود التفعيل غير صحيح.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Shield className="text-primary" size={30}/></div>
        <h1 className="text-2xl font-black mb-2">تفعيل الحساب مطلوب</h1>
        <p className="text-sm text-muted-foreground mb-6">مرحبًا {user.name}. لن تتمكن من استخدام محتوى المنصة قبل تفعيل بريدك الإلكتروني.</p>
        <Card2>
          {!verification ? (
            <Btn className="w-full" onClick={sendCode} disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <Mail size={16}/>} إرسال رسالة التفعيل
            </Btn>
          ) : (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
              <p className="text-sm text-muted-foreground">تم إرسال الكود إلى <strong dir="ltr">{verification.emailHint}</strong></p>
              <Input2 label="كود التفعيل" inputMode="numeric" dir="ltr" maxLength={6} value={code} onChange={(event:any) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}/>
              <Btn type="submit" className="w-full" disabled={loading || code.length !== 6}>{loading ? "جارٍ التفعيل…" : "تفعيل الحساب"}</Btn>
              <button type="button" className="text-sm text-primary disabled:opacity-50" disabled={loading || remaining > 0} onClick={sendCode}>
                {remaining > 0 ? `إعادة الإرسال خلال ${remaining} ثانية` : "إرسال كود جديد"}
              </button>
            </form>
          )}
          {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => void onLogout()}><LogOut size={15}/> تسجيل الخروج</button>
        </Card2>
      </div>
    </div>
  );
}
