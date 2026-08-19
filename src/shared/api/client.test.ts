// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { clearSessionToken, getSessionToken, setSessionToken } from "./client";

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
