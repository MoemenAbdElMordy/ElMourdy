// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { clearPendingPasswordReset, loadPendingPasswordReset, storePendingPasswordReset } from "./password-reset";

afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

it("discards a corrupted pending reset instead of crashing the recovery page", () => {
  sessionStorage.setItem("elmourdy-pending-password-reset", "{invalid-json");
  expect(loadPendingPasswordReset()).toBeNull();
  expect(sessionStorage.getItem("elmourdy-pending-password-reset")).toBeNull();
});

it("discards an incomplete pending reset", () => {
  sessionStorage.setItem("elmourdy-pending-password-reset", JSON.stringify({ passwordResetId: 1 }));
  expect(loadPendingPasswordReset()).toBeNull();
});

it("keeps the reset flow usable when private browsing blocks storage writes", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  expect(() => storePendingPasswordReset({ passwordResetId: 1, clientToken: "token", expiresAt: new Date().toISOString(), resendAfterSeconds: 60, verificationMethod: "email_code" })).not.toThrow();
});

it("does not crash when browser storage cannot be read or cleared", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
  expect(loadPendingPasswordReset()).toBeNull();
  expect(() => clearPendingPasswordReset()).not.toThrow();
});
