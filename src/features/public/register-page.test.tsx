// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastContainer } from "../../shared/ui";
import { RegisterPage } from "./pages";

const registerStudent = vi.fn();

vi.mock("../../shared/auth/registration", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/auth/registration")>()),
  registerStudent: (...args: unknown[]) => registerStudent(...args),
  storePendingRegistration: vi.fn(),
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
});
