// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadAcademicYears: vi.fn(),
  loadGrades: vi.fn(),
  loadCurriculum: vi.fn(),
  loadCurriculumLocations: vi.fn(),
  updateContent: vi.fn(),
}));

vi.mock("../../shared/admin/day5", () => ({
  loadAcademicYears: mocks.loadAcademicYears,
  loadGrades: mocks.loadGrades,
}));
vi.mock("../../shared/curriculum/api", () => ({
  loadCurriculum: mocks.loadCurriculum,
  loadCurriculumLocations: mocks.loadCurriculumLocations,
  updateContent: mocks.updateContent,
}));
vi.mock("./video-storage-panel", () => ({ VideoStoragePanel: () => null }));

import { CurriculumManagePage } from "./curriculum-page";

beforeEach(() => {
  mocks.loadAcademicYears.mockResolvedValue({ academic_years: [{ id: 1, name: "٢٠٢٦/٢٠٢٧", status: "active" }] });
  mocks.loadGrades.mockResolvedValue({ grades: [{ id: 2, name: "الثاني", level: 2 }] });
  mocks.loadCurriculumLocations.mockResolvedValue({ locations: [] });
  mocks.loadCurriculum.mockResolvedValue({ curriculum: {
    academic_year: { id: 1, name: "٢٠٢٦/٢٠٢٧" },
    grade: { id: 2, name: "الثاني", level: 2 },
    branches: [{
      id: 9, title: "النحو", status: "published", position: 1, chapters: [],
      nodes: [{
        id: 20, branch_id: 9, parent_id: null, kind: "lecture", position: 1,
        title: "المحاضرة المنشورة", lecture_id: 33, children: [],
        lecture: { id: 33, title: "المحاضرة المنشورة", status: "published", position: 1, is_free: false, additional_lesson_ids: [] },
      }],
    }],
  } });
  mocks.updateContent.mockResolvedValue({ lecture: { id: 33, title: "المحاضرة المنشورة", is_free: true } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("تعديل محاضرة منشورة داخل المجلدات", () => {
  it("يفتح التعديل دون درس قديم ويحفظ تحويل المحاضرة إلى مجانية", async () => {
    render(<CurriculumManagePage params={{}} />);
    fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
    fireEvent.click(screen.getByRole("button", { name: "تعديل المحاضرة" }));

    expect(screen.getByRole("dialog", { name: "تعديل محاضرة" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "محاضرة مجانية" }));
    fireEvent.click(screen.getByRole("button", { name: "حفظ التعديلات" }));

    await waitFor(() => expect(mocks.updateContent).toHaveBeenCalledWith(
      "lectures", 33, expect.objectContaining({ title: "المحاضرة المنشورة", is_free: true }),
    ));
  });
});
