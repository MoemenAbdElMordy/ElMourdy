// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastContainer } from "../../shared/ui";
import { OTPPage, ParentRegisterPage, RegisterPage } from "./pages";

const registerStudent = vi.fn();
const registerParent = vi.fn();
const loadPendingRegistration = vi.fn();
const verifyRegistration = vi.fn();

vi.mock("../../shared/auth/registration", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/auth/registration")>()),
  registerStudent: (...args: unknown[]) => registerStudent(...args),
  registerParent: (...args: unknown[]) => registerParent(...args),
  loadPendingRegistration: (...args: unknown[]) => loadPendingRegistration(...args),
  verifyRegistration: (...args: unknown[]) => verifyRegistration(...args),
  storePendingRegistration: vi.fn(),
  clearPendingRegistration: vi.fn(),
}));

vi.mock("../../shared/public/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/public/api")>()),
  loadGrades: vi.fn().mockResolvedValue({
    grades: [{ id: 1, level: 1, name: "First Secondary" }],
  }),
}));

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("student registration", () => {
  afterEach(cleanup);
  beforeEach(() => {
    registerStudent.mockReset();
  });

  it("submits valid data once and opens email verification", async () => {
    let resolveRegistration!: (value: Record<string, unknown>) => void;
    registerStudent.mockReturnValue(new Promise((resolve) => { resolveRegistration = resolve; }));
    const nav = vi.fn();

    render(<><RegisterPage nav={nav}/><ToastContainer/></>);
    fill("الاسم الكامل", "طالب اختبار");
    fireEvent.input(screen.getByLabelText("تاريخ الميلاد"), { target: { value: "2009-01-01" } });
    fill("هاتف الطالب", "01099990001");
    fill("هاتف ولي الأمر", "01199990002");
    fill("البريد الإلكتروني (فريد)", "student@example.test");
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => expect(screen.getByLabelText("الصف الدراسي")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("الصف الدراسي"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("المحافظة"), { target: { value: "الجيزة" } });
    fill("اسم المدرسة", "مدرسة اختبار");
    fill("اسم السنتر", "سنتر اختبار");
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    fill("كلمة المرور", "StrongPassword123!");
    fill("تأكيد كلمة المرور", "StrongPassword123!");
    const submit = screen.getByRole("button", { name: "إنشاء الحساب" });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(registerStudent).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("انتظر لحظات، يتم إنشاء الحساب وإرسال كود التفعيل…")).toBeVisible();

    resolveRegistration({ registrationId: 1, verificationId: 2 });
    await waitFor(() => expect(nav).toHaveBeenCalledWith("otp", {
      phone: "01099990001",
      verificationRole: "student",
    }));
  });

  it("normalizes both student and parent phones before registration", async () => {
    registerStudent.mockResolvedValue({ registrationId: 1, verificationId: 2 });
    render(<><RegisterPage nav={vi.fn()}/><ToastContainer/></>);
    fill("الاسم الكامل", "طالب اختبار");
    fireEvent.input(screen.getByLabelText("تاريخ الميلاد"), { target: { value: "2009-01-01" } });
    fill("هاتف الطالب", "٠١٠٩٩٩٩٠٠٠١");
    fill("هاتف ولي الأمر", "۰۱۱۹۹۹۹۰۰۰۲");
    expect(screen.getByLabelText("هاتف الطالب")).toHaveValue("01099990001");
    expect(screen.getByLabelText("هاتف ولي الأمر")).toHaveValue("01199990002");
    fill("البريد الإلكتروني (فريد)", "student@example.test");
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    await waitFor(() => expect(screen.getByLabelText("الصف الدراسي")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("الصف الدراسي"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("المحافظة"), { target: { value: "الجيزة" } });
    fill("اسم المدرسة", "مدرسة اختبار");
    fill("اسم السنتر", "سنتر اختبار");
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    fill("كلمة المرور", "StrongPassword123!");
    fill("تأكيد كلمة المرور", "StrongPassword123!");
    fireEvent.click(screen.getByRole("button", { name: "إنشاء الحساب" }));
    await waitFor(() => expect(registerStudent).toHaveBeenCalledWith(expect.objectContaining({
      phone: "01099990001", parentPhone: "01199990002",
    })));
  });
});

describe("parent registration and email verification", () => {
  afterEach(cleanup);
  beforeEach(() => {
    registerParent.mockReset();
    loadPendingRegistration.mockReset();
    verifyRegistration.mockReset();
  });

  it("registers a parent using an Arabic-digit phone", async () => {
    registerParent.mockResolvedValue({ registrationId: 3, verificationId: 4 });
    const nav = vi.fn();
    render(<ParentRegisterPage nav={nav}/>);
    fill("الاسم الكامل", "ولي أمر اختبار");
    fill("رقم الهاتف", "٠١١٩٩٩٩٠٠٠٢");
    fill("البريد الإلكتروني", "parent@example.test");
    fill("كلمة المرور", "StrongPassword123!");
    fill("تأكيد كلمة المرور", "StrongPassword123!");
    fireEvent.click(screen.getByRole("button", { name: "متابعة التحقق" }));
    await waitFor(() => expect(registerParent).toHaveBeenCalledWith(expect.objectContaining({ phone: "01199990002" })));
    expect(nav).toHaveBeenCalledWith("otp", { phone: "01199990002", verificationRole: "parent" });
  });

  it("verifies a student email code entered with Arabic digits", async () => {
    const registration = { registrationId: 3, verificationId: 4, emailHint: "s***@example.test", resendAfterSeconds: 0 };
    const student = { id: 8, role: "student", verified: true };
    loadPendingRegistration.mockReturnValue(registration);
    verifyRegistration.mockResolvedValue(student);
    const nav = vi.fn();
    const setRole = vi.fn();
    const setAuthUser = vi.fn();
    render(<OTPPage nav={nav} params={{}} setRole={setRole} setAuthUser={setAuthUser}/>);
    fill("كود التحقق", "١٢۳٤٥٦");
    expect(screen.getByLabelText("كود التحقق")).toHaveValue("123456");
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الكود" }));
    await waitFor(() => expect(verifyRegistration).toHaveBeenCalledWith(registration, "123456"));
    expect(setAuthUser).toHaveBeenCalledWith(student);
    expect(nav).toHaveBeenCalledWith("student-dashboard", {}, "student");
  });
});
