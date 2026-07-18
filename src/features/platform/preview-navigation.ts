import { LESSONS, MAHADARAT } from "../../data/mock-data";
import type { Navigate } from "../../app/routing/types";

export function buildPreviewNav(nav: Navigate) {
  return function previewLecture(lectureId: number) {
    const lectureIndex = MAHADARAT.findIndex(item => item.id === lectureId);
    const lessonId = LESSONS[Math.max(0, lectureIndex) % LESSONS.length]?.id ?? LESSONS[0].id;
    nav("video", { lectureId, lessonId });
  };
}
