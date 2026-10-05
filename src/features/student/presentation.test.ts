import { describe, expect, it } from "vitest";
import type { Branch, Lecture } from "../../shared/curriculum/api";
import { findStudentFolder, findStudentFolderParent, studentPresentationItems, studentVideoBranch } from "./presentation";

const youtube = (id: number, hasAccess = true): Lecture => ({
  id, title: `محاضرة ${id}`, position: 1, status: "published", is_free: hasAccess,
  has_access: hasAccess, video_source_type: "youtube", youtube_video_id: "DkJYaDCf48s",
});
const uploaded: Lecture = {
  id: 7, title: "محاضرة مرفوعة", position: 1, status: "published", is_free: true,
  has_access: true, video_source_type: "uploaded", video_asset: { id: 5, processing_status: "ready", available_qualities: ["360p", "480p", "720p"] },
};
const branch = (lecture: Lecture): Branch => ({
  id: 1, title: "النحو", position: 1, status: "published", chapters: [],
  nodes: [{ id: 100, branch_id: 1, kind: "folder", title: "الباب الأول", position: 1, children: [
    { id: 101, branch_id: 1, parent_id: 100, kind: "folder", title: "تدريبات", position: 1, children: [
      { id: 102, branch_id: 1, parent_id: 101, kind: "lecture", title: lecture.title, position: 1, lecture_id: lecture.id, lecture, children: [] },
    ] },
  ] }],
});

describe("student curriculum presentation", () => {
  it.each([
    ["الأول", youtube(11)],
    ["الثاني", uploaded],
    ["الثالث", youtube(12, false)],
  ])("shows a published %s-grade video through nested folders and in the player sidebar", (_grade, lecture) => {
    const subject = branch(lecture);
    const roots = studentPresentationItems(subject);
    expect(roots).toHaveLength(1);
    expect(findStudentFolder(roots, 101)?.children[0].lecture?.id).toBe(lecture.id);
    expect(findStudentFolderParent(roots, 101)?.id).toBe(100);
    expect(studentVideoBranch(subject).chapters[0].lessons[0].lectures[0].id).toBe(lecture.id);
  });

  it("keeps a legacy lecture without a folder node and avoids duplicate reused placements", () => {
    const subject = branch(youtube(11));
    subject.chapters = [{ id: 2, title: "باب قديم", position: 1, status: "published", lessons: [{
      id: 3, title: "درس قديم", position: 1, status: "published", is_free: true,
      lectures: [youtube(11), uploaded],
    }] }];
    const roots = studentPresentationItems(subject);
    expect(roots.map(item => item.title)).toEqual(["الباب الأول", "محاضرات أخرى"]);
    expect(roots[1].children.map(item => item.lecture?.id)).toEqual([7]);
    expect(studentVideoBranch(subject).chapters.flatMap(chapter => chapter.lessons.flatMap(lesson => lesson.lectures.map(lecture => lecture.id)))).toEqual([11, 7]);
  });
});
