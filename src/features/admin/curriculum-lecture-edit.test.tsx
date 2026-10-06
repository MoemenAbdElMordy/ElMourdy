// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadAcademicYears: vi.fn(),
  loadGrades: vi.fn(),
  loadCurriculum: vi.fn(),
  loadCurriculumLocations: vi.fn(),
  loadLectureViewers: vi.fn(),
  updateContent: vi.fn(),
  deleteContent: vi.fn(),
  createCurriculumFolder: vi.fn(),
}));

vi.mock("../../shared/admin/day5", () => ({
  loadAcademicYears: mocks.loadAcademicYears,
  loadGrades: mocks.loadGrades,
}));
vi.mock("../../shared/curriculum/api", () => ({
  loadCurriculum: mocks.loadCurriculum,
  loadCurriculumLocations: mocks.loadCurriculumLocations,
  loadLectureViewers: mocks.loadLectureViewers,
  updateContent: mocks.updateContent,
  deleteContent: mocks.deleteContent,
  createCurriculumFolder: mocks.createCurriculumFolder,
}));
vi.mock("./video-storage-panel", () => ({ VideoStoragePanel: () => null }));

import { CurriculumManagePage } from "./curriculum-page";

beforeEach(() => {
  mocks.loadAcademicYears.mockResolvedValue({ academic_years: [{ id: 1, name: "٢٠٢٦/٢٠٢٧", status: "active" }] });
  mocks.loadGrades.mockResolvedValue({ grades: [{ id: 2, name: "الثاني", level: 2 }] });
  mocks.loadCurriculumLocations.mockResolvedValue({ locations: [] });
  mocks.loadLectureViewers.mockResolvedValue({ viewers: [{ student_id: 4, name: "طالب تجريبي", watched_seconds: 240, last_position_seconds: 180, progress_percent: 40, status: "partial" }], pagination: { total_pages: 1 } });
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
  mocks.deleteContent.mockResolvedValue(undefined);
  mocks.createCurriculumFolder.mockResolvedValue({ node: { id: 34, kind: "folder", title: "مجلد تجريبي", children: [] } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("تعديل محاضرة منشورة داخل المجلدات", () => {
  it("يعرض المحتوى ومتابعة المشاهدة للمساعد دون أزرار التعديل", async () => {
    render(<CurriculumManagePage params={{}} authUser={{ role: "assistant", permissions: ["manage_content"] }} />);
    fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
    expect(screen.getByText("المحاضرة المنشورة")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "تعديل المحاضرة" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "إضافة مجلد" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "متابعة مشاهدة الطلاب في المحاضرة المنشورة" }));
    expect(await screen.findByText("طالب تجريبي")).toBeInTheDocument();
  });
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
  it("ينشئ مجلدًا واحدًا فقط داخل المادة المختارة", async () => {
    render(<CurriculumManagePage params={{}} />);
    fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
    fireEvent.click(screen.getByRole("button", { name: "إضافة مجلد" }));
    fireEvent.change(screen.getByRole("textbox", { name: "اسم المجلد" }), { target: { value: "مجلد تجريبي" } });
    fireEvent.click(screen.getByRole("button", { name: "إنشاء المجلد" }));
    await waitFor(() => expect(mocks.createCurriculumFolder).toHaveBeenCalledTimes(1));
    expect(mocks.createCurriculumFolder).toHaveBeenCalledWith(9, null, "مجلد تجريبي");
  });
  it("يحفظ موعد نشر المحاضرة المنشورة من نافذة التعديل", async () => {
    render(<CurriculumManagePage params={{}} />);
    fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
    fireEvent.click(screen.getByRole("button", { name: "تعديل المحاضرة" }));
    fireEvent.change(screen.getByLabelText("موعد النشر (اختياري)"), { target: { value: "2099-10-01T10:30" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ التعديلات" }));
    await waitFor(() => expect(mocks.updateContent).toHaveBeenCalledWith(
      "lectures", 33, expect.objectContaining({ publish_at: new Date("2099-10-01T10:30").toISOString(), status: "published" }),
    ));
  });
  it("يحذف المحاضرة المحددة فقط بعد تأكيد المستخدم", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    try {
      render(<CurriculumManagePage params={{}} />);
      fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
      fireEvent.click(screen.getByRole("button", { name: /^حذف$/ }));
      await waitFor(() => expect(mocks.deleteContent).toHaveBeenCalledWith("lectures", 33));
      expect(confirm).toHaveBeenCalledTimes(1);
    } finally {
      confirm.mockRestore();
    }
  });
  it("لا يحذف المحاضرة عند إلغاء التأكيد", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    try {
      render(<CurriculumManagePage params={{}} />);
      fireEvent.click(await screen.findByRole("button", { name: /النحو.*منشور/ }));
      fireEvent.click(screen.getByRole("button", { name: /^حذف$/ }));
      expect(mocks.deleteContent).not.toHaveBeenCalled();
    } finally {
      confirm.mockRestore();
    }
  });
});
