// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resetMocks = vi.hoisted(() => ({
  clear: vi.fn(),
  complete: vi.fn(),
  loadPending: vi.fn(),
  loadStatus: vi.fn(),
  request: vi.fn(),
  store: vi.fn(),
}));

vi.mock("../../shared/auth/password-reset", () => ({
  clearPendingPasswordReset: resetMocks.clear,
  completePasswordReset: resetMocks.complete,
  loadPasswordResetStatus: resetMocks.loadStatus,
  loadPendingPasswordReset: resetMocks.loadPending,
  requestPasswordReset: resetMocks.request,
  storePendingPasswordReset: resetMocks.store,
}));

import { ForgotPage, LoginPage } from "./pages";

const pendingReset = {
  passwordResetId: 12,
  expiresAt: "2026-08-11T15:00:00Z",
  resendAfterSeconds: 60,
  verificationMethod: "whatsapp_inbound" as const,
  whatsappUrl: "https://wa.me/201069229786?text=RESET%20ABCDEF1234567890",
  clientToken: "client-token",
};

beforeEach(() => {
  resetMocks.loadPending.mockReturnValue(null);
  resetMocks.loadStatus.mockResolvedValue({ status: "pending", expires_at: pendingReset.expiresAt });
  resetMocks.request.mockResolvedValue(pendingReset);
  resetMocks.complete.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("password recovery page", () => {
  it("starts WhatsApp verification using the account phone", async () => {
    render(<ForgotPage nav={vi.fn()}/>);

    fireEvent.change(screen.getByLabelText("رقم الهاتف"), { target: { value: "01000000001" } });
    fireEvent.click(screen.getByRole("button", { name: "متابعة عبر واتساب" }));

    await waitFor(() => expect(resetMocks.request).toHaveBeenCalledWith("01000000001"));
    expect(resetMocks.store).toHaveBeenCalledWith(pendingReset);
    expect(await screen.findByRole("link", { name: "فتح واتساب وإرسال الرسالة" })).toHaveAttribute("href", pendingReset.whatsappUrl);
  });

  it("sets a new password after the phone is verified", async () => {
    resetMocks.loadPending.mockReturnValue(pendingReset);
    resetMocks.loadStatus.mockResolvedValue({ status: "verified", expires_at: pendingReset.expiresAt });
    render(<ForgotPage nav={vi.fn()}/>);

    expect(await screen.findByText("تم التحقق من الرقم")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("كلمة المرور الجديدة"), { target: { value: "NewPassword123!" } });
    fireEvent.change(screen.getByLabelText("تأكيد كلمة المرور"), { target: { value: "NewPassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ كلمة المرور الجديدة" }));

    await waitFor(() => expect(resetMocks.complete).toHaveBeenCalledWith(
      pendingReset,
      "NewPassword123!",
      "NewPassword123!",
    ));
    expect(await screen.findByText("تم تغيير كلمة المرور")).toBeInTheDocument();
  });
});

describe("login page", () => {
  it("submits valid credentials when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue({ role: "assistant" });
    const nav = vi.fn();
    render(<LoginPage nav={nav} setRole={vi.fn()} onLogin={onLogin}/>);

    await user.type(screen.getByLabelText("رقم الهاتف"), "01012349876");
    await user.type(screen.getByLabelText("كلمة المرور"), "AssistantPassword{Enter}");

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith("01012349876", "AssistantPassword"));
    expect(nav).toHaveBeenCalledWith("admin-dashboard", {}, "assistant");
  });
});
