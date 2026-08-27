import { useState } from "react";
import { Building2, LogOut } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { updateProfile } from "../../shared/auth/profile";
import type { AuthUser } from "../../shared/auth/session";
import { Btn, Card2, Input2, notify } from "../../shared/ui";

export function StudentProfileCompletionGate({
  user,
  onCompleted,
  onLogout,
}: {
  user: AuthUser;
  onCompleted: (user: AuthUser) => void;
  onLogout: () => Promise<void>;
}) {
  const [centerName, setCenterName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!centerName.trim()) {
      setError("اكتب اسم السنتر للمتابعة");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await updateProfile({ center_name: centerName.trim() });
      onCompleted(response.user);
      notify("تم حفظ اسم السنتر", "success");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "تعذر حفظ اسم السنتر.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="text-primary" size={30} />
        </div>
        <h1 className="mb-2 text-2xl font-black">استكمال بيانات الحساب</h1>
        <p className="mb-6 text-sm text-muted-foreground">مرحبًا {user.name}. اكتب اسم السنتر حتى تتمكن من متابعة استخدام المنصة.</p>
        <Card2>
          <form className="space-y-4 text-right" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            <Input2 label="اسم السنتر" placeholder="اكتب اسم السنتر" value={centerName} onChange={(event: any) => setCenterName(event.target.value)} error={error} autoFocus />
            <Btn type="submit" className="w-full" disabled={loading || !centerName.trim()}>{loading ? "جارٍ الحفظ..." : "حفظ ومتابعة"}</Btn>
          </form>
          <button className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => void onLogout()}><LogOut size={15}/> تسجيل الخروج</button>
        </Card2>
      </div>
    </div>
  );
}
