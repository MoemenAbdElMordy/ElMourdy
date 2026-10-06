// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({ loadStudents: vi.fn(), loadGrades: vi.fn() }));

vi.mock("../../shared/admin/day5", () => ({
  exportStudents: vi.fn(),
  loadGrades: adminMocks.loadGrades,
  loadStudents: adminMocks.loadStudents,
}));

import { Day5StudentsListPage } from "./day5-pages";

const pagination = { current_page: 1, per_page: 20, total_count: 1, total_pages: 1, next_page: null, previous_page: null };

beforeEach(() => {
  adminMocks.loadGrades.mockResolvedValue({ grades: [] });
  adminMocks.loadStudents.mockImplementation(({ query }: { query?: string }) => Promise.resolve({
    students: query === "student@example.com" ? [{ id: 9, name: "طالب البريد", phone: "+201000000009", email: "student@example.com", status: "active", created_at: "2026-09-01" }] : [],
    pagination,
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("student list search", () => {
  it("searches by email and displays the matching student", async () => {
    render(<Day5StudentsListPage nav={vi.fn()}/>);
    fireEvent.change(screen.getByLabelText("بحث"), { target: { value: "student@example.com" } });

    await waitFor(() => expect(adminMocks.loadStudents).toHaveBeenCalledWith(expect.objectContaining({ query: "student@example.com" })), { timeout: 1500 });
    expect(await screen.findByText("طالب البريد")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("الاسم أو الهاتف أو البريد الإلكتروني أو السنتر")).toBeInTheDocument();
  });

  it("does not replace a newer status result with an older response", async () => {
    let finishOld!: (value: unknown) => void;
    adminMocks.loadStudents.mockImplementation(({ status }: { status?: string }) =>
      status === "active"
        ? new Promise((resolve) => { finishOld = resolve; })
        : Promise.resolve({ students: [{ id: 10, name: "طالب مؤرشف", phone: "+201000000010", status: "archived", created_at: "2026-09-01" }], pagination })
    );
    render(<Day5StudentsListPage nav={vi.fn()}/>);
    fireEvent.change(screen.getByLabelText("الحالة"), { target: { value: "active" } });
    await waitFor(() => expect(adminMocks.loadStudents).toHaveBeenCalledWith(expect.objectContaining({ status: "active" })), { timeout: 1500 });
    fireEvent.change(screen.getByLabelText("الحالة"), { target: { value: "archived" } });
    expect(await screen.findByText("طالب مؤرشف")).toBeInTheDocument();
    finishOld({ students: [{ id: 11, name: "نتيجة قديمة", phone: "+201000000011", status: "active", created_at: "2026-09-01" }], pagination });
    await waitFor(() => expect(screen.queryByText("نتيجة قديمة")).not.toBeInTheDocument());
    expect(screen.getByText("طالب مؤرشف")).toBeInTheDocument();
  });
});
