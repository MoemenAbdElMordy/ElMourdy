// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../shared/auth/session";

const verification = vi.hoisted(() => ({ request: vi.fn(), verify: vi.fn(), changeEmail: vi.fn() }));
vi.mock("../../shared/auth/account-verification", () => ({
  requestAccountVerification: verification.request,
  verifyAccount: verification.verify,
  changeAccountEmail: verification.changeEmail,
}));

import { AccountVerificationGate } from "./account-verification-gate";

const user: AuthUser = {
  id: 7, name: "طالب اختبار", phone: "01099990001", role: "student",
  verified: false, profile_complete: true, permissions: [],
};

beforeEach(() => {
  verification.request.mockReset().mockResolvedValue({ verificationId: 5, emailHint: "s***@example.test", resendAfterSeconds: 0 });
  verification.verify.mockReset().mockResolvedValue({ user: { ...user, verified: true } });
  verification.changeEmail.mockReset();
});
afterEach(cleanup);

describe("account verification gate", () => {
  it("blocks content, sends a code and accepts Arabic digits", async () => {
    const onVerified = vi.fn();
    render(<AccountVerificationGate user={user} onVerified={onVerified} onLogout={vi.fn()}/>);
    expect(screen.getByText("تفعيل الحساب مطلوب")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "إرسال رسالة التفعيل" }));
    fireEvent.change(await screen.findByLabelText("كود التفعيل"), { target: { value: "١٢۳٤٥٦" } });
    expect(screen.getByLabelText("كود التفعيل")).toHaveValue("123456");
    fireEvent.click(screen.getByRole("button", { name: "تفعيل الحساب" }));
    await waitFor(() => expect(verification.verify).toHaveBeenCalledWith(5, "123456"));
    expect(onVerified).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it("lets the user correct an email address before verification", async () => {
    verification.changeEmail.mockResolvedValue({ verificationId: 6, emailHint: "n***@example.test", resendAfterSeconds: 0 });
    render(<AccountVerificationGate user={user} onVerified={vi.fn()} onLogout={vi.fn()}/>);
    fireEvent.click(screen.getByRole("button", { name: "إرسال رسالة التفعيل" }));
    fireEvent.click(await screen.findByRole("button", { name: "البريد غير صحيح؟ تغيير البريد الإلكتروني" }));
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني الصحيح"), { target: { value: "new@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ وإرسال كود جديد" }));
    await waitFor(() => expect(verification.changeEmail).toHaveBeenCalledWith("new@example.test"));
  });
});
