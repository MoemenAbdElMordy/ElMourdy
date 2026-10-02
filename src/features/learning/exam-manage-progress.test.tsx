// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ exams: vi.fn(), attempts: vi.fn(), progress: vi.fn(), choices: vi.fn(), curriculum: vi.fn() }));
vi.mock("../../shared/learning/api", () => ({
  loadExams: mocks.exams,
  loadExamAttempts: mocks.attempts,
  loadExamProgress: mocks.progress,
}));
vi.mock("../../shared/admin/academic-choices", () => ({ loadAcademicChoices: mocks.choices }));
vi.mock("../../shared/curriculum/api", () => ({ loadCurriculum: mocks.curriculum }));

import { ConnectedExamManagePage } from "./connected-pages";

const pagination = { current_page: 1, total_pages: 1, total_count: 1, per_page: 20, next_page: null, previous_page: null };

beforeEach(() => {
  mocks.exams.mockResolvedValue({ exams: [{ id: 19, title: "واجب تجريبي", assessment_type: "homework", status: "published", duration_minutes: 30, questions_count: 2, attempts_count: 1 }], pagination });
  mocks.choices.mockResolvedValue({ academic_years: [{ id: 1, name: "٢٠٢٦/٢٠٢٧", status: "active" }], grades: [{ id: 2, name: "الصف الثاني الثانوي", level: 2 }] });
  mocks.curriculum.mockResolvedValue({ curriculum: { academic_year: { id: 1 }, grade: { id: 2 }, branches: [] } });
  mocks.progress.mockResolvedValue({ students: [
    { student_id: 1, name: "طالب لم يبدأ", status: "not_started", attempts_count: 0, best_percent: null, latest_percent: null },
    { student_id: 2, name: "طالب سلّم", status: "submitted", attempts_count: 1, best_percent: 80, latest_percent: 80 },
  ], pagination });
  mocks.attempts.mockResolvedValue({ attempts: [{ id: 4, student_name: "طالب سلّم", attempt_number: 1, status: "submitted", percent: 80, result_status: "passed" }], pagination });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("teacher assessment follow-up", () => {
  it("shows targeted students who never started as well as submitted attempts", async () => {
    render(<ConnectedExamManagePage assessmentType="homework" />);
    fireEvent.click(await screen.findByRole("button", { name: "متابعة الطلاب" }));
    expect(await screen.findByText("طالب لم يبدأ")).toBeInTheDocument();
    expect(screen.getAllByText("طالب سلّم", { selector: "strong" })).toHaveLength(2);
    expect(mocks.progress).toHaveBeenCalledWith(19, 1);
    expect(mocks.attempts).toHaveBeenCalledWith(19, 1);
    await waitFor(() => expect(screen.getByText("النتيجة: ٨٠٪")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(screen.queryByRole("dialog", { name: /متابعة واجب تجريبي/ })).not.toBeInTheDocument();
  });
});
