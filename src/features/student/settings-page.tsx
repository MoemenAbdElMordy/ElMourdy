import { useEffect, useState } from "react";
import { CalendarDays, Clock, Laptop, Monitor, Shield, Smartphone, UserCheck, Wifi } from "lucide-react";
import { ApiError } from "../../shared/api/client";
import { loadDevices, removeDevice as removeRegisteredDevice, requestDeviceRemoval, type StudentDevice } from "../../shared/auth/devices";
import { changePassword, loadProfile, updateProfile } from "../../shared/auth/profile";
import type { AuthUser } from "../../shared/auth/session";
import { Badge2, Btn, Card2, Field, Input2, Modal2, cn, notify } from "../../shared/ui";

export function StudentSettingsPage({
  authUser,
  setAuthUser,
}: {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
}) {
  const [tab, setTab] = useState<"profile" | "security" | "devices">("devices");
  const [profileForm, setProfileForm] = useState({
    name: authUser?.name ?? "",
    birthDate: "",
    parentPhone: "",
    governorate: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [devices, setDevices] = useState<StudentDevice[]>([]);
  const [deviceLimit, setDeviceLimit] = useState(3);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [submittingDevice, setSubmittingDevice] = useState(false);
  const [requestDevice, setRequestDevice] = useState<StudentDevice | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile().then((response) => {
      setProfileForm({
        name: response.user.name,
        birthDate: response.profile.birth_date ?? "",
        parentPhone: response.profile.parent_phone ?? "",
        governorate: response.profile.governorate ?? "",
      });
    }).catch(() => notify("تعذر تحميل بيانات الحساب", "error"));
  }, []);

  useEffect(() => {
    loadDevices().then((response) => {
      setDevices(response.devices);
      setDeviceLimit(response.limit);
    }).catch((error) => {
      notify(error instanceof ApiError ? error.message : "تعذر تحميل الأجهزة المسجلة", "error");
    }).finally(() => setLoadingDevices(false));
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await updateProfile({
        name: profileForm.name,
        governorate: profileForm.governorate,
      });
      setAuthUser(response.user);
      notify("تم حفظ البيانات", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر حفظ البيانات", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.current,
        password: passwords.next,
        passwordConfirmation: passwords.confirm,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      notify("تم تغيير كلمة المرور وإنهاء الجلسات الأخرى", "success");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر تغيير كلمة المرور", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "البيانات الشخصية", icon: UserCheck },
    { id: "security", label: "كلمة المرور", icon: Shield },
    { id: "devices", label: "الأجهزة والجلسات", icon: Monitor },
  ] as const;
  const deviceKind = (device: StudentDevice) => /android|ios|iphone/i.test(`${device.os} ${device.name}`) ? "phone" : /windows|mac|linux/i.test(`${device.os} ${device.name}`) ? "laptop" : "tablet";
  const DeviceIcon = ({ device }: { device: StudentDevice }) => deviceKind(device) === "phone" ? <Smartphone size={20}/> : deviceKind(device) === "laptop" ? <Laptop size={20}/> : <Monitor size={20}/>;

  const removeDevice = (device: StudentDevice) => {
    if (device.current) {
      notify("لا يمكن إزالة الجهاز المستخدم حاليًا", "error");
      return;
    }
    setRequestDevice(device);
  };

  const submitDeviceAction = async () => {
    if (!requestDevice) return;
    setSubmittingDevice(true);
    try {
      if (requestDevice.can_self_remove) {
        await removeRegisteredDevice(requestDevice.id);
        setDevices((current) => current.filter((device) => device.id !== requestDevice.id));
        notify("تمت إزالة الجهاز وإنهاء جلساته", "success");
      } else {
        await requestDeviceRemoval(requestDevice.id, requestReason);
        setDevices((current) => current.map((device) => device.id === requestDevice.id ? { ...device, pending_removal_request: true } : device));
        notify("تم إرسال طلب إزالة الجهاز للمساعد", "success");
      }
      setRequestDevice(null);
      setRequestReason("");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "تعذر تنفيذ طلب إزالة الجهاز", "error");
    } finally {
      setSubmittingDevice(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black">إعدادات الحساب</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة بياناتك وكلمة المرور والأجهزة المسجلة</p>
        </div>
        <div className="grid lg:grid-cols-[240px_1fr] gap-5">
          <Card2 className="h-fit !p-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setTab(item.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-right", tab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground")}><Icon size={16}/>{item.label}</button>;
            })}
          </Card2>
          <div>
            {tab === "profile" && <Card2><form onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}>
              <h2 className="font-bold mb-5">البيانات الشخصية والدراسية</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input2 label="الاسم الكامل" value={profileForm.name} onChange={(event) => setProfileForm((value) => ({ ...value, name: event.target.value }))}/>
                <Input2 label="رقم الهاتف" value={authUser?.phone ?? ""} dir="ltr" disabled/>
                <Input2 label="تاريخ الميلاد" type="date" value={profileForm.birthDate} disabled/>
                <Input2 label="رقم ولي الأمر" value={profileForm.parentPhone} dir="ltr" disabled/>
                <Input2 label="المحافظة" value={profileForm.governorate} onChange={(event) => setProfileForm((value) => ({ ...value, governorate: event.target.value }))}/>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted text-xs text-muted-foreground">لتغيير رقم الهاتف أو رقم ولي الأمر تواصل مع خدمة العملاء.</div>
              <Btn type="submit" className="mt-5" disabled={savingProfile}>حفظ التعديلات</Btn>
            </form></Card2>}
            {tab === "security" && <Card2><form onSubmit={(event) => { event.preventDefault(); void savePassword(); }}>
              <h2 className="font-bold mb-1">تغيير كلمة المرور</h2>
              <p className="text-sm text-muted-foreground mb-5">سيتم إنهاء كل الجلسات الأخرى بعد تغيير كلمة المرور.</p>
              <div className="space-y-4 max-w-lg">
                <Input2 label="كلمة المرور الحالية" type="password" value={passwords.current} onChange={(event) => setPasswords((value) => ({ ...value, current: event.target.value }))}/>
                <Input2 label="كلمة المرور الجديدة" type="password" value={passwords.next} onChange={(event) => setPasswords((value) => ({ ...value, next: event.target.value }))}/>
                <Input2 label="تأكيد كلمة المرور" type="password" value={passwords.confirm} onChange={(event) => setPasswords((value) => ({ ...value, confirm: event.target.value }))}/>
                <Btn type="submit" disabled={savingPassword || !passwords.current || passwords.next.length < 8 || passwords.next !== passwords.confirm}>تحديث كلمة المرور</Btn>
              </div>
            </form></Card2>}
            {tab === "devices" && <div className="space-y-4">
              <Card2>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div><h2 className="font-bold">الأجهزة المسجلة</h2><p className="text-sm text-muted-foreground mt-1">يمكنك استخدام 3 أجهزة بحد أقصى، وحسابك يعمل على جهاز واحد في نفس الوقت.</p></div>
                  <Badge2 variant={devices.length >= deviceLimit ? "warning" : "success"}>{devices.length} من {deviceLimit} أجهزة</Badge2>
                </div>
              </Card2>
              {loadingDevices && <Card2><p className="text-sm text-muted-foreground">جارٍ تحميل الأجهزة…</p></Card2>}
              {!loadingDevices && devices.length === 0 && <Card2><p className="text-sm text-muted-foreground">لا توجد أجهزة مسجلة.</p></Card2>}
              {devices.map((device) => <Card2 key={device.id}>
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", device.current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><DeviceIcon device={device}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{device.name}</h3>{device.current && <Badge2 variant="success">الجهاز الحالي</Badge2>}{device.pending_removal_request && <Badge2 variant="warning">طلب الإزالة قيد المراجعة</Badge2>}</div>
                    <div className="grid sm:grid-cols-2 gap-x-5 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Monitor size={12}/>{device.os || "نظام غير معروف"} • {device.browser || "متصفح غير معروف"}</span>
                      <span className="flex items-center gap-1"><Wifi size={12}/>{device.ip_address || "عنوان غير متاح"}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/>آخر نشاط {new Date(device.last_seen_at).toLocaleString("ar-EG")}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={12}/>أضيف {new Date(device.created_at).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                  {!device.current && <Btn size="sm" variant="ghost" disabled={device.pending_removal_request} onClick={() => removeDevice(device)}>{device.pending_removal_request ? "قيد المراجعة" : "إزالة"}</Btn>}
                </div>
              </Card2>)}
              <Card2 className="border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3"><Shield size={18} className="text-primary mt-0.5"/><div><h3 className="font-bold text-sm">سياسة إزالة الأجهزة</h3><p className="text-xs text-muted-foreground mt-1 leading-relaxed">يمكن إزالة جهاز ذاتيًا مرة كل 7 أيام. إذا كنت تحتاج إزالته قبل الموعد، أرسل طلبًا للمساعد من نافذة الإزالة.</p></div></div>
              </Card2>
            </div>}
          </div>
        </div>
      </div>
      <Modal2 open={Boolean(requestDevice)} onClose={() => { setRequestDevice(null); setRequestReason(""); }} title="إزالة الجهاز">
        {requestDevice && <div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted"><div className="font-bold text-sm">{requestDevice.name}</div><div className="text-xs text-muted-foreground mt-1">آخر نشاط: {new Date(requestDevice.last_seen_at).toLocaleString("ar-EG")}</div></div>
          {requestDevice.can_self_remove
            ? <div className="p-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 text-sm text-red-800 dark:text-red-300">ستتم إزالة الجهاز وإنهاء أي جلسة مفتوحة عليه.</div>
            : <><div className="p-3 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-300">لم يمر 7 أيام على آخر إزالة ذاتية. سيتم إرسال طلب للمساعد.</div><Field label="سبب الطلب (اختياري)"><textarea rows={3} value={requestReason} onChange={(event) => setRequestReason(event.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" placeholder="مثال: الجهاز ضاع أو تم بيعه"/></Field></>}
          <div className="flex gap-2"><Btn variant="outline" className="flex-1" disabled={submittingDevice} onClick={() => setRequestDevice(null)}>إلغاء</Btn><Btn className="flex-1" disabled={submittingDevice} onClick={submitDeviceAction}>{requestDevice.can_self_remove ? "إزالة الجهاز" : "إرسال الطلب"}</Btn></div>
        </div>}
      </Modal2>
    </div>
  );
}
