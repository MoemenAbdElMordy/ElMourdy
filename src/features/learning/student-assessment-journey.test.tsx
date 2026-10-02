// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const assessment = vi.hoisted(() => ({ load: vi.fn(), start: vi.fn(), submit: vi.fn(), answer: vi.fn() }));
vi.mock("../../shared/learning/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/learning/api")>()),
  loadExam: assessment.load,
  startExam: assessment.start,
  submitExam: assessment.submit,
  answerExamQuestion: assessment.answer,
}));
import { ConnectedStudentExamPage } from "./connected-pages";

beforeEach(() => {
  assessment.load.mockReset();
  assessment.start.mockReset();
  assessment.submit.mockReset();
  assessment.answer.mockReset();
});
afterEach(cleanup);

describe("student assessment journeys", () => {
  it.each(["homework", "exam"] as const)("starts, answers and submits a %s", async (kind) => {
    const exam = {
      id: 17, title: kind === "homework" ? "واجب اختبار" : "اختبار تجريبي",
      assessment_type: kind, duration_minutes: 30, max_attempts: 2, pass_percent: 60,
      correct_after_each_answer: false,
    };
    const attempt = {
      id: 41, exam_title: exam.title, attempt_number: 1,
      questions: [{ id: 7, body: "السؤال الأول", choices: [{ id: 8, body: "الإجابة الأولى" }, { id: 9, body: "الإجابة الثانية" }] }],
    };
    assessment.load.mockResolvedValue({ exam });
    assessment.start.mockResolvedValue({ attempt });
    assessment.submit.mockResolvedValue({ attempt: { ...attempt, status: "submitted" } });
    const nav = vi.fn();
    render(<ConnectedStudentExamPage nav={nav} params={{ examId: 17 }}/>);
    fireEvent.click(await screen.findByRole("button", { name: kind === "homework" ? "ابدأ الواجب" : "ابدأ الاختبار" }));
    await waitFor(() => expect(assessment.start).toHaveBeenCalledWith(17));
    fireEvent.click(await screen.findByRole("radio", { name: "الإجابة الثانية" }));
    fireEvent.click(screen.getByRole("button", { name: kind === "homework" ? "تسليم الواجب" : "تسليم الاختبار" }));
    await waitFor(() => expect(assessment.submit).toHaveBeenCalledWith(41, [{ question_id: 7, choice_id: 9 }]));
    expect(nav).toHaveBeenCalledWith("exam-result", { attemptId: 41 });
  });
});
