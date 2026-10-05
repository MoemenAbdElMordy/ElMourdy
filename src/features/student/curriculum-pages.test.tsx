// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { loadCurriculum, type Curriculum, type Lecture } from "../../shared/curriculum/api";
import { StudentCurriculumPage } from "./curriculum-pages";

vi.mock("../../shared/curriculum/api", async importOriginal => ({ ...await importOriginal<typeof import("../../shared/curriculum/api")>(), loadCurriculum: vi.fn() }));
vi.mock("../../shared/media/lecture-thumbnail", () => ({ useLectureThumbnailUrl: () => null }));
afterEach(cleanup);

const lecture = (grade: number): Lecture => ({
  id: grade * 10, title: `محاضرة الصف ${grade}`, position: 1, status: "published", is_free: true,
  has_access: true, video_source_type: grade === 2 ? "uploaded" : "youtube",
  ...(grade === 2 ? { video_asset: { id: grade, processing_status: "ready" as const } } : { youtube_video_id: "DkJYaDCf48s" }),
});
const curriculum = (grade: number): Curriculum => {
  const item = lecture(grade);
  return {
    academic_year: { id: 1, name: "2026/2027" }, grade: { id: grade, name: `الصف ${grade}`, level: grade },
    branches: [{ id: grade, title: "النحو", position: 1, status: "published", chapters: [], nodes: [{
      id: grade * 100, branch_id: grade, kind: "folder", title: "الباب الأول", position: 1, children: [{
        id: grade * 100 + 1, branch_id: grade, parent_id: grade * 100, kind: "lecture", title: item.title,
        position: 1, lecture_id: item.id, lecture: item, children: [],
      }],
    }] }],
  };
};

it.each([1, 2, 3])("lets a grade %i student reach and open a video stored in a folder", async grade => {
  vi.mocked(loadCurriculum).mockResolvedValue({ curriculum: curriculum(grade) });
  const nav = vi.fn();
  const { rerender } = render(<StudentCurriculumPage nav={nav} params={{ subjectId: grade }} />);
  fireEvent.click(await screen.findByRole("button", { name: /الباب الأول/ }));
  expect(nav).toHaveBeenCalledWith("lessons", { subjectId: grade, chapterId: grade * 100 });
  rerender(<StudentCurriculumPage nav={nav} params={{ subjectId: grade, chapterId: grade * 100 }} />);
  fireEvent.click(await screen.findByRole("button", { name: new RegExp(`محاضرة الصف ${grade}`) }));
  expect(nav).toHaveBeenCalledWith("video", { lessonId: grade * 10 });
});
