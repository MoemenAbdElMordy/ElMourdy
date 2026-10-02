// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../../shared/auth/session";

const auth = vi.hoisted(() => ({ restore: vi.fn(), logout: vi.fn() }));
vi.mock("../../shared/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/auth/session")>()),
  restoreSession: auth.restore,
  logout: auth.logout,
}));
vi.mock("../../shared/learning/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/learning/api")>()),
  loadAnnouncements: vi.fn().mockResolvedValue({ announcements: [] }),
}));

import App from "./PlatformApp";

const account = (role: AuthUser["role"], extra: Partial<AuthUser> = {}): AuthUser => ({
  id: 1, name: "حساب اختبار", phone: "01099990001", role,
  verified: true, profile_complete: true, permissions: [], ...extra,
});

beforeEach(() => {
  auth.restore.mockReset();
  auth.logout.mockReset();
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  window.scrollTo = vi.fn();
});
afterEach(cleanup);

describe("connected role journeys", () => {
  it("blocks a student from the teacher dashboard", async () => {
    auth.restore.mockResolvedValue(account("student"));
    window.history.replaceState({}, "", "/admin-dashboard");
    render(<App/>);
    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent("وصول غير مصرح به");
  });

  it("blocks an assistant without the content permission", async () => {
    auth.restore.mockResolvedValue(account("assistant"));
    window.history.replaceState({}, "", "/content-subjects");
    render(<App/>);
    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent("وصول غير مصرح به");
    expect(screen.queryByRole("link", { name: "المحتوى" })).not.toBeInTheDocument();
  });

  it("blocks a parent from student homework", async () => {
    auth.restore.mockResolvedValue(account("parent"));
    window.history.replaceState({}, "", "/homeworks");
    render(<App/>);
    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent("وصول غير مصرح به");
  });

  it("forces an unverified student through the verification gate", async () => {
    auth.restore.mockResolvedValue(account("student", { verified: false }));
    window.history.replaceState({}, "", "/student-dashboard");
    render(<App/>);
    await waitFor(() => expect(screen.getByText("تفعيل الحساب مطلوب")).toBeInTheDocument());
    expect(screen.queryByRole("link", { name: "واجباتي" })).not.toBeInTheDocument();
  });
});
