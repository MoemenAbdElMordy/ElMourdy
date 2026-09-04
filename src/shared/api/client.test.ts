// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, clearSessionToken, getSessionToken, setSessionToken } from "./client";

describe("session token storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("keeps a session after the browser session storage is cleared", () => {
    setSessionToken("persistent-token");
    sessionStorage.clear();

    expect(getSessionToken()).toBe("persistent-token");
  });

  it("migrates tokens saved by the previous session-storage implementation", () => {
    sessionStorage.setItem("elmourdy-session-token", "legacy-token");

    expect(getSessionToken()).toBe("legacy-token");
    expect(localStorage.getItem("elmourdy-session-token")).toBe("legacy-token");
    expect(sessionStorage.getItem("elmourdy-session-token")).toBeNull();
  });

  it("clears both current and legacy token storage", () => {
    localStorage.setItem("elmourdy-session-token", "current");
    sessionStorage.setItem("elmourdy-session-token", "legacy");

    clearSessionToken();

    expect(getSessionToken()).toBeNull();
  });
});

describe("API error messages", () => {
  it("guides a student to login when a registration already exists", () => {
    const error = new ApiError("Phone e164 has already been taken", 422, "unprocessable_entity");

    expect(error.message).toBe("تم إنشاء حساب بهذه البيانات بالفعل. سجّل الدخول لإكمال تفعيل الحساب");
  });
});
